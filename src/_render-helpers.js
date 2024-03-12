/**
 * 
 * Render Helpers
 * 
 * various shaders for walls, ceilings, objects
 * 
 */


// each texture has 4 values: 3 hues plus black
// each value can be rendered with 5 shades (4 plus black)
var _rh = {
  // The 4 color values for these start at this point in the array  
  colorReferenceTable:{
    m: ['1', '2', '3', '4'],
    b: ['a', 'b', 'c', 'd'],
    p: ['e', 'f', 'g', 'h'],
    r: ['i', 'j', 'k', 'l'],
    o: ['m', 'n', 'o', 'p'],
    g: ['q', 'r', 's', 't'],
    t: ['u', 'v', 'w', 'x'],
  },
  colorPixelLookupTable: {
    // Black
    '.q': [0, 0, 0],
    '*q': [0, 0, 0],
    '7q': [255, 255, 255],
    '#q': [255, 255, 255],
    
    // Grays
    '.m': [0, 0, 0],
    'om': [82, 82, 82],
    '*m': [102, 102, 102],
    '7m': [171, 171, 171],
    '#m': [200, 200, 200],

    // Blues
    'ob': [1, 36, 123],
    '*b': [39, 89, 201],
    '7b': [120, 171, 255],
    '#b': [202, 219, 255],

    // Indigos
    'oi': [27, 20, 137],
    '*i': [72, 69, 219],
    '7i': [152, 151, 255],
    '#i': [216, 210, 255],

    // Purples
    'ou': [57, 8, 124],
    '*u': [111, 52, 202],
    '7u': [192, 134, 255],
    '#u': [231, 204, 255],

    // Pink
    'op': [82, 2, 87],
    '*p': [146, 43, 155],
    '7p': [226, 125, 239],
    '#p': [244, 201, 249],

    // Reds
    'or': [92, 7, 37],
    '*r': [161, 48, 90],
    '7r': [242, 129, 175],
    '#r': [250, 203, 223],

    // Oranges
    'oo': [87, 19, 0],
    '*o': [155, 64, 24],
    '7o': [237, 145, 109],
    '#o': [247, 210, 196],

    // Yellows
    'oy': [71, 35, 0],
    '*y': [136, 84, 0],
    '7y': [219, 164, 59],
    '#y': [220, 207, 112],

    // Army
    'oa': [45, 51, 0],
    '*a': [104, 103, 0],
    '7a': [189, 184, 37],
    '#a': [225, 227, 165],

    // Green
    'og': [14, 64, 0],
    '*g': [62, 122, 0],
    '7g': [146, 203, 51],
    '#g': [208, 235, 171],

    // Sea
    'os': [0, 69, 0],
    '*s': [27, 130, 19],
    '7s': [109, 212, 99],
    '#s': [194, 238, 191],

    // Teals
    'ot': [0, 65, 36],
    '*t': [13, 124, 87],
    '7t': [94, 206, 168],
    '#t': [189, 235, 219],
  },
  // the color values
  pixelLookupTable: {
    0: [0, 0, 0], // Black
    1: [66, 66, 66], // 4 Grey Values
    2: [133, 133, 133],
    3: [200, 200, 200],
    4: [255, 255, 255], // White
    a: [32, 24, 136], // 4 Blues
    b: [32, 56, 232],
    c: [88, 144, 248],
    d: [192, 208, 248],
    e: [136, 0, 112], // 4 pinks (consider replacing with orange/brown)
    f: [184, 0, 184],
    g: [240, 120, 248],
    h: [248, 192, 248],
    i: [160, 0, 0], // 4 reds
    j: [216, 40, 66],
    k: [248, 112, 96],
    l: [248, 184, 176],
    m: [114, 64, 7], // 4 oranges (really yellow)
    n: [136, 112, 0],
    o: [199, 178, 28],
    p: [220, 206, 112],
    q: [0, 80, 0], // 4 greens
    r: [0, 168, 0], 
    s: [72, 216, 72],
    t: [168, 240, 184],
    u: [24, 56, 88], // 4 teals
    v: [0, 128, 136],
    w: [0, 232, 217],
    x: [152, 248, 240],
    // Add more entries as needed
  },
  pixelToAscii : {
    0: "b0",
    1: "b25",
    2: "b50",
    3: "b75",
    4: "b100",
    a: "b0", // 4 Blues
    b: "b25",
    c: "b50",
    d: "b75",
    e: "b25", // 4 pinks (consider replacing with orange/brown)
    f: "b50",
    g: "b75",
    h: "b100",
    i: "b0", // 4 reds
    j: "b50",
    k: "b75",
    l: "b100",
    m: "b0", // 4 oranges (really yellow)
    n: "b25",
    o: "b75",
    p: "b100",
    q: "b0", // 4 greens
    r: "b25",
    s: "b75",
    t: "b100",
    u: "b0", // 4 teals
    v: "b50",
    w: "b100",
    x: "b100",
  },
  pixelToAsciiGreen : {
    0: "b0",
    1: "b0",
    2: "b50",
    3: "b75",
    4: "b100",
    a: "b0", // 4 Blues
    b: "b0",
    c: "b25",
    d: "b50",
    e: "b0", // 4 pinks (consider replacing with orange/brown)
    f: "b75",
    g: "b100",
    h: "b100",
    i: "b0", // 4 reds
    j: "b0",
    k: "b75",
    l: "b75",
    m: "b25", // 4 oranges (really yellow)
    n: "b100",
    o: "b75",
    p: "b100",
    q: "b25", // 4 greens
    r: "b50",
    s: "b100",
    t: "b75",
    u: "b25", // 4 teals
    v: "b100",
    w: "b75",
    x: "b75",
  },
  pixelToAsciiBlue : {
    0: "b0",
    1: "b25",
    2: "b25",
    3: "b50",
    4: "b50",
    a: "b25", // 4 Blues
    b: "b50",
    c: "b50",
    d: "b50",
    e: "b50", // 4 pinks (consider replacing with orange/brown)
    f: "b100",
    g: "b100",
    h: "b75",
    i: "b0", // 4 reds
    j: "b25",
    k: "b0",
    l: "b25",
    m: "b0", // 4 oranges (really yellow)
    n: "b0",
    o: "b25",
    p: "b0",
    q: "b0", // 4 greens
    r: "b0",
    s: "b0",
    t: "b0",
    u: "b50", // 4 teals
    v: "b50",
    w: "b25",
    x: "b50",
  },
  pixelToAsciiRed : {
    0: "b0",
    1: "b0",
    2: "b0",
    3: "b0",
    4: "b25",
    a: "b0", // 4 Blues
    b: "b0",
    c: "b0",
    d: "b0",
    e: "b25", // 4 pinks (consider replacing with orange/brown)
    f: "b100",
    g: "b75",
    h: "b75",
    i: "b25", // 4 reds
    j: "b50",
    k: "b75",
    l: "b50",
    m: "b25", // 4 oranges (really yellow)
    n: "b50",
    o: "b50",
    p: "b50",
    q: "b0", // 4 greens
    r: "b25",
    s: "b25",
    t: "b0",
    u: "b0", // 4 teals
    v: "b0",
    w: "b0",
    x: "b25",
  },
  renderWall: function (fDistanceToWall, sWallDirection, pixelArray) {

    var pixel = pixelArray[0];
    var color = pixelArray[1] || 'm';

    // There are 4 lightness values in each color
    // This assigns the appropriate color value to the current pixel

    var b255 = "4";
    var b100 = _rh.colorReferenceTable[color][3];
    var b75  = _rh.colorReferenceTable[color][2];
    var b50  = _rh.colorReferenceTable[color][1];
    var b25  = _rh.colorReferenceTable[color][0];
    var b0   = "0";

    var fDepthRatio1 = fDepth/2 / 4;
    var fDepthRatio2 = fDepth/2 / 2.5;
    var fDepthRatio3 = fDepth/2 / 1.25;
    var fDepthRatio4 = fDepth/2 / 1.15;

    // var fDepthRatio1 = 4;
    // var fDepthRatio2 = 8;
    // var fDepthRatio3 = 12;
    // var fDepthRatio4 = 20;

    // Set default fill value
    let fill = b0;

    // if (pixel === "#")fill = b100;
    // else if (pixel === "7") fill = b75;
    // else if (pixel === "*" ) fill = b50;
    // else if (pixel === "o") fill = b25;
    // else fill = b25;
    // return fill;

    
    // "&#9109;"; // ⎕
    // var b0   = ".";
    // var b20  = "&#9617;"; // ░
    // var b40  = "&#9618;"; // ▒
    // var b60  = "&#9618;"; // ▒
    // var b80  = "&#9619;"; // ▓
    // var b100 = "&#9608;"; // █

    // TODO: (maybe) Convert to lookuptable?
    // Controls the depth shading
    switch (sWallDirection) {
      // Sprites and voxels
      case "V":
        if (fDistanceToWall < fDepthRatio1) {
          if (pixel === "#")fill = b100;
          else if (pixel === "7") fill = b75;
          else if (pixel === "*" ) fill = b50;
          else if (pixel === "o") fill = b25;
          else fill = b25;
        } else if (fDistanceToWall < fDepthRatio2) {
          if (pixel === "#") fill = b75;
          else if (pixel === "7") fill = b50;
          else if (pixel === "*" ) fill = b25;
          else if (pixel === "o") fill = b25;
          else fill = b0;
        } else if (fDistanceToWall < fDepthRatio3) {
          if (pixel === "#") fill = b75;
          else if (pixel === "7") fill = b50;
          else if (pixel === "*" || pixel === "o") fill = b25;
          else fill = b25;
        } else if (fDistanceToWall < fDepth) {
          if (pixel === "#") fill = b50;
          else if (pixel === "7") fill = b25;
          else if (pixel === "*" || pixel === "o") fill = b25;
          else fill = b0;
        }
        break;

      // North/South direction
      case "N":
      case "S":
        if (fDistanceToWall < fDepthRatio1) {
          if (pixel === "#")fill = b100;
          else if (pixel === "7") fill = b75;
          else if (pixel === "*" ) fill = b50;
          else if (pixel === "o") fill = b25;
          else fill = b25;
        } else if (fDistanceToWall < fDepthRatio2) {
          if (pixel === "#")fill = b100;
          else if (pixel === "7") fill = b50;
          else if (pixel === "*" ) fill = b50;
          else if (pixel === "o") fill = b25;
          else fill = b25;
        } else if (fDistanceToWall < fDepthRatio3) {
          if (pixel === "#")fill = b75;
          else if (pixel === "7") fill = b50;
          else if (pixel === "*" ) fill = b50;
          else if (pixel === "o") fill = b25;
          else fill = b25;
        } else if (fDistanceToWall < fDepthRatio4) {
          if (pixel === "#")fill = b75;
          else if (pixel === "7") fill = b50;
          else if (pixel === "*" ) fill = b50;
          else if (pixel === "o") fill = b25;
          else fill = b25;
        } else if (fDistanceToWall < fDepth) {
          if (pixel === "#") fill = b50;
          else if (pixel === "7") fill = b50;
          else if (pixel === "*" || pixel === "o") fill = b25;
          else fill = b0;
        }
        break;

      // West/East direction
      case "W":
      case "E":
        if (fDistanceToWall < fDepthRatio1) {
          if (pixel === "#")fill = b75;
          else if (pixel === "7") fill = b75;
          else if (pixel === "*" ) fill = b50;
          else if ( pixel === "o") fill = b25;
          else fill = b25;
        } else if (fDistanceToWall < fDepthRatio2) {
          if (pixel === "#")fill = b75;
          else if (pixel === "7") fill = b50;
          else if (pixel === "*" ) fill = b50;
          else if ( pixel === "o") fill = b25;
          else fill = b0;
        } else if (fDistanceToWall < fDepthRatio3) {
          if (pixel === "#")fill = b75;
          else if (pixel === "7") fill = b50;
          else if (pixel === "*" ) fill = b25;
          else if ( pixel === "o") fill = b25;
          else fill = b0;
        } else if (fDistanceToWall < fDepthRatio4) {
          if (pixel === "#")fill = b50;
          else if (pixel === "7") fill = b50;
          else if (pixel === "*" ) fill = b25;
          else if ( pixel === "o") fill = b25;
          else fill = b0;
        } else if (fDistanceToWall < fDepth) {
          if (pixel === "#")fill = b50;
          else if (pixel === "7") fill = b25;
          else if (pixel === "*" ) fill = b25;
          else if ( pixel === "o") fill = b25;
          else fill = b0;
        }
        break;
    
    }
    return fill;
  },
};





