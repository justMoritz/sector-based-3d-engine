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
    // console.log(sectorName)
    var allCurrentWalls = oMap[sectorName].walls;
    var nWallsHit = 0;

    // We're using fPlayerAngle = 0 for the direction, since it doesn't matter which direction we are firing the ray in.
    fEntityEndX = fEntityX + 1 * fDepth;  // fEyeX = Math.cos(0) === 1
    fEntityEndY = fEntityY + 0 * fDepth;  // fEyeY = Math.sin(0) === 0

    for( var w = 0; w < allCurrentWalls.length; w++ ){
      var currentWall = allCurrentWalls[w];

      var intersection = intersectionPoint(
        { x: fEntityX, y: fEntityEndY },
        { x: fPlayerEndX, y: fEntityEndY },
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
  spriteSectorCheck: function (fEntityX, fEntityY) {

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


  // sets the player height when a sector is changed
  setNewPlayerHeight: function ( input ){
    // console.log(input)
    if(typeof input !== 'undefined'){
      nSectorFloorHeight =  input.floor 
    }else{
      fPlayerH = 0;
    }
    nSectorCeilingHeight = input.ceil;
    // console.log(`nSectorCeilingHeight: ${nSectorCeilingHeight}`)
    // console.log(`nSectorFloorHeight = ${nSectorFloorHeight} `);
    // console.log(`----`)
  },


  // takes a vector from current position to requested new position (maybe x2?)
  // check all the walls in the current sector for intersection against that vector
  // If the vector collides with any wall EXCEPT a portal
  testWallCollision: function( testX, testY ){

    // look at all walls in the current player sector
    var allCurrentWalls = oMap[sPlayerSector].walls;


    for( var w = 0; w < allCurrentWalls.length; w++ ){
      var fTestDistanceToWall = fDepth;
      var currentWall = allCurrentWalls[w];
      var intersection = intersectionPoint(
        { x: fPlayerX, y: fPlayerY },
        { x: testX, y: testY },
        { x: currentWall[0], y: currentWall[1] },
        { x: currentWall[2], y: currentWall[3] }
      );
      if (!isNaN(intersection.x) && !isNaN(intersection.y)) {
        fTestDistanceToWall = Math.sqrt(
          Math.pow(fPlayerX - intersection.x, 2) +
          Math.pow(fPlayerY - intersection.y, 2)
        );
        // close enough to be considered hitting the wall
        if(fTestDistanceToWall < 1){

          // if this wall we are hitting is considered a portal
          if(currentWall[9] != false){
            var collisionSector = currentWall[9];

            // Doesn't allow player to move over an incline that is too large (player needs to jump)
            if( fPlayerH - (oLevel.map[collisionSector].floor) < -1 ){
              return true; // don't allow move
            }

            // console.log(`walking into ${collisionSector}`)
            
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

  // keystroke listening engine
  keylisten: function () {
    window.onkeydown = function (e) {

      if (e.which == 80) {
        // p
        if (bPaused) {
          _testScreenSizeAndStartTheGame();
          bPaused = false;
        } else {
          clearInterval(gameRun);
          bPaused = true;
        }
      }
      if (e.which == 16) {
        // shift
        bRunning = true;
      }
      if (e.which == 32) {
        // space
        bJumping = true;
      }
      if (e.which == 65) {
        // a
        bStrafeLeft = true;
      }
      if (e.which == 68) {
        // d
        bStrafeRight = true;
      }
      if (e.which == 81 || e.which == 37) {
        // q or left
        bTurnLeft = true;
      }
      if (e.which == 69 || e.which == 39) {
        // e or right
        bTurnRight = true;
      }
      if (e.which == 87 || e.which == 38) {
        // w or up
        bMoveForward = true;
      }
      if (e.which == 83 || e.which == 40) {
        // s or down
        bMoveBackward = true;
      }
    };

    window.onkeyup = function (e) {
      if (e.which == 16) {
        // shift
        bRunning = false;
      }
      if (e.which == 32) {
        // space
        bJumping = false;
        bFalling = true;
      }
      if (e.which == 65) {
        // a
        bStrafeLeft = false;
      }
      if (e.which == 68) {
        // d
        bStrafeRight = false;
      }
      if (e.which == 81 || e.which == 37) {
        // q or left
        bTurnLeft = false;
      }
      if (e.which == 69 || e.which == 39) {
        // e or right
        bTurnRight = false;
      }
      if (e.which == 87 || e.which == 38) {
        // w or up
        bMoveForward = false;
      }
      if (e.which == 83 || e.which == 40) {
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

    // if(bOnObject){
    //   fYMoveBy /= 4;
    // }
  
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

    // reset look
    eTouchLook.addEventListener("touchend", function () {
      _moveHelpers.oTouch.look.x = 0;
      _moveHelpers.oTouch.look.y = 0;
      _moveHelpers.oTouch.look.bFirstTouch = true;
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
        // walk
        fPlayerX -=
          (Math.sin(fPlayerA) + 5.0 * 0.0051) * oDifferences.x * 0.05;
        fPlayerY +=
          (Math.cos(fPlayerA) + 5.0 * 0.0051) * oDifferences.x * 0.05;

        // converts coordinates into integer space and check if it is a wall (!.), if so, reverse
        if (map[~~fPlayerY * nMapWidth + ~~fPlayerX] != ".") {
          _moveHelpers.checkExit();
          fPlayerX +=
            (Math.sin(fPlayerA) + 5.0 * 0.0051) * oDifferences.x * 0.05;
          fPlayerY -=
            (Math.cos(fPlayerA) + 5.0 * 0.0051) * oDifferences.x * 0.05;
        }

        // strafe
        fPlayerX +=
          (Math.cos(fPlayerA) + 5.0 * 0.0051) * -oDifferences.y * 0.05;
        fPlayerY +=
          (Math.sin(fPlayerA) + 5.0 * 0.0051) * -oDifferences.y * 0.05;

        // converts coordinates into integer space and check if it is a wall (!.), if so, reverse
        if (map[~~fPlayerY * nMapWidth + ~~fPlayerX] != ".") {
          _moveHelpers.checkExit();
          fPlayerX -=
            (Math.cos(fPlayerA) + 5.0 * 0.0051) * -oDifferences.y * 0.05;
          fPlayerY -=
            (Math.sin(fPlayerA) + 5.0 * 0.0051) * -oDifferences.y * 0.05;
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

  checkExit: function () {
    // if we hit an exit
    if (map[~~fPlayerY * nMapWidth + ~~fPlayerX] == "X") {
      _loadLevel(window[sLevelstring].exitsto);
    }
  },

  // called once per frame, handles movement computation
  move: function () {
    
    if (bTurnLeft) {
      fPlayerA -= 0.05;
    }

    if (bTurnRight) {
      fPlayerA += 0.05;
    }

    var fMoveFactor = 0.1;
    if (bRunning) {
      fMoveFactor = 0.2;
    }

    if (bStrafeLeft) {

      var fNewPlayerX = fPlayerX + (Math.sin(fPlayerA) + 0.025 ) * fMoveFactor;
      var fNewPlayerY = fPlayerY - (Math.cos(fPlayerA) + 0.025 ) * fMoveFactor;    

      if( !_moveHelpers.testWallCollision(fNewPlayerX, fNewPlayerY) ){
        fPlayerX = fNewPlayerX;
        fPlayerY = fNewPlayerY;
      }
    }

    if (bStrafeRight) {

      var fNewPlayerX = fPlayerX - (Math.sin(fPlayerA) + 0.025 ) * fMoveFactor;
      var fNewPlayerY = fPlayerY + (Math.cos(fPlayerA) + 0.025 ) * fMoveFactor;

      if( !_moveHelpers.testWallCollision(fNewPlayerX, fNewPlayerY) ){
        fPlayerX = fNewPlayerX;
        fPlayerY = fNewPlayerY;
      }
    }

    if (bMoveForward && bPlayerMayMoveForward) {

      var fNewPlayerX = fPlayerX + (Math.cos(fPlayerA) + 0.025 ) * fMoveFactor;
      var fNewPlayerY = fPlayerY + (Math.sin(fPlayerA) + 0.025 ) * fMoveFactor;

      if( !_moveHelpers.testWallCollision(fNewPlayerX, fNewPlayerY) ){
        fPlayerX = fNewPlayerX;
        fPlayerY = fNewPlayerY;
      }
    }

    if (bMoveBackward) {

      var fNewPlayerX = fPlayerX - (Math.cos(fPlayerA) + 0.025 ) * fMoveFactor;
      var fNewPlayerY = fPlayerY - (Math.sin(fPlayerA) + 0.025 ) * fMoveFactor;

      if( !_moveHelpers.testWallCollision(fNewPlayerX, fNewPlayerY) ){
        fPlayerX = fNewPlayerX;
        fPlayerY = fNewPlayerY;
      }
    }
  },

  // Calculations related to jumping, falling, and sector height changes. Called 1x ea. frame
  playerHeight: function(){

    // Jumping
    if (bJumping) {
      nJumptimer++;
      fPlayerH += 0.1;
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
      if( Math.abs( fPlayerH - nSectorFloorHeight) < 0.1  ) {
        fPlayerH = nSectorFloorHeight;
      }
      else if( fPlayerH > nSectorFloorHeight ){
        fPlayerH -= 0.15; // falling
      }else if( fPlayerH < nSectorFloorHeight  ){
        fPlayerH += 0.1;
        nJumptimer = 0;
      }
    }
  },
  
};