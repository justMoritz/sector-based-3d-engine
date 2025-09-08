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

      var oldX = sprite["x"];
      var oldY = sprite["y"];

      // move the sprite along it's radiant line
      sprite["x"] = +sprite["x"] + +fastCos(sprite["r"]) * fMovementSpeed;
      sprite["y"] = +sprite["y"] + +fastSin(sprite["r"]) * fMovementSpeed;


      if (_moveHelpers.testWallCollisionSprite(sprite, oldX, oldY)) {
        sprite["x"] = oldX;
        sprite["y"] = oldY;
        sprite["r"] = (+sprite["r"] + PI___) % PIx2 - 0.2;
      }


      // if sprite is close to the player, and facing the player, turn around
      // if (sprite["z"] < 1 && ( sprite["a"] !== "B" ) ) {
      //   sprite["r"] = (+sprite["r"] + PIx1_5) % PIx2;
      // }

      if (sprite["z"] < 1 && sprite["a"] !== "B") {
        // vector from sprite → player
        var dx = fPlayerX - sprite.x;
        var dy = fPlayerY - sprite.y;
        var angleToPlayer = Math.atan2(dy, dx);
      
        // reflect heading across line perpendicular to player direction
        var angleDiff = sprite["r"] - angleToPlayer;
        var reflected = angleToPlayer - angleDiff;
      
        sprite["r"] = (reflected + PIx1_5) % PIx2;
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


// checks every sprite every few frames to make sure they behaveb (are in the sector we're expecting). \
// This is expensive, maybe it's only useful for fast sprites
function _spriteSanityCheck() {
  for(var si in oLevelSprites){
      
    for (var sector in oMap) {
      if(sector != 0){
        if ( _moveHelpers.testEntityInSector( sector, oLevelSprites[si]["x"], oLevelSprites[si]["y"] )){
          // console.log(`${oLevelSprites[si]['sc']} was found in ${sector}`);
          if ( oLevelSprites[si]['sc'] != sector){
            // console.log('not supposed to be here');
            oLevelSprites[si]['sc'] = sector;
            oLevelSprites[si]["h"] = oLevel.map[sector].floor;
            // oLevelSprites[si]['speed'] = 0.02;
          }
          break;
        }  
      }
    }
  }
}

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



function _drawSpritesNew (i) {
  if( EDITMODE || !oLevelSprites ){ return; }


  // for each sprite object
  for (var si = 0; si < Object.keys(oLevelSprites).length; si++) {
    var sprite = oLevelSprites[Object.keys(oLevelSprites)[si]];

    // reference to the global sprite object (texture etc. will need later)
    var currentSpriteObject = allSprites[sprite["name"]];

    var spriteAx = sprite["x"] + fastCos(fPlayerA - PIdiv2) * currentSpriteObject["aspctRt"] 
    var spriteAy = sprite["y"] + fastSin(fPlayerA - PIdiv2) * currentSpriteObject["aspctRt"] 
    var spriteBx = sprite["x"] + fastCos(fPlayerA + PIdiv2) * currentSpriteObject["aspctRt"] 
    var spriteBy = sprite["y"] + fastSin(fPlayerA + PIdiv2) * currentSpriteObject["aspctRt"] 



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

      // Fisheye correction
      fDistanceToSprite *= fastCos(fAngleDifferences)

      // to close
      if( fDistanceToSprite < 0.5 ){
          return;
      }

      // checks which sprite angle preset to use
      // if ("superangles" in currentSpriteObject) {
      //   // The angle the sprite is facing relative to the player
      //   var fSpriteBeautyAngle = fPlayerA - sprite["r"] + PIdiv4;
      //   if (fSpriteBeautyAngle < 0) {
      //     fSpriteBeautyAngle += PIx2;
      //   }
      //   if (fSpriteBeautyAngle > PIx2) {
      //     fSpriteBeautyAngle -= PIx2;
      //   }

      //   // normalize to 0–2π
      //   fSpriteBeautyAngle = fSpriteBeautyAngle % PIx2;

      //   // total steps (36 for 360°/10° each)
      //   var steps = currentSpriteObject["superAnglesCount"];
      //   var stepSize = PIx2 / steps; // 10° in radians

      //   // compute index (0–35)
      //   var index = Math.floor(fSpriteBeautyAngle / stepSize);

      //   // sprite key from A01 to A36
      //   var key = "A" + String(index + 1).padStart(2, "0");

      //   sprite["s"] = key;
      // }

      
      if ("superangles" in currentSpriteObject) {
        // relative angle between sprite facing and player
        var fSpriteBeautyAngle = fPlayerA - sprite["r"];

        // flip by 180deg because I'm an idiot (and exported things like a chump lmao)
        fSpriteBeautyAngle += Math.PI;

        // normalize into 0..2π
        if (fSpriteBeautyAngle < 0) fSpriteBeautyAngle += PIx2;
        if (fSpriteBeautyAngle >= PIx2) fSpriteBeautyAngle -= PIx2;

        // slice into X steps
        var steps = currentSpriteObject["superAnglesCount"];
        var stepSize = PIx2 / steps;
        var index = Math.floor(fSpriteBeautyAngle / stepSize);

        // assign key A01..A36
        sprite["s"] = "A" + String(index + 1).padStart(2, "0");
      }
      


      var fSpriteFloor = fscreenHeightFactor + nScreenHeight / fDistanceToSprite * ((1-sprite["h"]) + (fPlayerH)) ; 
      var fSpriteCeil = fscreenHeightFactor - nScreenHeight / fDistanceToSprite * (sprite["h"] + currentSpriteObject['hghtFctr'] - fPlayerH);

      if ( "isVox" in currentSpriteObject ) {
        fSampleX = 1;
      }else{
        fSampleX = texSampleLerp( spriteAx ,spriteAy, spriteBx,  spriteBy, intersection.x, intersection.y );
      }
      

      for(var sj = 0; sj < nScreenHeight; sj ++){

        // makes sure that a) Sprite is not hidden by any wall, 
        // not hidden by any floor pixel
        // and we're drawing within the sprite-height
        if( 
          fDepthBufferR[sj * nScreenWidth + i] >= fDistanceToSprite  &&
          sj > fSpriteCeil && sj <= fSpriteFloor
          )
        {

          var fSampleY = (sj - fSpriteCeil) / (fSpriteFloor - fSpriteCeil);
          var fSamplePixel;
          var sAnimationFrame = '';
          var animFrames = [
            "W1","W1","W1","W1","W1",
            "","","","","","",
            "W2","W2","W2","W2","W2",
            "","","","","","",
          ];
          var sectorLightValue = oMap[sprite["sc"]]["bakedSectorLight"] + 0.1;

          // Like walkframes, but SUPER ;)
          if (sprite["move"] && "superWalkframes" in currentSpriteObject) {

            sAnimationFrame = animFrames[animationTimer];
            
            if(sAnimationFrame !== ""){
              fSamplePixel = _getSamplePixel( currentSpriteObject["superangles"][sprite["s"]][sAnimationFrame], fSampleX, fSampleY, 1, 1, 0, 0, fDistanceToSprite, sectorLightValue, true);
            }
            else{
              fSamplePixel = _getSamplePixel( currentSpriteObject["superangles"][sprite["s"]], fSampleX, fSampleY, 1, 1, 0, 0, fDistanceToSprite, sectorLightValue, true);
            }
          }

          // if superangles exist in the sprite sample the appropriate angle
          else if (sprite["s"]) {
            fSamplePixel = _getSamplePixel( currentSpriteObject["superangles"][sprite["s"]], fSampleX, fSampleY, 1, 1, 0, 0, fDistanceToSprite, sectorLightValue, true);
          }


          // regular sampling
          else{
            fSamplePixel = _getSamplePixel( currentSpriteObject, fSampleX, fSampleY, 1, 1, 0, 0, fDistanceToSprite, sectorLightValue, true);
          }

          // transparency
          var bIsTransparentPix = fSamplePixel.every(element => element === 0);
          
          if( !bIsTransparentPix ){
            fDepthBufferR[sj * nScreenWidth + i] =  fDistanceToSprite;
            screen[sj * nScreenWidth + i] = fSamplePixel
          }
        
        }
      }
    }
  }
}

