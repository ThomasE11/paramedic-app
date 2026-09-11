"""Bedroom environment build for y2-007 Academic City (simple backdrop).

Blender --background --python scripts/anatomy-models/build-bedroom-env.py -- temp-blender-y2-007
"""

import os
import sys
import bpy

output = os.path.abspath(sys.argv[sys.argv.index('--') + 1])
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


# Floor
def floor_mat(name, colour, roughness):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*colour, 1)

# Walls  
for i in range(4):
    wall_x = [ -205, -205, 250, 250 ][i]
    wall_z = [ -220, 220, 220, -220 ][i]
    bpy.ops.mesh.primitive_plane_add(location=(wall_x, 140, wall_z))


print("✓ Bedroom backdrop created")
print(f"Output: {output}")
