# How slopes work

This is a walkthrough of the slope code, from the level data to drawing, walking, sprites, the camera and the editor. It quotes the code that matters at each step and explains it in plain words.

---

## 1. The idea

A slope here is a **floor that tilts**, like a ramp. It works the same way as in the old Build engine (Duke Nukem 3D):

- Every sector already has a flat floor height.
- A sloped sector picks **one of its walls as a hinge**: its first wall, `walls[0]`.
- Right along that wall, the floor is at its normal height.
- The further you move away from that wall, into the room, the higher (or lower) the floor gets.
- How quickly it rises is set by **one number**: the sector's `slope`.

Picture a sheet of plywood lying on the floor. Keep one edge on the ground (wall 0) and lift the opposite side. That's the slope. It's always a flat, straight ramp. It never bends or curves.

Only floors can slope. Ceilings stay flat.

---

## 2. The level data: one extra number

Each sector in the level file has a `slope` value next to its `floor` and `ceil`. The editor's defaults show the shape:

```js
const sectorDefaults = {
    "floor": 0,
    "ceil": 2,
    "floorTex": "Y",
    "ceilTex": "U",
    "slope": 0,
}
```

- `slope: 0` means flat, which is how every sector behaved before slopes existed.
- `slope: 0.1` means the floor rises 0.1 height units for every 1 unit you walk away from wall 0.
- A negative number makes the floor go *down* instead.

---

## 3. The heart of it: two small helper functions

Everything else (drawing, walking, sprites, camera) uses these two functions in `src/_functions.js`. Once they make sense, the rest is mostly "ask these functions for the height at a point".

### 3a. `_makeSlopeRef`: describe the hinge wall once

```js
function _makeSlopeRef (sectorWalls, fSlope) {
  if (!fSlope) return null;
  var wall0 = sectorWalls[0];
  var fDX = wall0[2] - wall0[0];
  var fDY = wall0[3] - wall0[1];
  return {
    x: wall0[0],
    y: wall0[1],
    dx: fDX,
    dy: fDY,
    len: Math.sqrt(fDX * fDX + fDY * fDY),
    slope: fSlope
  };
}
```

Step by step:

1. **If the slope is 0, give up right away** and return `null`. Everything that gets `null` treats the sector as flat and skips the slope work. Flat sectors cost nothing extra.
2. **Take the first wall.** A wall is stored as `[startX, startY, endX, endY, texture, …]`, so `wall0[0]`/`wall0[1]` is where it starts and `wall0[2]`/`wall0[3]` is where it ends.
3. **Work out which way the wall runs**: `dx` is how far it goes left/right, `dy` how far up/down.
4. **Measure how long the wall is** (`len`), using the usual Pythagoras.
5. **Pack it all into a small object** (the "slope reference") together with the slope number, so it doesn't have to be worked out again.

This object is basically "the hinge line, and how steep the ramp is".

### 3b. `_slopeFloorFactorAt`: how high is the floor at this spot?

```js
function _slopeFloorFactorAt (fBaseFactor, oSlopeRef, x, y) {
  if (!oSlopeRef) return fBaseFactor;
  var fPerp = ((x - oSlopeRef.x) * oSlopeRef.dy - (y - oSlopeRef.y) * oSlopeRef.dx) / oSlopeRef.len;
  return fBaseFactor + oSlopeRef.slope * fPerp;
}
```

Step by step:

1. **Flat sector?** (no slope reference) Then the floor is just the normal floor height. Done.
2. **How far is this spot from the hinge wall?** That's `fPerp`. It's the straight-line distance from the point to the wall's line, measured at a right angle to the wall, like measuring how far a chair is from a wall.
   - It has a **sign**: points on one side of the wall get a positive distance, points on the other side a negative one. Which side is which depends on which direction the wall was drawn. The editor shows this with a little tick (see section 9).
   - Walking *along* the wall (parallel to it) doesn't change this distance. Walking *away* from it does. That's what makes the ramp a straight, tilted plane.
