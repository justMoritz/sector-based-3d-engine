/**
 * 
 * Functions that do things like Math
 * 
 */


function getFraction(number) {
  return number % 1;
}


// takes beginning and ends of two vectors, and returns the point at which they meet, if they do
// Stolen from jdh on YouTube, (who stole it from Wikipedia), but then implemented for my needs :)
// I actually like returning NaN in case of no intersection, 
// since it's more ‘numberic’ than a truthy check (i.e.false)
function intersectionPoint(a0, a1, b0, b1) {
  var d = ((a0.x - a1.x) * (b0.y - b1.y)) - ((a0.y - a1.y) * (b0.x - b1.x));
  
  if (Math.abs(d) < 0.000001) { 
    return { x: NaN, y: NaN }; 
  }
    
  var t = (((a0.x - b0.x) * (b0.y - b1.y)) - ((a0.y - b0.y) * (b0.x - b1.x))) / d;
  var u = (((a0.x - b0.x) * (a0.y - a1.y)) - ((a0.y - b0.y) * (a0.x - a1.x))) / d;

  if(t >= 0 && t <= 1 && u >= 0 && u <= 1){
    return { 
      x: a0.x + (t * (a1.x - a0.x)), 
      y: a0.y + (t * (a1.y - a0.y)), 
    }
  }
  else{
    return { x: NaN, y: NaN };
  }
}


// Linear interpolation function to find sample position 
function texSampleLerp( ax,ay, bx ,by, hx, hy ){
  var distanceAH = Math.sqrt(Math.pow(hx - ax, 2) + Math.pow(hy - ay, 2));
  var totalLength = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));

  // Distance between points a and h
  // div. by total length of the wall
  return distanceAH / totalLength;
}


var epsilon = 0.0001;
function approximatelyEqual(a, b, epsilon) {
  return Math.abs(a - b) < epsilon;
}

/**
 * 
 * @param  {...any} bools 
 * @returns true if between 1 and 3 trues are found
 */
function containsBlackColor(...vars) {
  var blackCount = 0;
  for (let i = 0; i < vars.length; i++) {
    if (vars[i] === true) {
      blackCount++;
    }
  }
  return blackCount >= 1 && blackCount <= 3;
}


function brighestColor(var1, var2, var3) {
  if (var1 >= var2 && var1 >= var3) {
    return var1;
  } else if (var2 >= var1 && var2 >= var3) {
    return var2;
  } else {
    return var3;
  }
}

// leaving the console for errors, logging seems to kill performance
var _debugOutput = function ( input ) {
  eDebugOut.innerHTML = input;
};


function toggleFullscreen( canvasElement ) {
  if (document.fullscreenElement) {
    // If already in fullscreen, exit fullscreen
    document.exitFullscreen();
  } else {
    // Set new screen height
    nScreenHeight = nScreenHeight*2
    fscreenHeightFactorFloor = nScreenHeight / 2;
    // Request fullscreen
    canvasElement.requestFullscreen()
      .catch(err => {
      console.error('Failed to enter fullscreen mode: ', err);
    });
  }
}


// Function to rotate a point (x, y) by an angle
function rotatePoint(x, y, angle) {
  var cosAngle = Math.cos(angle);
  var sinAngle = Math.sin(angle);
  var rotatedX = x * cosAngle - y * sinAngle;
  var rotatedY = x * sinAngle + y * cosAngle;
  return { x: rotatedX, y: rotatedY };
}


/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}


/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}



/**
 * 
 * @param {array} pixels, i.e. [ 16711684, 65280, 255, 16777215];
 * @returns array of pixels like [[255,0,0], […], …]
 */
function hexToRbg (pixels){
  var rgbPixels = [];
  for (var i = 0; i < pixels.length; i++) {
    var hex = pixels[i];
    var red = (hex >> 16) & 255;
    var green = (hex >> 8) & 255;
    var blue = hex & 255;
    rgbPixels.push([red, green, blue]);
  }
  return rgbPixels;
}


