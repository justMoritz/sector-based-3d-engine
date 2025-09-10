/**
 * 
 * Move Helpers
 * 
 */





// keyboard and mouse
var _moveHelpers = {


  // 
  /**
   * 
   * @param {*} sectorName 
   * @param {*} fEntityX 
   * @param {*} fEntityY 
   * @returns  Simple test: If we hit an even number of walls (incl. 0), 
   *           we are NOT in the sector, odd number means we ARE
   */
  testEntityInSector: function ( sectorName, fEntityX, fEntityY ){
    var nSafeSector = parseInt(Math.ceil(sectorName));
    if( nSafeSector === 0 ) nSafeSector = 1;
    var allCurrentWalls = oMap[nSafeSector].walls;
    var nWallsHit = 0;

    // We're using fPlayerAngle = 0 for the direction, since it doesn't matter which direction we are firing the ray in.
    fEntityEndX = fEntityX + 1 * fDepth;  // fEyeX = fastCos(0) === 1
    fEntityEndY = fEntityY + 0 * fDepth;  // fEyeY = fastSin(0) === 0

    for( var w = 0; w < allCurrentWalls.length; w++ ){
      var currentWall = allCurrentWalls[w];

      var intersection = intersectionPoint(
        { x: fEntityX, y: fEntityEndY },
        { x: fEntityEndX, y: fEntityEndY },
        { x: currentWall[0], y: currentWall[1] },
        { x: currentWall[2], y: currentWall[3] }
      );
      if (!isNaN(intersection.x) && !isNaN(intersection.y)) {
        nWallsHit++
      }
    }
    return ( nWallsHit % 2 )
  },

  

  // This function checks if the player is still in the sector they are supposed to 
  // Sectors are updated as the player walks through them in testWallCollision(), 
  // but it could have missed the player in especially small sectors
  playerSectorCheck: function () {
    
    // Check for player in last known sector
    if( _moveHelpers.testEntityInSector( sLastKnownSector, fPlayerX, fPlayerY ) ){
      return;
    }
    
    // checking for player in connecting sectors to last known sector
    var lastKnownSectorMap = oMap[sLastKnownSector].walls;
    for (var l = 0; l < lastKnownSectorMap.length; l++) {
      var connectingSector = lastKnownSectorMap[l][7];
      if (connectingSector && _moveHelpers.testEntityInSector( connectingSector, fPlayerX, fPlayerY )) {
        console.log(`Player sector ${connectingSector} found via CONNECTING SEARCH`);
        // set new global sector and player height
        sPlayerSector = connectingSector;
        sLastKnownSector = connectingSector;
        _moveHelpers.setNewPlayerHeight( oLevel.map[sPlayerSector] );
        return;
      }
    }
     
    // else check for player in all sectors via linear search in level data
    for (let sector in oMap) {
      if(sector != 0){
        if ( _moveHelpers.testEntityInSector( sector, fPlayerX, fPlayerY )){
          console.log(`player in ${sector} found via LINEAR SEARCH`);
          // set new global sector and player height
          sPlayerSector = sector;
          sLastKnownSector = sector;
          _moveHelpers.setNewPlayerHeight( oLevel.map[sPlayerSector] );
          return;
        }  
      }
    }
  },

  

  // Similar to Player Sector Check, but for sprites.
  // Broken into its own function for clarity. 
  // This function gets called a lot!
  spriteSectorCheckOLD: function (fEntityX, fEntityY) {

    // Check for player in last known sector
    if( _moveHelpers.testEntityInSector( sLastKnownSector, fEntityX, fEntityY ) ){
      return;
    }
    
    // checking for player in connecting sectors to last known sector
    var lastKnownSectorMap = oMap[sLastKnownSector];
    for (var l = 0; l < lastKnownSectorMap.length; l++) {
      var connectingSector = lastKnownSectorMap[l][2];
      if (connectingSector && _moveHelpers.testEntityInSector( connectingSector, fEntityX, fEntityY )) {
        // set new global sector and player height
        sPlayerSector = connectingSector;
        sLastKnownSector = sPlayerSector;
        _moveHelpers.setNewPlayerHeight( oLevel.map[sPlayerSector] );
        return;
      }
    }

    
    // else check for player in all sectors via linear search in level data
    // for (let sector in oMap) {
    for (let sector in oMap) {
      if ( _moveHelpers.testEntityInSector( sector, fEntityX, fEntityY )){
        // set new global sector and player height
        sPlayerSector = sector;
        sLastKnownSector = sPlayerSector;
        _moveHelpers.setNewPlayerHeight( oLevel.map[sPlayerSector] );
        return;
      }
    }
  },

  // swept collision approach:
  // Casting a ray from the old to the new (projected) coordinates.
  // checks all walls on the way. Since it's a continuous line, if it hits any walls, 
  // the move is illegal and we need to try again :)
  spriteSectorCheck: function (fOldX, fOldY, fNewX, fNewY) {
    var bWasHit = false;
    var oClosestHit = null;
    var nClosestHitLen = 2000; 
    var nClosestHitSector = 0;
  
    for (var si in oMap) {
      if (si == 0) continue; 

      var currentSector = oMap[si];
  
      var allCurrentWalls = currentSector.walls;
      for (var wi = 0; wi < allCurrentWalls.length; wi++) {
        var wall = allCurrentWalls[wi];
  
        var intersection = intersectionPoint(
          { x: fOldX, y: fOldY },
          { x: fNewX, y: fNewY },
          { x: wall[0], y: wall[1] },
          { x: wall[2], y: wall[3] }
        );

        // After ever wall that was positively hit, we need to determine the closest hit to the sprite
        if (!isNaN(intersection.x) && !isNaN(intersection.y)) {
          bWasHit = true;

          // some fast-magic screwery that determines the closest hit
          var hitLenSq = (intersection.x - fOldX) ** 2 + (intersection.y - fOldY) ** 2;

          if (hitLenSq < nClosestHitLen) {
            nClosestHitLen = hitLenSq;
            oClosestHit = { x: intersection.x, y: intersection.y };
            nClosestHitSector = wall[9];
          }
        }
      } // end wall loop
    } // end sector loop
    var oHitPoint = {};
    oHitPoint.hit = bWasHit;
    oHitPoint.coords = oClosestHit;
    oHitPoint.connectingSector = nClosestHitSector;
    return oHitPoint;
  },  


  // sets the player height when a sector is changed
  setNewPlayerHeight: function ( input ){
    // console.log(input)
    if(typeof input !== 'undefined'){
      nSectorFloorHeight =  input.floor 
    }else{
      fPlayerH = 0;
    }
    nSectorCeilingHeight = input.ceil;
  },


  // takes a vector from current position to requested new position (maybe x2?)
  // check all the walls in the current sector for intersection against that vector
  // If the vector collides with any wall EXCEPT a portal
  testWallCollision: function( testX, testY){

    // look at all walls in the current player sector
    var allCurrentWalls = oMap[sPlayerSector].walls;

    var fCheckX = fPlayerX;
    var fCheckY = fPlayerY;

    for( var w = 0; w < allCurrentWalls.length; w++ ){
      var fTestDistanceToWall = fDepth;
      var currentWall = allCurrentWalls[w];
      var intersection = intersectionPoint(
        { x: fCheckX, y: fCheckY },
        { x: testX, y: testY },
        { x: currentWall[0], y: currentWall[1] },
        { x: currentWall[2], y: currentWall[3] }
      );
      if (!isNaN(intersection.x) && !isNaN(intersection.y)) {
        fTestDistanceToWall = Math.sqrt(
          Math.pow(fCheckX - intersection.x, 2) +
          Math.pow(fCheckY - intersection.y, 2)
        );
        // close enough to be considered hitting the wall
        if(fTestDistanceToWall < 1){
          // if this wall we are hitting is considered a portal
          if(currentWall[9] != false){
            var collisionSector = currentWall[9];

            // Doesn't allow player to move over an incline that is too large (player needs to jump)
            if( fPlayerH - (oLevel.map[collisionSector].floor) < -0.5 ){
              return true; // don't allow move
            }
            
            // set new global sector and set new player Height
            sPlayerSector = collisionSector;
            sLastKnownSector = sPlayerSector;
            _moveHelpers.setNewPlayerHeight( oLevel.map[sPlayerSector] );

            // and allow moving
            return false;
          }
          else{
            // non-portal wall, don't allow move
            return true;
          }
        }
      }
    }
    return false;
  },

  // takes a vector from current position to requested new position (maybe x2?)
  // check all the walls in the current sector for intersection against that vector
  // If the vector collides with any wall EXCEPT a portal
  testWallCollisionSprite: function(sprite, testX, testY){
    

    // look at all walls in the current sprite sector
    var allCurrentWalls = oMap[sprite["sc"]].walls;
    // console.log( oMap[sprite["sc"]] )

    var fCheckX = sprite["x"];
    var fCheckY = sprite["y"];
  

    for( var w = 0; w < allCurrentWalls.length; w++ ){
      var fTestDistanceToWall = fDepth;
      var currentWall = allCurrentWalls[w];
      var intersection = intersectionPoint(
        { x: fCheckX, y: fCheckY },
        { x: testX, y: testY },
        { x: currentWall[0], y: currentWall[1] },
        { x: currentWall[2], y: currentWall[3] }
      );

      if (!isNaN(intersection.x) && !isNaN(intersection.y)) {
        fTestDistanceToWall = Math.sqrt(
          Math.pow(fCheckX - intersection.x, 2) +
          Math.pow(fCheckY - intersection.y, 2)
        );
        // close enough to be considered hitting the wall
        if(fTestDistanceToWall < 0.025){

          // if this wall we are hitting is considered a portal
          if(currentWall[9] != false){
            var collisionSector = currentWall[9];

            // sprites can't walk over obstacles that are too high
            if( sprite["h"] - (oMap[collisionSector].floor) < -0.5 ){
              return true; // don't allow move
            }
            
            // set new sprite-sector and set new sprite Height
            sprite["sc"] = collisionSector;
            sprite["h"] = oMap[sprite["sc"]].floor;

            // and allow moving
            return false;
          }
          else{
            // non-portal wall, don't allow move
            return true;
          }
        }
      }
    }
    return false;
  },

  // keystroke listening engine
  keylisten: function () {
    window.onkeydown = function (e) {

      // TODO: reimplement pause
      // if (e.which == 80) {
      //   // p
      //   if (bPaused) {
      //     _testScreenSizeAndStartTheGame();
      //     bPaused = false;
      //   } else {
      //     clearInterval(gameRun);
      //     bPaused = true;
      //   }
      // }
      if (e.which == 16) {
        // shift
        bRunning = false;
      }
      if (e.which == 32) {
        // space
        if (!bFalling) {
          bJumping = true;
        }
      }
      if ((e.which == 65 && !EDITMODE) || e.which == 188) {
        // a or ,
        bStrafeLeft = true;
      }
      if ((e.which == 68 && !EDITMODE) || e.which == 190) {
        // d or .
        bStrafeRight = true;
      }
      if ((e.which == 81 && !EDITMODE) || e.which == 37) {
        // q or left
        bTurnLeft = true;
      }
      if ((e.which == 69 && !EDITMODE) || e.which == 39) {
        // e or right
        bTurnRight = true;
      }
      if ((e.which == 87 && !EDITMODE) || e.which == 38) {
        // w or up
        bMoveForward = true;
      }
      if ((e.which == 83 && !EDITMODE) || e.which == 40) {
        // s or down
        bMoveBackward = true;
      }
      if (e.which == 222 && EDITMODE) {
        // '
        fLooktimer++;
      }
      if (e.which == 191 && EDITMODE) {
        // /
        fLooktimer--;
      }
      if (e.which == 70 && e.altKey) {
        // f + alt
        bTexFiltering = !bTexFiltering;
      }
    };

    window.onkeyup = function (e) {
      if (e.which == 16) {
        // shift
        bRunning = true;
      }
      if (e.which == 32) {
        // space
        bJumping = false;
        bFalling = true;
      }
      if ((e.which == 65 && !EDITMODE) || e.which == 188) {
        // a or ,
        bStrafeLeft = false;
      }
      if ((e.which == 68 && !EDITMODE) || e.which == 190) {
        // d or .
        bStrafeRight = false;
      }
      if ((e.which == 81 && !EDITMODE) || e.which == 37) {
        // q or left
        bTurnLeft = false;
      }
      if ((e.which == 69 && !EDITMODE) || e.which == 39) {
        // e or right
        bTurnRight = false;
      }
      if ((e.which == 87 && !EDITMODE) || e.which == 38) {
        // w or up
        bMoveForward = false;
      }
      if ((e.which == 83 && !EDITMODE) || e.which == 40) {
        // s or down
        bMoveBackward = false;
      }
    };
  },


  /**
   * Y-Movement
   * @param  {float}  fMoveInput   the movement from touch or mouse-input
   * @param  {float}  fMoveFactor  factor by which to multiply the recieved input
   *
   * Ultimately modifies the `fLooktimer` variable, which is global :)
   */
  yMoveUpdate: function (fMoveInput, fMoveFactor) {
    // look up/down (with bounds)
    var fYMoveBy = fMoveInput * fMoveFactor;
  
    // if the looktimer is negative (looking down), increase the speed exponentially
    if (fLooktimer < 0) {
      fYMoveBy = fYMoveBy * Math.pow(1.2, -fLooktimer);
    }else{
      fYMoveBy = fYMoveBy * Math.pow(1.2, fLooktimer);
    }

    // Update the looktimer
    fLooktimer -= fYMoveBy;
  
    // Check and adjust boundaries
    if (fLooktimer > nLookLimit * 0.7 || fLooktimer < -nLookLimit * 3) {
      fLooktimer += fYMoveBy;
    }
  },
  

  mouseLook: function () {
    var fMouseLookFactor = 0.002;

    document.body.requestPointerLock();
    document.onmousemove = function (e) {
      // look left/right
      fPlayerA +=
        e.movementX * fMouseLookFactor ||
        e.mozMovementX * fMouseLookFactor ||
        e.webkitMovementX * fMouseLookFactor ||
        0;

      // look up and down
      _moveHelpers.yMoveUpdate(
        e.movementY || e.mozMovementY || e.webkitMovementY || 0,
        0.05
      );
    };
  },

  // mouse
  mouseinit: function () {
    touchinputlook.onclick = _moveHelpers.mouseLook;
    touchinputmove.onclick = _moveHelpers.mouseLook;
  },

  // holds and tracks touch-inputs
  oTouch: {
    move: {
      x: 0,
      y: 0,
      bFirstTouch: true,
    },
    look: {
      x: 0,
      y: 0,
      bFirstTouch: true,
    },
  },

  /**
   * Calculates the difference between touch events fired
   * @param  {object} prev  information about the state
   * @param  {event}  e     the event
   * @return {object}       x and y coordinates
   */
  touchCalculate: function (prev, e) {
    var oDifference = {};

    // fetch and compare touch-points
    // always [0] because no multitouch
    var fInputX = e.changedTouches[0].clientX;
    var fInputY = e.changedTouches[0].clientY;

    var differenceX = fInputX - prev.x;
    var differenceY = fInputY - prev.y;

    prev.x = fInputX;
    prev.y = fInputY;

    oDifference = {
      x: differenceX,
      y: differenceY,
    };

    return oDifference;
  },

  // initialize the touch listeners for walk and move areas
  touchinit: function () {
    // look (left hand of screen)
    eTouchLook.addEventListener("touchmove", function (e) {
      // fetches differences from input
      var oDifferences = _moveHelpers.touchCalculate(
        _moveHelpers.oTouch.look,
        e
      );

      // makes sure no crazy
      if (oDifferences.x < 10 && oDifferences.x > -10) {
        _moveHelpers.oTouch.look.bFirstTouch = false;
      }

      if (!_moveHelpers.oTouch.look.bFirstTouch) {
        // left and right
        fPlayerA += oDifferences.x * 0.005;

        // up and down
        _moveHelpers.yMoveUpdate(oDifferences.y, 0.1);
      }
    });


    // TODO: move
    var nDoubleTapThreshold = 300;
    var nLastTapTime = 0;


    // reset look
    eTouchLook.addEventListener("touchend", function () {
      _moveHelpers.oTouch.look.x = 0;
      _moveHelpers.oTouch.look.y = 0;
      _moveHelpers.oTouch.look.bFirstTouch = true;

      // double-tap
      var fNow = performance.now();
      var nTapLength = fNow - nLastTapTime;
      if (nTapLength < nDoubleTapThreshold && nTapLength > 0) {
        bJumping = true;
        setTimeout(() => { bJumping = false; }, 1000);
      }
      nLastTapTime = fNow;
    });

    // move (right hand of screen)
    eTouchMove.addEventListener("touchmove", function (e) {
      var oDifferences = _moveHelpers.touchCalculate(
        _moveHelpers.oTouch.move,
        e
      );

      // makes sure no crazy
      if (oDifferences.x < 10 && oDifferences.x > -10) {
        _moveHelpers.oTouch.move.bFirstTouch = false;
      }

      // first touch will be a huge difference, that"s why we only move after the first touch
      if (!_moveHelpers.oTouch.move.bFirstTouch) {
        const fOrigX = fPlayerX;
        const fOrigY = fPlayerY;
      
        // walk
        let fNewPlayerX = fOrigX - (fastSin(fPlayerA) + 5.0 * 0.0051) * oDifferences.x * 0.05;
        let fNewPlayerY = fOrigY + (fastCos(fPlayerA) + 5.0 * 0.0051) * oDifferences.x * 0.05;
      
        // strafe
        fNewPlayerX += (fastCos(fPlayerA) + 5.0 * 0.0051) * -oDifferences.y * 0.05;
        fNewPlayerY += (fastSin(fPlayerA) + 5.0 * 0.0051) * -oDifferences.y * 0.05;
      
        if (!_moveHelpers.testWallCollision(fNewPlayerX, fNewPlayerY)) {
          fPlayerX = fNewPlayerX;
          fPlayerY = fNewPlayerY;
        }
      }
    });


    // reset move
    eTouchMove.addEventListener("touchend", function () {
      _moveHelpers.oTouch.move.x = 0;
      _moveHelpers.oTouch.move.y = 0;
      _moveHelpers.oTouch.move.bFirstTouch = true;
    });
  },

  // TODO: reimplement
  checkExit: function () {
    // if we hit an exit
    if (map[~~fPlayerY * nMapWidth + ~~fPlayerX] == "X") {
      _loadLevel(window[sLevelstring].exitsto);
    }
  },

  // called once per frame, handles movement computation
  move: function () {
    
    if (bTurnLeft) {
      fPlayerA -= 0.045;
    }

    if (bTurnRight) {
      fPlayerA += 0.045;
    }

    var fMoveFactor = 0.1;
    if (bRunning) {
      fMoveFactor = 0.2;
    }

    if (bStrafeLeft) {

      var fNewPlayerX = fPlayerX + (fastSin(fPlayerA) + 0.025 ) * fMoveFactor;
      var fNewPlayerY = fPlayerY - (fastCos(fPlayerA) + 0.025 ) * fMoveFactor;    

      if( !_moveHelpers.testWallCollision(fNewPlayerX, fNewPlayerY) ){
        fPlayerX = fNewPlayerX;
        fPlayerY = fNewPlayerY;
      }
    }

    if (bStrafeRight) {

      var fNewPlayerX = fPlayerX - (fastSin(fPlayerA) + 0.025 ) * fMoveFactor;
      var fNewPlayerY = fPlayerY + (fastCos(fPlayerA) + 0.025 ) * fMoveFactor;

      if( !_moveHelpers.testWallCollision(fNewPlayerX, fNewPlayerY) ){
        fPlayerX = fNewPlayerX;
        fPlayerY = fNewPlayerY;
      }
    }

    if (bMoveForward && bPlayerMayMoveForward) {

      var fNewPlayerX = fPlayerX + (fastCos(fPlayerA) + 0.025 ) * fMoveFactor;
      var fNewPlayerY = fPlayerY + (fastSin(fPlayerA) + 0.025 ) * fMoveFactor;

      if( !_moveHelpers.testWallCollision(fNewPlayerX, fNewPlayerY) ){
        fPlayerX = fNewPlayerX;
        fPlayerY = fNewPlayerY;
      }
    }

    if (bMoveBackward) {

      var fNewPlayerX = fPlayerX - (fastCos(fPlayerA) + 0.025 ) * fMoveFactor;
      var fNewPlayerY = fPlayerY - (fastSin(fPlayerA) + 0.025 ) * fMoveFactor;

      if( !_moveHelpers.testWallCollision(fNewPlayerX, fNewPlayerY) ){
        fPlayerX = fNewPlayerX;
        fPlayerY = fNewPlayerY;
      }
    }
  },

  // Calculations related to jumping, falling, and sector height changes. Called 1x ea. frame
  playerHeight: function(){

    // Jumping
    if (bJumping && !bFalling) {
      nJumptimer++;
      fPlayerH += 0.1;
      bFallcomplete = false;
    }
    // jumping only until max-jump height, OR the player hits the ceiling height (2, minus the player height of about 1.4)
    if ( nJumptimer > 10 || fPlayerH > nSectorCeilingHeight - 0.6 ) { 
      bFalling = true;
      bJumping = false;
    }

    // falling back down after jump
    if (bFalling && nJumptimer > 0) {
      // handles cases if jumping between different sector heights
      if( fPlayerH < nSectorFloorHeight && Math.abs( fPlayerH - nSectorFloorHeight) > 0.1 ) {
        fPlayerH = nSectorFloorHeight;
        nJumptimer = 0;
      }
      else{
        nJumptimer--;
        fPlayerH -= 0.1;
        bJumping = false;
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
      if( Math.abs( fPlayerH - nSectorFloorHeight) < 0.1  ) {
        fPlayerH = nSectorFloorHeight;
      }
      else if( fPlayerH > nSectorFloorHeight ){
        fPlayerH -= 0.15; // falling
        bFalling = true;
      }else if( fPlayerH < nSectorFloorHeight  ){
        fPlayerH += 0.1;
        nJumptimer = 0;
      }
    }
  },


  _updateCamera: function (gameTimer) {

    var cameraPath = oLevel["cameraPath"];

    var segmentDuration = 140; // e.g. 4s at 60fps
  
    var numSegments = cameraPath.length - 1;
    var totalDuration = numSegments * segmentDuration;
  
    // After the full path time has elapsed, stop animating
    if (gameTimer >= totalDuration) {
      return false; 
    }
  
    var segmentIndex = Math.floor(gameTimer / segmentDuration);
    var localT = (gameTimer % segmentDuration) / segmentDuration;
  
    var start = cameraPath[segmentIndex];
    var end   = cameraPath[segmentIndex + 1];
  
    fPlayerX = simpleLerpPoint(start.x, end.x, localT);
    fPlayerY = simpleLerpPoint(start.y, end.y, localT);
    fPlayerA = angleLerpPoint(start.a, end.a, localT);
    fPlayerH = simpleLerpPoint(start.h, end.h, localT);
  
    return true; // still running
  }
  
};