3. **Floor height = normal floor + slope × distance.** Right on the wall the distance is 0, so you get the normal floor. Two units away you get the normal floor + 2 × slope, and so on.

**A worked example.** Say wall 0 runs from (10, 0) to (0, 0), the sector's floor is 0, and the slope is 0.1.

- `dx = 0 - 10 = -10`, `dy = 0 - 0 = 0`, `len = 10`.
- For the point (3, 4): `fPerp = ((3 - 10) × 0 - (4 - 0) × -10) / 10 = 40 / 10 = 4`. The point is 4 units from the wall. Height = `0 + 0.1 × 4 = 0.4`.
- For the point (7, 4): `fPerp = ((7 - 10) × 0 - 4 × -10) / 10 = 4`. Same distance from the wall, so same height, 0.4. Moving parallel to the wall didn't change anything.

### 3c. `_sectorFloorAt`: the shortcut

```js
function _sectorFloorAt (sector, x, y) {
  var oSector = oMap[sector];
  return _slopeFloorFactorAt(oSector.floor, _makeSlopeRef(oSector.walls, oSector.slope), x, y);
}
```

This combines the two: "give me the floor height of sector *n* at spot *x, y*". Sprites and the camera use it.

---

## 4. Drawing walls: the bottom edge follows the slope

The renderer goes across the screen one column at a time. For each column it sends a "ray" out from the player and finds which wall that ray hits. Then it works out which screen row the wall's **top** (ceiling) and **bottom** (floor) land on.

Before slopes, the bottom edge only depended on the sector's single floor height. Now it uses the floor height **at the exact spot where the ray hits the wall** (`src/_sector-engine.js`):

```js
var oSlopeRef = _makeSlopeRef(sectorWalls, oLevel.map[currentSector].slope);
// … for each wall the ray hits …
var fFloorFactorHere = _slopeFloorFactorAt(sectorFloorFactor, oSlopeRef, intersection.x, intersection.y);
var nFloor = fscreenHeightFactor + nScreenHeight / fDistanceToWall * ((1-fFloorFactorHere) + (fPlayerH));
```

Step by step:

1. **Once per sector**, build the slope reference (section 3a). It's `null` if the sector is flat.
2. **For each wall hit**, ask "how high is the floor right here, where the ray touched the wall?". That's `fFloorFactorHere`.
3. **Turn that height into a screen row** (`nFloor`). In plain words:
   - `(1 - floorHere) + fPlayerH` is "how far below the player's eyes the floor is at that spot". `1` is roughly the eye height above your feet.
   - Dividing by `fDistanceToWall` makes distant things squash towards the middle of the screen (the horizon). That's ordinary perspective.

Because the floor height is checked separately for each screen column, the bottom edge of a wall in a sloped room comes out as a **diagonal line** on screen instead of a horizontal one.

### Portals (looking into the next sector)

When the wall is a portal (a window into another sector), the code compares the floors of **both** sectors **at the same shared spot**:

```js
var oNextSlopeRef = _makeSlopeRef(oMap[nextSector].walls, oMap[nextSector].slope);
var fNextFloorFactorHere = _slopeFloorFactorAt(nextSectorFloorFactor, oNextSlopeRef, intersection.x, intersection.y);

if( fNextFloorFactorHere > fFloorFactorHere ){
  nNextSectorFloor = fscreenHeightFactor + nScreenHeight / fDistanceToWall * ((1-fNextFloorFactorHere) + (fPlayerH));
}
```

1. Work out the next sector's floor height right at the doorway, using its own slope.
2. **If the floor on the other side is higher**, there's a step up. The bit between the two floor heights is drawn as wall (the face of the step), and the "window" into the next sector starts above it.
3. If the other side is lower or level, nothing extra happens. You just look down into it.

Checking both floors at the exact same point is what makes a ramp line up with the room next to it. Using the flat heights instead would leave a gap or an odd step at the doorway.

---

## 5. Drawing the floor itself: the trickiest part

This is `drawFloor` in `src/_render-helpers.js`. It runs for **every floor pixel** on screen, so it has to be quick.

