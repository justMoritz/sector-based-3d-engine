var gameEngineJS = (function(){

  // constants
  var PI_00 = parseFloat(Math.PI * 0.0);
  var PI_05 = parseFloat(Math.PI * 0.5);
  var PI_10 = parseFloat(Math.PI * 1.0);
  var PI_15 = parseFloat(Math.PI * 1.5);
  var PI_20 = parseFloat(Math.PI * 2.0);

  // setup variables
  var eScreen;
  var eDebugOut;

  var nScreenWidth = 320;
  var nScreenHeight = 80;

  var fFOV = Math.PI / 2.25; // (Math.PI / 4.0 originally)
  var fDepth = 16.0; // viewport depth
  var nLookLimit = 8;

  var bTurnLeft;
  var bTurnRight;
  var bStrafeLeft;
  var bStrafeRight;
  var bMoveForward;
  var bMoveBackward;
  var bJumping;
  var bFalling;
  var bRunning;

  var nJumptimer = 0;
  var fLooktimer = 0;

  var fDepthBuffer = [];

  // defaults
  var fPlayerX = 14.0;
  var fPlayerY = 1.0;
  var fPlayerA = 1.5;
  var nDegrees = 0;
  var nRenderMode = 2;

  var nMapHeight = 16;
  var nMapWidth = 16;
  var map = "";
  var sLevelstring = "";

  // █
  // ▓
  // ▒
  // ░

  function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Loads
   * @param  {[string]} level The Level file
   * @return {[type]}       [description]
   */
  var _loadLevel = function(level){

    clearInterval(gameRun);

    sLevelstring = level.replace(".map", ""); // sets global string

    var loadScriptAsync = function(uri, sLevelstring) {
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

    var scriptLoaded = loadScriptAsync(level, sLevelstring);

    scriptLoaded.then(function(){
        // updates the level map and dimensions
        map = window[sLevelstring].map;
        nMapHeight = window[sLevelstring].nMapHeight;
        nMapWidth = window[sLevelstring].nMapWidth;

        // places the player at the map starting point
        fPlayerX = window[sLevelstring].fPlayerX;
        fPlayerY = window[sLevelstring].fPlayerY;
        fPlayerA = window[sLevelstring].fPlayerA;

        // load sprites
        oLevelSprites = window[sLevelstring].sprites;

        if( oLevelSprites == "autogen" ){

          // generates random Pogels :oooo
          oLevelSprites = {};
          for( var m = 0; m < 50; m++){
            var randAngle = randomIntFromInterval(0, Math.PI*2);
            var oRandomSprite = {
                "x": randomIntFromInterval(0, nMapWidth),
                "y": randomIntFromInterval(0, nMapHeight),
                "r": randAngle,
                "name": "P",
                "move": true
            }
            oLevelSprites[m] = oRandomSprite ;
          }
        }


        document.querySelector("body").style.color = window[sLevelstring].color;
        document.querySelector("body").style.background = window[sLevelstring].background;

    });


    // pauses, then starts the game loop
    _testScreenSizeAndStartTheGame();
    window.addEventListener("resize", function(){
      clearInterval(gameRun);
      _testScreenSizeAndStartTheGame();
    });
  };


  /**
   * Function will get the pixel to be sampled from the sprite
   *
   * @param  {array} texture -     The texture to be sampled
   * @param  {float} x -           The x coordinate of the sample (how much across)
   * @param  {float} y -           The y coordinate of the sample
   * @param  {float} scaleFactor - scales the texture.
   *                               Example: 2 will render twice the resolution
   *                               (texture tiled 4x across one block)
   * @return {string}
   */
  var _getSamplePixel = function(texture, x, y){
    // _debugOutput( texture );

    var scaleFactor = texture["scale"]  || defaultTexScale;
    var texWidth    = texture["width"]  || defaultTexWidth;
    var texHeight   = texture["height"] || defaultTexHeight;

    var texpixels = texture["texture"];

    if( texture["texture"] == "DIRECTIONAL" ){
      // Different Texture based on viewport
      if( nDegrees > 0 && nDegrees < 180 ){
        texpixels = texture["S"];
      }else{
        texpixels = texture["N"];
      }
    }

    scaleFactor = scaleFactor || 2;

    x = scaleFactor * x%1;
    y = scaleFactor * y%1;

    var sampleX = Math.floor(texWidth*x);
    var sampleY = Math.floor(texHeight*y);

    var samplePosition = (texWidth*(sampleY)) + sampleX;

    if( x < 0 || x > texWidth || y < 0 || y > texHeight ){
      return "+";
    }else{
      return texpixels[samplePosition];
    }
  };


  /**
   * Retrieve a fixed number of elements from an array, evenly distributed but
   * always including the first and last elements.
   *
   * source https://stackoverflow.com/questions/32439437/retrieve-an-evenly-distributed-number-of-elements-from-an-array
   * wow!!!!
   *
   * @param   {Array} items - The array to operate on.
   * @param   {number} n -    The number of elements to extract.
   * @returns {Array}
   */
  // helper function
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _evenlyPickItemsFromArray(allItems, neededCount) {
    if (neededCount >= allItems.length) {
      return _toConsumableArray(allItems);
    }

    var result = [];
    var totalItems = allItems.length;
    var interval = totalItems / neededCount;

    for (var i = 0; i < neededCount; i++) {
      var evenIndex = Math.floor(i * interval + interval / 2);
      result.push(allItems[evenIndex]);
    }

    return result;
  }


  // gonna leave the console for errors, logging seems to kill performance
  var _debugOutput = function(input){
    eDebugOut.innerHTML = input;
  };


  // returns true every a-th interation of b
  var _everyAofB = function(a, b){
    return ( a && (a % b === 0));
  }

  // lookup table “for fine-control” or “for perfomance”
  // …(but really because I suuuuuuck at logic [apparently] )
  var _skipEveryXrow = function(input){
    input = Math.round(input);
    switch( Number(input) ) {
      case 0: return 0; break;
      case 1: return 8; break;
      case 2: return 6; break;
      case 3: return 4; break;
      case 4: return 3; break;
      case 5: return 2; break;
      case 6: return 2; break;
      case 7: return 2; break;
      case 8: return 1; break;

      case -1: return 8; break;
      case -2: return 8; break;
      case -3: return 7; break;
      case -4: return 7; break;
      case -5: return 6; break;
      case -6: return 6; break;
      case -7: return 5; break;
      case -8: return 5; break;
      case -9: return 4; break;
      case -10: return 4; break;
      case -11: return 3; break;
      case -12: return 3; break;
      case -13: return 3; break;
      case -14: return 2; break;
      case -15: return 2; break;
      case -16: return 2; break;

      default:
        return 0;
    }
  };


  var _printCompositPixel = function(oInput, oOverlay, index){
    var sOutput = "";
    // if oOverlay !0, appends it to the output instead
    if( oOverlay && oOverlay[index] != 0){
      sOutput += oOverlay[index];
    }else{
      sOutput += oInput[index];
    }
    return sOutput;
  };


  /**
   * Creates a new array of pixels taking looking up and down into account
   * It returns an array to be rendered later.
   * the aim is to remove the first and last 30 pixels of very row,
   * to obscure the skewing
   */
  var _fPrepareFrame = function(oInput, oOverlay, eTarget){
    var oOverlay = oOverlay || false;
    var eTarget  = eTarget || eScreen;
    var sOutput = [];


    // this is the maximum of variation created by the lookup timer, aka the final lookmodifier value
    var neverMoreThan = Math.round(nScreenHeight / _skipEveryXrow(fLooktimer) - 1);


    // used to skew the image
    var globalPrintIndex = 0;
    var fLookModifier = 0;


    // if looking up, the starting point is the max number of pixesl to indent,
    // which will be decremented, otherwise it remains 0, which will be incremented
    if( fLooktimer > 0 && isFinite(neverMoreThan) ){
      fLookModifier = neverMoreThan;
    }

    // interate each row at a time
    for(var row = 0; row < nScreenHeight; row++){

      // increment the fLookModifier every time it needs to grow (grows per row)
      if ( _everyAofB(row, _skipEveryXrow(fLooktimer)) ) {

        if( fLooktimer > 0 ){ // looking up
          fLookModifier--;
        }else{
          fLookModifier++;
        }
      }

      // print filler pixels
      for(var i=0; i<fLookModifier; i++){
        sOutput.push( "." );
      }

      var toBeRemoved = (2*fLookModifier);
      var removeFrom = [];


      //  make a new array that contains the indices of the elements to print
      // (removes X amount of elements from array)
      var items = [];
      for (var i=0; i<= nScreenWidth; i++) {
        items.push(i);
      }

      // list to be removed from each row:
      // [1,2,3,4,5,6,7,8]
      // [1,2, ,4,5, ,7,8]
      //   [1,2,4,5,7,8]
      removeFrom = _evenlyPickItemsFromArray(items, toBeRemoved);


      // loops through each rows of pixels
      for(var rpix = 0; rpix < nScreenWidth; rpix++){

        // print only if the pixel is in the list of pixels to print
        if( removeFrom.includes(rpix) ){
          // don"t print
        }else{
          // print
          sOutput.push( _printCompositPixel(oInput, oOverlay, globalPrintIndex) );
        }

        globalPrintIndex++;
      } // end for(rpix

      // print filler pixels
      for(var i=0; i<fLookModifier; i++){
        sOutput.push( "." );
      }

    } // end for(row

    return sOutput;
  };


  var _fDrawFrame = function(screen, overlayscreen){
    var frame = _fPrepareFrame(screen, overlayscreen);

    var sOutput = "";

    // interates over each row again, and omits the first and last 30 pixels, to disguise the skewing!
    var printIndex = 0;
    var removePixels = nScreenHeight/2;
    for(var row = 0; row < nScreenHeight; row++){
      for(var pix = 0; pix < nScreenWidth; pix++){

        // H-blank based on screen-width
        if(printIndex % (nScreenWidth) == 0){
          sOutput += "<br>";
        }

        if( pix < removePixels ){
          sOutput += "";
        }
        else if( pix > nScreenWidth-removePixels ){
          sOutput += "";
        }
        else{
          sOutput += frame[printIndex];
        }

        printIndex++;
      }
    }
    eScreen.innerHTML = sOutput;
  };


  // various shaders for walls, ceilings, objects
  // _renderHelpers
  //
  // each texture has 4 values: 3 hues plus black
  // each value can be rendered with 5 shades (4 plus black)
  var _rh = {

    shades: "$@B%8&WM#o*ahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,^`.",

    renderWall: function(j, fDistanceToWall, sWallDirection, pixel){

      var fill = "";

      var b100 = "&#9608;";
      var b75  = "&#9619;";
      var b50  = "&#9618;";
      var b25  = "&#9617;";
      var b0   = "&nbsp;";

      // var b100 = _rh.shades[0]; // var b100 = "$";
      // var b75  = _rh.shades[8]; // var b75  = "#"
      // var b50  = _rh.shades[9]; // var b50  = "o"
      // var b25  = _rh.shades[10]; // var b25  = "*"
      // var b0   = _rh.shades[65]; // var b0   = "."


      if( sWallDirection === "N" || sWallDirection === "S" ){

        if(fDistanceToWall < fDepth / 5.5 ){   // 4

          if( pixel === "#" ){
            fill = b100;
          }else if( pixel === "7" ){
            fill = b75;
          }else if( pixel === "*" || pixel === "o"){
            fill = b50;
          }else{
            fill = b25;
          }

        }
        else if(fDistanceToWall < fDepth / 3.66 ){    // 3

          if( pixel === "#" ){
            fill = b75;
          }else if( pixel === "7" ){
            fill = b50;
          }else if( pixel === "*" || pixel === "o"){
            fill = b25;
          }else{
            fill = b0;
          }

        }
        else if(fDistanceToWall < fDepth / 2.33 ){    // 2

          if( pixel === "#" ){
            fill = b50;
          }else if( pixel === "7" ){
            fill = b25;
          }else if( pixel === "*" || pixel === "o"){
            fill = b25;
          }else{
            fill = b0;
          }

        }
        else if(fDistanceToWall < fDepth / 1 ){    // 1

          if( pixel === "#" ){
            fill = b25;
          }else if( pixel === "7" ){
            fill = b25;
          }else if( pixel === "*" || pixel === "o"){
            fill = b25;
          }else{
            fill = b0;
          }

        }
        else{
          fill = "&nbsp;";
        }
      }

      // walldirection W/E
      else{

        if(fDistanceToWall < fDepth / 5.5 ){   // 4

          if( pixel === "#" ){
            fill = b75;
          }else if( pixel === "7" ){
            fill = b50;
          }else if( pixel === "*" || pixel === "o"){
            fill = b25;
          }else{
            fill = b0;
          }

        }
        else if(fDistanceToWall < fDepth / 3.66 ){    // 3

          if( pixel === "#" ){
            fill = b50;
          }else if( pixel === "7" ){
            fill = b50;
          }else if( pixel === "*" || pixel === "o"){
            fill = b25;
          }else{
            fill = b0;
          }

        }
        else if(fDistanceToWall < fDepth / 2.33 ){    // 2

          if( pixel === "#" ){
            fill = b50;
          }else if( pixel === "7" ){
            fill = b25;
          }else if( pixel === "*" || pixel === "o"){
            fill = b25;
          }else{
            fill = b0;
          }

        }
        else if(fDistanceToWall < fDepth / 1 ){    // 1

          if( pixel === "#" ){
            fill = b25;
          }else if( pixel === "7" ){
            fill = b25;
          }else if( pixel === "*" || pixel === "o"){
            fill = b0;
          }else{
            fill = b0;
          }

        }
        else{
          fill = "&nbsp;";
        }
      }

      return fill;

    },

    // figures out shading for given section
    renderSolidWall: function(j, fDistanceToWall, isBoundary){
      var fill = "&#9617;";

      if(fDistanceToWall < fDepth / 6.5 ){   // 4
        fill = "&#9608;";
      }
      else if(fDistanceToWall < fDepth / 4.66 ){    // 3
        fill = "&#9619;";
      }
      else if(fDistanceToWall < fDepth / 3.33 ){    // 2
        fill = "&#9618;";
      }
      else if(fDistanceToWall < fDepth / 1 ){    // 1
        fill = "&#9617;";
      }else{
        fill = "&nbsp;";
      }

      if( isBoundary ){
        if(fDistanceToWall < fDepth / 6.5 ){   // 4
          fill = "&#9617;";
        }
        else if(fDistanceToWall < fDepth / 4.66 ){    // 3
          fill = "&#9617;";
        }
        else if(fDistanceToWall < fDepth / 3.33 ){    // 2
          fill = "&nbsp;";
        }
        else if(fDistanceToWall < fDepth / 1 ){    // 1
          fill = "&nbsp;";
        }else{
          fill = "&nbsp;";
        }
      }

      return fill;
    },

    // shading and sectionals for gate
    renderGate: function(j, fDistanceToWall, nDoorFrameHeight){
      var fill = "X";
      if( j < nDoorFrameHeight){

        if(fDistanceToWall < fDepth / 4){
          fill = "&boxH;";
        }
        else{
          fill = "=";
        }

      }else{

        if(fDistanceToWall < fDepth / 4){
          fill = "&boxV;";
        }
        else{
          fill = "|";
        }
      }
      return fill;
    },

    renderFloor: function(j){
      var fill = "`";

      // draw floor, in different shades
      b = 1 - (j -nScreenHeight / 2) / (nScreenHeight / 2);
      b = 1 - (j -nScreenHeight / (2- fLooktimer*0.15)) / (nScreenHeight / (2 - fLooktimer*0.15));

      if(b < 0.25){
        fill = "x";
      }else if(b < 0.5){
        fill = "=";
      }else if(b < 0.75){
        fill = "-";
      }else if(b < 0.9){
        fill = "`";
      }else{
        fill = "&nbsp;";
      }

      return fill;
    },

    renderCeiling: function(j){
      var fill = "`";

      // draw floor, in different shades
      b = 1 - (j -nScreenHeight / 2) / (nScreenHeight / 2);
      if(b < 0.25){
        fill = "`";
      }else if(b < 0.5){
        fill = "-";
      }else if(b < 0.75){
        fill = "=";
      }else if(b < 0.9){
        fill = "x";
      }else{
        fill = "#";
      }

      return fill;
    },
  };


  // keyboard and mouse
  var _moveHelpers = {

    // keystroke listening engine
    keylisten: function(){

      window.onkeydown = function(e) {

        // _debugOutput(e.which);

        if (e.which == 80) { // p
          clearInterval(gameRun);
        }
        if (e.which == 16) { // shift
          bRunning = true;
        }
        if (e.which == 32) { // space
          bJumping = true;
        }
        if (e.which == 65) { // a
          bStrafeLeft = true;
        }
        if (e.which == 68) { // d
          bStrafeRight = true;
        }
        if (e.which == 81 || e.which == 37) { // q or left
          bTurnLeft = true;
        }
        if (e.which == 69 || e.which == 39) { // e or right
          bTurnRight = true;
        }
        if (e.which == 87 || e.which == 38) { // w or up
          bMoveForward = true;
        }
        if (e.which == 83 || e.which == 40) { // s or down
          bMoveBackward = true;
        }
      };

      window.onkeyup = function(e) {

        if (e.which == 16) { // shift
          bRunning = false;
        }
        if (e.which == 32) { // space
          bJumping = false;
          bFalling = true;
        }
        if (e.which == 65) { // a
          bStrafeLeft = false;
        }
        if (e.which == 68) { // d
          bStrafeRight = false;
        }
        if (e.which == 81 || e.which == 37) { // q or left
          bTurnLeft = false;
        }
        if (e.which == 69 || e.which == 39) { // e or right
          bTurnRight = false;
        }
        if (e.which == 87 || e.which == 38) { // w or up
          bMoveForward = false;
        }
        if (e.which == 83 || e.which == 40) { // s or down
          bMoveBackward = false;
        }
      };
    },

    //
    //
    /**
     * Y-Movement
     * @param  {float}  fMoveInput   the movement from touch or mouse-input
     * @param  {float}  fMoveAdjust  factor by which to multiply the recieved input
     *
     * Ultimately modifies the
     *  `fLooktimer`
     * variable, which is global :)
     */
    yMoveUpdate: function(fMoveInput, fMoveAdjust ){
      // look up/down (with bounds)
      // var fYMoveFactor = ( (e.movementY*0.05) || (e.mozMovementY*0.05) || (e.webkitMovementY*0.05) || 0);
      var fYMoveFactor = fMoveInput * fMoveAdjust;

      // if the looktimer is negative (looking down), increase the speed
      if( fLooktimer < 0 ){
        fYMoveFactor = fYMoveFactor*4;
      }

      // the reason for the increased speed is that looking “down” becomes expotentially less,
      // so we are artificially increasing the down-factor. It"s a hack, but it works okay!
      fLooktimer -= fYMoveFactor;
      if( fLooktimer > nLookLimit*0.7 || fLooktimer < -nLookLimit*2 ){
        fLooktimer += fYMoveFactor;
      }
    },

    mouseLook: function(){
      var fMouseLookFactor = 0.002;

      document.body.requestPointerLock();
      document.onmousemove = function (e) {

        // look left/right
        fPlayerA   += ( (e.movementX*fMouseLookFactor) || (e.mozMovementX*fMouseLookFactor) || (e.webkitMovementX*fMouseLookFactor) || 0);

        // look up and down
        _moveHelpers.yMoveUpdate( ( e.movementY || e.mozMovementY || e.webkitMovementY || 0), 0.05 );

      }
    },

    // mouse
    mouseinit: function(){
      touchinputlook.onclick = _moveHelpers.mouseLook;
      touchinputmove.onclick = _moveHelpers.mouseLook;
    },

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
    touchCalculate: function(prev, e){
      var oDifference = {};

      // fetch and compare touch-points
      // always [0] because no multitouch in look-area
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
    touchinit: function(){

      // look (left hand of screen)
      eTouchLook.addEventListener('touchmove', function(e){

        // fetches differences from input
        var oDifferences = _moveHelpers.touchCalculate( _moveHelpers.oTouch.look, e);

        // makes sure no crazy
        if( oDifferences.x < 10 && oDifferences.x > -10 ){
          _moveHelpers.oTouch.look.bFirstTouch = false;
        }

        if( !_moveHelpers.oTouch.look.bFirstTouch ){

          // left and right
          fPlayerA += oDifferences.x * 0.005;

          // up and down
          _moveHelpers.yMoveUpdate(oDifferences.y, 0.1);
        }
      });

      // reset look
      eTouchLook.addEventListener('touchend', function(){
        _moveHelpers.oTouch.look.x = 0;
        _moveHelpers.oTouch.look.y = 0;
        _moveHelpers.oTouch.look.bFirstTouch = true;
      });


      // move (right hand of screen)
      eTouchMove.addEventListener('touchmove', function(e){
        var oDifferences = _moveHelpers.touchCalculate( _moveHelpers.oTouch.move, e);

        // makes sure no crazy
        if( oDifferences.x < 10 && oDifferences.x > -10 ){
          _moveHelpers.oTouch.move.bFirstTouch = false;
        }

        if( !_moveHelpers.oTouch.move.bFirstTouch ){

          // walk
          fPlayerX -= ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * oDifferences.x * 0.05;
          fPlayerY += ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * oDifferences.x * 0.05;

          // converts coordinates into integer space and check if it is a wall (!.), if so, reverse
          if(map[parseInt(fPlayerY) * nMapWidth + parseInt(fPlayerX)] != "."){
            _moveHelpers.checkExit();
            fPlayerX += ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * oDifferences.x * 0.05;
            fPlayerY -= ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * oDifferences.x * 0.05;
          }

          // strafe
          fPlayerX += ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * -oDifferences.y * 0.05;
          fPlayerY += ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * -oDifferences.y * 0.05;

          // converts coordinates into integer space and check if it is a wall (!.), if so, reverse
          if(map[parseInt(fPlayerY) * nMapWidth + parseInt(fPlayerX)] != "."){
            _moveHelpers.checkExit();
            fPlayerX -= ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * -oDifferences.y * 0.05;
            fPlayerY -= ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * -oDifferences.y * 0.05;
          }
        }
      });

      // reset move
      eTouchMove.addEventListener('touchend', function(){
        _moveHelpers.oTouch.move.x = 0;
        _moveHelpers.oTouch.move.y = 0;
        _moveHelpers.oTouch.move.bFirstTouch = true;
      });

    },

    checkExit: function(){
      // if we hit an exit
      if(map[parseInt(fPlayerY) * nMapWidth + parseInt(fPlayerX)] == "X"){
        _loadLevel( window[sLevelstring].exitsto );
      }
    },

    // called once per frame, handles movement computation
    move: function(){

      if(bTurnLeft){
        fPlayerA -= 0.05;
      }

      if(bTurnRight){
        fPlayerA += 0.05;
      }

      var fMoveFactor = 0.1;
      if(bRunning){
        fMoveFactor = 0.2;
      }

      if(bStrafeLeft){
        fPlayerX += ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
        fPlayerY -= ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;

        // converts coordinates into integer space and check if it is a wall (!.), if so, reverse
        if(map[parseInt(fPlayerY) * nMapWidth + parseInt(fPlayerX)] != "."){
          _moveHelpers.checkExit();
          fPlayerX -= ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
          fPlayerY += ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
        }
      }

      if(bStrafeRight){
        fPlayerX -= ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
        fPlayerY += ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;

        // converts coordinates into integer space and check if it is a wall (!.), if so, reverse
        if(map[parseInt(fPlayerY) * nMapWidth + parseInt(fPlayerX)] != "."){
          _moveHelpers.checkExit();
          fPlayerX += ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
          fPlayerY -= ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
        }
      }

      if(bMoveForward){
        fPlayerX += ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
        fPlayerY += ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;

        // converts coordinates into integer space and check if it is a wall (!.), if so, reverse
        if(map[parseInt(fPlayerY) * nMapWidth + parseInt(fPlayerX)] != "."){
          _moveHelpers.checkExit();
          fPlayerX -= ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
          fPlayerY -= ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
        }
      }

      if(bMoveBackward){
        fPlayerX -= ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
        fPlayerY -= ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;

        // converts coordinates into integer space and check if it is a wall (!.), if so, reverse
        if(map[parseInt(fPlayerY) * nMapWidth + parseInt(fPlayerX)] != "."){
          _moveHelpers.checkExit();
          fPlayerX += ( Math.cos(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
          fPlayerY += ( Math.sin(fPlayerA) + 5.0 * 0.0051 ) * fMoveFactor;
        }
      }

    },
  };



  var _moveSprites = function(){

    // for each sprite object
    for(var si=0; si < Object.keys(oLevelSprites).length; si++ ){
      var sprite = oLevelSprites[Object.keys(oLevelSprites)[si]];

      // if the sprite's move flag is set
      if( sprite["move"] ){
        var fMovementSpeed = 0.05;

        // move the sprite along it's radiant line
        sprite["x"] = parseFloat(sprite["x"]) + parseFloat(Math.cos(sprite["r"])) * fMovementSpeed;
        sprite["y"] = parseFloat(sprite["y"]) + parseFloat(Math.sin(sprite["r"])) * fMovementSpeed;

        // collision coordinates (attempting to center sprite)
        var fCollideY = parseFloat(sprite["y"]) - 0.5;
        var fCollideX = parseFloat(sprite["x"]) + 0.25;

        var fCollideY2 = parseFloat(sprite["y"]) + 0.25;
        var fCollideX2 = parseFloat(sprite["x"]) - 0.5;

        // sprite has hit any other type other than blank
        if( map[ parseInt(fCollideY) * nMapWidth + parseInt(fCollideX)] != '.' || map[ parseInt(fCollideY2) * nMapWidth + parseInt(fCollideX2)] != '.' ){

          // reverse last movement
          sprite["x"] = parseFloat(sprite["x"]) - parseFloat(Math.cos(sprite["r"])) * fMovementSpeed;
          sprite["y"] = parseFloat(sprite["y"]) - parseFloat(Math.sin(sprite["r"])) * fMovementSpeed;

          // repeat may help unstuck sprites
          sprite["x"] = parseFloat(sprite["x"]) - parseFloat(Math.cos(sprite["r"])) * fMovementSpeed;
          sprite["y"] = parseFloat(sprite["y"]) - parseFloat(Math.sin(sprite["r"])) * fMovementSpeed;
          sprite["x"] = parseFloat(sprite["x"]) - parseFloat(Math.cos(sprite["r"])) * fMovementSpeed;
          sprite["y"] = parseFloat(sprite["y"]) - parseFloat(Math.sin(sprite["r"])) * fMovementSpeed;

          // change the angle and visible angle
          sprite["r"] = (parseFloat(sprite["r"]) + Math.PI/2 ) % Math.PI*2; // still buggie

          // TODO, maybe turn a random amount of degreens between 45 and 90?
        }
      } // end if sprite move
    }
  };


  var gameRun;
  var animationTimer = 0;


  /**
   * The basic game loop
   */
  var main = function(){
    gameRun = setInterval(gameLoop, 33);
    function gameLoop(){

      animationTimer++;
      if(animationTimer > 15){
        animationTimer = 0;
      }

      _moveHelpers.move();

      // if(animationTimer == 3 || animationTimer == 6 || animationTimer == 9 || animationTimer == 15){
        _moveSprites();
      // }


      // allows jumping for only a certain amount of time
      if(bJumping){
        nJumptimer++
      }
      if( nJumptimer > 6 ){
        bFalling = true;
        bJumping = false;
        nJumptimer = 6;
      }
      // falling back down after jump
      if(bFalling){
        nJumptimer--;
      }
      if( nJumptimer < 1 ){
        bFalling = false;
      }


      // holds the frames we"re going to send to the renderer
      var screen = [];
      var overlayscreen = [];


      // Converts player turn position into degrees (used for texturing)
      nDegrees = Math.floor( fPlayerA * (180/Math.PI)) % 360;


      // for the length of the screenwidth (one frame)
      for(var i = 0; i < nScreenWidth; i++){

        // calculates the ray angle into the world space
        // take the current player angle, subtract half the field of view
        // and then chop it up into equal little bits of the screen width (at the current colum)
        var fRayAngle = (fPlayerA - fFOV / 1.8) + (i / nScreenWidth) * fFOV;

        var bBreakLoop = false;

        var fDistanceToWall = 0;
        var fDistanceToObject = 0;
        var fDistanceToInverseObject = 0;

        var bHitWall = false;

        var bHitObject = false;
        var bHitBackObject = false;

        var sWalltype = "#";
        var sObjectType = "0";

        var fEyeX = Math.cos(fRayAngle); // I think this determines the line the testing travels along
        var fEyeY = Math.sin(fRayAngle);

        var fSampleX = 0.0;
        var sWallDirection = "N";

        var nRayLength = 0.0;

        // var nGrainControl = 0.1;
        var nGrainControl = 0.05;

        /**
         * Ray Casting Loop
         */
        while(!bBreakLoop && nRayLength < fDepth){

          // increment
          nRayLength += nGrainControl;

          if( !bHitObject ){
            fDistanceToObject += nGrainControl;
          }
          if( !bHitBackObject ){
            fDistanceToInverseObject += nGrainControl;
          }
          if( !bHitWall ){
            fDistanceToWall += nGrainControl;
          }

          // ray position
          var nTestX = parseInt( ((fPlayerX) + fEyeX * nRayLength) );
          var nTestY = parseInt( ((fPlayerY) + fEyeY * nRayLength) );

          // test if ray hits out of bounds
          if(nTestX < 0 || nTestX >= nMapWidth || nTestY < 0 || nTestY >= nMapHeight){
            bHitWall = true; // didn"t actually, just no wall there
            fDistanceToWall = fDepth;
            bBreakLoop = true;
          }

          // test for objects
          else if(map[nTestY * nMapWidth + nTestX] == "o" || map[nTestY * nMapWidth + nTestX] == ","){
            bHitObject = true;
            sObjectType = map[nTestY * nMapWidth + nTestX];
          }
          else if(bHitObject == true && map[nTestY * nMapWidth + nTestX] == "." || bHitObject == true && map[nTestY * nMapWidth + nTestX] == "."){
            bHitBackObject = true;
          }

          // Test for walls
          else if( map[nTestY * nMapWidth + nTestX] != "." ){
            bHitWall = true;
            bBreakLoop = true;

            sWalltype = map[nTestY * nMapWidth + nTestX];


            // test found boundries of the wall
            var fBound = 0.01;
            var isBoundary = false;

            var vectorPairList = [];
            for (var tx = 0; tx < 2; tx++) {
              for (var ty = 0; ty < 2; ty++) {
                var vy = parseFloat(nTestY) + ty - fPlayerY;
                var vx = parseFloat(nTestX) + tx - fPlayerX;
                var d = Math.sqrt(vx*vx + vy*vy);

                var dot = (fEyeX * vx / d) + (fEyeY * vy / d);
                vectorPairList.push([d, dot]);
              }
            }

            vectorPairList.sort((a, b) => {
              return a[0] - b[0];
            })

            if (Math.acos(vectorPairList[0][1]) < fBound) {
              isBoundary = true;
            }
            if (Math.acos(vectorPairList[1][1]) < fBound) {
              isBoundary = true;
            }


            // 1u wide cell into quarters
            var fBlockMidX = (nTestX) + 0.5;
            var fBlockMidY = (nTestY) + 0.5;


            // using the distance to the wall and the player angle (Eye Vectors)
            // to determine the collusion point
            var fTestPointX = fPlayerX + fEyeX * fDistanceToWall;
            var fTestPointY = fPlayerY + fEyeY * fDistanceToWall;


            // now we have the location of the middle of the cell,
            // and the location of point of collision, work out angle
            var fTestAngle = Math.atan2( (fTestPointY - fBlockMidY), (fTestPointX - fBlockMidX) )
            // rotate by pi over 4

            if( fTestAngle >= -Math.PI * 0.25 && fTestAngle < Math.PI * 0.25 ){
              fSampleX = fTestPointY - parseFloat(nTestY);
              sWallDirection = "W";
            }
            if( fTestAngle >= Math.PI * 0.25 && fTestAngle < Math.PI * 0.75 ){
              fSampleX = fTestPointX - parseFloat(nTestX);
              sWallDirection = "N";
            }
            if( fTestAngle < -Math.PI * 0.25 && fTestAngle >= -Math.PI * 0.75 ){
              fSampleX = fTestPointX - parseFloat(nTestX);
              sWallDirection = "S";
            }
            if( fTestAngle >= Math.PI * 0.75 || fTestAngle < -Math.PI * 0.75 ){
              fSampleX = fTestPointY - parseFloat(nTestY);
              sWallDirection = "E";
            }

          }
        } // end ray casting loop


        // at the end of ray casting, we should have the lengths of the rays
        // set to their last value, representing their distances
        // based on the distance to wall, determine how much floor and ceiling to show per column,
        // Adding in the recalc for looking (fLookTimer) and jumping (nJumptimer)
        // // var nCeiling = (nScreenHeight / 2) - nScreenHeight / fDistanceToWall;
        // // var nCeiling = (nScreenHeight / (2 - fLooktimer*0.15)) - nScreenHeight / fDistanceToWall;
        var nCeiling = (nScreenHeight / ((2 - nJumptimer*0.15) - fLooktimer*0.15)) - nScreenHeight / fDistanceToWall;
        var nFloor   = (nScreenHeight / ((2 - nJumptimer*0.15) - fLooktimer*0.15)) + nScreenHeight / fDistanceToWall;

        // similar for towers and gates
        var nTower   = (nScreenHeight / ((2 - nJumptimer*0.15) - fLooktimer*0.15)) - nScreenHeight / (fDistanceToWall - 2);
        var nDoorFrameHeight = (nScreenHeight / ((2 - nJumptimer*0.15) - fLooktimer*0.15)) - nScreenHeight / (fDistanceToWall + 2);

        // similar operation for objects
        var nObjectCeiling = (nScreenHeight / ((2 - nJumptimer*0.15) - fLooktimer*0.15)) - nScreenHeight / fDistanceToObject;
        var nObjectFloor = (nScreenHeight / ((2 - nJumptimer*0.15) - fLooktimer*0.15)) + nScreenHeight / fDistanceToObject;
        var nFObjectBackwall = (nScreenHeight / ((2 - nJumptimer*0.15) - fLooktimer*0.15) ) + (nScreenHeight / (fDistanceToInverseObject + 0) ); // 0 makes the object flat, higher the number, the higher the object :)


        // the spot where the wall was hit
        fDepthBuffer[i] = fDistanceToWall;


        // draw the columns one screenheight-pixel at a time
        for(var j = 0; j < nScreenHeight; j++){

          // sky
          if( j < nCeiling){

            // case of tower block (the bit that reaches into the ceiling)
            if(sWalltype == "T"){
              if( j > nTower ){

                var fSampleY = ( (j - nCeiling + 6) / (nFloor - nCeiling + 6) );

                // screen[j*nScreenWidth+i] = _rh.renderSolidWall(j, fDistanceToWall, isBoundary);
                screen[j*nScreenWidth+i] = _rh.renderWall(j, fDistanceToWall, sWallDirection, _getSamplePixel(textures[sWalltype], fSampleX, fSampleY));
              }else{
                screen[j*nScreenWidth+i] = "&nbsp;";
              }
            }

            // draw ceiling/sky
            else{
              if(sWalltype == ","){
                screen[j*nScreenWidth+i] = "1";
              }else{
                screen[j*nScreenWidth+i] = "&nbsp;";
              }
            }
          }

          // solid block
          else if( j > nCeiling && j <= nFloor ){

            // Door Walltype
            if(sWalltype == "X"){
              screen[j*nScreenWidth+i] = _rh.renderGate(j, fDistanceToWall, nDoorFrameHeight);
            }

            // Solid Walltype
            else if(sWalltype != "." || sWalltype == "T"){

              var fSampleY = ( (j - nCeiling) / (nFloor - nCeiling) );

              /**
               * animation timer example
               */
              // if( animationTimer < 5 ){
              //   screen[j*nScreenWidth+i] = _getSamplePixel(texture, fSampleX, fSampleY);
              // }else if( animationTimer >= 5 && animationTimer < 10 ){
              //   screen[j*nScreenWidth+i] = _getSamplePixel(texture2, fSampleX, fSampleY);
              // }else if( animationTimer >= 10 ){
              //   screen[j*nScreenWidth+i] = _getSamplePixel(texture3, fSampleX, fSampleY);
              // }


              // Render Texture Directly
              if( nRenderMode == 1 ){
                screen[j*nScreenWidth+i] = _getSamplePixel(textures[sWalltype], fSampleX, fSampleY);
              }


              // Render Texture with Shading
              if( nRenderMode == 2 ){
                screen[j*nScreenWidth+i] = _rh.renderWall(j, fDistanceToWall, sWallDirection, _getSamplePixel(textures[sWalltype], fSampleX, fSampleY));
              }


              // old, solid-style shading
              if( nRenderMode == 0 ){
                screen[j*nScreenWidth+i] = _rh.renderSolidWall(j, fDistanceToWall, isBoundary);
              }
            }

            // render whatever char is on the map as walltype
            else{
              screen[j*nScreenWidth+i] = sWalltype;
            }
          } // end solid block


          // floor
          else {
            screen[j*nScreenWidth+i] = _rh.renderFloor(j);
          }
        } // end draw column loop


        // Overlay Draw
        for(var y = 0; y < nScreenHeight; y++){

          // sky
          if( y < nObjectCeiling){
            // sky is always 0 on overlayscreen
            overlayscreen[y*nScreenWidth+i] = "0";
          }

          // solid block
          else if( y > nObjectCeiling && y <= nObjectFloor ){

            // Floortile Walltype
            if(sObjectType == "o"){
              if( y < nFObjectBackwall ){
                overlayscreen[y*nScreenWidth+i] = "0";
              }
              else{
                overlayscreen[y*nScreenWidth+i] = _rh.renderSolidWall(y, fDistanceToObject, isBoundary);
                // overlayscreen[y*nScreenWidth+i] = "&nbsp;";
              }
            }else{
              overlayscreen[y*nScreenWidth+i] = "0";
            }
          }

          // floor
          else {
            // overlayscreen floor is always 0
            overlayscreen[y*nScreenWidth+i] = "0";
          }

        } // end draw column loop
      }  // end column loop



      // draw sprites
      for(var si=0; si < Object.keys(oLevelSprites).length; si++ ){

        // the sprite in the level-side
        var sprite = oLevelSprites[Object.keys(oLevelSprites)[si]];

        // reference to the global-side sprite
        var currentSpriteObject = allSprites[sprite["name"]];


        // can object be seen?
        var fVecX = sprite["x"] - fPlayerX;
        var fVecY = sprite["y"] - fPlayerY;
        var fDistanceFromPlayer = Math.sqrt(fVecX*fVecX + fVecY*fVecY);

        // calculate angle between sprite and player, to see if in fov
        var fEyeX = Math.cos(fPlayerA);
        var fEyeY = Math.sin(fPlayerA);

        var fSpriteAngle = Math.atan2(fVecY, fVecX) - Math.atan2(fEyeY, fEyeX) ;
        if (fSpriteAngle < -Math.PI){
          fSpriteAngle += 2.0 * Math.PI;
        }
        if (fSpriteAngle > Math.PI){
          fSpriteAngle -= 2.0 * Math.PI;
        }

        var bInPlayerView = Math.abs(fSpriteAngle) < fFOV / 2;
        // var bInPlayerView = true;


        // only proceed if sprite is visible
        if( bInPlayerView && fDistanceFromPlayer >= 0.5 ){

          // very similar operation to background floor and ceiling.
          // Sprite height is default 1, but we can adjust with the factor passed in the sprite object/
          var fSpriteCeiling = parseFloat(nScreenHeight / ((2 - nJumptimer*0.15) - fLooktimer*0.15)) - nScreenHeight / (parseFloat(fDistanceFromPlayer) ) * currentSpriteObject["hghtFctr"];
          var fSpriteFloor = parseFloat(nScreenHeight / ((2 - nJumptimer*0.15) - fLooktimer*0.15)) + nScreenHeight / (parseFloat(fDistanceFromPlayer) );

          var fSpriteCeiling = Math.round(fSpriteCeiling);
          var fSpriteFloor = Math.round(fSpriteFloor);

          var fSpriteHeight = fSpriteFloor - fSpriteCeiling;
          var fSpriteAspectRatio = parseFloat(currentSpriteObject["height"]) / parseFloat(currentSpriteObject["width"] * currentSpriteObject["aspctRt"]);
          var fSpriteWidth = fSpriteHeight / fSpriteAspectRatio;
          var fMiddleOfSprite = (0.5 * (fSpriteAngle / (fFOV / 2.0)) + 0.5) * parseFloat(nScreenWidth);

          // The angle the sprite is facing relative to the player
          var fSpriteBeautyAngle = fPlayerA - sprite["r"] + Math.PI / 4.0;
          // normalize
          if (fSpriteBeautyAngle < 0){
            fSpriteBeautyAngle += 2.0 * Math.PI;
          }
          if (fSpriteBeautyAngle > 2.0 * Math.PI){
            fSpriteBeautyAngle -= 2.0 * Math.PI;
          }

          // loops through the sprite pixels
          for(var sx = 0; sx < fSpriteWidth; sx++ ){
            for(var sy = 0; sy < fSpriteHeight; sy++){

              // sample sprite
              var fSampleX = sx / fSpriteWidth;
              var fSampleY = sy / fSpriteHeight;


              // sample angled Glyphs if available
              if( "angles" in currentSpriteObject ){

                var sSamplePixel = '';

                if( fSpriteBeautyAngle >= PI_00 && fSpriteBeautyAngle < PI_05 ){
                  sSamplePixel = _getSamplePixel(currentSpriteObject["angles"]["B"], fSampleX, fSampleY);
                }
                else if( parseFloat(fSpriteBeautyAngle) >= parseFloat(PI_05) && parseFloat(fSpriteBeautyAngle) < parseFloat(PI_10) ){
                  sSamplePixel = _getSamplePixel(currentSpriteObject["angles"]["L"], fSampleX, fSampleY);
                }
                else if( parseFloat(fSpriteBeautyAngle) >= parseFloat(PI_10) && parseFloat(fSpriteBeautyAngle) < parseFloat(PI_15) ){
                  sSamplePixel = _getSamplePixel(currentSpriteObject["angles"]["F"], fSampleX, fSampleY);
                }
                else if( parseFloat(fSpriteBeautyAngle) >= parseFloat(PI_15) && parseFloat(fSpriteBeautyAngle) < parseFloat(PI_20) ){
                  sSamplePixel = _getSamplePixel(currentSpriteObject["angles"]["R"], fSampleX, fSampleY);
                }
              }

              // if not, use basic sprite
              else{
                sSamplePixel = _getSamplePixel(currentSpriteObject, fSampleX, fSampleY);
              }


              // assign based on render mode
              if( nRenderMode == 2 || nRenderMode == 0 ){
                sSpriteGlyph = _rh.renderWall( j, fDistanceFromPlayer, "W", sSamplePixel );
              }
              else{
                sSpriteGlyph = sSamplePixel;
              }


              var nSpriteColumn = Math.round((fMiddleOfSprite + sx - (fSpriteWidth / 2)));

              if (nSpriteColumn >= 0 && nSpriteColumn < nScreenWidth){
                // only render the sprite pixel if it is not a . or a space, and if the sprite is far enough from the player
                if (sSpriteGlyph != "." && sSpriteGlyph != "&nbsp;" && fDepthBuffer[nSpriteColumn] >= fDistanceFromPlayer ){

                // debug
                // if (sSpriteGlyph != "." && sSpriteGlyph != "&nbsp;" ){
                //   if (fDepthBuffer[nSpriteColumn] < fDistanceFromPlayer ){
                //     sSpriteGlyph = 'm';
                //   }

                  // render to overlay
                  var yccord = fSpriteCeiling + sy;
                  var xccord = nSpriteColumn;
                  overlayscreen[ yccord*nScreenWidth + xccord ] = sSpriteGlyph;

                  fDepthBuffer[nSpriteColumn] = fDistanceFromPlayer;
                }
              }
            }
          }
        } // end if

        // player was hit
        else{
          // clearInterval(gameRun);
        }

      }


      _fDrawFrame(screen, overlayscreen);
      // _fDrawFrame(overlayscreen, false, eDebugOut);

    }
  };


  // for every row make a nScreenWidth amount of pixels
  var _createTestScreen = function(){
    var sOutput = "";
    for(var i = 0; i < nScreenHeight; i++){
      for(var j = 0; j < nScreenWidth; j++){
        sOutput += "&nbsp;";
      }
      sOutput += ".<br>";
    }
    eScreen.innerHTML = sOutput;
  };


  var _getWidth = function() {
    if (self.innerWidth) {
      return self.innerWidth;
    }
    if (document.documentElement && document.documentElement.clientWidth) {
      return document.documentElement.clientWidth;
    }
    if (document.body) {
      return document.body.clientWidth;
    }
  };


  var nTrymax = 512;
  var _testScreenSizeAndStartTheGame = function(){

    // render a static test screen
    _createTestScreen();

    var widthOfDisplay = eScreen.offsetWidth;
    var widthOfViewport = _getWidth();

    // check if the amount of pixels to be rendered fit, if not, repeat
    if(widthOfDisplay > widthOfViewport ){
      nScreenWidth = nScreenWidth - 1;
      nScreenHeight = nScreenWidth * 0.22;

      // try no more than nTrymax times (in case of some error)
      if( nTrymax > 0 ){
        nTrymax--;
        _testScreenSizeAndStartTheGame();
      }

    }
    // if it does, start the game
    else{
      main();
    }
  };


  var init = function( input )
  {
    // prep document
    eScreen = document.getElementById("display");
    eDebugOut = document.getElementById("debug");
    eTouchLook = document.getElementById("touchinputlook");
    eTouchMove = document.getElementById("touchinputmove");

    _moveHelpers.keylisten();
    _moveHelpers.mouseinit();
    _moveHelpers.touchinit();

    // TODO: move to in-game menu
    document.getElementById("solid").addEventListener("click", function(){ nRenderMode = 0 });
    document.getElementById("texture").addEventListener("click", function(){ nRenderMode = 1 });
    document.getElementById("shader").addEventListener("click", function(){ nRenderMode = 2 });

    // initial gameload
    _loadLevel("levelfile1.map");
  };


  return{
    init: init,
  }
})();