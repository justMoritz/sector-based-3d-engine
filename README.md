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

✅ Floor texture:
  ✅ Fix Looking up and down
  ✅ Fix sector height change
👩🏼‍💻 Re-implement Sprite rendering (possibly via intersection method)
  - Make sure sprites properly face the player (with perspective correction)
  - Perhaps draw the sprite up-down by default, and the rotate the same direction as the player?
  - re-implement angles and animation
  - re-implement transparency

- Refactor checkSectors function
- Rethink variable scope of some variables
- Fisheye correction is still a bit wonky

#### Level Editor (TODO:)
- Grid (with 0.125 grid size?)
- User interaction as follows:
  1. levels consist of sectors
  2. clicking a sector will enable a right-side context menu where to edit *floor height+tex, ceiling height+tex,*
  3. sectors consist of walls (maybe with normals?)
    - clicking a sector ALSO will make points movable
  4. Walls are drawn as continuous polygons: 
    - i.e. click, make points, points automatically connect. 
    - level editor parses out each two lines into individual walls
    - left-clicking a wall will show a context menu where to set the *portal, walltex, textXsample, texYsample*
    - right-clicking a wall will add another point to the polygon
  5. Sprite mode. In this mode,
     -  click anywhere to place a sprite
     -  left-clicking a sprite brings up context menu where to set sprite texture, velocity, and just about anything else we can image