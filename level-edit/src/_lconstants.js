// App States
let appMode = 'draw';

let gridCanvas;
let ctx;

let allLSBbuttons;

// Grid parameters
const gridSize = 25; // Size of grid squares
const mainRuleInterval = 100; // Main rule interval (1 unit)
const subRuleInterval = 25; // Sub rule interval (0.25 units)
let scale = 1; // Initial scale
let offsetX = 0; // Initial offset X
let offsetY = 0; // Initial offset Y
let isDragging = false;
let lastX = 0;
let lastY = 0;
// let vertices = []; // Array to store vertices
let gDraggedPoint0;
let gDraggedPoint1;




let leveldata = {};


let mapdata = [];
mapdata[0] = [null];

let mapdataObj = [];
mapdataObj[0] = [null];


let mapSecMeta = [];
mapSecMeta[0] = [null];


// Global variables needed for Draw Mode (DM)
let drawMeta = [];
drawMeta[0] = [null];


let currentSector = 0;
let sectorCounter = 1;


const sectorSelectorTemplate = 
`<div data-id="XXX" class="sector-selector">
    <span class="sector-name">Sector XXX</span> <div data-remove-id="XXX" class="remove-sector"><span> - </span></div>
</div>`


// Random huge object that holds information about each wall. Coordinates, as well as texture info etc. 
let wallData = {}



let fDepth = 30;
let fPlayerX = 2;
let fPlayerY = 2;
let fPlayerA = 2.8;
let fPlayerH = 0;
let startingSector = 1;




const wallDefaults = {
    "tex": "#",
    "sX": 2,
    "sY": 2,
    "sC": 0,
    "xO": 0,
    "yO": 0,
}

const sectorDefaults = {
    "floor": 0,
    "ceil": 2,
    "floorTex": "Y",
    "ceilTex": "U"
}


let editwallid;
let wallTexInput;
let texScaleXinput;
let texScaleYinput;
let sectorconnectorinput;
let floorInput;
let ceilInput;
let ceilTexInput;
let floorTexInput;
