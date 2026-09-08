"""Build a lightweight cutaway vehicle seat at the simulator's seated support plane.

Blender --background --python scripts/anatomy-models/build-vehicle-patient-seat.py -- public/models/vehicle-patient-seat.glb
The patient faces +Z; cushion top is Y=.61 in exported glTF coordinates.
"""
import os
import sys
import bpy

output = os.path.abspath(sys.argv[sys.argv.index('--') + 1])
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, colour, roughness, metal=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*colour, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*colour, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metal
    return mat

cloth = material('Charcoal woven upholstery', (.09, .12, .14), .93)
insert = material('Seat centre fabric', (.16, .20, .22), .96)
steel = material('Seat runners', (.12, .14, .16), .4, .7)

def part(name, xyz, size, mat, bevel=.025):
    # glTF Y-up -> Blender Z-up; forward +Z -> Blender -Y.
    x, y, z = xyz
    w, h, d = size
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, -z, y))
    obj = bpy.context.object
    obj.name = name
    obj.scale = (w, d, h)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    mod = obj.modifiers.new('Soft manufactured edges', 'BEVEL')
    mod.width = bevel
    mod.segments = 3
    bpy.ops.object.modifier_apply(modifier=mod.name)
    for face in obj.data.polygons:
        face.use_smooth = True
    return obj

part('Cushion', (0, .53, .26), (.66, .16, .54), cloth, .05)
part('Cushion insert', (0, .604, .29), (.45, .015, .41), insert, .006)
part('Backrest', (0, .91, -.015), (.64, .69, .14), cloth, .045)
part('Backrest insert', (0, .93, .06), (.43, .49, .018), insert, .006)
part('Head restraint', (0, 1.38, -.015), (.32, .22, .12), cloth, .035)
for x in (-.11, .11):
    part('Head restraint stem', (x, 1.255, -.015), (.016, .12, .016), steel, .003)
for x in (-.24, .24):
    part('Seat runner', (x, .025, .24), (.07, .055, .63), steel, .009)
    part('Seat pedestal', (x, .25, .24), (.07, .45, .32), steel, .01)

bpy.ops.export_scene.gltf(filepath=output, export_format='GLB', export_animations=False)
print('Vehicle patient seat exported:', output)
