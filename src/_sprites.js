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

      if (
        map[~~fCollideY * nMapWidth + ~~fCollideX] != "." ||
        map[~~fCollideY2 * nMapWidth + ~~fCollideX2] != "."
      ) {
        sprite["stuckcounter"]++;

        // // reverse last movement
        sprite["x"] =
          +sprite["x"] - +Math.cos(sprite["r"]) * fMovementSpeed * 2;
        sprite["y"] =
          +sprite["y"] - +Math.sin(sprite["r"]) * fMovementSpeed * 2;

        // // repeat may help unstuck sprites
        // sprite["x"] = +(sprite["x"]) - +(Math.cos(sprite["r"])) * fMovementSpeed;
        // sprite["y"] = +(sprite["y"]) - +(Math.sin(sprite["r"])) * fMovementSpeed;
        // sprite["x"] = +(sprite["x"]) - +(Math.cos(sprite["r"])) * fMovementSpeed;
        // sprite["y"] = +(sprite["y"]) - +(Math.sin(sprite["r"])) * fMovementSpeed;

        // change the angle and visible angle
        sprite["r"] = (+sprite["r"] + PIx1_5) % PIx2; // TODO: sometimes buggie

        // if sprite keeps getting stuck, shove it outta there
        if (sprite["stuckcounter"] > 10) {
          sprite["stuckcounter"] = 0;
          sprite["r"] = 0.5;
          sprite["x"] = +sprite["x"] - +Math.cos(sprite["r"]) * 0.5;
          sprite["y"] = +sprite["y"] - +Math.sin(sprite["r"]) * 0.5;

          // sprite["move"]  = false;
          // sprite["x"]  = 0;
          // sprite["7"]  = 0;
        }
      }

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

