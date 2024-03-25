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