/**
 * Function will get the pixel to be sampled from the sprite WITH bilinear filtering
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
  var shadingFactor = Math.max(0.5, 1 - depthValue / fDepth);
  colorR *= shadingFactor;
  colorG *= shadingFactor;
  colorB *= shadingFactor;

  // Rounding and return color components
  var finalColor = [~~(colorR), ~~(colorG), ~~(colorB)];
  return finalColor;
};




/**
 * Function will get the pixel to be sampled from the sprite without bilinear filtering
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
  currentColorPixel = _rh.pixelLookupTable[_getColorPixel(currentColor, currentPixel)] || [0, 0, 0]; 

  var shadingFactor = Math.max(0.5, 1 - depthValue / fDepth);
  colorR = currentColorPixel[0] * shadingFactor;
  colorG = currentColorPixel[1] * shadingFactor;
  colorB = currentColorPixel[2] * shadingFactor;

  // return currentColorPixel;
  var finalColor = [~~(colorR), ~~(colorG), ~~(colorB)];
  return finalColor;

};



var _getSamplePixel = function (texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance) {
  if(bTexFiltering){
    return _getSamplePixelBilinear(texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance);
  }
  else {
    return _getSamplePixelDirect(texture, x, y, fSampleXScale, fSampleYScale, fSampleXOffset, fSampleYOffset, fDistance);
  }
}





// returns true every a-th interation of b
var _everyAofB = function (a, b) {
  return a && a % b === 0;
};


var _getColorPixel = function(color, pixel){
  var sColPixName = ""+pixel+color;
  // console.log(sColPixName);
  var color = _rh.colorPixelLookupTable[sColPixName];

  if (Array.isArray(color)) {
    return _rh.colorPixelLookupTable[sColPixName];

} else {
  console.log(sColPixName);
}


  var b100 = _rh.colorReferenceTable[color][3];
  var b75  = _rh.colorReferenceTable[color][2];
  var b50  = _rh.colorReferenceTable[color][1];
  var b25  = _rh.colorReferenceTable[color][0];
  var b0   = "0";

  // Set default fill value
  let fill = b0;

  if (pixel === "#")fill = b100;
  else if (pixel === "7") fill = b75;
  else if (pixel === "*" ) fill = b50;
  else if (pixel === "o") fill = b25;
  else fill = b0;
  return fill;
}


// lookup-table “for fine-control” or “for performance”
// …(but really because I couldn"t figure out the logic [apparently] )
var _skipEveryXrow = function (input) {
  input = Math.round(input);
  if(input < -16){
    return 2;
  }
  switch (Number(input)) {
    case 0:
      return 0;
      break;
    case 1:
      return 8;
      break;
    case 2:
      return 6;
      break;
    case 3:
      return 4;
      break;
    case 4:
      return 3;
      break;
    case 5:
      return 2;
      break;
    case 6:
      return 2;
      break;
    case 7:
      return 2;
      break;
    case 8:
      return 1;
      break;

    case -1:
      return 8;
      break;
    case -2:
      return 8;
      break;
    case -3:
      return 7;
      break;
    case -4:
      return 7;
      break;
    case -5:
      return 6;
      break;
    case -6:
      return 6;
      break;
    case -7:
      return 5;
      break;
    case -8:
      return 5;
      break;
    case -9:
      return 4;
      break;
    case -10:
      return 4;
      break;
    case -11:
      return 3;
      break;
    case -12:
      return 3;
      break;
    case -13:
      return 3;
      break;
    case -14:
      return 3;
      break;
    case -15:
      return 3;
      break;
    case -16:
      return 3;
      break;
    default:
      return 0;
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
function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) ||
    _iterableToArray(arr) ||
    _unsupportedIterableToArray(arr) ||
    _nonIterableSpread()
  );
}
function _evenlyPickItemsFromArray(allItems, neededCount) {
  if (neededCount >= allItems.length) {
    return _toConsumableArray(allItems);
  }

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
    nScreenHeight / _skipEveryXrow(fLooktimer) - 1
  );

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
    if (_everyAofB(row, _skipEveryXrow(fLooktimer))) {
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
        // don"t print
      } else {
        // print
        sOutput.push( oInput[globalPrintIndex] );
        // sOutput.push(_printCompositPixel(oInput, oOverlay, globalPrintIndex));
      }

      globalPrintIndex++;
    } // end for(rpix

    // print filler pixels
    for (var i = 0; i < fLookModifier; i++) {
      sOutput.push(".");
    }
  } // end for(row

  return sOutput;
};


var _convertPixelToAscii = function( input, color ){
  // var b0   = ".";
  // var b20  = "&#9617;"; // ░
  // var b40  = "&#9618;"; // ▒
  // var b60  = "&#9618;"; // ▒
  // var b80  = "&#9619;"; // ▓
  // var b100 = "&#9608;"; // █

  if(color === 0){
    pixelToRender = _rh.pixelToAscii[input];
    switch (pixelToRender) {
      case "b0":
        return "&nbsp;";
      case "b25":
        return "&#9617;";
      case "b50":
        return "&#9618;";
      case "b75":
        return "&#9619;";
      case "b100":
        return "&#9608;";
    }
  }

  else if(color === 1){
    pixelToRender = _rh.pixelToAsciiRed[input];
    switch (pixelToRender) {
      case "b0":
        return "&nbsp;";
      case "b25":
        return "&#9617;";
      case "b50":
        return "&#9618;";
      case "b75":
        return "&#9619;";
      case "b100":
        return "&#9608;";
    }
  }

  else if(color === 2){
    pixelToRender = _rh.pixelToAsciiGreen[input];
    switch (pixelToRender) {
      case "b0":
        return "&nbsp;";
      case "b25":
        return "&#9617;";
      case "b50":
        return "&#9618;";
      case "b75":
        return "&#9619;";
      case "b100":
        return "&#9608;";
    }
  }

  else if(color === 3){
    pixelToRender = _rh.pixelToAsciiBlue[input];
    switch (pixelToRender) {
      case "b0":
        return "&nbsp;";
      case "b25":
        return "&#9617;";
      case "b50":
        return "&#9618;";
      case "b75":
        return "&#9619;";
      case "b100":
        return "&#9608;";
    }
  }
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



var _drawToCanvasOld = function ( pixels ) {

  eCanvas.width = nScreenWidth;
  eCanvas.height = nScreenHeight;
  
  // Create an ImageData object with the pixel data
  var imageData = cCtx.createImageData(nScreenWidth, nScreenHeight);
      
  // Convert values to shades of colors
  for (var i = 0; i < pixels.length; i++) {
    var pixelValue = pixels[i];
    var depthValue = fDepthBufferR[i];
    // var shadingFactor = (1 - depthValue*2 / fDepth);
    var shadingFactor = Math.max(0.5, 1 - depthValue / fDepth);
    // var shadingFactor = 1;
    var color = _rh.pixelLookupTable[pixelValue] || [0, 0, 0]; // Default to black if not found
    
    imageData.data[i * 4] = color[0] * shadingFactor ; // Red 
    imageData.data[i * 4 + 1] = color[1] * shadingFactor ; // Green 
    imageData.data[i * 4 + 2] = color[2] * shadingFactor ; // Blue 
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


var _fDrawFrameRGB = function (screen, target) {
  // _debugOutput(`A: ${fPlayerA} X:${fPlayerX} Y:${fPlayerY}`)
  var frame = screen
  var target = target || eScreen;

  var sOutputG = "";
  var sOutputB = "";
  var sOutputR = "";
  
  // var sCanvasOutput = "";

  // interates over each row again, and omits the first and last 30 pixels, to disguise the skewing!
  var printIndex = 0;

  for (var row = 0; row < nScreenHeight; row++) {
    for (var pix = 0; pix < nScreenWidth; pix++) {
      // H-blank based on screen-width
      if (printIndex % nScreenWidth == 0) {
        sOutputG += "<br>";
        sOutputB += "<br>";
        sOutputR += "<br>";
      }
      sOutputG += _convertPixelToAscii(frame[printIndex], 2);
      sOutputB += _convertPixelToAscii(frame[printIndex], 3);
      sOutputR += _convertPixelToAscii(frame[printIndex], 1);

      // sCanvasOutput += frame[printIndex];
      printIndex++;
    }
  }
  eScreenG.innerHTML = sOutputG;
  eScreenB.innerHTML = sOutputB;
  eScreenR.innerHTML = sOutputR;

  // _drawToCanvas( sCanvasOutput );
};



var _fDrawFrameWithSkew = function (screen, target) {
  _debugOutput(`A: ${fPlayerA} X:${fPlayerX} Y:${fPlayerY} + H: ${ fPlayerY }`);
  var frame = _fPrepareFrame(screen);
  var target = target || eScreen;

  // var sOutput = "";
  // var sCanvasOutput = "";

  // // interates over each row again, and omits the first and last 30 pixels, to disguise the skewing!
  // var printIndex = 0;
  // var removePixels = nScreenHeight / 2;

  
  // for (var row = 0; row < nScreenHeight; row++) {
  //   for (var pix = 0; pix < nScreenWidth; pix++) {
  //     // H-blank based on screen-width
  //     if (printIndex % nScreenWidth == 0) {
  //       // sOutput += "<br>";
  //     }

  //     // if (pix < removePixels) {
  //     //   sOutput += "";
  //     //   sCanvasOutput[printIndex] = [0, 0, 0];
  //     // } else if (pix > nScreenWidth - removePixels) {
  //     //   sOutput += "";
  //     //   sCanvasOutput[printIndex] = [0, 0, 0];
  //     // } else {
  //     //   // sOutput += frame[printIndex];)
  //     //   sCanvasOutput[printIndex] = frame[printIndex];
  //     // }

  //     printIndex++;
  //   }
  // }
  // // target.innerHTML = sCanvasOutput;
  _drawToCanvas( frame );
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