# 3D (2.5D) Sector based 3D Engine!

The continuation of the old ASCII-based raycaster engine (with perspective-correct looking up and down!). This is turning into a Build-style engine!

This new engine uses sector-based rendering which allows such cool features such as:

- Any angle walls
- Different height sectors
- Windows
- Platforms
- Voxel-objects (again, think Build Engine)
- NES-color pallet (and probably more in the future!)
- All while retaining the ascii-based renderer :)

And so much more! The limits are endless!


## Current TODO: list:

- Floor texture:
  - Fix Looking up and down
  - Fix sector height change
- Refactor checkSectors function
- Rethink variable scope of some variables
- Re-implement Sprite rendering (possibly via intersection method)
- Fisheye correction is still a bit wonky