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
  function _loadLevelFromServer (level) {  
    clearInterval(gameRun);
    fetch("http://127.0.0.1:5500/assets/_testmap.json")
      .then(response => response.json())
      .then(json => {
        console.log(json);
        // updates the level map, dimensions and textures
        oLevel = json;
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
  }


    /**
   * Loads
   */
    function _loadLevelFromEditor () {
      clearInterval(gameRun);
  
      // updates the level map, dimensions and textures
      oLevel = window[sLevelstring];
      oMap = leveldata;
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
  
    };
  



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

      // updates the level map, dimensions and textures
      oLevel = window[sLevelstring];
      oMap = oLevel.map;
      fDepth = oLevel.fDepth || fDepth;
      sPlayerSector = oLevel.startingSector || startingSector;
      sLastKnownSector = sPlayerSector;
      
      // load sprites
      // oLevelSprites = oLevel.sprites;
      // oLevelSprites = _generateRandomSprites();
      oLevelSprites = {
        ...oLevel.sprites,
        ..._generateRandomSprites()
      };
      _spriteSanityCheck();

      oLevelVoxels = oLevel.voxels;


      // breaks each voxel object into sprites
      // prepareVoxelObjects();

      // loads textures and creates mipMaps
      oLevelTextures = prepareTextures(textures);

      // places the player at the map starting point
      fPlayerX = oLevel.fPlayerX;
      fPlayerY = oLevel.fPlayerY;
      fPlayerA = oLevel.fPlayerA;
      fPlayerH = oLevel.fPlayerH;

      _moveHelpers.setNewPlayerHeight( oLevel.map[sPlayerSector] );

      _generateRandomSprites();
      bakeWallLighting(4);
      bakeVoxelPositions();
      prepSprites();

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
  function drawSectorInformation (i , fDistanceToWall, sWalltype, nCeiling, nFloor, sectorFloorFactor, sectorCeilingFactor, fSampleX, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, sSectorFloorTexture, sSectorCeilingTexture, start, end, nNextSectorCeiling, nNextSectorFloor, currentSector, fLightValue){
    // draws (into the pixel buffer) each column one screenheight-pixel at a time
    var bScreenStartSet = false;
    var nNewScreenStart = 0;
    var nNewScreenEnd   = 0;
    var sPixelToRender = [0,0,0];

    for (var j = start; j < end; j++) {

      fDepthBufferR[j * nScreenWidth + i] = fDistanceToWall;
      
      // sky or ceiling
      if (j < nCeiling) {
        if(sSectorCeilingTexture === "bg"){
          sPixelToRender = drawBackground(i, j);
          fDepthBufferR[j * nScreenWidth + i] = fDepth;
        }
        else{
          sPixelToRender = drawCeiling(i, j, sectorCeilingFactor, sSectorCeilingTexture, currentSector);
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
        sPixelToRender = _getSamplePixel( oLevelTextures[sWalltype], fSampleX, fSampleY, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistanceToWall, fLightValue, false);
      }

      // Draw Floor
      else {
        sPixelToRender = drawFloor(i, j, sectorFloorFactor, sSectorFloorTexture, currentSector);
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
          fDistanceToWall *= fastCos(fAngleDifferences)

          
          // Wall Type (texture)
          sWallType = currentWall[4];
          // sWallType = "U";
          // Wall X/Y-Sample Scale Override
          fSampleXScale = currentWall[5];
          fSampleYScale = currentWall[6];
          // Wall Offset Overrides
          fSampleXOffset = currentWall[7];
          fSampleYOffset = currentWall[8];

          // get texture sample position, ceiling and floor height (can vary per sector), and pass to renderer. Also used for lighting below
          wallSamplePosition = texSampleLerp( currentWall[0],currentWall[1],  currentWall[2] ,currentWall[3], intersection.x, intersection.y );
          
          // TODO: Bake the wall angle against the world at load-time. Then adjust the position absed on this. This should give us World-space texture
          // That can repeat over severl/all sectors without needing too many adjustments
          // wallSamplePosition = texSampleLerp( 0,0,  10 , 10, intersection.x, intersection.y );

          
          // get accurate, dynamic lighting value, only used in editor, since we need to see it live
          if( EDITMODE ){
            fLightValue = getLightingValue(intersection.x, intersection.y);
          }
          // baked lighting, in various variations :)
          else{
            if( bUseFancyLighting ){
              /*** use baked light values for the given wall. very good, and very close to live ***/
              var oBakedLightingValuesforWall = currentWall.bakedLight;
              var fSampleIndex = wallSamplePosition * (oBakedLightingValuesforWall.length - 1); // corresponding index in the the bakedLight array
              var fSampleIndexLeft = fSampleIndex | 0; // fast floor
              var fSampleIndexRight = (fSampleIndexLeft + 1 < oBakedLightingValuesforWall.length) ? fSampleIndexLeft + 1 : fSampleIndexLeft;
              var fSampleLerpFactor = fSampleIndex - fSampleIndexLeft;
              fLightValue = oBakedLightingValuesforWall[fSampleIndexLeft] * (1 - fSampleLerpFactor) + oBakedLightingValuesforWall[fSampleIndexRight] * fSampleLerpFactor;
            }
            else{
              /*** use baked light values per sector. ***/
              fLightValue = oMap[currentSector].bakedSectorLight;
            }
          }






          
          
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
                fLightValue,
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
              currentSector,
              fLightValue
            );

          } // end non-portal/portal found

        } // end wall found
        
      } // end iterate over all walls

    } // end while sectorQueue length

  };



  var stopGame = function () {
    clearInterval(gameRun);
  }


  // Setup at Game start
  var _gameSettingsInit = function () {
    if(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){
      console.log('hey');
      nScreenWidth = 320;
      // nScreenWidth = window.innerWidth/1.5;
      nScreenHeight = 140;
      nLookLimit = 5;
      fFOV = PI___ / 2.25;
      fFOV_div2 = fFOV / 2;
      nRemovePixels = nScreenWidth - ~~(nScreenWidth*0.85);
      nDrawWidth = nScreenWidth - nRemovePixels * 2;
      fscreenHeightFactorFloor = nScreenHeight / 2;
      bUseFancyLighting = false;
      sPostProcessing = '';
      // bTexFiltering = false;
    }
    else if (bUseSkew) {
      // nScreenWidth = 916;
      // nScreenHeight = 440;
      nScreenWidth = 468;
      nScreenHeight = 220;
      nLookLimit = 8;
      fFOV = PI___ / 2.25;
      fFOV_div2 = fFOV / 2;
      nRemovePixels = nScreenWidth - ~~(nScreenWidth*0.85);
      nDrawWidth = nScreenWidth - nRemovePixels * 2;
      fscreenHeightFactorFloor = nScreenHeight / 2;
      bUseFancyLighting = true;
      sPostProcessing = '10bit';
      sPostProcessing = '';
      // bTexFiltering = false;
    }
    else {
      nScreenWidth = 320;
      nScreenHeight = 220;
      nLookLimit = 10;
      fFOV = PI___ / 2.5; // (PI___ / 4.0 originally)
      fFOV_div2 = fFOV / 2;
      nDrawWidth = nScreenWidth;
      nRemovePixels = 0;
      fscreenHeightFactorFloor = nScreenHeight / 2;
      bUseFancyLighting = true;
      sPostProcessing = '10bit';
    }

  };





  /**
   * The basic game loop
   */
  var main = function ( isEditor ) {
    _gameSettingsInit();
    var gameTimer = 0;

    
    // TODO: Why?
    if( DEBUGMODE ){
      gameLoop()
    }else{
      gameRun = setInterval(gameLoop, 33);
    }

    // variables for FPS measurement (TEMP)
    // var lastTime = performance.now();
    // var fps = 0;
    // END variables for FPS measurement (TEMP)

    function gameLoop() {

      // Output for FPS measurement (TEMP)
      // var now = performance.now();
      // var delta = now - lastTime;   // milliseconds since last frame
      // lastTime = now;
      // fps = 1000 / delta;           // frames per second (rough)
      // _debugOutput( fps.toFixed(1))
      // END Output for FPS measurement (TEMP)

      gameTimer++;

      animationTimer++;
      if (animationTimer > 19) {
        animationTimer = 0;
      }

      // If in editor, update the level map constantly
      if( isEditor ){
        oLevel = leveldata;
        oMap = leveldata.map;
        fDepth = oLevel.fDepth || fDepth;
        oLevelSprites = oLevel.sprites;
      }

      if( oLevel["cameraPath"] && _moveHelpers._updateCamera(gameTimer) ){  
        // intro-sequence
      } else {
        _moveHelpers.move();
        _moveHelpers.playerHeight();
      }



      _moveSprites();
      _updateSpriteBuffer();
      if ( animationTimer == 0 ) {
        _spriteSanityCheck();
      }

      _moveHelpers.playerSectorCheck();

      // _worldFunctions(gameTimer);
      
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
        var fEyeX = fastCos(fRayAngle);
        var fEyeY = fastSin(fRayAngle);
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

        // checks current sector, potentially updates the sector the player might be in, renders all sectors
        setPalette(worldPalette);
        checkSectors(sPlayerSector, i);

        if ( !EDITMODE ) {
          setPalette(spritesPalette);
          _drawCrazyVoxels(i);
          _drawSpritesNew(i);
        }

      } // end column loop

      
      // draws the output
      if ( bUseSkew ) {
        _fDrawFrameWithSkew(screen);
      }else{
        _fDrawFrame(screen); 
      }  

    }
  };


  var init = function (input) {

    // prep document
    eScreen = document.getElementById("display");

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


  var initEditor = function () {
    // prep document
    eScreen = document.getElementById("display");
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

    // load level
    oLevel = leveldata;
    oMap = leveldata.map;
    fDepth = oLevel.fDepth || fDepth;
    // load sprites
    oLevelSprites = oLevel.sprites;
    sPlayerSector = oLevel.startingSector || startingSector;
    sLastKnownSector = sPlayerSector;
    oLevelTextures = prepareTextures(textures);
    
    clearInterval(gameRun);

    // Additional editor-only settings:
    bUseSkew = false;
    bTexFiltering = false;
    sPostProcessing = '';

    main(true);

  };

  return {
    init: init,
    initEditor: initEditor,
    main: main,
    stop: stopGame,
  };
})();