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
var _getSamplePixelBilinear = function(texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance, fLightValue, isSprite) {
  
  if(typeof texture !== "undefined"){
    var texWidth = texture.width;
    var texHeight = texture.height;
    var texpixels = texture.texture;

    // mip mapping (try 5, 8, 20 for floors?)
    if(fDistance > 40 && !isSprite){
      texpixels = texture.mm3;
      texHeight = texture.height / 8;
      texWidth = texture.width / 8;
    }
    else if(fDistance > 30 && !isSprite){
      texpixels = texture.mm2;
      texHeight = texture.height / 4;
      texWidth = texture.width / 4;
    }
    else if(fDistance > 20 && !isSprite){
      texpixels = texture.mm1;
      texHeight = texture.height / 2;
      texWidth = texture.width / 2;
    }

  }else{
    var texWidth = 1
    var texHeight = 1
    var texpixels = [[255,0,255]];
  }

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

  // prevents wrapping on sprite by Math.min-ing it.
  if (isSprite) {
    // var x1 = Math.min(x0 + 1, texWidth - 1);
    // var y1 = Math.min(y0 + 1, texHeight - 1);
    var x1 = mathMinBitwise(x0 + 1, texWidth - 1);
    var y1 = mathMinBitwise(y0 + 1, texHeight - 1);
  } else {
    var x1 = (x0 + 1) % texWidth;  
    var y1 = (y0 + 1) % texHeight;
  }

  var dx = x - x0;
  var dy = y - y0;

  // Sampling the four surrounding pixels
  var samplePosition00 = (y0 * texWidth + x0);
  var samplePosition01 = (y0 * texWidth + x1);
  var samplePosition10 = (y1 * texWidth + x0);
  var samplePosition11 = (y1 * texWidth + x1);

  var color00 = oRenderPalette[texpixels[samplePosition00]];
  var color01 = oRenderPalette[texpixels[samplePosition01]];
  var color10 = oRenderPalette[texpixels[samplePosition10]];
  var color11 = oRenderPalette[texpixels[samplePosition11]];

  // Bilinear interpolation for each color component
  var colorR = color00[0] * (1 - dx) * (1 - dy) + color01[0] * dx * (1 - dy) + color10[0] * (1 - dx) * dy + color11[0] * dx * dy;
  var colorG = color00[1] * (1 - dx) * (1 - dy) + color01[1] * dx * (1 - dy) + color10[1] * (1 - dx) * dy + color11[1] * dx * dy;
  var colorB = color00[2] * (1 - dx) * (1 - dy) + color01[2] * dx * (1 - dy) + color10[2] * (1 - dx) * dy + color11[2] * dx * dy;

  if(isSprite){
    // if out of the 4 sample pixels between 1 and 3 are black...
    var bColor00Black = color00.every(element => element === 0);
    var bColor01Black = color01.every(element => element === 0);
    var bColor10Black = color10.every(element => element === 0);
    var bColor11Black = color11.every(element => element === 0);

    if (containsBlackColor(bColor00Black, bColor01Black, bColor10Black, bColor11Black)) { 
      if ( brighestColor(colorR, colorG, colorB) < 75) { 
        colorR = 0;
        colorG = 0;
        colorB = 0;
      }
      // colorR = samplePosition00[0];
      // colorG = samplePosition00[1];
      // colorB = samplePosition00[2];
    } 
  }
  // end if is Sprite

  // Adding shading based on depth Value
  // var shadingFactor = Math.max(0.5, 1 - depthValue / fDepth);
  var shadingFactor = Math.max(0.5, 1 - depthValue / Math.min(40, fDepth));

  var lightShade = 1;
  // if(typeof fLightValue !== "undefined" && !isSprite){
  if(typeof fLightValue !== "undefined"){
    lightShade = fLightValue + oLevel.baseLight;
  }

  colorR *= lightShade * shadingFactor;
  colorG *= lightShade * shadingFactor;
  colorB *= lightShade * shadingFactor;

  // Rounding and return color components
  // var finalColor = [~~(colorR), ~~(colorG), ~~(colorB)];
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
var _getSamplePixelDirect = function (texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance, fLightValue, isSprite) {
  if(typeof texture !== "undefined"){
    var texWidth = texture.width;
    var texHeight = texture.height;
    var texpixels = texture.texture;


    // mip mapping
    // if(fDistance > 40 && !isSprite){
    //   texpixels = texture.mm3;
    //   texHeight = texture.height / 8;
    //   texWidth = texture.width / 8;
    // }
    // else 
    if(fDistance > 30 && !isSprite){
      texpixels = texture.mm2;
      texHeight = texture.height / 4;
      texWidth = texture.width / 4;
    }
    else if(fDistance > 20 && !isSprite){
      texpixels = texture.mm1;
      texHeight = texture.height / 2;
      texWidth = texture.width / 2;
    }


  }else{
    var texWidth = 1
    var texHeight = 1
    var texpixels = [0];
  }

  var scaleFactorX = fSampleXScale || 2;
  var scaleFactorY = fSampleYScale || 2;
  var offsetX = fSampleXOffset || 0;
  var offsetY = fSampleYOffset || 0;
  var depthValue = fDistance || 1;

  x = (scaleFactorX * x + offsetX) % 1;
  y = (scaleFactorY * y + offsetY) % 1;

  var sampleX = ~~(texWidth * x);
  var sampleY = ~~(texHeight * y);

  var samplePosition = (texWidth * sampleY + sampleX);

  var pixelIndex = texpixels[samplePosition];
  var currentColorPixel = oRenderPalette[pixelIndex] || [0, 0, 0];
  
  // var currentPixel;
  // var currentColorPixel;

  // currentPixel = texpixels[samplePosition];
  // currentColorPixel = currentPixel || [0, 0, 0]; 

  var lightShade = 1;
  if(typeof fLightValue !== "undefined"){
    lightShade = fLightValue + oLevel.baseLight;
  }

  var shadingFactor = Math.max(0.5, 1 - depthValue / fDepth);
  colorR = currentColorPixel[0] * shadingFactor * lightShade;
  colorG = currentColorPixel[1] * shadingFactor * lightShade;
  colorB = currentColorPixel[2] * shadingFactor * lightShade;

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
var _getSamplePixel = function (texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance, fLightValue, isSprite) {
  if(bTexFiltering){
    return _getSamplePixelBilinear(texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance, fLightValue, isSprite);
  }
  else {
    return _getSamplePixelDirect(texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance, fLightValue, isSprite);
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
  // var neverMoreThan = Math.round(
  //   nScreenHeight / _rh.skipEveryXrow(fLooktimer) - 1
  // );

  // fast round
  var neverMoreThan = ( (nScreenHeight / _rh.skipEveryXrow(fLooktimer) - 1) + 0.5 ) | 0;


  // used to skew the image
  var globalPrintIndex = 0;
  var fLookModifier = 0;
  
  // if looking up, the starting point is the max number of pixesl to indent,
  // which will be decremented, otherwise it remains 0, which will be incremented
  if (fLooktimer > 0 && isFinite(neverMoreThan)) {
    fLookModifier = neverMoreThan;
  }
  
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
  if ( sPostProcessing === '8bit' ) {
    _drawToCanvasDithered(pixels, '8bit');
  }
  else if ( sPostProcessing === '12bit' ) {
    _drawToCanvasDithered(pixels, '12bit');
  }
  else if ( sPostProcessing === '10bit' ) {
    _drawToCanvasDithered(pixels);
  }
  else if ( sPostProcessing === 'vaporwave' ) {
    _drawToCanvasDithered(pixels, 'vaporwave');
  }
  else {
    _drawToCanvas24bit(pixels)
  }
}



/**
 * Draws to Canvas in full 24 bit color, no post-processing
 * @param {*} pixels 
 */
var _drawToCanvas24bit = function ( pixels ) {

  eCanvas.width = nDrawWidth;
  eCanvas.height = nScreenHeight;
  
  // Create an ImageData object with the pixel data
  var imageData = cCtx.createImageData(nDrawWidth, nScreenHeight);
      
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



/**
 * Draws to Canvas in full 24 bit color, no post-processing
 * @param {*} pixels 
 */
var _drawToCanvasAntialias = function ( pixels ) {
  eCanvas.width = nDrawWidth;
  eCanvas.height = nScreenHeight;

  // 👇 only blur edges
  const aaPixels = antialiasEdges(pixels, nDrawWidth, nScreenHeight);

  var imageData = cCtx.createImageData(nDrawWidth, nScreenHeight);
  for (let i = 0; i < aaPixels.length; i++) {
    let c = aaPixels[i];
    imageData.data[i*4]     = c[0];
    imageData.data[i*4 + 1] = c[1];
    imageData.data[i*4 + 2] = c[2];
    imageData.data[i*4 + 3] = 255;
  }
  cCtx.putImageData(imageData, 0, 0);
};


// Precompute color expansion tables
const expand4bit = new Uint8Array(16);
const expand3bit = new Uint8Array(8);
const expand2bit = new Uint8Array(4);
for (let i = 0; i < 16; i++) { expand4bit[i] = (i << 4) | i; }
for (let i = 0; i < 8; i++) expand3bit[i] = (i << 5) | (i << 2) | (i >> 1);
for (let i = 0; i < 4; i++) expand2bit[i] = (i << 6) | (i << 4) | (i << 2) | i;

/**
 * Draws to canvas with quantizing and dithering post-processing
 * @param {*} pixels 
 * @param {*} method 
 */
var _drawToCanvasDithered = function (pixels, method) {
  eCanvas.width = nDrawWidth;
  eCanvas.height = nScreenHeight;

  var imageData = cCtx.createImageData(nDrawWidth, nScreenHeight);
  var width = nDrawWidth;
  var height = nScreenHeight;

  // Deep copy pixels so we can dither in-place
  var ditheredPixels = pixels.map(color => [...color]);

  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var idx = y * width + x;
      var oldColor = ditheredPixels[idx];

      // Quantisation method
      if (method === "8bit") {
        var newColor = quantizeColor8(oldColor);
      }
      else if (method === "12bit") {
        var newColor = quantizeColor12(oldColor);
      }
      else if (method === "vaporwave") {
        var newColor = quantizeColorVaporwave(oldColor);
      }
      else{
        var newColor = quantizeColor10(oldColor);
      }

      // Write quantized color to canvas buffer
      imageData.data[idx * 4]     = newColor[0];
      imageData.data[idx * 4 + 1] = newColor[1];
      imageData.data[idx * 4 + 2] = newColor[2];
      imageData.data[idx * 4 + 3] = 255;

      // Error between original and quantized
      var errR = oldColor[0] - newColor[0];
      var errG = oldColor[1] - newColor[1];
      var errB = oldColor[2] - newColor[2];

      // Floyd–Steinberg dithering
      spreadError(x + 1, y    , errR, errG, errB, 7 / 16);
      spreadError(x - 1, y + 1, errR, errG, errB, 3 / 16);
      spreadError(x    , y + 1, errR, errG, errB, 5 / 16);
      spreadError(x + 1, y + 1, errR, errG, errB, 1 / 16);
    }
  }

  cCtx.putImageData(imageData, 0, 0);

  // Quantize to 12 bit
  function quantizeColor12(color) {
    return [
      expand4bit[color[0] >> 4],
      expand4bit[color[1] >> 4],
      expand4bit[color[2] >> 4]
    ];
  }

  // Quantize in the middle
  function quantizeColor10(color) {
    const r = color[0] >> 5; // 3 bits
    const g = color[1] >> 4; // 4 bits
    const b = color[2] >> 5; // 3 bits

    return [
      expand3bit[r],
      expand4bit[g],
      expand3bit[b]
    ];
  }

  // Quantize to 8 bit
  function quantizeColor8(color) {
    var r = color[0] >> 5; // 3 bits
    var g = color[1] >> 5; // 3 bits
    var b = color[2] >> 6; // 2 bits

    return [
      expand3bit[r],
      expand3bit[g],
      expand2bit[b]
    ];
  }

  // Quantize to 8 bit, vaporwave
  function quantizeColorVaporwave(color) {
    var r = color[0] >> 4; // 3 bits
    var g = color[1] >> 4; // 3 bits
    var b = color[2] >> 6; // 2 bits

    return [
      expand3bit[r],
      expand3bit[g],
      expand2bit[b]
    ];
  }

  // Floyd Steinberg error spreading
  function spreadError(x, y, errR, errG, errB, factor) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    var i = y * width + x;
    ditheredPixels[i][0] = clamp255(ditheredPixels[i][0] + errR * factor);
    ditheredPixels[i][1] = clamp255(ditheredPixels[i][1] + errG * factor);
    ditheredPixels[i][2] = clamp255(ditheredPixels[i][2] + errB * factor);
  }

  function clamp255(val) {
    return val < 0 ? 0 : val > 255 ? 255 : val | 0;
    return Math.max(0, Math.min(255, val));
  }
};







// Function to find the closest color in the palette
function findClosestColor(color, palette) {
  var minDistanceSquared = Number.MAX_VALUE;
  var closestColor = null;

  for (var i = 0; i < palette.length; i++) {
    var distanceSquared = colorDistanceSquared(color, palette[i]);
    if (distanceSquared < minDistanceSquared) {
      minDistanceSquared = distanceSquared;
      closestColor = palette[i];
    }
  }

  return closestColor;
}

// Function to calculate the squared Euclidean distance between two colors
function colorDistanceSquared(color1, color2) {
  var dR = color1[0] - color2[0];
  var dG = color1[1] - color2[1];
  var dB = color1[2] - color2[2];
  return dR * dR + dG * dG + dB * dB;
}


var _round2bitwise = function (input) {
  return ((input * 100 + 0.5) << 0) / 100;
}

var _fDrawFrame = function (screen, target) {
  _debugOutput(`A: ${_round2bitwise(fPlayerA)} X:${_round2bitwise(fPlayerX)} Y:${_round2bitwise(fPlayerY)}}`);
  _drawToCanvas( screen );
};

var _fDrawFrameWithSkew = function (screen, target) {
  _debugOutput(`A: ${_round2bitwise(fPlayerA)} X:${_round2bitwise(fPlayerX)} Y:${_round2bitwise(fPlayerY)}}`);
  var frame = _fPrepareFrame(screen);
  var target = target || eScreen;

  var sCanvasOutput = [];

  // interates over each row again, and omits the first and last 30 pixels, to disguise the skewing!
  var currentIndex = 0;
  var printIndex = 0;

  // removes those pixels we don't need to draw
  for (var row = 0; row < nScreenHeight; row++) {
    for (var pix = 0; pix < nScreenWidth; pix++) {
      if (pix >= nRemovePixels && pix < nScreenWidth - nRemovePixels) {
        sCanvasOutput[printIndex] = frame[currentIndex];
        printIndex++;
      }
      currentIndex++;
    }
  }
  _drawToCanvas( sCanvasOutput );
};



function drawFloor(i, j, fSectorFloorHeight, sSectorFloorTexture, currentSector){

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
  
  fRealDistance = fDirectDistFloor / fastCos(fPlayerA - fRayAngleGlob ) ;
  fDepthBufferR[j * nScreenWidth + i] = fRealDistance;
  
  // Calculate real-world coordinates with the player angle
  var floorPointX = fPlayerX + fastCos(fRayAngleGlob) * fRealDistance;
  var floorPointY = fPlayerY + fastSin(fRayAngleGlob) * fRealDistance;
  

  // live lighting in editor, otherwise sector-based lighting
  if( EDITMODE ){
    fLightValue = getLightingValue(floorPointX, floorPointY);
  }
  else{
    fLightValue = oMap[currentSector].bakedSectorLight;
  }

  sFloorPixelToRender = _getSamplePixel( oLevelTextures[sSectorFloorTexture], floorPointX,  floorPointY , 1, 1, 0, 0, fRealDistance, fLightValue);
  return sFloorPixelToRender;
}


function drawCeiling(i, j, fSectorCeilingHeight, sSectorCeilTexture, currentSector){

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
  
  fRealDistance = fDirectDistCeil / fastCos(fPlayerA - fRayAngleGlob ) ;
  fDepthBufferR[j * nScreenWidth + i] = fRealDistance;
  
  // Calculate real-world coordinates with the player angle
  var ceilPointX = fPlayerX + fastCos(fRayAngleGlob) * fRealDistance;
  var ceilPointY = fPlayerY + fastSin(fRayAngleGlob) * fRealDistance;
  


  // live lighting in editor, otherwise sector-based lighting
  if( EDITMODE ){
    fLightValue = getLightingValue(ceilPointX, ceilPointY);
  }
  else{
    fLightValue = oMap[currentSector].bakedSectorLight;
  }

  var sCeilPixelToRender = _getSamplePixel( oLevelTextures[sSectorCeilTexture], ceilPointX,  ceilPointY , 1.5, 1.5, 0, 0,  fRealDistance, fLightValue);
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
  
  sPixelToDraw = _getSamplePixel(oLevelTextures['bg'], fBgX, fBgY, 1, 1);

  return sPixelToDraw;
}



