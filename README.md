# 3D (2.5D) Sector based 3D Engine!

<<<<<<< HEAD
The continuation of the old ASCII-based raycaster engine (with perspective-correct looking up and down!). Now a fully-fledged Build-style engine!
=======
**Check it out here!**
[https://sector-engine.moritz.work/](https://sector-engine.moritz.work/)

The continuation of the old ASCII-based raycaster engine (with perspective-correct looking up and down!). This is turning into a Build-style engine!
>>>>>>> 950cd16d14164ac78599e0af90478f0c9c164437

This new engine uses sector-based rendering which allows such cool features such as:

- Any angle walls
- Different height sectors
- Windows
- Platforms
- Voxel-objects (again, think Build Engine)
- Any-color pallet (Although I'm limiting it to indexed 256 for textures and sprites each)
- ❌ All while retaining the ascii-based renderer :) (Sadly no more. It could come back sometime :P)

And so much more! The limits are endless! The endlim is itless!



---

## AI/LLM DISCLOSURE
- I think of this project as a **NO-AI/NO-LLM** project. The whole point is for me to wrack my brain and think about things
- That being said, when LLM-assisted coding first was rolled out in a big way a few years ago, I was naturally curious and tested it. Some of the code in this project *was*, at the time, written with Copilot assistance. I didn't think much of it, and it made some things a little easier. It made some things way worse and I probably discarded more than I used in the end. It was, after all, a few years ago.
- I changed my mind about using LLM code since then, and I don't honestly remember *exactly* what was written with it. A list of my best guesses below:
  - Edit suite: Some of the edit suite tools were written with LLM assistance. Usually as a quick prototype-starting point. (Although you can tell by the extremely shitty implementation that it's still mostly my code)
  - Debugging: I used to debug my bilinear filtering algos
  - Similar to above, I watched a YouTube video on Floyd-Steinberg, and used the LLM to help me write bug-free code. If I could go back and redo it myself without what I know now, I would.
  - (Please note that the confusing/inconsistent naming-schemes are purely a result of me working on things at different times, and referencing different sources :P)
- Because it's not exactly clear what was and wasn't written with LLM-assistance, it's probably unreasonable/impossible to remove that code from the codebase. It's just part of the history of this codebase now

----


## Texture/Sprites workflow:

1) Convert PNGs to pixel-arrays stored in variables using this tool: 
   `/edit-suite/png-converter.html`
   This gives you something like `var de1 = [[197,199,198],[199,201,200],[199,201,200],[…`

2) Move all the variables it generates in a file like textures.tex (example file)
   Take that file, and load it into the Pallette Quantizer/Median cut tool
   `/edit-suite/median-cut-generator.html`

3) Paste the results in your final texture file. You will need an array that assigns the textures stored in variabels to keys that will correspond to the names used in editor and render with the following keys. Example:
    `var textures = {`
    `  "bg": {`
    `   "width": [int],`
    `   "height": [int],`
    `   "texture": [variable-name],`
    `   "scale": [int],`
    ` },`
    ` …`
    `}`

// TODO: This could be one workflow eventually :P




## 👩🏼‍💻 Current TODO: list:

- ✅ Convert Textures to 255 indexed pallette (+transparent)
- Add Sprites list to editor
- ✅ Add Lighting to editor
- ✅ Add lighting too editor
- ✅ Eat Pizza


- Lighting is working
  - Colored lighting? I know, getting cocky
  - ✅ Add provision to have baseline lighting


- ✅ Floor texture:
  - ✅ Fix Looking up and down
  - ✅ Fix sector height change
- Re-implement Sprite rendering (now working officially via intersection method)
  - ✅ Make sure sprites properly face the player (with perspective correction)
  - ✅ Perhaps draw the sprite up-down by default, and the rotate the same direction as the player?
  - ✅ re-implement angles and animation
  - ✅ re-implement moving
  - ✅ re-implement sorting 
  - ✅ re-implement transparency
  - ✅ refactor checkPlayerInSector function to also work for sprites
- ✅ Fix Ceiling texture rendering
  - ✅ Re-implmement and refactor skybox
- Think about slopes. I kinda don't want to open that can of worms, but maybe think about slopes... OH NO I'M THINKING ABOUT SLOPES

- ✅ Refactor checkSectors function
- Rethink variable scope of some variables
- Fisheye correction is still a bit wonky
- Wall-collision detection... it's bad
- ✅ Build in Texture X and Y offset

#### Level Editor (TODO:)
**OH MY GOD THIS WAS SO MUCH WORK**
- ✅ Refactor level file: No more sectorMeta, no more nested arrays for walls, single source of truth for all level data 

##### More Level Editor Things
- ✅ live-preview... this should be possible, just load the engine code in the editor. 
  - After some testing it looks like setting up a server and write to file. Actually this might be cleaner...
- ❓ Build in sector texture scale
- ❓ Better yet, world-coordinates texture mapping?




---


## Lighting Idea

First iteration will be baked lighting
- Cast n (8?) rays radially from the light source. 
- Check if they are colliding with any wall in any sector 
  - (later: only the sectors the light source is in plus the ones connected to it)
- New array:  oLightMap Store position where it collided, and how far from the wall it is
- When rendering each column, check the world position where the wall was hit, then look up the nearest light info in the oLightMap array, and shade that pixel accordingly
  - Probably by passing it to the get Sample Pixel function 


Alternatively, we could go it in real time by:
- casting a ray from where the wall was hit to the light source
- and figure out the length, that's how dark that pixel is



All of the below is outdated, I'll write up some docs sometime.

- ✅ Level Editor panning (maybe zooming, probably not though (Edit: no zooming))
- ✅ Build in Texture X and Y offset


OLD!!!!!
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
-  







Could be handy https://notisrac.github.io/FileToCArray/
mkdir -p sprites && for f in *.png; do magick "$f" -resize 64x64\! -filter point "sprites/$f"; done

