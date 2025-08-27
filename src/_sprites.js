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
  if( EDITMODE ){ return; }

  // for each sprite object
  for (var si = 0; si < Object.keys(oLevelSprites).length; si++) {
    var sprite = oLevelSprites[Object.keys(oLevelSprites)[si]];

    // reference to the global sprite object (texture etc. will need later)
    var currentSpriteObject = allSprites[sprite["name"]];

    var spriteAx = sprite["x"] + Math.cos(fPlayerA - PIdiv2) * currentSpriteObject["aspctRt"] 
    var spriteAy = sprite["y"] + Math.sin(fPlayerA - PIdiv2) * currentSpriteObject["aspctRt"] 
    var spriteBx = sprite["x"] + Math.cos(fPlayerA + PIdiv2) * currentSpriteObject["aspctRt"] 
    var spriteBy = sprite["y"] + Math.sin(fPlayerA + PIdiv2) * currentSpriteObject["aspctRt"] 


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

      // The angle the sprite is facing relative to the player
      var fSpriteBeautyAngle = fPlayerA - sprite["r"] + PIdiv4;
      if (fSpriteBeautyAngle < 0) {
        fSpriteBeautyAngle += PIx2;
      }
      if (fSpriteBeautyAngle > PIx2) {
        fSpriteBeautyAngle -= PIx2;
      }

      // checks which sprite angle preset to use
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
      

      var fSpriteFloor = fscreenHeightFactor + nScreenHeight / fDistanceToSprite * ((1-sprite["h"]) + (fPlayerH)) ; 
      var fSpriteCeil = fscreenHeightFactor - nScreenHeight / fDistanceToSprite * (sprite["h"] + currentSpriteObject['hghtFctr'] - fPlayerH);

      fSampleX = texSampleLerp( spriteAx ,spriteAy, spriteBx,  spriteBy, intersection.x, intersection.y );

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

          // if angles exist in the sprite, sample the appropriate angle
          if (sprite["a"]) {
            fSamplePixel = _getSamplePixel( currentSpriteObject["angles"][sprite["a"]], fSampleX, fSampleY, 1, 1, 0, 0, fDistanceToSprite, 1, true);
          }
          // regular sampling
          else{
            fSamplePixel = _getSamplePixel( currentSpriteObject, fSampleX, fSampleY, 1, 1, 0, 0, fDistanceToSprite, 1, true);
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