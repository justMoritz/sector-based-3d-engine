/**
 * SECTOR ENGINE
 */




// sectors
// 



/**
 * Sector Markup
 * 
 * (required) wall start x/y     [float, float]
 * (required) wall end x/y       [float, float]
 * (required) portal to sector   string or false
 * (required) wall textures      string
 *            x-sample scale     float
 *            Y-sample scale     float
 * 
 */


map = {
  "sector1": [
    [
      [4,2], 
      [5,4], 
      "sector2",
      "#"
    ],     
    [
      [5,4],
      [2,5],
      false,
      "$"
    ],     
    [
      [2, 5],
      [0.5, 4], 
      false,
      "Y"
    ],     
    [
      [0.5, 4],
      [0.2, 0.2],
      false,
      "T",
      10,
      4
    ],     
    [
      [0.2, 0.2],
      [4, 2],
      false,
      "#",
      6
    ]
  ],
  "sector2" : [
    [
      [4,2],
      [5,4],
      "sector1",
      "#",
    ],     
    [
      [4,2],
      [6,1],
      false,
      "o"
    ],     
    [
      [6, 1],
      [7, 2.1],
      false,
      "o"
    ],     
    [
      [7, 2.1],
      [5, 4],
      "sector3",
      "Y"
    ]     
  ],
  "sector3" : [
    [
      [7, 2.1],
      [5, 4], 
      "sector2",
      "o"
    ],     
    [
      [7,2.1],
      [8,4],
      false,
      "#"
    ],     
    [
      [8, 4],
      [6, 6],
      false,
      "#"
    ],     
    [
      [6, 6],
      [4.5, 5],
      "sector4",
      "#"
    ],     
    [
      [4.5, 5],
      [5, 4],
      false,
      "#",
      1
    ]     
  ],
  "sector4" : [
    [
      [6, 6],
      [4.5, 5],
      "sector3",
      "#"
    ],     
    [
      [6, 6],
      [6, 10],
      false,
      "Y"
    ],     
    [
      [6, 10],
      [4.5, 10],
      "sector5",
      "o"
    ],     
    [
      [4.5, 10],
      [4.5, 5],
      false,
      "o",
      8
    ]        
  ],
  "sector5" : [
    [
      [4.5, 10],
      [6, 10],
      "sector4",
      "#"
    ],     
    [
      [4.5, 10],
      [4.5, 14],
      false,
      "Y"
    ],     
    [
      [4.5, 14],
      [6, 14],
      false,
      "o"
    ],     
    [
      [6, 14],
      [6, 10],
      "sector6",
      "o"
    ]        
  ],
  "sector6" : [
    [
      [6, 14],
      [6, 10],
      "sector5",
      "#"
    ],     
    [
      [6, 10],
      [15, 11],
      false,
      "Y",
      8
    ],     
    [
      [15, 11],
      [15, 14],
      false,
      "o"
    ],     
    [
      [15, 14],
      [6, 14],
      false,
      "o",
      8
    ]        
  ],
}

// New approach:
// Standard Floor Height: 0
// Standard Ceiling Height: 1
// up and down from there :)
// of the reference of each
sectorMeta = {
  "sector1" : [
    0.8, // Floor Height
    3, // Ceiling Height
    "#"  // floor texture
  ],
  "sector2" : [
    0.4, 
    2, 
    "Y",
  ],
  "sector3" : [
    0, 
    1.5, 
    "Y",
  ],
  "sector4":[
    0,
    1,
    '#'
  ],
  "sector5":[
    0.2,
    1.5,
    'Y',
  ],
  "sector6": [
    -1.5,
    1,
    'Y'
  ]
}

testmap = {
  map: map,
  sectorMeta: sectorMeta,
  fPlayerX: 6.7,
  fPlayerY: 4.4,
  fPlayerA: 3.8,
  fPlayerH: 0,
  fDepth: 30,
  startingSector: 'sector3',
  sprites: {
    "1": {
      "x": 3,
      "y": 3,
      "r": 2.0,
      "name": "P",
    },
    "3": {
      "x": 5.5,
      "y": 12.5,
      "r": 2.0,
      "name": "O",
    },
    "2": {
      "x": 6,
      "y": 4,
      "r": 2.0,
      "name": "P",
    },
    "4": {
      "x": 9.5,
      "y": 11.4,
      "r": 2.0,
      "name": "chair",
    },
  },
};


