function drawFloor(j, sectorFloorFactor, sSectorFloorTexture ){

    // TODO: consider removing: Using globals instead
    // var fPerspectiveCalculationL = (2 - fLooktimer * 0.15);

  
    // Define the height of the player above the floor 
    var fPlayerHeight = 2 * sectorFloorFactor;

      
    // Calculate the direct distance from the player to the floor pixel
    var directDistFloor = ( (fPlayerHeight) * fscreenHeightFactor) / (j - nScreenHeight / 2);

    // Calculate the angle for the current ray
    // TODO: consider removing: Using Global Ray Angle instead
    // var rayAngle = fPlayerA - fFOV / 2 + (i / nScreenWidth) * fFOV;

    // Calculate real-world distance with the angle relative to the player
    var realDistance = directDistFloor / Math.cos(fPlayerA - fRayAngleGlob);

    // Calculate real-world coordinates with the player angle
    var floorPointX = fPlayerX + Math.cos(fRayAngleGlob) * realDistance;
    var floorPointY = fPlayerY + Math.sin(fRayAngleGlob) * realDistance;

    sFloorPixelToRender = _rh.renderWall(
      1,
      "N",
      _getSamplePixel( textures[sSectorFloorTexture], floorPointX,  floorPointY , 1, 1)
    );
    return sFloorPixelToRender;
  }



  function _drawSpritesInSector (currentSector, i) {
    // for each sprite object
    for (var si = 0; si < Object.keys(oLevelSprites).length; si++) {
      var sprite = oLevelSprites[Object.keys(oLevelSprites)[si]];
  
      // check if the sprite is in the current sector
      // console.log(`is ${sprite["name"]} in ${currentSector}?`);
      if( sprite['s'] === currentSector ){
        // console.log(`    YES!! ${sprite["name"]} is in ${currentSector}!!!`);  
        
      
        // reference to the global sprite object (texture etc. will need later)
        var currentSpriteObject = allSprites[sprite["name"]];
  
  
        var spriteAx = sprite["x"] + Math.cos(fPlayerA - PIdiv2) * currentSpriteObject["hghtFctr"] 
        var spriteAy = sprite["y"] + Math.sin(fPlayerA - PIdiv2) * currentSpriteObject["hghtFctr"] 
        var spriteBx = sprite["x"] + Math.cos(fPlayerA + PIdiv2) * currentSpriteObject["hghtFctr"] 
        var spriteBy = sprite["y"] + Math.sin(fPlayerA + PIdiv2) * currentSpriteObject["hghtFctr"] 
  
  
        var intersection = intersectionPoint(
          { x: fPlayerX, y: fPlayerY },
          { x: fPlayerEndX, y: fPlayerEndY },
          { x: spriteAx, y: spriteAy },
          { x: spriteBx, y: spriteBy }
        );
        
  
        // If there is an intersection, update fDistanceToWall
        if (!isNaN(intersection.x) && !isNaN(intersection.y)) {
          fDistanceToSprite = Math.sqrt(
            Math.pow(fPlayerX - intersection.x, 2) +
            Math.pow(fPlayerY - intersection.y, 2)
          );
  
          // Fisheye correction
          fDistanceToSprite *= Math.cos(fAngleDifferences)
  
          // console.log(sprite);
  
          var fSpriteFloor = fscreenHeightFactor + nScreenHeight / fDistanceToSprite * ((1-sprite["h"]) + (fPlayerH)) ; 
          var fSpriteCeil = fscreenHeightFactor - nScreenHeight / fDistanceToSprite * (sprite["h"] + currentSpriteObject['hghtFctr'] - fPlayerH);
  
          fSampleX = texSampleLerp( spriteAx ,spriteAy, spriteBx,  spriteBy, intersection.x, intersection.y );
  
          for(var sj = 0; sj < nScreenHeight; sj ++){
  
            fDepthBufferS[sj * nScreenWidth + i] = 0;
  
            // if( fDepthBuffer[i] >= fDistanceToSprite ){
              if (sj > fSpriteCeil && sj <= fSpriteFloor) {
                // [screen[sj * nScreenWidth + i]] = 'g';
  
                var fSampleY = (sj - fSpriteCeil) / (fSpriteFloor - fSpriteCeil);
  
                var sSamplePixel = _getSamplePixel( currentSpriteObject, fSampleX, fSampleY, 1, 1);
  
                // if(sSamplePixel[0] !== '.'){
                  sPixelToRender = _rh.renderWall(
                    fDistanceToSprite,
                    "V",
                    sSamplePixel
                  );
                  screen[sj * nScreenWidth + i] = sPixelToRender
                  // Update Depth buffer 
                  fDepthBufferS[sj * nScreenWidth + i] = 1;
                // }
              }
              
            // }
          }
          
        }
      }
  
  
    }
  }
  



  var _drawSprites = function () {

    // Things that stay the same for all sprites
    var fEyeX = Math.cos(fPlayerA);
    var fEyeY = Math.sin(fPlayerA);
  
  
    for (var si = 0; si < Object.keys(oLevelSprites).length; si++) {
  
      // the sprite in the level-side
      var sprite = oLevelSprites[Object.keys(oLevelSprites)[si]];
  
      // reference to the global-side sprite object
      var currentSpriteObject = allSprites[sprite["name"]];
  
      
      var fVecX = sprite["x"] - fPlayerX;
      var fVecY = sprite["y"] - fPlayerY;
      var fDistanceFromPlayer = Math.sqrt(fVecX * fVecX + fVecY * fVecY);
  
      // fisheye correction
      fDistanceFromPlayer *= Math.cos(fPlayerA - Math.atan2(fVecY, fVecX));
  
      // calculate angle between sprite and player, to see if in fov
      var fSpriteAngle = Math.atan2(fVecY, fVecX) - Math.atan2(fEyeY, fEyeX);
      if (fSpriteAngle < -PI___) {
        fSpriteAngle += PIx2;
      }
      if (fSpriteAngle > PI___) {
        fSpriteAngle -= PIx2;
      }
  
      var bInPlayerView = Math.abs(fSpriteAngle) < fFOV_div2;
    
  
      // only proceed if sprite is visible
      if (bInPlayerView && fDistanceFromPlayer >= 0.5) {
        // very similar operation to background floor and ceiling.
        // Sprite height is default 1, but we can adjust with the factor passed in the sprite object/
        var fSpriteCeiling = +(fscreenHeightFactor) - (nScreenHeight / +fDistanceFromPlayer)  * currentSpriteObject["hghtFctr"];
        var fSpriteFloor = +(fscreenHeightFactor) + nScreenHeight / +fDistanceFromPlayer ;
  
        var fSpriteCeiling = Math.round(fSpriteCeiling);
        var fSpriteFloor = Math.round(fSpriteFloor);
  
        var fSpriteHeight = fSpriteFloor - fSpriteCeiling;
        // var fSpriteAspectRatio = +currentSpriteObject["height"] / +(currentSpriteObject["width"] * currentSpriteObject["aspctRt"]);
        var fSpriteWidth = fSpriteHeight / currentSpriteObject["aspctRt"];
        var fMiddleOfSprite = (0.5 * (fSpriteAngle / fFOV_div2 ) + 0.5) * +nScreenWidth;
  
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
            // fisheye correction
            fDistanceFromPlayer *= Math.cos(fPlayerA - Math.atan2(fVecY, fVecX));
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
  