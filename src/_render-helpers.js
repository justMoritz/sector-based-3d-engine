/**
 * 
 * Render Helpers
 * 
 * various shaders for walls, ceilings, objects
 * 
 */


/**
 * Lookup Tables for anything render related
 */
var _rh = {
  colorPixelLookupTable: {
    // Black
    '.m': [0, 0, 0],
    '.q': [0, 0, 0],
    '*q': [0, 0, 0],
    '7q': [255, 255, 255],
    '#q': [255, 255, 255],
    // "#525252": ['o', 'm'], // Grays
    // "#666666": ['*', 'm'],
    // "#ABABAB": ['7', 'm'],
    // "#C8C8C8": ['#', 'm'],
    // Grays
    'om': [66, 66, 66],
    '*m': [102, 102, 102],
    '7m': [168, 168, 168],
    '#m': [224, 224, 224], // 200

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
  // lookup-table “for fine-control” or “for performance”
  // …(but really because I couldn"t figure out the logic [apparently] )
  skipEveryXrow: function (input) {

    if (input < 0) {
      fYMoveBy = input * 0.7
      // console.log('down')
    }else{
      fYMoveBy = input * Math.pow(1.2, input);
    }

    // TODO: Somehow get this factor based on the screen resolution
    // If the width is 540, 0.25
    // If the width is 270, 0.5
    // if the width is 1080, 0.125
    var adjustFactor = 0.25;

    var skipEveryXRow = (nScreenHeight * adjustFactor) /fYMoveBy;
    return ~~skipEveryXRow;
  },
};

   

/**
 * 
 * Function gets the pixel to be sampled from the sprite WITH bilinear filtering
 * @param {object} texture Texture object from textures.tex file
 * @param {float} x              Requested X Coordinate on the wall
 * @param {float} y              Requested Y Coord.
 * @param {float} fSampleXScale  How many times to repeat the texture on a given wall, in the X direction
 * @param {float} fSampleYScale  " , in the Y direction
 * @param {float} fSampleXOffset X Offset for the texture (how far the texture needs to be shifted by)
 * @param {float} fSampleYOffset Y Offset 
 * @param {float} fDistance      Distance to the wall/object/sprite
 * @returns {array}              RBG Value of the pixel, with proper distance shading
 * 
 */
var _getSamplePixelBilinear = function(texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance) {

  var texWidth = texture.width || defaultTexWidth;
  var texHeight = texture.height || defaultTexHeight;
  var texpixels = texture.texture;

  var scaleFactorX = fSampleXScale || 2;
  var scaleFactorY = fSampleYScale || 2;
  var offsetX = fSampleXOffset || 0;
  var offsetY = fSampleYOffset || 0;
  var depthValue = fDistance || 1;

  // Actual sample point
  x = (scaleFactorX * x + offsetX) % 1;
  y = (scaleFactorY * y + offsetY) % 1;

  // Scales coordinates to texture size
  x *= texWidth;
  y *= texHeight;

  // Integer and fractionals
  var x0 = ~~(x);
  var y0 = ~~(y);
  var dx = x - x0;
  var dy = y - y0;
  var x1 = (x0 + 1) % texWidth;  
  var y1 = (y0 + 1) % texHeight;

  // Sampling the four surrounding pixels
  var samplePosition00 = (y0 * texWidth + x0) * 2;
  var samplePosition01 = (y0 * texWidth + x1) * 2;
  var samplePosition10 = (y1 * texWidth + x0) * 2;
  var samplePosition11 = (y1 * texWidth + x1) * 2;
  var color00 = _getColorPixel(texpixels[samplePosition00 + 1], texpixels[samplePosition00]);
  var color01 = _getColorPixel(texpixels[samplePosition01 + 1], texpixels[samplePosition01]);
  var color10 = _getColorPixel(texpixels[samplePosition10 + 1], texpixels[samplePosition10]);
  var color11 = _getColorPixel(texpixels[samplePosition11 + 1], texpixels[samplePosition11]);

  // Bilinear interpolation for each color component
  var colorR = color00[0] * (1 - dx) * (1 - dy) + color01[0] * dx * (1 - dy) + color10[0] * (1 - dx) * dy + color11[0] * dx * dy;
  var colorG = color00[1] * (1 - dx) * (1 - dy) + color01[1] * dx * (1 - dy) + color10[1] * (1 - dx) * dy + color11[1] * dx * dy;
  var colorB = color00[2] * (1 - dx) * (1 - dy) + color01[2] * dx * (1 - dy) + color10[2] * (1 - dx) * dy + color11[2] * dx * dy;

  // Adding shading based on depth Value
  // var shadingFactor = Math.max(0.5, 1 - depthValue / fDepth);
  var shadingFactor = Math.max(0.5, 1 - depthValue / fDepth);

  // console.log(shadingFactor);
  colorR *= shadingFactor;
  colorG *= shadingFactor;
  colorB *= shadingFactor;

  // Rounding and return color components
  var finalColor = [~~(colorR), ~~(colorG), ~~(colorB)];
  return finalColor;
};




/**
 * 
 * Function will get the pixel to be sampled from the sprite without bilinear filtering
 * @param {object} texture Texture object from textures.tex file
 * @param {float} x              Requested X Coordinate on the wall
 * @param {float} y              Requested Y Coord.
 * @param {float} fSampleXScale  How many times to repeat the texture on a given wall, in the X direction
 * @param {float} fSampleYScale  " , in the Y direction
 * @param {float} fSampleXOffset X Offset for the texture (how far the texture needs to be shifted by)
 * @param {float} fSampleYOffset Y Offset 
 * @param {float} fDistance      Distance to the wall/object/sprite
 * @returns {array}              RBG Value of the pixel, with proper distance shading
 * 
 */
var _getSamplePixelDirect = function (texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance) {

  // defaults
  var texWidth = texture.width || defaultTexWidth;
  var texHeight = texture.height || defaultTexHeight;
  var texpixels = texture.texture;

  var scaleFactorX = fSampleXScale || 2;
  var scaleFactorY = fSampleYScale || 2;
  var offsetX = fSampleXOffset || 0;
  var offsetY = fSampleYOffset || 0;
  var depthValue = fDistance || 1;

  x = (scaleFactorX * x + offsetX) % 1;
  y = (scaleFactorY * y + offsetY) % 1;

  var sampleX = ~~(texWidth * x);
  var sampleY = ~~(texHeight * y);

  var samplePosition = (texWidth * sampleY + sampleX) * 2;

  var currentColor;
  var currentPixel;
  var currentColorPixel;

  currentPixel = texpixels[samplePosition];
  currentColor = texpixels[samplePosition+1];
  currentColorPixel = _getColorPixel(currentColor, currentPixel) || [0, 0, 0]; 

  var shadingFactor = Math.max(0.5, 1 - depthValue / fDepth);
  colorR = currentColorPixel[0] * shadingFactor;
  colorG = currentColorPixel[1] * shadingFactor;
  colorB = currentColorPixel[2] * shadingFactor;

  // return currentColorPixel;
  var finalColor = [~~(colorR), ~~(colorG), ~~(colorB)];
  return finalColor;
};



/**
 * 
 * Switch to determine which sampler to use based on setting.
 * Passes all parameters to sampling call.
 * 
 */
var _getSamplePixel = function (texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance) {
  if(bTexFiltering){
    return _getSamplePixelBilinear(texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance);
  }
  else {
    return _getSamplePixelDirect(texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance);
  }
}


/**
 * 
  * @param {string} color The color key (any color)
  * @param {string} pixel The darkness key (4 shaes)
  * @returns {array} RGB values
 */
var _getColorPixel = function(color, pixel){
  var sColPixName = ""+pixel+color;
  return _rh.colorPixelLookupTable[sColPixName];
}


// returns true every a-th interation of b
var _everyAofB = function (a, b) {
  return a && a % b === 0;
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
function _evenlyPickItemsFromArray(allItems, neededCount) {

  var result = [];
  var totalItems = allItems.length;
  var interval = totalItems / neededCount;

  for (var i = 0; i < neededCount; i++) {
    var evenIndex = ~~(i * interval + interval / 2);
    result.push(allItems[evenIndex]);
  }

  return result;
}






/**
 * Creates a new array of pixels taking looking up and down into account
 * It returns an array to be rendered later.
 * the aim is to remove the first and last 30 pixels of very row,
 * to obscure the skewing
 */
var _fPrepareFrame = function (oInput, eTarget) {
  var eTarget = eTarget || eScreen;
  var sOutput = [];

  // this is the maximum of variation created by the lookup timer, aka the final look-modifier value
  var neverMoreThan = Math.round(
    nScreenHeight / _rh.skipEveryXrow(fLooktimer) - 1
  );

  // used to skew the image
  var globalPrintIndex = 0;
  var fLookModifier = 0;
  
  // if looking up, the starting point is the max number of pixesl to indent,
  // which will be decremented, otherwise it remains 0, which will be incremented
  if (fLooktimer > 0 && isFinite(neverMoreThan)) {
    fLookModifier = neverMoreThan;
  }

  _debugOutput(`${_rh.skipEveryXrow(fLooktimer)}, ${fLooktimer} , ${fLookModifier}, ${fLookModifier}`)
  
  // iterate each row at a time
  for (var row = 0; row < nScreenHeight; row++) {
    // increment the fLookModifier every time it needs to grow (grows per row)
    if (_everyAofB(row, _rh.skipEveryXrow(fLooktimer))) {
      if (fLooktimer > 0) {
        // looking up
        fLookModifier--;
      } else {
        fLookModifier++;
      }
    }

    // print filler pixels
    for (var i = 0; i < fLookModifier; i++) {
      sOutput.push([255,255,255]);
    }

    var toBeRemoved = 2 * fLookModifier;
    var removeFrom = [];

    //  make a new array that contains the indices of the elements to print
    // (removes X amount of elements from array)
    var items = [];
    for (var i = 0; i <= nScreenWidth; i++) {
      items.push(i);
    }

    // list to be removed from each row:
    // [1,2,3,4,5,6,7,8]
    // [1,2, ,4,5, ,7,8]
    //   [1,2,4,5,7,8]
    removeFrom = _evenlyPickItemsFromArray(items, toBeRemoved);

    // loops through each rows of pixels
    for (var rpix = 0; rpix < nScreenWidth; rpix++) {
      // print only if the pixel is in the list of pixels to print
      if (removeFrom.includes(rpix)) {
        // don't print
      } else {
        // print
        sOutput.push( oInput[globalPrintIndex] );
      }

      globalPrintIndex++;
    } // end for(rpix

    // print filler pixels
    for (var i = 0; i < fLookModifier; i++) {
      sOutput.push([255,255,255]);
    }
  } // end for(row

  return sOutput;
};


var _drawToCanvas = function ( pixels ) {

  eCanvas.width = nScreenWidth;
  eCanvas.height = nScreenHeight;
  
  // Create an ImageData object with the pixel data
  var imageData = cCtx.createImageData(nScreenWidth, nScreenHeight);
      
  // Convert values to shades of colors
  for (var i = 0; i < pixels.length; i++) {
    var color = pixels[i];
    // console.log(pixels);
   
    imageData.data[i * 4] = color[0] ; // Red 
    imageData.data[i * 4 + 1] = color[1] ; // Green 
    imageData.data[i * 4 + 2] = color[2] ; // Blue 
    imageData.data[i * 4 + 3] = 255; // Alpha 
  }
  // Use putImageData to draw the pixels onto the canvas
  cCtx.putImageData(imageData, 0, 0);
}



var _fDrawFrame = function (screen, target) {
  var changeLookTimer = ~~(fLooktimer*10)

  _debugOutput(`A: ${fPlayerA} X:${fPlayerX} Y:${fPlayerY} + H: ${ fPlayerH }`)
  // var frame = screen
  // var target = target || eScreen;

  // var sOutput = "";  
  // var sCanvasOutput = "";

  // // interates over each row again, and omits the first and last 30 pixels, to disguise the skewing!
  // nPrintIndex = 0;

  // for (var row = 0 ; row < nScreenHeight ; row++) {
  // // for (var row = 0 ; row < nScreenHeight ; row++) {
  //   for (var pix = 0; pix < nScreenWidth; pix++) {
  //     // H-blank based on screen-width
  //     if (nPrintIndex % nScreenWidth == 0) {
  //       sOutput += "<br>";
  //     }
  //     // sOutput += _convertPixelToAscii(frame[nPrintIndex], 0);
  //     sOutput += frame[nPrintIndex];
  //     sCanvasOutput += frame[nPrintIndex];
  //     nPrintIndex++;
  //   }
  // }
  // eScreen.innerHTML = sOutput;
  _drawToCanvas( screen );
};

var _fDrawFrameWithSkew = function (screen, target) {
  _debugOutput(`A: ${fPlayerA} X:${fPlayerX} Y:${fPlayerY} + H: ${ fLooktimer }`);
  var frame = _fPrepareFrame(screen);
  var target = target || eScreen;

  // var sOutput = "";
  var sCanvasOutput = [];

  // // interates over each row again, and omits the first and last 30 pixels, to disguise the skewing!
  var printIndex = 0;
  

  
  for (var row = 0; row < nScreenHeight; row++) {
    for (var pix = 0; pix < nScreenWidth; pix++) {
      // H-blank based on screen-width
      // if (printIndex % nScreenWidth == 0) {
      //   // sOutput += "<br>";
      // }

      if (pix < nRemovePixels) {
        // sOutput += "";
        sCanvasOutput[printIndex] = [55, 0, 0];
      } else if (pix > nScreenWidth - nRemovePixels) {
        // sOutput += "";
        sCanvasOutput[printIndex] = [55, 0, 0];
      } else {
        // sOutput += frame[printIndex];)
        sCanvasOutput[printIndex] = frame[printIndex];
      }

      printIndex++;
    }
  }
  // target.innerHTML = sCanvasOutput;
  _drawToCanvas( sCanvasOutput );
  // _drawToCanvas( frame );
};



function drawFloor(i, j, fSectorFloorHeight, sSectorFloorTexture,){

  var nStandardHeight = 2;
  var fPlayerHinSector;
  var fPlayerViewHeight;
  var fAdjustedHeight;
  var fRealDistance;
  var fDirectDistFloor;

  fPlayerHinSector = fSectorFloorHeight;
  fAdjustedHeight = nStandardHeight - fPlayerHinSector * 2  ;
  fPlayerViewHeight = fAdjustedHeight  + ( fPlayerH * 2  ); // Adjusts for jumping
  // Calculate the direct distance from the player to the floor pixel
  // Adjusts the looktimer here instead of in the fscreenHeightFactor
  fDirectDistFloor = ( fPlayerViewHeight  * fscreenHeightFactorFloor ) / ( j - nScreenHeight / (2 - fFloorLooktimer) ); 
  
  fRealDistance = fDirectDistFloor / Math.cos(fPlayerA - fRayAngleGlob ) ;
  fDepthBufferR[j * nScreenWidth + i] = fRealDistance;
  
  // Calculate real-world coordinates with the player angle
  var floorPointX = fPlayerX + Math.cos(fRayAngleGlob) * fRealDistance;
  var floorPointY = fPlayerY + Math.sin(fRayAngleGlob) * fRealDistance;

  sFloorPixelToRender = _getSamplePixel( textures[sSectorFloorTexture], floorPointX,  floorPointY , 1, 1, 0, 0, fRealDistance);
  return sFloorPixelToRender;
}


function drawCeiling(i, j, fSectorCeilingHeight, sSectorCeilTexture){

  var nStandardHeight = 2;
  var fPlayerHinSector;
  var fPlayerViewHeight;
  var fAdjustedHeight;
  var fRealDistance;
  var fDirectDistCeil;

  
  fPlayerHinSector = 0.5  + fSectorCeilingHeight;
  fAdjustedHeight = nStandardHeight - fPlayerHinSector * 2  ;
  fPlayerViewHeight = fAdjustedHeight  + ( fPlayerH * 2  ); // Adjusts for jumping
  // Calculate the direct distance from the player to the floor pixel
  // Adjusts the looktimer here instead of in the fscreenHeightFactor
  fDirectDistCeil = ( fPlayerViewHeight  * fscreenHeightFactorFloor ) / ( j - nScreenHeight / (2 - fFloorLooktimer) ); 
  
  fRealDistance = fDirectDistCeil / Math.cos(fPlayerA - fRayAngleGlob ) ;
  fDepthBufferR[j * nScreenWidth + i] = fRealDistance;
  
  // Calculate real-world coordinates with the player angle
  var ceilPointX = fPlayerX + Math.cos(fRayAngleGlob) * fRealDistance;
  var ceilPointY = fPlayerY + Math.sin(fRayAngleGlob) * fRealDistance;

  var sCeilPixelToRender = _getSamplePixel( textures[sSectorCeilTexture], ceilPointX,  ceilPointY , 1.5, 1.5, 0, 0,  fRealDistance);
  return sCeilPixelToRender;
}


function drawBackground (i, j) {
  
  // make the background double the size of the screen
  var fBgX = i / nScreenWidth;
  var fBgY = (j + fscreenHeightFactorFloor) / nScreenHeight;

  // Calculate horizontal offset based on player angle
  var angleOffset = fPlayerA * OneDivPi;
  fBgX += angleOffset * 2;

  if (fLooktimer < 0) { 
    fBgY -= fLooktimer / 100; // down
  }else{
    fBgY -= fLooktimer / 20; // up
  }
  
  sPixelToDraw = _getSamplePixel(textures['bg'], fBgX, fBgY, 1, 1);

  return sPixelToDraw;
}