### First, how a flat floor works

For each floor pixel, the engine needs to know **which spot on the floor that pixel is showing**, so it can pick the right texture colour. The question is "how far along the ray do I hit the floor?".

For a flat floor the answer is simple:

- Each screen row below the horizon is a ray pointing down at a certain angle. Rows near the horizon point down only a little, so they reach the floor far away. Rows at the bottom of the screen point down steeply and hit the floor close by. The code keeps this per-row value in `fRowFactor`.
- Distance to the floor = eye height above the floor × that row's value. (There's also a small "fisheye" correction, `fCosAngleDiff`, for rays that point off to the side.)

### Now with a slope

On a slope, the floor isn't at one fixed height. It's rising or falling *along the ray*. The code handles this with one neat trick and no trial and error.

```js
var fSlopeAtPlayer = 0;
var fSlopeRatePerRay = 0;
if( oSlopeRef ){
  var fPerpAtPlayer = ((fPlayerX - oSlopeRef.x) * oSlopeRef.dy - (fPlayerY - oSlopeRef.y) * oSlopeRef.dx) / oSlopeRef.len;
  var fPerpRatePerRay = (fastCos(fRayAngleGlob) * oSlopeRef.dy - fastSin(fRayAngleGlob) * oSlopeRef.dx) / oSlopeRef.len;
  fSlopeAtPlayer = oSlopeRef.slope * fPerpAtPlayer;
  fSlopeRatePerRay = oSlopeRef.slope * fPerpRatePerRay;
}

fAdjustedHeight = nStandardHeight - (fSectorFloorHeight + fSlopeAtPlayer) * 2  ;
fPlayerViewHeight = fAdjustedHeight  + ( fPlayerH * 2  );

var fRowFactor = fscreenHeightFactorFloor / ( j - nScreenHeight / (2 - fFloorLooktimer) );
var fCosAngleDiff = fastCos(fPlayerA - fRayAngleGlob );

fRealDistance = ( fPlayerViewHeight * fRowFactor ) / ( fCosAngleDiff + 2 * fSlopeRatePerRay * fRowFactor );
```

Step by step:

1. **How much higher is the floor right under the player?** (`fSlopeAtPlayer`) This is the same "distance from the hinge wall × slope" from section 3b, using the player's position.

2. **How fast does the floor rise along this ray?** (`fSlopeRatePerRay`) It's the same formula again. This time, instead of "where is the player", it plugs in "which direction is the ray pointing" (the `cos`/`sin` of the ray angle). The result answers: *for every step I take along this ray, how much does the floor go up or down?*
   - Looking straight up the ramp: a big positive number.
   - Looking along the ramp (parallel to the hinge wall): zero, since the floor stays level that way.
   - Looking down the ramp: negative.

3. **How high are the player's eyes above the floor directly beneath them?** (`fPlayerViewHeight`) It starts from the normal eye height. It subtracts the floor height (including the slope at the player's spot) and adds the player's current height (`fPlayerH`, which changes when jumping). Everything is doubled here (`* 2`, `nStandardHeight = 2`). That's just the scale this function works in.

4. **Find where the ray meets the floor.** Think of it as two things closing in on each other:
   - The ray starts at eye height and **drops** a fixed amount for every step forward. How much depends on the screen row.
   - The floor **rises** a fixed amount for every step forward (from step 2).
   - The gap between them starts at the eye height and shrinks at the combined speed. So the distance is simply *starting gap ÷ closing speed*. That's what the last line computes. The `+ 2 * fSlopeRatePerRay * fRowFactor` part at the bottom of the division is the floor's contribution to the closing speed.

   This works because a slope is a perfectly flat, tilted plane, so the floor rises at a *constant* rate along any straight ray. A curved floor wouldn't allow this shortcut.

5. **Sanity check with a flat floor.** Both slope values are 0, so the extra part of the formula disappears and you're back to exactly the old flat-floor formula. That's why flat sectors look exactly as they did before.

