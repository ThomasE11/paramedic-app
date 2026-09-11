# -*- coding: utf-8 -*-
"""
Build Academic City Student Bedroom Scene for y2-007 Paracetamol OD Case
Female patient sitting on edge of bed, flatmate standing beside bed (supportive bystander)

Run via: Blender --background --python scripts/anatomy-models/build-academic-city-bedroom.py
"""

import bpy
import os
import sys


def main():
    """Main build function - simpler approach using existing scripts."""
    
    print("=" * 60)
    print(f"BUILDING: y2-007 - Academic City Student Bedroom")
    print("=" * 60)
    
    try:
        # Create floor mesh using correct operator
        bpy.ops.mesh.primitive_cube_add(
            location=(0, 0, -430), 
            size=(501, 532, 900)  # width x depth x height
        )
        
        print("✓ Floor created")
        
        return True
        
    except Exception as e:
        print(f"❌ Build failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Floor build complete")
    else:
        print("\n❌ Floor build failed")
