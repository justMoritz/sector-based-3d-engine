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

let usePreview = false;



let leveldata = {};


// let mapdata = [];
// mapdata[0] = [null];

let mapdataObj = [];
mapdataObj[0] = [null];


let mapSecMeta = [];
mapSecMeta[0] = [null];


// Global variables needed for Draw Mode (DM)
let drawMeta = [];
drawMeta[0] = [null];


let currentSector = 0;
let sectorCounter = 1;

var lightsObj = {};         // id → { x, y, b, r }
var lightCounter = 0;       // used to generate new light IDs
var currentLight = null;    // optional: track currently selected light

const sectorSelectorTemplate = 
`<div data-id="XXX" class="sector-selector">
    <span class="sector-name">Sector XXX</span> <div data-remove-id="XXX" class="remove-sector"><span> - </span></div>
</div>`

const lightsSelectorTemplate = 
`
    <span class="sector-name">Light XXX</span>
    <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; font-size: 12px; margin-top: 0.25rem;">
    <label>X <input type="number" step="0.1" data-k="x" value="0"></label>
    <label>Y <input type="number" step="0.1" data-k="y" value="0"></label>
    <label>B <input type="number" step="0.05" data-k="b" value="0.25"></label>
    <label>R <input type="number" step="0.1" data-k="r" value="12"></label>
    <div class="remove-sector remove-light" data-act="delete" title="Delete this light">-</div>
    </div>
`;


// Random huge object that holds information about each wall. Coordinates, as well as texture info etc. 
let wallData = {}



let fDepth = 30;
let fPlayerX = 2;
let fPlayerY = 2;
let fPlayerA = 2.8;
let fPlayerH = 0;
let startingSector = 1;
let baseLight = 0.1;
let spritesObject = {}


let fDepthInput;
let fPlayerXInput;
let fPlayerYInput;
let fPlayerAInput;
let fPlayerHInput;
let startingSectorInput;


const wallDefaults = {
    "tex": "#",
    "sX": 2, // scale
    "sY": 2,
    "sC": 0, // sector connector
    "oX": 0, 
    "oY": 0, // offset
}

const sectorDefaults = {
    "floor": 0,
    "ceil": 2,
    "floorTex": "Y",
    "ceilTex": "U",
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
let floorTexScaleX;
let floorTexScaleY;
let ceilTexScaleX;
let ceilTexScaleY;

let outputareaTA;
let inputareaTA;
let outputButton;
let inputButton;


let lastSelectedWallForEditing;
let clickedSectorForWallEditing;
let sectorSelectorIsFocussed = false;



let importedJSON;