6. **What changes visually:**
   - Looking up a ramp, the floor rises towards you, the ray hits it *sooner*, and the floor appears closer.
   - Looking down a ramp, the floor falls away, the ray hits it *later*, and the floor appears further away.

7. **The rest is unchanged.** Once the distance is known, the code walks that far along the ray to get the floor's real-world position (`floorPointX`/`floorPointY`). It then looks up the texture colour and lighting there, exactly as for flat floors.

---

## 6. Standing on a slope: the player's height

Before slopes, the player's floor height only changed when you walked into a new sector. Now it's **recomputed every frame** from where you are standing (`src/_move-helpers.js`, in `playerHeight`):

```js
var oSlopeRef = _makeSlopeRef( oMap[sPlayerSector].walls, oMap[sPlayerSector].slope );
nSectorFloorHeight = _slopeFloorFactorAt( oMap[sPlayerSector].floor, oSlopeRef, fPlayerX, fPlayerY );
```

1. Build the slope reference for the sector the player is in.
2. Ask for the floor height at the player's exact x, y.
3. Use that as "the floor to stand on" for the rest of the jump/fall logic, which didn't need to change:
   - If you're within 0.1 of the floor, you snap onto it. On a gentle slope that happens every frame, so you glide up and down smoothly.
   - If the floor is further below you, you fall at 0.15 per frame.
   - If it's further above you, you rise at 0.1 per frame.

---

## 7. Walking from one sector into another: the step-height check

When you walk through a portal into another sector, the game checks whether the floor on the other side is too high to step onto. With slopes, that check uses the **floor height right at the doorway** rather than the next sector's flat height (`testWallCollision` in `src/_move-helpers.js`):

```js
var oCollisionSlopeRef = _makeSlopeRef( oMap[collisionSector].walls, oMap[collisionSector].slope );
var fCollisionFloorHeight = _slopeFloorFactorAt( oLevel.map[collisionSector].floor, oCollisionSlopeRef, intersection.x, intersection.y );
if( fPlayerH - fCollisionFloorHeight < -0.5 ){
  return true; // don't allow move
}
```

1. Work out the next sector's floor height at the point where you'd cross into it.
2. If that floor is **more than half a unit above your feet**, you're blocked and need to jump.
3. Otherwise you move into the new sector. Section 6 then takes over and adjusts your height to the slope.

Without this, a ramp that starts level with the doorway could block you, because its flat height might be somewhere else entirely. It could also let you through where it shouldn't.

---

## 8. Sprites and the third-person camera

### Sprites (`src/_sprites.js`)

Sprites follow exactly the same two rules as the player:

```js
// the next sector's floor right at the crossing point (a sloped sector's edge isn't at its flat height)
var targetFloor = _sectorFloorAt( targetSector, hasHitAnyWalls["coords"]["x"], hasHitAnyWalls["coords"]["y"] );

// sprites can't walk over obstacles that are too high
if (sprite["h"] - targetFloor < -0.5) {
  bIsLegelMove = false;
}
```

```js
// follow the floor, also while walking across a slope
sprite["h"] = _sectorFloorAt( sprite["sc"], sprite["x"], sprite["y"] );
```

1. When a sprite tries to walk into another sector, it checks the floor height at the crossing point. If it's more than half a unit up, the sprite turns around.
2. After every move, the sprite's height is set to the floor height at its new position, so it walks up and down ramps. Unlike the player, sprites don't ease into the new height. They're placed on it immediately.

### Third-person camera (`thirdPersonCamera` in `src/_move-helpers.js`)

The camera sits on an imaginary stick (a "boom") pointing backwards from the player. A slope can rise up into that stick, for example when you stand at the bottom of a ramp facing away from it. The camera must not end up inside the floor.

```js
var fExitDist = closestWall ? fClosestHit : fThirdPersonDistance;
var fExitFloor = _sectorFloorAt(currentSector, fPlayerX + fDirX * fExitDist, fPlayerY + fDirY * fExitDist);
if (fExitFloor > fMaxFloorZ) {
  var fEntryFloor = _sectorFloorAt(currentSector, fPlayerX + fDirX * fEntryDist, fPlayerY + fDirY * fEntryDist);
  var fRiseShare = fEntryFloor < fMaxFloorZ ? (fMaxFloorZ - fEntryFloor) / (fExitFloor - fEntryFloor) : 0;
  fCamDist = fEntryDist + (fExitDist - fEntryDist) * fRiseShare;
  break;
}
```

