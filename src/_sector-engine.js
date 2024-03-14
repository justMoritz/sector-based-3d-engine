/**
 * SECTOR ENGINE (Possibly `techsas engine`)
 */

// Line with two points on the grid system
// Not used, just still nostalgic :,)
// a: x=4 y=2
// b: x=5 y=4
// testline = [
//   [4,2],
//   [5,4]
// ]


var gameEngineJS = (function () {
  
  /**
   * Loads
   */
  function _loadLevel (level) {
    clearInterval(gameRun);

    sLevelstring = level.replace(".map", ""); // sets global string

    var loadScriptAsync = function (uri, sLevelstring) {
      return new Promise(function (resolve, reject) {
        var tag = document.createElement("script");
        tag.src = "assets/" + uri;
        tag.id = sLevelstring;
        tag.async = true;

        tag.onload = function () {
          resolve();
        };

        document.getElementById("map").src = "assets/" + level;
        var firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      });
    };

    var levelLoaded = loadScriptAsync(level, sLevelstring);

    levelLoaded.then(function () {
      console.log( window[sLevelstring] )

      // updates the level map, dimensions and textures
      oLevel = window[sLevelstring];
      oMap = oLevel.map;
      fDepth = oLevel.fDepth || fDepth;
      sPlayerSector = oLevel.startingSector || startingSector;
      sLastKnownSector = sPlayerSector;
      
      // load sprites
      oLevelSprites = oLevel.sprites;
      
      // places the player at the map starting point
      fPlayerX = oLevel.fPlayerX;
      fPlayerY = oLevel.fPlayerY;
      fPlayerA = oLevel.fPlayerA;
      fPlayerH = oLevel.fPlayerH;

      _moveHelpers.setNewPlayerHeight( oLevel.map[sPlayerSector] );

      main();

    });


    // // pauses, then starts the game loop
    // _testScreenSizeAndStartTheGame();
    // window.addEventListener("resize", function () {
    //   clearInterval(gameRun);
    //   _testScreenSizeAndStartTheGame();
    // });
  };
  

  // TODO:
  function drawSectorInformation(i , fDistanceToWall, sWalltype, nCeiling, nFloor, sectorFloorFactor, sectorCeilingFactor, fSampleX, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, sSectorFloorTexture, sSectorCeilingTexture, start, end, nNextSectorCeiling, nNextSectorFloor, currentSector){
    // draws (into the pixel buffer) each column one screenheight-pixel at a time
    var bScreenStartSet = false;
    var nNewScreenStart = 0;
    var nNewScreenEnd   = 0;

    for (var j = start; j < end
      ; j++) {
      fDepthBufferR[j * nScreenWidth + i] = fDistanceToWall;
      
      // sky or ceiling
      if (j < nCeiling) {
        if(sSectorCeilingTexture === "bg"){
          sPixelToRender = drawBackground(i, j);
          fDepthBufferR[j * nScreenWidth + i] = 1;
        }
        else{
          sPixelToRender = drawCeiling(i, j, sectorCeilingFactor, sSectorCeilingTexture);
        }
      }

      // Draws the wall portion that's above or below the ‘window’ through which we are looking into the next sector
      else if (j > nNextSectorCeiling && j <= nNextSectorFloor) {
        // as well as
        // sets the new screen start (the first screen-height-pixel is a wall) 
        // and new screen end variable (whatever last screen-height-pixel of wall we found)
        if(!bScreenStartSet){
          nNewScreenStart = j;
          bScreenStartSet = true;
        }
        nNewScreenEnd = j+1;
      }

      // Draw Walls
      else if (j > nCeiling && j <= nFloor) {
        var fSampleY = (j - nCeiling) / (nFloor - nCeiling);
        sPixelToRender = _getSamplePixel( textures[sWalltype], fSampleX, fSampleY, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistanceToWall);
      }

      // Draw Floor
      else {
        sPixelToRender = drawFloor(i, j, sectorFloorFactor, sSectorFloorTexture);
      }

      // draw
      screen[j * nScreenWidth + i] = sPixelToRender; 

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


      try {
        var sectorWalls = oMap[currentSector].walls; 
      } catch (error) {
          console.error(`Sector ${currentSector} Not found`);
      }

      var sectorWalls = oMap[currentSector].walls; 


      var sectorFloorFactor = 1;
      var sectorCeilingFactor = 1;
      var sSectorFloorTexture = "Y";
      var sSectorCeilingTexture = "a";

      // per-sector settings for floors and ceilings
      sectorFloorFactor = oLevel.map[currentSector].floor
      sectorCeilingFactor = oLevel.map[currentSector].ceil
      sSectorFloorTexture = oLevel.map[currentSector].floorTex;
      sSectorCeilingTexture = oLevel.map[currentSector].ceilTex;

      // for each wall in a sector
      for( var w = 0; w < sectorWalls.length; w++ ){
        // Calculate if the lines of the current eye-vector and the testline variable above intersect,
        // If so, at which point, and then use the distance between that point and the player position (fPlayerX and fPlayerY)
        // to set the fDistanceToWall variable :) 
        var currentWall = sectorWalls[w];
        var wallSamplePosition = null;
        var fSampleXScale = null;
        var fSampleYScale = null;
        var fSampleXOffset = null;
        var fSampleYOffset = null;
      
        // Check for intersection of current view vector with the wall-vector we are testing
        var intersection = intersectionPoint(
          { x: fPlayerX, y: fPlayerY },
          { x: fPlayerEndX, y: fPlayerEndY },
          { x: currentWall[0], y: currentWall[1] },
          { x: currentWall[2], y: currentWall[3] }
        );

        // If there is an intersection, update fDistanceToWall
        if (!isNaN(intersection.x) && !isNaN(intersection.y)) {
          fDistanceToWall = Math.sqrt(
            Math.pow(fPlayerX - intersection.x, 2) +
            Math.pow(fPlayerY - intersection.y, 2)
          );

          // Fisheye correction
          fDistanceToWall *= Math.cos(fAngleDifferences)
          
          // Wall Type (texture)
          sWallType = currentWall[4];
          // sWallType = "U";
          // Wall X/Y-Sample Scale Override
          fSampleXScale = currentWall[5];
          fSampleYScale = currentWall[6];
          // Wall Offset Overrides
          fSampleXOffset = currentWall[7];
          fSampleYOffset = currentWall[8];

          // get texture sample position, ceiling and floor height (can vary per sector), and pass to renderer
          wallSamplePosition = texSampleLerp( currentWall[0],currentWall[1],  currentWall[2] ,currentWall[3], intersection.x, intersection.y );
          
          // Minus operations required since the sectorCeiling and Floor factors adjust where the wall is rendered. 
          //  Ideally 1 and 1 are the default (since multiplying by 1 won't change anything), but in the level-data
          //  makes more intuitive sense to use 0 (floor) and 1 (ceiling) for default heights, and smaller numbers 
          //  mean smaller heights. This adjusts for this :)
          var nFloor = fscreenHeightFactor + nScreenHeight / fDistanceToWall * ((1-sectorFloorFactor) + (fPlayerH)) ; 
          var nCeiling = fscreenHeightFactor - nScreenHeight / fDistanceToWall * (-0.5+sectorCeilingFactor - fPlayerH);
          
          
          // PORTAL FOUND
          // if the current sector we are looking at has a portal (currentwall[9] !== false)
          // instead of drawing that wall, draw the sector behind the portal where the wall would have been
          if(currentWall[9] != false){

            nextSector = currentWall[9];

            // If the next sector hasn't been visited yet, enqueue it for checking
            if (!visitedSectors[nextSector]) {
              sectorQueue.push(nextSector);

              var nNextSectorCeiling = nCeiling;
              var nNextSectorFloor = nFloor;

              if(typeof oMap[nextSector] !== 'undefined'){

                nextSectorFloorFactor = oMap[nextSector].floor;
                nextSectorCeilingFactor = oMap[nextSector].ceil;


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
                nCeiling, 
                nFloor, 
                sectorFloorFactor,
                sectorCeilingFactor,
                wallSamplePosition, 
                fSampleXScale, 
                fSampleYScale, 
                fSampleXOffset,
                fSampleYOffset,
                sSectorFloorTexture,
                sSectorCeilingTexture,
                nDrawStart,
                nDrawEnd,
                nNextSectorCeiling,
                nNextSectorFloor,
                currentSector,
                
              );
              // for the next iteration of non-portal walls seen through this window.
              nDrawStart = newStartAndEnd[0];
              nDrawEnd = newStartAndEnd[1];

            }

          }
          else{
            // Regular wall

            // We don't actually need the return array from this function call
            drawSectorInformation(
              i , 
              fDistanceToWall, 
              sWallType, 
              nCeiling, 
              nFloor, 
              sectorFloorFactor,
              sectorCeilingFactor,
              wallSamplePosition, 
              fSampleXScale, 
              fSampleYScale, 
              fSampleXOffset,
              fSampleYOffset,
              sSectorFloorTexture,
              sSectorCeilingTexture,
              nDrawStart,
              nDrawEnd,
              false,
              false,
              currentSector
            );

          } // end non-portal/portal found

        } // end wall found
        
      } // end iterate over all walls

    } // end while sectorQueue length

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
      _moveHelpers.playerHeight();

      if(bDrawSrpites) _updateSpriteBuffer();

      // every 2 frames or so, check that the player is still in the correct sector.
      // Sectors are updated as the player walks through them in _moveHelpers.testWallCollision(), 
      // but it could have missed the player in especially small sectors
      // if( gameTimer % 2 === 0 ){
      //   _moveHelpers.playerSectorCheck();
      //   gameTimer= 0;
      // }

      _moveHelpers.playerSectorCheck();

      // normalize player angle
      if (fPlayerA < 0) {
        fPlayerA += PIx2;
      }
      if (fPlayerA > PIx2) {
        fPlayerA -= PIx2;
      }


      // Some constants for each loop
      var fPerspectiveCalculation = (2 - fLooktimer * 0.15);
      fFloorLooktimer = fLooktimer * 0.15;
      // var fPerspectiveCalculation = 1.999;
      fscreenHeightFactor = nScreenHeight / fPerspectiveCalculation;


      // for each screen-column
      for (var i = 0; i < nScreenWidth; i++) {
              
        // Calculate the direction of the current ray
        var fRayAngle = fPlayerA - fFOV / 2 + (i / nScreenWidth) * fFOV;
        var fEyeX = Math.cos(fRayAngle);
        var fEyeY = Math.sin(fRayAngle);
        var rayLength = fDepth;
        fPlayerEndX = fPlayerX + fEyeX * rayLength;
        fPlayerEndY = fPlayerY + fEyeY * rayLength;
        
        fAngleDifferences =  fPlayerA - fRayAngle ;
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

        if(bDrawSrpites) _drawSpritesNew(i);

      } // end column loop

      
      if (!bDrawRGB && bUseSkew) {
        _fDrawFrameWithSkew(screen);
      }else if(!bDrawRGB){
        _fDrawFrame(screen); 
      }  
      else if (bDrawRGB) {
        _fDrawFrameRGB(screen);
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
    _loadLevel("_testmap.map");
  };

  return {
    init: init,
  };
})();