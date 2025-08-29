/**
 * Function that handles movement of all sprites
 */
var _moveSprites = function () {
  // for each sprite object
  for (var si = 0; si < Object.keys(oLevelSprites).length; si++) {
    var sprite = oLevelSprites[Object.keys(oLevelSprites)[si]];

    // if the sprite"s move flag is set
    if (sprite["move"]) {
      // var fMovementSpeed = 0.01;
      var fMovementSpeed = sprite["speed"] || 0.03;

      // move the sprite along it's radiant line
      sprite["x"] = +sprite["x"] + +Math.cos(sprite["r"]) * fMovementSpeed;
      sprite["y"] = +sprite["y"] + +Math.sin(sprite["r"]) * fMovementSpeed;

      // collision coordinates (attempting to center sprite)
      var fCollideY = +sprite["y"] - 0.65; // 0.5
      var fCollideX = +sprite["x"] + 0.125; // 0.25

      var fCollideY2 = +sprite["y"] + 0.425; // 0.25
      var fCollideX2 = +sprite["x"] - 0.65; //0.5

      // TODO: new collision
      // if (
      //   map[~~fCollideY * nMapWidth + ~~fCollideX] != "." ||
      //   map[~~fCollideY2 * nMapWidth + ~~fCollideX2] != "."
      // ) {
      //   sprite["stuckcounter"]++;

      //   // // reverse last movement
      //   sprite["x"] =
      //     +sprite["x"] - +Math.cos(sprite["r"]) * fMovementSpeed * 2;
      //   sprite["y"] =
      //     +sprite["y"] - +Math.sin(sprite["r"]) * fMovementSpeed * 2;

      //   // // repeat may help unstuck sprites
      //   // sprite["x"] = +(sprite["x"]) - +(Math.cos(sprite["r"])) * fMovementSpeed;
      //   // sprite["y"] = +(sprite["y"]) - +(Math.sin(sprite["r"])) * fMovementSpeed;
      //   // sprite["x"] = +(sprite["x"]) - +(Math.cos(sprite["r"])) * fMovementSpeed;
      //   // sprite["y"] = +(sprite["y"]) - +(Math.sin(sprite["r"])) * fMovementSpeed;

      //   // change the angle and visible angle
      //   sprite["r"] = (+sprite["r"] + PIx1_5) % PIx2; // TODO: sometimes buggie

      //   // if sprite keeps getting stuck, shove it outta there
      //   if (sprite["stuckcounter"] > 10) {
      //     sprite["stuckcounter"] = 0;
      //     sprite["r"] = 0.5;
      //     sprite["x"] = +sprite["x"] - +Math.cos(sprite["r"]) * 0.5;
      //     sprite["y"] = +sprite["y"] - +Math.sin(sprite["r"]) * 0.5;

      //     // sprite["move"]  = false;
      //     // sprite["x"]  = 0;
      //     // sprite["7"]  = 0;
      //   }
      // }

      // if sprite is close to the player, and facing the player, turn around
      if (sprite["z"] < 1 && sprite["a"] !== "B") {
        sprite["r"] = (+sprite["r"] + PIx1_5) % PIx2;
      }
      // if player hits sprite, prevent moving
      if (sprite["z"] < 0.75) {
        bPlayerMayMoveForward = false;
      } else {
        bPlayerMayMoveForward = true;
      }

      // TODO: sprites hitting each other
      // for(var sj=0; sj < Object.keys(oLevelSprites).length; sj++ ){
      //   var jsprite = oLevelSprites[Object.keys(oLevelSprites)[sj]];
      //   if( jsprite["z"] - sprite["z"] > 2 ){
      //     jsprite["r"] = (+(sprite["r"]) + PIx1_5 ) % PIx2;
      //   }
      // }
    } // end if sprite move
  }
};

/**
 * Sorts List
 */
function _sortSpriteList(b, a) {
  if (a["z"] < b["z"]) {
    return -1;
  }
  if (a["z"] > b["z"]) {
    return 1;
  }
  return 0;
}

/**
 * Sorts the Sprite list based on distance from the player
 */
var _updateSpriteBuffer = function () {
  if( EDITMODE ){ return; }
  // calculates the distance to the player
  for (var si = 0; si < Object.keys(oLevelSprites).length; si++) {
    var sprite = oLevelSprites[Object.keys(oLevelSprites)[si]];

    // the distance between the sprite and the player
    var fDistance = Math.hypot(
      sprite["x"] - fPlayerX,
      sprite["y"] - fPlayerY
    );

    sprite["z"] = fDistance;
  }

  // converts array of objects to list
  var newList = [];
  for (var sj = 0; sj < Object.keys(oLevelSprites).length; sj++) {
    newList.push(oLevelSprites[Object.keys(oLevelSprites)[sj]]);
  }

  // sorts the list
  newList = newList.sort(_sortSpriteList);

  // make object from array again
  oLevelSprites = {};
  for (var sk = 0; sk < Object.keys(newList).length; sk++) {
    oLevelSprites[sk] = newList[sk];
  }
};



