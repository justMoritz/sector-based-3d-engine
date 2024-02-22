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
    // Request fullscreen
    canvasElement.requestFullscreen()
      .catch(err => {
      console.error('Failed to enter fullscreen mode: ', err);
    });
  }
}