function _drawCrazyVoxels (i) {
  if( EDITMODE || !oLevelVoxels ){ return; }

  // only check every 8th 
  if(i % 10){
    return;
  }

  // for each sprite object
  for (var si = 0; si < Object.keys(oLevelVoxels).length; si++) {
    var sprite = oLevelVoxels[Object.keys(oLevelVoxels)[si]];

    // reference to the global sprite object (texture etc. will need later)
    var currentSpriteObject = allSprites[sprite["name"]];

    var spriteAx = sprite["x"] + fastCos(fPlayerA - PIdiv2) * currentSpriteObject["aspctRt"] 
    var spriteAy = sprite["y"] + fastSin(fPlayerA - PIdiv2) * currentSpriteObject["aspctRt"] 
    var spriteBx = sprite["x"] + fastCos(fPlayerA + PIdiv2) * currentSpriteObject["aspctRt"] 
    var spriteBy = sprite["y"] + fastSin(fPlayerA + PIdiv2) * currentSpriteObject["aspctRt"] 

    var intersection = intersectionPoint(
      { x: fPlayerX, y: fPlayerY },
      { x: fPlayerEndX, y: fPlayerEndY },
      { x: spriteAx, y: spriteAy },
      { x: spriteBx, y: spriteBy }
    );

    // If there is an intersection, update fDistanceToSprite
    if (!isNaN(intersection.x) && !isNaN(intersection.y)) {
      
      // was:
      // fDistanceToSprite = Math.sqrt(
      //   Math.pow(fPlayerX - intersection.x, 2) +
      //   Math.pow(fPlayerY - intersection.y, 2)
      // );
      var sdx = fPlayerX - intersection.x;
      var sdy = fPlayerY - intersection.y;
      fDistanceToSprite = Math.sqrt(sdx * sdx + sdy * sdy);

      // Fisheye correction
      // fDistanceToSprite *= fastCos(fAngleDifferences)

      // the closer we get, the more we skip
      if( fDistanceToSprite < 1.5 ){
        if(i % 20){
          return;
        }
      }
      else if( fDistanceToSprite < 1 ){
        if(i % 60){
          return;
        }
      }
      else if( fDistanceToSprite < 0.5 ){
        if(i % 120){
          return;
        }
      }
      else if( fDistanceToSprite < 0.2 ){
        if(i % 200){
          return;
        }
      }
            
      if ("vox" in currentSpriteObject) {

        for (var subVoxel of sprite["voxPos"]) {

          // world-space position of this subVoxel
          // No Trig for rotation ... to expensive
          // instead we calculate the rotation at level-load, write them into oLevelSprites
          var subX = sprite["x"] + subVoxel.x;
          var subY = sprite["y"] + subVoxel.y;

          // vector from player to subVoxel
          var fVecX = subX - fPlayerX;
          var fVecY = subY - fPlayerY;

          // distance
          var fDistanceToSub = Math.sqrt(fVecX * fVecX + fVecY * fVecY);
          if (fDistanceToSub <= 0.1) continue; // skip too close

          // angle from player forward to subVoxel
          var fAngleToSub = Math.atan2(fVecY, fVecX) - fPlayerA;
          if (fAngleToSub < -PI___) fAngleToSub += PIx2;
          if (fAngleToSub > PI___)  fAngleToSub -= PIx2;

          fDistanceToSub *= fastCos(fAngleToSub);

          // project angle to screen column
          // was: Math.floor(  (0.5 * (fAngleToSub / (fFOV / 2)) + 0.5) * nScreenWidth );
          var nSubColumn = ( (0.5 * (fAngleToSub / (fFOV / 2)) + 0.5) * nScreenWidth ) << 0;

          if (nSubColumn < 0 || nSubColumn >= nScreenWidth) continue;

          // vertical span on screen
          var fSpriteFloor = fscreenHeightFactor + nScreenHeight / fDistanceToSub * ((1 - sprite["h"]) + fPlayerH);
          var fSpriteCeil  = fscreenHeightFactor - nScreenHeight / fDistanceToSub * (sprite["h"] + currentSpriteObject["hghtFctr"] - fPlayerH);

          // sorts the subsprite back to front for drawing, farthest first
          currentSpriteObject["vox"].sort((a, b) => {
            var da = (sprite.x + a.x - fPlayerX) ** 2 + (sprite.y + a.y - fPlayerY) ** 2;
            var db = (sprite.x + b.x - fPlayerX) ** 2 + (sprite.y + b.y - fPlayerY) ** 2;
            return db - da;
          });

          var light = 1;

          // loop vertical pixels
          // was: for (var sj = Math.floor(fSpriteCeil); sj < fSpriteFloor; sj++) {
          for (var sj = (fSpriteCeil << 0); sj < fSpriteFloor; sj++) {

            if (sj < 0 || sj >= nScreenHeight) continue;

            if (fDepthBufferR[sj * nScreenWidth + nSubColumn] >= fDistanceToSub) {
              var fSampleY = (sj - fSpriteCeil) / (fSpriteFloor - fSpriteCeil);

              // copy parent’s props into subVoxel for sampling
              subVoxel.width    = currentSpriteObject.width;
              subVoxel.height   = currentSpriteObject.height;
              subVoxel.aspctRt  = currentSpriteObject.aspctRt;
              subVoxel.hghtFctr = currentSpriteObject.hghtFctr;
              subVoxel.scale    = currentSpriteObject.scale;


              // TODO: Incorporate looktimer
              light = sj * 0.0066;

              // transparency check...
              // sample subVoxel texture, first column of the texture only. Only used for transparency check—
              // it's cheaper to do this only once for the entire column, before the smear. 
              // This does mean that within each subvox, transparency is only set here. 
              // So, if a column is 3 pixels wide (for example) all 3 pixels wide would be transparent
              // It's not a bad tradeoff IMO
              var fSamplePixel = _getSamplePixelDirect( subVoxel, 1, fSampleY, 1, 1, 0, 0, 1, 1, true );
              var bIsTransparentPix = fSamplePixel.every(e => e === 0);
              if (!bIsTransparentPix) {

                // Instead of rendering essentially one screen column where the subsprite is actually located,                
                // we expand (smear) the very thin, single-column subVox into a arbitrary thickness, which correlates
                // To the distance from player, simulating perspective
                // was: var fThickness = Math.max(1, Math.floor(25 / (fDistanceToSub + 0.001)));
                var fThickness = (25 / (fDistanceToSub + 0.001)) | 0 || 1;


                // was: for (var dx = -Math.floor(fThickness/2); dx <= Math.floor(fThickness/2); dx++) {
                for (var dx = -(fThickness >> 1); dx <= (fThickness >> 1); dx++) {
                  var col = nSubColumn + dx;
                  if (col >= 0 && col < nScreenWidth) {
                    if (fDistanceToSub < fDepthBufferR[sj * nScreenWidth + col] - 0.001) {

                      // samplepixel for the expanded subVox
                      var fSampleX = (dx + fThickness/2) / fThickness;
                      fSamplePixel = _getSamplePixelDirect(
                        subVoxel,
                        fSampleX,
                        fSampleY,
                        1,1,0,0,
                        fDistanceToSub,
                        light,
                        true
                      );

                      screen[sj * nScreenWidth + col] = fSamplePixel;
                      fDepthBufferR[sj * nScreenWidth + col] = fDistanceToSub;
                    }
                  }
                } 

              } // end if (!bIsTransparentPix)
            } // end  if (fDepthBufferR[sj …
          } // end for (var sj …
        } // end for (var subVoxel of sprite["voxPos"]) …
      } // end if ("vox" in currentSpriteObject)
    } // end if (!isNaN(intersection.x) && !isNaN(intersection.y))
  } // end for each sprite object
}