function _drawVoxels (i) {
  if( EDITMODE ){ return; }
  if(i % 40){
    return;
  }

  // for each sprite object
  for (var si = 0; si < Object.keys(oLevelSprites).length; si++) {
    var sprite = oLevelSprites[Object.keys(oLevelSprites)[si]];

    // reference to the global sprite object (texture etc. will need later)
    var currentSpriteObject = allSprites[sprite["name"]];

    var spriteAx = sprite["x"] + Math.cos(fPlayerA - PIdiv2);
    var spriteAy = sprite["y"] + Math.sin(fPlayerA - PIdiv2);
    var spriteBx = sprite["x"] + Math.cos(fPlayerA + PIdiv2);
    var spriteBy = sprite["y"] + Math.sin(fPlayerA + PIdiv2);


    var intersection = intersectionPoint(
      { x: fPlayerX, y: fPlayerY },
      { x: fPlayerEndX, y: fPlayerEndY },
      { x: spriteAx, y: spriteAy },
      { x: spriteBx, y: spriteBy }
    );

    // If there is an intersection, update fDistanceToSprite
    if (!isNaN(intersection.x) && !isNaN(intersection.y)) {
      fDistanceToSprite = Math.sqrt(
        Math.pow(fPlayerX - intersection.x, 2) +
        Math.pow(fPlayerY - intersection.y, 2)
      );


      fSampleX = 1;

      for (let subVoxel of currentSpriteObject["vox"]) {

        // --- world-space position of this subVoxel ---
        let subX = sprite["x"] + subVoxel.x;
        let subY = sprite["y"] + subVoxel.y;

        // vector from player to subVoxel
        let fVecX = subX - fPlayerX;
        let fVecY = subY - fPlayerY;

        // distance
        let fDistanceToSub = Math.sqrt(fVecX * fVecX + fVecY * fVecY);
        if (fDistanceToSub <= 0.1) continue; // skip too close

        // angle from player forward to subVoxel
        let fAngleToSub = Math.atan2(fVecY, fVecX) - fPlayerA;
        if (fAngleToSub < -PI___) fAngleToSub += PIx2;
        if (fAngleToSub > PI___)  fAngleToSub -= PIx2;

        // project angle to screen column
        let nSubColumn = Math.floor(
          (0.5 * (fAngleToSub / (fFOV / 2)) + 0.5) * nScreenWidth
        );

        if (nSubColumn < 0 || nSubColumn >= nScreenWidth) continue;

        // vertical span on screen
        let fSpriteFloor = fscreenHeightFactor + nScreenHeight / fDistanceToSub * ((1 - sprite["h"]) + fPlayerH);
        let fSpriteCeil  = fscreenHeightFactor - nScreenHeight / fDistanceToSub * (sprite["h"] + currentSpriteObject["hghtFctr"] - fPlayerH);

        // loop vertical pixels
        for (let sj = Math.floor(fSpriteCeil); sj < fSpriteFloor; sj++) {
          if (sj < 0 || sj >= nScreenHeight) continue;

          if (fDepthBufferR[sj * nScreenWidth + nSubColumn] >= fDistanceToSub) {
            let fSampleY = (sj - fSpriteCeil) / (fSpriteFloor - fSpriteCeil);

            // sample subVoxel texture
            let fSamplePixel = [255,222,111]

            // transparency check
            // let bIsTransparentPix = fSamplePixel.every(e => e === 0);
            let bIsTransparentPix = false;
            // if (!bIsTransparentPix) {
              fDepthBufferR[sj * nScreenWidth + nSubColumn] = fDistanceToSub;
              screen[sj * nScreenWidth + nSubColumn] = fSamplePixel;

              // repeat sideways — thickness increases as you get closer
              let thickness = Math.max(1, Math.floor(30 / (fDistanceToSub+0.001))); 
              // let thickness = 1;
              // e.g. 10 units away = 1 column, 1 unit away = 10 columns

              for (let dx = 1; dx < thickness; dx++) {
                let col = nSubColumn + dx;
                if (col >= 0 && col < nScreenWidth) {
                  fDepthBufferR[sj * nScreenWidth + col] = fDistanceToSub;
                  screen[sj * nScreenWidth + col] = fSamplePixel;
                }
              }
            // }

          }
        }
      }

    }
  }
}


// function _drawVoxelColumnsSimple(i) {
//   if (EDITMODE) return;

//   if(i % 40){
//     return;
//   }

//   for (let spriteKey in oLevelSprites) {
//     let sprite = oLevelSprites[spriteKey];
//     let vox = allSprites[sprite.name].vox;

//     for (let subVoxel of vox) {
//       // world position
//       let subX = sprite.x + subVoxel.x;
//       let subY = sprite.y + subVoxel.y;

//       // vector to player
//       let dx = subX - fPlayerX;
//       let dy = subY - fPlayerY;
//       let dist2 = dx*dx + dy*dy;
//       if (dist2 <= 0.01) continue;

//       let dist = Math.sqrt(dist2);

//       // angle relative to player
//       let angle = Math.atan2(dy, dx) - fPlayerA;
//       if (angle < -PI___) angle += PIx2;
//       if (angle >  PI___) angle -= PIx2;

//       // skip outside FOV
//       if (Math.abs(angle) > fFOV * 0.5) continue;

//       // screen column
//       let col = Math.floor(
//         (0.5 * (angle / (fFOV / 2)) + 0.5) * nScreenWidth
//       );
//       if (col < 0 || col >= nScreenWidth) continue;

//       // vertical span
//       let floor = fscreenHeightFactor + nScreenHeight / dist * ((1 - sprite.h) + fPlayerH);
//       let ceil  = fscreenHeightFactor - nScreenHeight / dist * (sprite.h + allSprites[sprite.name].hghtFctr - fPlayerH);

//       let yTop = Math.max(0, Math.floor(ceil));
//       let yBot = Math.min(nScreenHeight - 1, Math.floor(floor));

//       // draw column with flat color
//       for (let sj = yTop; sj <= yBot; sj++) {
//         let bufIdx = sj * nScreenWidth + col;
//         if (fDepthBufferR[bufIdx] < dist) continue;

//         screen[bufIdx] = [255, 222, 111]; // placeholder pixel
//         fDepthBufferR[bufIdx] = dist;
//       }
//     }
//   }
// }
