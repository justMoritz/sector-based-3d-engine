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
let vertices = []; // Array to store vertices
let gDraggedPoint;



let leveldata = {};


let mapdata = [];

let currentSector;
let sectorCounter = 1;


const sectorSelectorTemplate = 
`<div data-id="XXX" class="sector-selector">
    <span class="sector-name">Sector XXX</span> <div data-remove-id="XXX" class="remove-sector"><span> - </span></div>
</div>`

