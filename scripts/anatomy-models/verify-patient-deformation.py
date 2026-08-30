"""Verify patient rig scale and seated/tripod mesh continuity.

Run with Blender, not system Python::

    Blender --background --python scripts/anatomy-models/verify-patient-deformation.py -- \
      public/models/patient-male.glb public/models/patient-infant-female.glb

This is deliberately geometry-based. A GLB can contain the expected bones and
morph names yet still hide an adult armature inside infant skin or stretch a
millimetre pelvic edge into a visible hole at full posture influence.
"""

from __future__ import annotations

import os
import sys

import bpy


paths = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
if not paths:
    raise SystemExit("usage: verify-patient-deformation.py <patient.glb> [...]")


def largest_mesh():
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("GLB has no mesh objects")
    return max(meshes, key=lambda obj: len(obj.data.vertices))


def verify(path: str):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=path)
    body = largest_mesh()
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
    if len(armatures) != 1:
        raise RuntimeError(f"expected one armature, found {len(armatures)}")
    armature = armatures[0]
    if len(armature.data.bones) < 50:
        raise RuntimeError(f"incomplete armature: {len(armature.data.bones)} bones")

    shape_keys = body.data.shape_keys
    if shape_keys is None:
        raise RuntimeError("patient body has no shape keys")
    basis = shape_keys.key_blocks.get("Basis")
    if basis is None:
        raise RuntimeError("patient body has no Basis shape")
    height = max(point.co.z for point in basis.data) - min(point.co.z for point in basis.data)
    rig_ratio = armature.dimensions.z / max(height, 1e-8)
    if not 0.65 <= rig_ratio <= 1.05:
        raise RuntimeError(
            f"armature/body height mismatch: rig={armature.dimensions.z:.3f}m "
            f"body={height:.3f}m ratio={rig_ratio:.2f}"
        )

    posture_results = []
    for morph_name in ("pose_seated", "pose_tripod"):
        target = shape_keys.key_blocks.get(morph_name)
        if target is None:
            raise RuntimeError(f"patient body is missing {morph_name}")
        if abs(target.value) > 1e-6:
            raise RuntimeError(f"{morph_name} default influence is {target.value}, expected 0")
        max_ratio = 0.0
        stretched = 0
        for edge in body.data.edges:
            first, second = edge.vertices
            rest_length = (basis.data[second].co - basis.data[first].co).length
            if rest_length <= 1e-8:
                continue
            ratio = (target.data[second].co - target.data[first].co).length / rest_length
            max_ratio = max(max_ratio, ratio)
            # Deep knee flex can legitimately stretch a short diagonal edge
            # around 2.4x while staying within centimetres. The former pelvis
            # failure measured 7x-120x and exposed the background, so 3x is a
            # useful hard tear threshold without rejecting normal joint skin.
            if ratio > 3.0:
                stretched += 1
        if max_ratio > 4.0 or stretched > 8:
            raise RuntimeError(
                f"{morph_name} tears connected mesh edges: "
                f"count={stretched} max-ratio={max_ratio:.2f}"
            )
        posture_results.append(f"{morph_name}={max_ratio:.2f}x/{stretched}")

    print(
        "[verify-patient-deformation] "
        f"{os.path.basename(path)} bones={len(armature.data.bones)} "
        f"body={height:.3f}m rig-ratio={rig_ratio:.2f} "
        + " ".join(posture_results)
    )


bpy.ops.wm.read_factory_settings(use_empty=True)
for patient_path in paths:
    verify(os.path.abspath(patient_path))