/**
 * 
 * @param {array} pixels, i.e.  [16711684, 65280, 255, 16777215]
 * @returns array of pixels like [[255,0,0], […], …]
 */
function hexToRbg16bit(pixels) {
  var rgbPixels = [];
  for (var i = 0; i < pixels.length; i++) {
    var pixel = pixels[i];
    var red = (pixel >> 11) & 0x1F;    // Extract 5 bits for red
    var green = (pixel >> 5) & 0x3F;   // Extract 6 bits for green
    var blue = pixel & 0x1F;           // Extract 5 bits for blue

    // Scale up the R, G, and B 
    red = (red * 255) / 31;
    green = (green * 255) / 63;
    blue = (blue * 255) / 31;

    // Store the RGB components in the output array
    rgbPixels.push([red, green, blue]);
  }
  return rgbPixels;
}



var downsampleTexture = function( texels, width, height, factor ){
  var newTexture = [];
  var stepCounter = 0;
  var newCounter = 0;
  for(var i = 0; i < width; i++){
    for(var j = 0; j < height; j++){
      console.log(i%2)
      if( (i)%factor === 0 && (j)%factor === 0 ){
        newTexture[newCounter] = texels[stepCounter];
        newCounter++;
      }
      stepCounter++;
    }
  }
  return newTexture;
}



var downSampleBilinear = function( texels, width, height, factor ){
  var newTexture = [];
  var stepCounter = 0;
  var newCounter = 0;
  for(var i = 0; i < width; i++){
    for(var j = 0; j < height; j++){
  
      if( (i)%factor == 0 && (j)%factor == 0 ){
        
        var x0 = j;
        var y0 = i;
        var x1 = (x0 + 1) % width;  
        var y1 = (y0 + 1) % height;
        var dx = j - x0;
        var dy = i - y0;

        // Sampling the four surrounding pixels
        var samplePosition00 = (y0 * width + x0);
        var samplePosition01 = (y0 * width + x1);
        var samplePosition10 = (y1 * width + x0);
        var samplePosition11 = (y1 * width + x1);      
        
        var color00 = texels[samplePosition00];
        var color01 = texels[samplePosition01];
        var color10 = texels[samplePosition10];
        var color11 = texels[samplePosition11];

        // Bilinear interpolation for each color component
        var colorR = color00[0] * (1 - dx) * (1 - dy) + color01[0] * dx * (1 - dy) + color10[0] * (1 - dx) * dy + color11[0] * dx * dy;
        var colorG = color00[1] * (1 - dx) * (1 - dy) + color01[1] * dx * (1 - dy) + color10[1] * (1 - dx) * dy + color11[1] * dx * dy;
        var colorB = color00[2] * (1 - dx) * (1 - dy) + color01[2] * dx * (1 - dy) + color10[2] * (1 - dx) * dy + color11[2] * dx * dy;

        newTexture[newCounter] = [colorR, colorG, colorB];
        
        // newTexture[newCounter] = texels[stepCounter];
        newCounter++;
      }
      stepCounter++;
    }
  }
  return newTexture;
}



function prepareTextures( textures ){

  // create mipmaps for all textures
  for (var key in textures) {
    // TODO: seems to only work for square textures ATM, 
    if(key === 'bg'){
      continue;
    }
    var currentTexture = textures[key];
    var mipMap1 = downSampleBilinear(currentTexture.texture, currentTexture.width, currentTexture.height, 2);
    var mipMap2 = downSampleBilinear(mipMap1, currentTexture.width/2, currentTexture.height/2, 2);
    var mipMap3 = downSampleBilinear(mipMap2, currentTexture.width/4, currentTexture.height/4, 2);
    textures[key].mm1 = mipMap1;
    textures[key].mm2 = mipMap2;
    textures[key].mm3 = mipMap3;
  }

  return textures;
}