// Line with two points on the grid system
// a: x=4 y=2
// b: x=5 y=4
testline = [
  [4,2],
  [5,4]
]




var gameEngineJS = (function () {
  

  /**
   * Loads
   */
  var _loadLevel = function () {
    clearInterval(gameRun);

    // updates the level map, dimensions and textures
    oMap = testmap.map;
    fDepth = testmap.fDepth || fDepth;
    sPlayerSector = testmap.startingSector || startingSector;
    sLastKnownSector = sPlayerSector;
    _moveHelpers.setNewPlayerHeight( sectorMeta[sPlayerSector] );

    // load sprites
    oLevelSprites = testmap.sprites;

    // places the player at the map starting point
    fPlayerX = testmap.fPlayerX;
    fPlayerY = testmap.fPlayerY;
    fPlayerA = testmap.fPlayerA;
    fPlayerH = testmap.fPlayerH;

    main();
  };


  
  function drawSolidWall(j, xxx){
    
  }


  function drawFloor(j, fSectorFloorFactor, sSectorFloorTexture ){

    // var fPerspectiveCalculation2 = (2 - fLooktimer * 0.15);
    // fscreenHeightFactor2 = nScreenHeight / fPerspectiveCalculation2;

    // fscreenHeightFactor2 = nScreenHeight / 2;


    var fPerspectiveCalculation2 = (2 - fPlayerH ) ;
    fscreenHeightFactor2 = nScreenHeight / fPerspectiveCalculation2;

    

    // Define the height of the player above the floor 
    var fPlayerHeight = ( 1 + nNewHeight ) * fSectorFloorFactor;
    // var fPlayerHeight = ( fPlayerH ) * fSectorFloorFactor;

    adjustedHeight = 2 - fPlayerHeight;

    // console.log()
      
    // Calculate the direct distance from the player to the floor pixel
    var directDistFloor = ( (fPlayerHeight * 2 ) * fscreenHeightFactor2) / ((j ) - nScreenHeight / 2  );

    // Calculate real-world distance with the angle relative to the player
    var realDistance = directDistFloor / Math.cos(fPlayerA - fRayAngleGlob);

    // Calculate real-world coordinates with the player angle
    var floorPointX = fPlayerX + Math.cos(fRayAngleGlob) * realDistance;
    var floorPointY = fPlayerY + Math.sin(fRayAngleGlob) * realDistance;

    sFloorPixelToRender = _rh.renderWall(
      realDistance,
      "N",
      _getSamplePixel( textures[sSectorFloorTexture], floorPointX,  floorPointY , 1, 1)
    );
    return sFloorPixelToRender;
  }


  // TODO:
  function drawSectorInformation(i , fDistanceToWall, sWalltype, sWallDirection, nCeiling, nFloor, sectorFloorFactor, sectorCeilingFactor, fSampleX, fSampleXScale, fSampleYScale, sSectorFloorTexture, start, end, nNextSectorCeiling, nNextSectorFloor){
    // draws (into the pixel buffer) each column one screenheight-pixel at a time
    var bScreenStartSet = false;
    var nNewScreenStart = 0;
    var nNewScreenEnd   = 0;

    for (var j = start; j < end; j++) {
      
      // sky
      if (j < nCeiling) {
          screen[j * nScreenWidth + i] = "a";
      }

      // Draws the wall portion that's above or below the ‘window’ through which we are looking into the next sector
      else if (j > nNextSectorCeiling && j <= nNextSectorFloor) {
        // as well as
        screen[j * nScreenWidth + i] = "1";
        // sets the new screen start (the first screen-height-pixel is a wall) 
        // and new screen end variable (whatever last screen-height-pixel of wall we found)
        if(!bScreenStartSet){
          nNewScreenStart = j;
          bScreenStartSet = true;
        }
        nNewScreenEnd = j+1;
      }

      // Draw Solid Wall
      else if (j > nCeiling && j <= nFloor) {

        // Default Pixel (probably don't need)
        var sPixelToRender = "0";

        var fSampleY = (j - nCeiling) / (nFloor - nCeiling);
        sPixelToRender = _rh.renderWall(
          fDistanceToWall,
          sWallDirection,
          _getSamplePixel( textures[sWalltype], fSampleX, fSampleY, fSampleXScale, fSampleYScale)
        );
        screen[j * nScreenWidth + i] = sPixelToRender

      } // End Draw Solid Wall

      // Draw Floor
      else {
        // screen[j * nScreenWidth + i] = drawFloor(j, sectorFloorFactor, sSectorFloorTexture );


        screen[j * nScreenWidth + i] = "a";

        // alternative idea:
        // return the lowest highest value for j for which we draw a wall OR half-screen-height-lookfactor
        // (the furthest point in the sector, and the furthestest wall distance should be at that point)
        // At the end of the drawing loop, we cast the opposite way around?

      }
    } // end draw column loop
    return [nNewScreenStart, nNewScreenEnd];
  }




  /**
   * This function checks and renders a given sector. Then it checks if there are any portals to adjacent sectors
   * It prepares the “window” through which to look into the next sector, and then queues that sector up for rendering
   * The while loop does this semi-recursively until there are no more portals/sectors that need to be rendered
   * @param {string} startingSector 
   * @param {*} i 
   * @param {*} fDistanceToWall 
   * @returns 
   */
  function checkSectors( startingSector, i ){

    var sWallDirection = "N";
    var fDistanceToWall;
    
    var currentSector = startingSector;

    // Queue to store sectors to be checked, and visited sectors
    var sectorQueue = [currentSector];
    var visitedSectors = {};

    // These variables determine where the renderer starts and ends the drawing of each column.
    // These are in screen-space
    // The reason these exist is because when we check each sector in the while loop, 
    // we want the renderer to only draw those columns that are visible through each portal
    var nDrawStart = 0;
    var nDrawEnd   = nScreenHeight;

    while (sectorQueue.length > 0) {
      // Dequeue the first sector from the queue
      currentSector = sectorQueue.shift();

      // Mark the current sector as visited
      visitedSectors[currentSector] = true;

      // the actual sector object from the level file
      var sectorWalls = oMap[currentSector]; 

      var sectorFloorFactor = 1;
      var sectorCeilingFactor = 1;
      var sSectorFloorTexture = "Y";

      // per-sector overrides for floor and ceiling heights
      if(typeof sectorMeta[currentSector] !== 'undefined'){
        sectorFloorFactor = sectorMeta[currentSector][0]
        sectorCeilingFactor = sectorMeta[currentSector][1]

        if(typeof sectorMeta[currentSector][2] !== 'undefined'){
          sSectorFloorTexture = sectorMeta[currentSector][2];
        }
      }

      // for each wall in a sector
      for( var w = 0; w < sectorWalls.length; w++ ){
        // Calculate if the lines of the current eye-vector and the testline variable above intersect,
        // If so, at which point, and then use the distance between that point and the player position (fPlayerX and fPlayerY)
        // to set the fDistanceToWall variable :) 
        var currentWall = sectorWalls[w];
        var wallSamplePosition = null;
        var fSampleXScale = null;
        var fSampleYScale = null;
      
        // Check for intersection of current view vector with the wall-vector we are testing
        var intersection = intersectionPoint(
          { x: fPlayerX, y: fPlayerY },
          { x: fPlayerEndX, y: fPlayerEndY },
          { x: currentWall[0][0], y: currentWall[0][1] },
          { x: currentWall[1][0], y: currentWall[1][1] }
        );

        // If there is an intersection, update fDistanceToWall
        if (!isNaN(intersection.x) && !isNaN(intersection.y)) {
          fDistanceToWall = Math.sqrt(
            Math.pow(fPlayerX - intersection.x, 2) +
            Math.pow(fPlayerY - intersection.y, 2)
          );

          // Fisheye correction
          fDistanceToWall *= Math.cos(fAngleDifferences)
          
          // preliminary wall shading: different shade every other wall
          if(w % 2 == 0){
            sWallDirection = "S";
          }else{
            sWallDirection = "E";
          }

          // Wall Type (texture)
          if(currentWall[3] != false){
            sWallType = currentWall[3];
          }

          // Wall X-Sample Scale Override
          if(typeof currentWall[4] !== 'undefined' && currentWall[4]){
            fSampleXScale = currentWall[4];
          }
          // Wall Y-Sample Scale Override
          if(typeof currentWall[5] !== 'undefined' && currentWall[5]){
            fSampleYScale = currentWall[5];
          }

          // get texture sample position, ceiling and floor height (can vary per sector), and pass to renderer
          wallSamplePosition = texSampleLerp( currentWall[0][0],currentWall[0][1],  currentWall[1][0] ,currentWall[1][1], intersection.x, intersection.y );
          
          // Minus operations required since the sectorCeiling and Floor factors adjust where the wall is rendered. 
          //  Ideally 1 and 1 are the default (since multiplying by 1 won't change anything), but in the level-data
          //  makes more intuitive sense to use 0 (floor) and 1 (ceiling) for default heights, and smaller numbers 
          //  mean smaller heights. This adjusts for this :)
          var nCeiling = fscreenHeightFactor - nScreenHeight / fDistanceToWall * (-0.5+sectorCeilingFactor - fPlayerH);
          var nFloor = fscreenHeightFactor + nScreenHeight / fDistanceToWall * ((1-sectorFloorFactor) + (fPlayerH)) ; 
          
          
          // PORTAL FOUND
          // if the current sector we are looking at has a portal (currentwall[2] !== false)
          // instead of drawing that wall, draw the sector behind the portal where the wall would have been
          if(currentWall[2] != false){
            // sWallDirection = "X";
            nextSector = currentWall[2];

            // If the next sector hasn't been visited yet, enqueue it for checking
            if (!visitedSectors[nextSector]) {
              sectorQueue.push(nextSector);

              var nNextSectorCeiling = nCeiling;
              var nNextSectorFloor = nFloor;

              if(typeof sectorMeta[nextSector] !== 'undefined'){

                nextSectorFloorFactor = sectorMeta[nextSector][0];
                nextSectorCeilingFactor = sectorMeta[nextSector][1];

                // only recalculate if the next sector floor is higher than the previous
                // See also note above about floor and ceiling heights in level data
                if( nextSectorFloorFactor > sectorFloorFactor ){
                  nNextSectorFloor = fscreenHeightFactor + nScreenHeight / fDistanceToWall * ((1-nextSectorFloorFactor) + (fPlayerH));
                }
                nNextSectorCeiling = fscreenHeightFactor - nScreenHeight / fDistanceToWall * (-0.5+nextSectorCeilingFactor - fPlayerH);

              }
         
              // determine the new start and end screen-coordinates for the next sector to be drawn in. 
              // These are essentially a “window” through we we are looking into the new sector
              // This routine otherwise doesn't actually draw anything, so we might consider refactoring
              var newStartAndEnd = drawSectorInformation(
                i , 
                fDistanceToWall, 
                sWallType, 
                sWallDirection, 
                nCeiling, 
                nFloor, 
                sectorFloorFactor,
                sectorCeilingFactor,
                wallSamplePosition, 
                fSampleXScale, 
                fSampleYScale, 
                sSectorFloorTexture,
                nDrawStart,
                nDrawEnd,
                nNextSectorCeiling,
                nNextSectorFloor,
                
              );
              // for the next iteration of non-portal walls seen through this window.
              nDrawStart = newStartAndEnd[0];
              nDrawEnd = newStartAndEnd[1];

            }

          }
          else{
            // Regular wall

            fDepthBuffer[i] = fDistanceToWall;  
            // We don't actually need the return array from this function call
            drawSectorInformation(
              i , 
              fDistanceToWall, 
              sWallType, 
              sWallDirection, 
              nCeiling, 
              nFloor, 
              sectorFloorFactor,
              sectorCeilingFactor,
              wallSamplePosition, 
              fSampleXScale, 
              fSampleYScale, 
              sSectorFloorTexture,
              nDrawStart,
              nDrawEnd,
              false,
              false
            );

          } // end non-portal/portal found

        } // end wall found
        
      } // end iterate over all walls

    }
  };




  /**
   * The basic game loop
   */
  var main = function () {
    var gameTimer = 0;
    gameRun = setInterval(gameLoop, 33);
    function gameLoop() {
      gameTimer++

      _moveHelpers.move();

      // _updateSpriteBuffer();
      // _moveSprites();

      // about every second or so, check that the player is still in the correct sector.
      // Sectors are updated as the player walks through them in _moveHelpers.testWallCollision(), 
      // but it could have missed the player in especially small sectors
      if( gameTimer % 33 === 0 ){
        _moveHelpers.playerSectorCheck();
        gameTimer= 0;
      }


      // normalize player angle
      if (fPlayerA < 0) {
        fPlayerA += PIx2;
      }
      if (fPlayerA > PIx2) {
        fPlayerA -= PIx2;
      }


      // Jumping
      if (bJumping) {
        nJumptimer++;
        fPlayerH += 0.1;
      }
      if (nJumptimer > 10) {
        bFalling = true;
        bJumping = false;
      }


      // falling back down after jump
      if (bFalling && nJumptimer > 0) {
        // handles cases if jumping between different sector heights
        if( fPlayerH < nNewHeight && Math.abs( fPlayerH - nNewHeight) > 0.1 ) {
          fPlayerH = nNewHeight;
          nJumptimer = 0;
          bFalling = false;
        }
        else{
          nJumptimer--;
          fPlayerH -= 0.1;
        }
      }
      else{
        bFalling = false;
      }
      

      // stop falling
      if (nJumptimer < 1) {
        bFalling = false;
      }


      // smoothly adjust sector height to new sector height
      if( !bJumping && !bFalling ){
        if( Math.abs( fPlayerH - nNewHeight) < 0.2  ) {
          fPlayerH = nNewHeight;
        }
        else if( fPlayerH > nNewHeight ){
          fPlayerH -= 0.3;
        }else if( fPlayerH < nNewHeight  ){
          fPlayerH += 0.2;
          nJumptimer = 0;
        }
      }
    

      // Some constants for each loop
      var fPerspectiveCalculation = (2 - fLooktimer * 0.15);
      fscreenHeightFactor = nScreenHeight / fPerspectiveCalculation;


      // for the length of the screenwidth (one frame)
      for (var i = 0; i < nScreenWidth; i++) {
              
        // Calculate the direction of the current ray
        var fRayAngle = fPlayerA - fFOV / 2 + (i / nScreenWidth) * fFOV;
        var fEyeX = Math.cos(fRayAngle);
        var fEyeY = Math.sin(fRayAngle);
        var rayLength = fDepth;
        fPlayerEndX = fPlayerX + fEyeX * rayLength;
        fPlayerEndY = fPlayerY + fEyeY * rayLength;
        
        fAngleDifferences =  fPlayerA - fRayAngle ;
        var angleCorrection = 0;

        // the looking up and down “reverse-fisheyes” the effect. Similar to the skewing of the final image effect,
        // This corrects for this perspective
        if( bUseSkew ){
          var angleCorrection = (10 - _skipEveryXrow(fLooktimer)) * 0.1; 
        }

        if( angleCorrection == 1 ){
          angleCorrection = 0;
        }
        fAngleDifferences *= 1- angleCorrection/4;

        // normalize
        if ( fAngleDifferences < 0) {
          fAngleDifferences += PIx2;
        }
        if (fAngleDifferences > PIx2) {
          fAngleDifferences -= PIx2;
        }
        
        fRayAngleGlob = fRayAngle;

        // checks the current sector, and potentially updates the sector the player might be in
        checkSectors(sPlayerSector, i);

        // TODO: There's got to be a better way to render sprites
        // Namely, let's test the distance to the sprite-center at every ray. 
        // If we hit the sprite, draw the portion of the visible sprite
        // We can make use of the same fDepthBuffer

        // If this doesn't work, the current drawing sprite method works, but it doesn't work with the angle correction.
        // This is because the angle correction is dependent on correcting on a per-column basis, and we don't have that
        // column information anymore once we are done casting the ray.
        


      } // end column loop



      // RENDER SPRITES, DRAW SPRITES
      // _drawSprites();


      if( bUseSkew ){
        _fDrawFrameWithSkew(screen);
      }else{
        _fDrawFrame(screen);
        // _fDrawFrameRGB(screen);
      }

    }
  };


  var init = function (input) {
    // prep document
    eScreen = document.getElementById("display");

    eScreenG = document.getElementById("displayg");
    eScreenB = document.getElementById("displayb");
    eScreenR = document.getElementById("displayr");

    eCanvas = document.getElementById("seconddisplay");
    cCtx    = eCanvas.getContext("2d");
    eDebugOut = document.getElementById("debug");
    eTouchLook = document.getElementById("touchinputlook");
    eTouchMove = document.getElementById("touchinputmove");

    eDebugOut.addEventListener('click', () => {
      toggleFullscreen(eCanvas);
    });

    _moveHelpers.keylisten();
    _moveHelpers.mouseinit();
    _moveHelpers.touchinit();

    // initial gameload
    _loadLevel();
  };

  return {
    init: init,
  };
})();