function spriteHitsWall(sprite) {
  // project sprite's facing direction into a screen column
  const dirX = fastCos(sprite["r"]);
  const dirY = fastSin(sprite["r"]);

  // angle from player to sprite's forward vector
  const fAngleToSprite = Math.atan2(dirY, dirX);

  // normalize angle to 0..2π
  let relAngle = fAngleToSprite - fPlayerA;
  if (relAngle < 0) relAngle += PIx2;
  if (relAngle >= PIx2) relAngle -= PIx2;

  // which screen column that angle corresponds to
  const col = Math.floor((relAngle / fFOV) * nScreenWidth);
  if (col < 0 || col >= nScreenWidth) return false; // off-screen, ignore

  // how far sprite wants to move forward
  const stepDist = sprite["speed"] || 0.03;
  const newZ = sprite["z"] - stepDist;

  // compare with depth buffer at that column
  if (newZ <= fDepthBuffer[col]) {
    return false; // open space
  } else {
    return true; // wall is closer than new position
  }
}


var _randomIntFromInterval = function (min, max) {
  // min and max included
  return ~~(Math.random() * (max - min + 1) + min);
};

// generates only pogels that can be placed
var _generateRandomCoordinates = function () {
  var x = +_randomIntFromInterval(18, 30) + 0;
  var y = +_randomIntFromInterval(14, 30) - 0;

  // while (map[~~y * nDrawWidth + ~~x] != ".") {
    // x = +_randomIntFromInterval(0, 20) + 1;
    // y = +_randomIntFromInterval(0, 20) - 1;
  // }

  var oCoordinates = {
    x: x,
    y: y,
  };

  return oCoordinates;
};

// generate random Sprites
var _generateRandomSprites = function (nNumberOfSprites) {
  nNumberOfSprites = 15;
    // nNumberOfSprites || Math.round((nMapWidth * nMapWidth) / 15);
  // generates random SUPERpogels
  var oRandomLevelSprites = {};
  for (var m = 0; m < nNumberOfSprites; m++) {
    var randAngle = _randomIntFromInterval(0, PIx2);
    var nSpriteRand = _randomIntFromInterval(0, 3);
    var randomCoordinates = _generateRandomCoordinates();
    var oRandomSprite = {
      x: randomCoordinates.x,
      y: randomCoordinates.y,
      r: randAngle,
      name: nSpriteRand === 1 ? "lil" : "superpogel",
      // name: "superpogel",
      move: true,
      sc: 1,
      speed: _randomIntFromInterval(1.5, 3) * 0.01,
    };
    oRandomLevelSprites[m] = oRandomSprite;
  }
  return oRandomLevelSprites;
};