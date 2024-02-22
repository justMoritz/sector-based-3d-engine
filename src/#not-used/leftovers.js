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