For each sector the boom passes through:

1. **Check the floor where the boom leaves the sector** (or where it ends, if it ends inside). Along a straight line, a flat ramp is highest at one end or the other, never in the middle. So checking the ends is enough.
2. **If the floor there is too high** (above `fMaxFloorZ`, just below the camera's eye):
   - Also check the floor where the boom *entered* the sector.
   - Work out what share of the way from entry to exit the floor reaches the limit. For example, if the floor rises from 0.2 to 1.2 and the limit is 0.7, it gets there halfway (`fRiseShare = 0.5`).
   - Place the camera at that point and stop.
3. **When the boom passes through a portal**, it checks the next sector's floor at the crossing point (again using `_sectorFloorAt`) to see if the camera fits through.

---

## 9. The level editor

### Setting the slope

The sector panel has a **Floor Slope** number field (`edit-suite/level-edit.html`), stepping in 0.005s:

```html
<label for="slope" title="Tilts the floor around this sector's first wall (the wall drawn first). 0 = flat.">
    <span>Floor Slope:</span>
    <input id="slope" type="number" placeholder="i.e. 0" step="0.005">
</label>
```

Changing it saves the value to the sector, and it's written to the level file as `"slope": …`.

### Seeing which wall is the hinge

Because everything depends on which wall is wall 0, the editor highlights it on the map for any sloped sector (`edit-suite/src/_lhelpers.js`):

1. Wall 0 is drawn as a **thick orange line**, labelled "wall 0 (slope)".
2. A small **orange tick with a dot** sticks out from the middle of the wall, **pointing towards the side where the floor goes up**:

```js
const tickX = midX + (dy / len) * tickLen;
const tickY = midY + (-dx / len) * tickLen;
```

This uses the same "which side of the wall is positive" rule as `_slopeFloorFactorAt`, so the tick always agrees with the engine. With a positive slope, the floor rises in the direction the tick points. With a negative slope, it's the other way round.

### Choosing a different hinge wall

The **Rotate ↻** button next to "Wall 0" moves the next wall into first place (`handleRotateSectorWalls` in `edit-suite/src/_ledit.js`). In other words, it moves the hinge one wall clockwise:

```js
if (signedArea > 0) {
  walls.push(walls.shift());   // move the first wall to the end
} else {
  walls.unshift(walls.pop());  // move the last wall to the front
}
```

1. First it works out whether the sector's walls were drawn clockwise or counter-clockwise. It adds up a running total over all the corners (`signedArea`, the "shoelace" trick). The sign of the total gives the direction.
2. Then it shifts the list of walls by one in whichever direction makes the hinge **move clockwise on screen**. That way the button behaves the same however the sector was originally drawn.
3. The map redraws, and the orange highlight jumps to the new wall 0.

The walls themselves don't change, only their order. The ramp just tilts around a different edge.

---

## 10. Things slopes don't do (yet)

These aren't bugs, just what the current code covers:

- **Ceilings are always flat.** `drawCeiling` has no slope code, and there's no ceiling slope value.
- **Floor textures aren't stretched along the ramp.** The texture is picked by the floor point's x, y position, like a projector shining straight down. On a steep ramp the texture looks a little stretched compared to flat floors.
- **Lighting is still per sector** in-game (it's baked). The ramp doesn't get lighter or darker as it rises.
- **A possible edge case (not tested):** on a ramp sloping *down* away from the player, looking towards the horizon, the bottom of the division in the floor formula (section 5, step 4) could reach zero or below. The floor drops away faster than the ray comes down, so the ray never meets it. There's no guard for this in `drawFloor`, so if odd floor pixels ever show up near the horizon on a downward ramp, that's the first place to look.
