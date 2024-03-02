/**
 * 
 * Constants and Global Variables
 * 
 */


// constants
var PI___ = +Math.PI;
var PI_0 = 0.0;
var PIx0_25 = +(PI___ * 0.25);
var PIx05 = +(PI___ * 0.5);
var PIx0_75 = +(PI___ * 0.75);
var PIx1 = PI___;
var PIx1_5 = +(PI___ * 1.5);
var PIx2 = +(PI___ * 2.0);
var I80divPI = 180 / PI___;
var PIdiv4 = PI___ / 4.0;
var PIdiv2 = PI___ / 2.0;
var OneDivPi = 1 /  PI___;

// setup variables
var eScreen;
var eCanvas;
var cCtx;
var eDebugOut;

var nScreenWidth = 480;
var nScreenHeight = 160;

var fFOV = PI___ / 1.8; // (PI___ / 4.0 originally)
var fFOV_div2 = fFOV / 2;
// var fFOV = PI___ / 2.14; // (PI___ / 4.0 originally)
var fDepth = 16.0; // viewport depth
var nLookLimit = 10;

var bUseSkew = false;
var bDrawRGB = false;
var bDrawSrpites = true;


if (bDrawRGB){
    nScreenWidth = 320;
    nScreenHeight = 110;
}
if (bUseSkew){
    nScreenWidth = 576;
    nScreenHeight = 160;
    nLookLimit = 8;
    var fFOV = PI___ / 2.25;
    var fFOV_div2 = fFOV / 2;
}


var bTurnLeft;
var bTurnRight;
var bStrafeLeft;
var bStrafeRight;
var bMoveForward;
var bMoveBackward;
var bJumping;
var bFalling;
var bRunning;
var bPaused;
var bPlayerMayMoveForward = true;

var nJumptimer = 0;
var fLooktimer = 0;
var fHeighttimer = 0;
var nNewHeight = 0;

var debugWrite;

var fDepthBuffer = [];
var fDepthBufferS = [];
var fFloorBuffer = [];

// defaults
var fPlayerX = 14.0;
var fPlayerY = 1.0;
var fPlayerA = 1.5;
var fPlayerH = 0;

var sLastKnownSector = 'sector0';
var sPlayerSector = 'sector0';
var nSectorCeilingHeight = 1;
var nSectorFloorHeight = 0;

var fPlayerEndX;
var fPlayerEndY;

var fscreenHeightFactor;
var fscreenHeightFactorFloor = nScreenHeight / 2;
var fLocalLooktimer;
var fRayAngleGlob;

var oMap;

var nMapHeight = 16;
var nMapWidth = 16;

var gameRun;

// holds the frames we"re going to send to the renderer
var screen = [];