var _drawSprites = function () {
  for (var si = 0; si < Object.keys(oLevelSprites).length; si++) {

    // the sprite in the level-side
    var sprite = oLevelSprites[Object.keys(oLevelSprites)[si]];

    // reference to the global-side sprite
    var currentSpriteObject = allSprites[sprite["name"]];

    // can object be seen?
    var fVecX = sprite["x"] - fPlayerX;
    var fVecY = sprite["y"] - fPlayerY;
    var fDistanceFromPlayer = Math.sqrt(fVecX * fVecX + fVecY * fVecY);

 

    // calculate angle between sprite and player, to see if in fov
    var fEyeX = Math.cos(fPlayerA);
    var fEyeY = Math.sin(fPlayerA);

    var fSpriteAngle = Math.atan2(fVecY, fVecX) - Math.atan2(fEyeY, fEyeX);
    if (fSpriteAngle < -PI___) {
      fSpriteAngle += PIx2;
    }
    if (fSpriteAngle > PI___) {
      fSpriteAngle -= PIx2;
    }

    // fDistanceFromPlayer *= Math.cos(fAngleDifferences);


    var bInPlayerView = Math.abs(fSpriteAngle) < fFOV / 2;

    // only proceed if sprite is visible
    if (bInPlayerView && fDistanceFromPlayer >= 0.5) {
      // very similar operation to background floor and ceiling.
      // Sprite height is default 1, but we can adjust with the factor passed in the sprite object/
      var fSpriteCeiling = +(fscreenHeightFactor) - (nScreenHeight / +fDistanceFromPlayer)  * currentSpriteObject["hghtFctr"] ;
      var fSpriteFloor = +(fscreenHeightFactor) + nScreenHeight / +fDistanceFromPlayer ;

      var fSpriteCeiling = Math.round(fSpriteCeiling);
      var fSpriteFloor = Math.round(fSpriteFloor);

      var fSpriteHeight = fSpriteFloor - fSpriteCeiling;
      var fSpriteAspectRatio = +currentSpriteObject["height"] / +(currentSpriteObject["width"] * currentSpriteObject["aspctRt"]);
      var fSpriteWidth = fSpriteHeight / fSpriteAspectRatio;
      var fMiddleOfSprite = (0.5 * (fSpriteAngle / (fFOV / 2)) + 0.5) * +nScreenWidth;

      // If the current Sprite is a Voxel Object
      if(currentSpriteObject["vox"]){

        var oSpritesWithDistances = [];

        // go through each sub-voxel
        for (var voxKey in currentSpriteObject["vox"]) {
          var currentVox = currentSpriteObject["vox"][voxKey]

          // position re-calculations for every voxel
          fVecX = sprite["x"] + currentVox["x"] - fPlayerX;
          fVecY = sprite["y"] + currentVox["y"] - fPlayerY;

          fSpriteAngle = Math.atan2(fVecY, fVecX) - Math.atan2(fEyeY, fEyeX);
          if (fSpriteAngle < -PI___) {
            fSpriteAngle += PIx2;
          }
          if (fSpriteAngle > PI___) {
            fSpriteAngle -= PIx2;
          }

          fDistanceFromPlayer = Math.sqrt(fVecX * fVecX + fVecY * fVecY);
          oSpritesWithDistances.push({ sprite: currentVox, distance: fDistanceFromPlayer, angle: fSpriteAngle });
        }

        // Sort the voxels by distance to player
        oSpritesWithDistances.sort(function(a, b) {
          return b.distance - a.distance;
        });

        // go through all now sorted voxels to render
        for (var voxelKey in oSpritesWithDistances) {

          var spriteWithDistance = oSpritesWithDistances[voxelKey];
          var currentVox = spriteWithDistance.sprite;
          var currentDistance = spriteWithDistance.distance;
          var currentAngle = spriteWithDistance.angle;


          // very similar operation to background floor and ceiling.
          // voxel height is default 1, but we can adjust with the factor passed in the voxel object/
          fSpriteCeiling = +(fscreenHeightFactor) - (nScreenHeight / +currentDistance) * currentSpriteObject["hghtFctr"];
          fSpriteFloor = +(fscreenHeightFactor) + nScreenHeight / +currentDistance;

          fSpriteCeiling = Math.round(fSpriteCeiling);
          fSpriteFloor = Math.round(fSpriteFloor);

          fSpriteHeight = fSpriteFloor - fSpriteCeiling;

          fMiddleOfSprite = (0.5 * (currentAngle / (fFOV / 2)) + 0.5) * +nScreenWidth;

          // Voxels always have the same levels as the parent
          currentVox["scale"] = currentSpriteObject["scale"];
          currentVox["width"] = currentSpriteObject["width"];
          currentVox["height"] = currentSpriteObject["height"];
          currentVox["aspctRt"] = currentSpriteObject["aspctRt"];
          currentVox["hghtFctr"] = currentSpriteObject["hghtFctr"];

          // loops through the vox pixels
          for (var vx = 0; vx < fSpriteWidth; vx++) {
            for (var vy = 0; vy < fSpriteHeight; vy++) {
              // updates sample point for voxel
              var fSampleX = vx / fSpriteWidth;
              var fSampleY = vy / fSpriteHeight;

              var sSamplePixel = "";

              sSamplePixel = _getSamplePixel(
                currentVox,
                fSampleX,
                fSampleY
              );

              //
              var nSpriteColumn = ~~(fMiddleOfSprite + vx - fSpriteWidth / 2 );
              if (nSpriteColumn >= 0 && nSpriteColumn < nScreenWidth) {
                // only render the sprite pixel if it is not a . or a space, and if the sprite is far enough from the player
                if ( sSamplePixel[0] != "." ) {
                  // render pixels to screen
                  var yccord = fSpriteCeiling + vy;
                  var xccord = nSpriteColumn;

                  if( fDepthBuffer[nSpriteColumn] >= currentDistance ){

                    // assign the Sprite Glyph
                    sSpriteGlyph = _rh.renderWall(
                      currentDistance,
                      "V",
                      sSamplePixel
                    );

                    screen[yccord * nScreenWidth + xccord] = sSpriteGlyph;
                    fDepthBuffer[nSpriteColumn] = currentDistance;

                    var currentScreenPixel = [yccord * nScreenWidth + xccord]
                  }
                }
              }
              
            } // end vx
          } // end vy
        }
      }
      
      else{

        // The angle the sprite is facing relative to the player
        // (not needed for voxels)
        var fSpriteBeautyAngle = fPlayerA - sprite["r"] + PIdiv4;
        // normalize
        if (fSpriteBeautyAngle < 0) {
          fSpriteBeautyAngle += PIx2;
        }
        if (fSpriteBeautyAngle > PIx2) {
          fSpriteBeautyAngle -= PIx2;
        }

        // loops through the sprite pixels
        for (var sx = 0; sx < fSpriteWidth; sx++) {
          for (var sy = 0; sy < fSpriteHeight; sy++) {
            // sample sprite
            var fSampleX = sx / fSpriteWidth;
            var fSampleY = sy / fSpriteHeight;

            var sSamplePixel = "";
            var sAnimationFrame = false;

            // animation-cycle available, determine the current cycle
            // MAYBE: randomize cycle position
            if (sprite["move"] && "walkframes" in currentSpriteObject) {
              if (animationTimer < 5) {
                sAnimationFrame = "W1";
              } else if (animationTimer >= 5 && animationTimer < 10) {
                sAnimationFrame = "W2";
              } else if (animationTimer >= 10) {
                sAnimationFrame = false;
              }
            }

            // sample-angled glyph is available
            if ("angles" in currentSpriteObject) {
              if (fSpriteBeautyAngle >= PI_0 && fSpriteBeautyAngle < PIx05) {
                sprite["a"] = "B";
              } else if (
                +fSpriteBeautyAngle >= +PIx05 &&
                +fSpriteBeautyAngle < +PIx1
              ) {
                sprite["a"] = "L";
              } else if (
                +fSpriteBeautyAngle >= +PIx1 &&
                +fSpriteBeautyAngle < +PIx1_5
              ) {
                sprite["a"] = "F";
              } else if (
                +fSpriteBeautyAngle >= +PIx1_5 &&
                +fSpriteBeautyAngle < +PIx2
              ) {
                sprite["a"] = "R";
              }
            }

            // check if object has both, angles, or animations
            if (sprite["a"] && sAnimationFrame) {
              sSamplePixel = _getSamplePixel(
                currentSpriteObject["angles"][sprite["a"]][sAnimationFrame],
                fSampleX,
                fSampleY
              );
            } else if (sprite["a"]) {
              sSamplePixel = _getSamplePixel(
                currentSpriteObject["angles"][sprite["a"]],
                fSampleX,
                fSampleY
              );
            } else if (sAnimationFrame) {
              sSamplePixel = _getSamplePixel(
                currentSpriteObject[sAnimationFrame],
                fSampleX,
                fSampleY
              );
            } else {
              // if not, use basic sprite
              sSamplePixel = _getSamplePixel(
                currentSpriteObject,
                fSampleX,
                fSampleY
              );
            }
            
            var nSpriteColumn = ~~(fMiddleOfSprite + sx - fSpriteWidth / 2);
            if (nSpriteColumn >= 0 && nSpriteColumn < nScreenWidth) {
              // only render the sprite pixel if it is not a . or a space, and if the sprite is far enough from the player
              if (
                sSamplePixel[0] != "." &&
                fDepthBuffer[nSpriteColumn] >= fDistanceFromPlayer
              ) {

                // assign the Sprite Glyph
                sSpriteGlyph = _rh.renderWall(
                  fDistanceFromPlayer,
                  "V",
                  sSamplePixel
                );

                // render pixels to screen
                var yccord = fSpriteCeiling + sy;
                var xccord = nSpriteColumn;
                screen[yccord * nScreenWidth + xccord] = sSpriteGlyph;
                fDepthBuffer[nSpriteColumn] = fDistanceFromPlayer;
              }
            }
          }
        }
      }
    } // end if

    // player was hit
    else {
      // clearInterval(gameRun);
    }
  }
}

