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
  




  var _rh = {
    // The 4 color values for these start at this point in the array  
    colorReferenceTable:{
      m: ['1', '2', '3', '4'],
      b: ['a', 'b', 'c', 'd'],
      p: ['e', 'f', 'g', 'h'],
      r: ['i', 'j', 'k', 'l'],
      o: ['m', 'n', 'o', 'p'],
      g: ['q', 'r', 's', 't'],
      t: ['u', 'v', 'w', 'x'],
    },
    colorPixelLookupTable: {
      // Black
      '.m': [0, 0, 0],
      '.q': [0, 0, 0],
      '*q': [0, 0, 0],
      '7q': [255, 255, 255],
      '#q': [255, 255, 255],
      
      // Grays
      'om': [66, 66, 66],
      '*m': [133, 133, 133],
      '7m': [171, 171, 171],
      '#m': [248, 248, 248], // 200
  
      // Blues
      'ob': [0, 0, 168],
      '*b': [0, 112, 232],
      '7b': [56, 184, 248],
      '#b': [168, 224, 248],
  
      // Indigos
      'oi': [32, 24, 136],
      '*i': [32, 56, 232],
      '7i': [88, 144, 248],
      '#i': [192, 208, 248],
  
      // Purples
      'ou': [64, 0, 152],
      '*u': [128, 0, 240],
      '7u': [160, 136, 248],
      '#u': [208, 200, 248],
  
      // Pink
      'op': [136, 0, 112],
      '*p': [184, 0, 184],
      '7p': [240, 120, 248],
      '#p': [248, 192, 248],
  
      // Roses
      'os': [168, 0, 16],
      '*s': [224, 0, 88],
      '7s': [248, 112, 176],
      '#s': [248, 184, 216],
  
      // Reds
      'or': [160, 0, 0],
      '*r': [216, 40, 66],
      '7r': [248, 112, 96],
      '#r': [248, 184, 176],
  
      // Oranges
      'oo': [120, 8, 0],
      '*o': [197, 72, 8],
      '7o': [248, 152, 56],
      '#o': [248, 216, 168],
  
      // Yellows
      'oy': [114, 64, 7],
      '*y': [136, 112, 0],
      '7y': [199, 178, 28],
      '#y': [220, 206, 112],
  
      // Army
      'oa': [16, 64, 0],
      '*a': [56, 144, 0],
      '7a': [128, 208, 16],
      '#a': [224, 248, 160],
  
      // Green
      'og': [0, 80, 0],
      '*g': [0, 168, 0], 
      '7g': [72, 216, 72],
      '#g': [168, 240, 184],
  
      // Sea 
      'os': [0, 56, 16],
      '*s': [0, 144, 56],
      '7s': [88, 248, 152],
      '#s': [176, 248, 200],
  
      // Teal
      'ot': [24, 56, 88],
      '*t': [0, 128, 136],
      '7t': [0, 232, 217],
      '#t': [152, 248, 240],
    },
    // the color values
    pixelLookupTable: {
      0: [0, 0, 0], // Black
      1: [66, 66, 66], // 4 Grey Values
      2: [133, 133, 133],
      3: [200, 200, 200],
      4: [255, 255, 255], // White
      a: [32, 24, 136], // 4 Blues
      b: [32, 56, 232],
      c: [88, 144, 248],
      d: [192, 208, 248],
      e: [136, 0, 112], // 4 pinks (consider replacing with orange/brown)
      f: [184, 0, 184],
      g: [240, 120, 248],
      h: [248, 192, 248],
      i: [160, 0, 0], // 4 reds
      j: [216, 40, 66],
      k: [248, 112, 96],
      l: [248, 184, 176],
      m: [114, 64, 7], // 4 oranges (really yellow)
      n: [136, 112, 0],
      o: [199, 178, 28],
      p: [220, 206, 112],
      q: [0, 80, 0], // 4 greens
      r: [0, 168, 0], 
      s: [72, 216, 72],
      t: [168, 240, 184],
      u: [24, 56, 88], // 4 teals
      v: [0, 128, 136],
      w: [0, 232, 217],
      x: [152, 248, 240],
      // Add more entries as needed
    },
    pixelToAscii : {
      0: "b0",
      1: "b25",
      2: "b50",
      3: "b75",
      4: "b100",
      a: "b0", // 4 Blues
      b: "b25",
      c: "b50",
      d: "b75",
      e: "b25", // 4 pinks (consider replacing with orange/brown)
      f: "b50",
      g: "b75",
      h: "b100",
      i: "b0", // 4 reds
      j: "b50",
      k: "b75",
      l: "b100",
      m: "b0", // 4 oranges (really yellow)
      n: "b25",
      o: "b75",
      p: "b100",
      q: "b0", // 4 greens
      r: "b25",
      s: "b75",
      t: "b100",
      u: "b0", // 4 teals
      v: "b50",
      w: "b100",
      x: "b100",
    },
    pixelToAsciiGreen : {
      0: "b0",
      1: "b0",
      2: "b50",
      3: "b75",
      4: "b100",
      a: "b0", // 4 Blues
      b: "b0",
      c: "b25",
      d: "b50",
      e: "b0", // 4 pinks (consider replacing with orange/brown)
      f: "b75",
      g: "b100",
      h: "b100",
      i: "b0", // 4 reds
      j: "b0",
      k: "b75",
      l: "b75",
      m: "b25", // 4 oranges (really yellow)
      n: "b100",
      o: "b75",
      p: "b100",
      q: "b25", // 4 greens
      r: "b50",
      s: "b100",
      t: "b75",
      u: "b25", // 4 teals
      v: "b100",
      w: "b75",
      x: "b75",
    },
    pixelToAsciiBlue : {
      0: "b0",
      1: "b25",
      2: "b25",
      3: "b50",
      4: "b50",
      a: "b25", // 4 Blues
      b: "b50",
      c: "b50",
      d: "b50",
      e: "b50", // 4 pinks (consider replacing with orange/brown)
      f: "b100",
      g: "b100",
      h: "b75",
      i: "b0", // 4 reds
      j: "b25",
      k: "b0",
      l: "b25",
      m: "b0", // 4 oranges (really yellow)
      n: "b0",
      o: "b25",
      p: "b0",
      q: "b0", // 4 greens
      r: "b0",
      s: "b0",
      t: "b0",
      u: "b50", // 4 teals
      v: "b50",
      w: "b25",
      x: "b50",
    },
    pixelToAsciiRed : {
      0: "b0",
      1: "b0",
      2: "b0",
      3: "b0",
      4: "b25",
      a: "b0", // 4 Blues
      b: "b0",
      c: "b0",
      d: "b0",
      e: "b25", // 4 pinks (consider replacing with orange/brown)
      f: "b100",
      g: "b75",
      h: "b75",
      i: "b25", // 4 reds
      j: "b50",
      k: "b75",
      l: "b50",
      m: "b25", // 4 oranges (really yellow)
      n: "b50",
      o: "b50",
      p: "b50",
      q: "b0", // 4 greens
      r: "b25",
      s: "b25",
      t: "b0",
      u: "b0", // 4 teals
      v: "b0",
      w: "b0",
      x: "b25",
    },
    renderWall: function (fDistanceToWall, sWallDirection, pixelArray) {
  
      var pixel = pixelArray[0];
      var color = pixelArray[1] || 'm';
  
      // There are 4 lightness values in each color
      // This assigns the appropriate color value to the current pixel
  
      var b255 = "4";
      var b100 = _rh.colorReferenceTable[color][3];
      var b75  = _rh.colorReferenceTable[color][2];
      var b50  = _rh.colorReferenceTable[color][1];
      var b25  = _rh.colorReferenceTable[color][0];
      var b0   = "0";
  
      var fDepthRatio1 = fDepth/2 / 4;
      var fDepthRatio2 = fDepth/2 / 2.5;
      var fDepthRatio3 = fDepth/2 / 1.25;
      var fDepthRatio4 = fDepth/2 / 1.15;
  
      // var fDepthRatio1 = 4;
      // var fDepthRatio2 = 8;
      // var fDepthRatio3 = 12;
      // var fDepthRatio4 = 20;
  
      // Set default fill value
      let fill = b0;
  
      // if (pixel === "#")fill = b100;
      // else if (pixel === "7") fill = b75;
      // else if (pixel === "*" ) fill = b50;
      // else if (pixel === "o") fill = b25;
      // else fill = b25;
      // return fill;
  
      
      // "&#9109;"; // ⎕
      // var b0   = ".";
      // var b20  = "&#9617;"; // ░
      // var b40  = "&#9618;"; // ▒
      // var b60  = "&#9618;"; // ▒
      // var b80  = "&#9619;"; // ▓
      // var b100 = "&#9608;"; // █
  
      // TODO: (maybe) Convert to lookuptable?
      // Controls the depth shading
      switch (sWallDirection) {
        // Sprites and voxels
        case "V":
          if (fDistanceToWall < fDepthRatio1) {
            if (pixel === "#")fill = b100;
            else if (pixel === "7") fill = b75;
            else if (pixel === "*" ) fill = b50;
            else if (pixel === "o") fill = b25;
            else fill = b25;
          } else if (fDistanceToWall < fDepthRatio2) {
            if (pixel === "#") fill = b75;
            else if (pixel === "7") fill = b50;
            else if (pixel === "*" ) fill = b25;
            else if (pixel === "o") fill = b25;
            else fill = b0;
          } else if (fDistanceToWall < fDepthRatio3) {
            if (pixel === "#") fill = b75;
            else if (pixel === "7") fill = b50;
            else if (pixel === "*" || pixel === "o") fill = b25;
            else fill = b25;
          } else if (fDistanceToWall < fDepth) {
            if (pixel === "#") fill = b50;
            else if (pixel === "7") fill = b25;
            else if (pixel === "*" || pixel === "o") fill = b25;
            else fill = b0;
          }
          break;
  
        // North/South direction
        case "N":
        case "S":
          if (fDistanceToWall < fDepthRatio1) {
            if (pixel === "#")fill = b100;
            else if (pixel === "7") fill = b75;
            else if (pixel === "*" ) fill = b50;
            else if (pixel === "o") fill = b25;
            else fill = b25;
          } else if (fDistanceToWall < fDepthRatio2) {
            if (pixel === "#")fill = b100;
            else if (pixel === "7") fill = b50;
            else if (pixel === "*" ) fill = b50;
            else if (pixel === "o") fill = b25;
            else fill = b25;
          } else if (fDistanceToWall < fDepthRatio3) {
            if (pixel === "#")fill = b75;
            else if (pixel === "7") fill = b50;
            else if (pixel === "*" ) fill = b50;
            else if (pixel === "o") fill = b25;
            else fill = b25;
          } else if (fDistanceToWall < fDepthRatio4) {
            if (pixel === "#")fill = b75;
            else if (pixel === "7") fill = b50;
            else if (pixel === "*" ) fill = b50;
            else if (pixel === "o") fill = b25;
            else fill = b25;
          } else if (fDistanceToWall < fDepth) {
            if (pixel === "#") fill = b50;
            else if (pixel === "7") fill = b50;
            else if (pixel === "*" || pixel === "o") fill = b25;
            else fill = b0;
          }
          break;
  
        // West/East direction
        case "W":
        case "E":
          if (fDistanceToWall < fDepthRatio1) {
            if (pixel === "#")fill = b75;
            else if (pixel === "7") fill = b75;
            else if (pixel === "*" ) fill = b50;
            else if ( pixel === "o") fill = b25;
            else fill = b25;
          } else if (fDistanceToWall < fDepthRatio2) {
            if (pixel === "#")fill = b75;
            else if (pixel === "7") fill = b50;
            else if (pixel === "*" ) fill = b50;
            else if ( pixel === "o") fill = b25;
            else fill = b0;
          } else if (fDistanceToWall < fDepthRatio3) {
            if (pixel === "#")fill = b75;
            else if (pixel === "7") fill = b50;
            else if (pixel === "*" ) fill = b25;
            else if ( pixel === "o") fill = b25;
            else fill = b0;
          } else if (fDistanceToWall < fDepthRatio4) {
            if (pixel === "#")fill = b50;
            else if (pixel === "7") fill = b50;
            else if (pixel === "*" ) fill = b25;
            else if ( pixel === "o") fill = b25;
            else fill = b0;
          } else if (fDistanceToWall < fDepth) {
            if (pixel === "#")fill = b50;
            else if (pixel === "7") fill = b25;
            else if (pixel === "*" ) fill = b25;
            else if ( pixel === "o") fill = b25;
            else fill = b0;
          }
          break;
      
      }
      return fill;
    },
  };
  