var ledit = (function(){


  handleMouseInteraction = function (event) {
    if(mapdata.length < 2){
      alert('please add a sector');
    }

    if (appMode === "draw") {
      handleDrawMode(event);
    } else if (appMode === "add") {
      handleAddMode(event);
    } else if (appMode === "edit") {
      handleEditMode(event);
    } else if (appMode === "delete") {
      handleDeleteMode(event);
    } else if (appMode === "wall") {
      handleWallMode(event);
    }

    _lhelpers.generateLevelData();
  }

  /**
   * 
   * Wall Mode
   * 
   */
  handleWallMode = function () {
    const clickX = (event.clientX - offsetX) / scale;
    const clickY = (event.clientY - offsetY) / scale;

    let wallPoints = _lhelpers.findClosestPointsToClick( clickX, clickY, mapdata[currentSector] );

    console.log(wallPoints);
    _lhelpers.drawGrid(wallPoints[0], wallPoints[1]);


    // adds an entry into the wallData object

    // let wallId = [wallPoints[0].id, wallPoints[1].id];
    let wallId = ""+wallPoints[0].id+"_"+wallPoints[1].id+"";

    // makes an entry in the wallData object, with default values for the wall, TODO: if it not yet set
    wallData[wallId] = {
      "tex": "#",
      "xS": 2,
      "yS": 2,
      "sC": 0,
    };

    console.log(wallData)

    document.querySelector(".right-sidebar__walls").classList.remove("disabled");
    document.querySelector("#editwallid").innerHTML = wallId;
    document.querySelector("#wallTex").value = wallData[wallId].tex;
    document.querySelector("#texScaleX").value = wallData[wallId].xS;
    document.querySelector("#texScaleY").value = wallData[wallId].yS;
    document.querySelector("#sectorconnectorinput").value = wallData[wallId].sC;

    // opens the edit window, and pulls in data


  };


  /**
   * 
   * Delete Mode
   * 
   */
  handleDeleteMode = function () {
    const clickX = (event.clientX - offsetX) / scale;
    const clickY = (event.clientY - offsetY) / scale;
    let clickedPoint = _lhelpers.findClickedPoint(clickX, clickY, mapdata[currentSector]);

    for (let p = 0; p < mapdata[currentSector].length; p++) {
      if( mapdata[currentSector][p] === clickedPoint ){
        mapdata[currentSector] = _lhelpers.removeNthElement(mapdata[currentSector], p);
      }
    }

    _lhelpers.drawGrid();


  }


  /**
   * 
   * Add Mode
   * 
   */
  handleAddMode = function () {
    let clickX = (event.clientX - offsetX) / scale;
    let clickY = (event.clientY - offsetY) / scale;

    // clickX = _lhelpers.roundToNearest(clickX);
    // clickY = _lhelpers.roundToNearest(clickY);

    // Check if clicked on a line segment between vertices
    for (let i = 0; i < mapdata[currentSector].length - 1; i++) {
      const point1 = mapdata[currentSector][i];
      const point2 = mapdata[currentSector][i + 1];
      const distanceToLine = _lhelpers.pointToLineDistance({ x: clickX, y: clickY }, point1, point2);
      if (distanceToLine <= 3) {
        // Insert new vertex between point1 and point2
        mapdata[currentSector].splice(i + 1, 0, { x: _lhelpers.roundToNearest(clickX), y: _lhelpers.roundToNearest(clickY),id: _lhelpers.generateRandomId() });

        _lhelpers.drawGrid();
        return;
      }
    }
  }


  /**
   * 
   * Draw Mode
   * 
   */


  
  function handleDrawMode(event) {
      let clickX = (event.clientX - offsetX) / scale;
      let clickY = (event.clientY - offsetY) / scale;
      clickX = _lhelpers.roundToNearest(clickX);
      clickY = _lhelpers.roundToNearest(clickY);
  
      if (DMfirstPoint === null) {
          // First click, store it as the firstPoint
          DMfirstPoint = { x: clickX, y: clickY };
          DMprevPoint = { x: clickX, y: clickY }; // Also set prevPoint for the next line segment
          DMdrawCounter++
      } else {
        // get rid of the last wall in the list after on the 3rd vertex (when shapes close)
        if( DMdrawCounter > 2 ){
          DMwallsObject.pop();
        }

        // Second click onwards, create line segments
        const wallSegment = { start: { x: DMprevPoint.x, y: DMprevPoint.y }, zend: { x: clickX, y: clickY } };
        DMwallsObject.push(wallSegment);

        // close after the first wall is drawn 
        if( DMdrawCounter > 1 ){
          // Connect the last point to the first point to close the polygon
          const closingSegment = { start: { x: clickX, y: clickY }, zend: { x: DMfirstPoint.x, y: DMfirstPoint.y } };
          DMwallsObject.push(closingSegment);
        }
        
        // Reset prevPoint for the next line segment
        DMprevPoint = { x: clickX, y: clickY };
        DMdrawCounter++
      }
      
      mapdataObj[currentSector] = DMwallsObject;

      console.log(mapdataObj);


      // temp print
      _lhelpers.clearGrid()
      _lhelpers.drawRules()
      for (let index = 0; index < mapdataObj.length; index++) {
        if (index === 0){
          continue;
        }
        const element = mapdataObj[index];
        for (const wall of element) {
          // Retrieve start and end points of the wall segment
          const startX = wall.start.x * scale + offsetX;
          const startY = wall.start.y * scale + offsetY;
          const endX = wall.zend.x * scale + offsetX;
          const endY = wall.zend.y * scale + offsetY;
          ctx.strokeStyle = '#f00';
          // Draw the line segment
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
  
          // Print coordinates
          ctx.font = '10px Arial';
          ctx.fillStyle = 'black';
          ctx.fillText(`(${startX.toFixed(2)/100}, ${startY.toFixed(2)/100})`, startX + 5, startY - 5);
          ctx.fillText(`(${endX.toFixed(2)/100}, ${endY.toFixed(2)/100})`, endX + 5, endY - 5);
        }
      }
      
  }
  



  /**
   * 
   * Edit Mode
   * 
   */
  function handleEditMode(event) {    
    const mouseX = (event.clientX - offsetX) / scale;
    const mouseY = (event.clientY - offsetY) / scale;

    _lhelpers.drawGrid();

    if( !isDragging ){
      gDraggedPoint = null;
    }
    
    // Check if the mouse is over any point
    let clickedPoint = _lhelpers.findClickedPoint(mouseX, mouseY, mapdata[currentSector]);

    if (clickedPoint) {
      isDragging = true;
      // Start dragging the clicked point
      gDraggedPoint = clickedPoint;
      dragOffsetX = _lhelpers.roundToNearest(mouseX) - clickedPoint.x;
      dragOffsetY = _lhelpers.roundToNearest(mouseY) - clickedPoint.y;
      _lhelpers.drawGrid();
    }
  
    // Continue dragging
    gDraggedPoint.x = _lhelpers.roundToNearest(mouseX) - dragOffsetX;
    gDraggedPoint.y = _lhelpers.roundToNearest(mouseY) - dragOffsetY;
    _lhelpers.drawGrid();
  }


  /**
   * Adding a new sector, (addsector, addnewsectors, sectoradd)
   */
  var handleAddNewSector = function () {
    let buttonToAppend = sectorSelectorTemplate.replace(new RegExp("XXX", 'g'), sectorCounter);
    selectorlist.insertAdjacentHTML('beforeend', buttonToAppend);

    currentSector = sectorCounter;
    // initialize empty array
    mapdata[currentSector] = [];


    // Preparing variables for Draw Mode
    mapdataObj[currentSector] = [];
    DMwallsObject = [];
    DMfirstPoint = null;
    DMprevPoint = null;
    DMdrawCounter = 0;
    
    sectorCounter++;
  };


  /**
   * Remove Sectors
   */
  var handleRemoveSector = function (event) {
    let reshuffleCounter = 1;
    const dataRemoveId = event.target.dataset.removeId;
    // remove that sector
    document.querySelector(`[data-id="${dataRemoveId}"]`).remove();

    // reshuffle all other sectors 
    let allSectorSelectors = document.querySelectorAll(".sector-selector");

    allSectorSelectors.forEach ( (element) => {
      element.dataset.id = reshuffleCounter;
      element.querySelector(".sector-name").innerHTML = `Sector ${reshuffleCounter}`;
      element.querySelector(".remove-sector").dataset.remove_id = reshuffleCounter;
      reshuffleCounter++;
    });

    // unselects all sectors
    document.querySelectorAll(".sector-selector").forEach( (ss) => { ss.classList.remove("this--active") });
    currentSector = 0;
  };



  /**
   * Select a given sector selector ( sectorselect, selectsector )
   */
  var handleSelectSector = function (event) {
    document.querySelectorAll(".sector-selector").forEach( (ss) => { ss.classList.remove("this--active") });
    event.target.classList.add('this--active');
    // sets the Global current sector we're working with
    currentSector = event.target.dataset.id;
    _lhelpers.drawGrid();
  }





  handleValueChange = function( event, type){
    console.log(type);
    console.log(event);
  }



  /**
   * Init Function
   */
  var init = function(){

    // Sets up Canvas
    gridCanvas = document.getElementById('gridCanvas');
    ctx = gridCanvas.getContext('2d');
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;

    // sets up buttons
    allLSBbuttons = document.querySelectorAll('.left-sidebar__button');
    
    // sets up sector handling
    selectorlist = document.querySelector('#selectorlist');
    sectorAdd = document.querySelector('#sectorAdd');


    // Attach event listeners
    // window.addEventListener('wheel', _lhelpers.handleScroll, { passive: false });

    // Redraw grid when window is resized
    window.addEventListener('resize', _lhelpers.drawGrid);


    // Switches between modes
    allLSBbuttons.forEach( (button)=> {
      button.addEventListener('click', () => {
        allLSBbuttons.forEach( (buttons)=> { buttons.classList.remove('active'); });
        button.classList.add('active');
        const mode = button.dataset.mode;
        appMode = mode;
        console.log(`${appMode} mode`);
      });
    });
    document.onkeypress = function (e) {
      e = e || window.event;
      let keyCode = e.keyCode;
      console.log(keyCode);
      if( keyCode === 100 ){ // letter D
        document.querySelector('[data-mode="draw"]').click();
      }
      else if (keyCode === 97 ){ // letter A
        document.querySelector('[data-mode="add"]').click();
      }
      else if (keyCode === 101 ){ // letter E
        document.querySelector('[data-mode="edit"]').click();
      }
      else if (keyCode === 120 ){ // letter X
        document.querySelector('[data-mode="delete"]').click();
      }
      else if (keyCode === 119 ){ // letter W
        document.querySelector('[data-mode="wall"]').click();
      }
    };


    // Attach event listeners for mouse events
    gridCanvas.addEventListener('mousedown', function (event) {
      if (appMode === "edit") {
        handleMouseInteraction(event);
      }else{
        isDragging = false;
        handleMouseInteraction(event);
      }
    });

    gridCanvas.addEventListener('mousemove', function (event) {
      if (isDragging && appMode === "edit") {
        handleMouseInteraction(event);
      }
    });

    gridCanvas.addEventListener('mouseup', function () {
      isDragging = false;
    });


    // Add new sector
    sectorAdd.addEventListener('click', () => {
      handleAddNewSector();
    });
    // Remove a given sector
    selectorlist.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-sector')) {
        handleRemoveSector(event);
      }
      else if (event.target.classList.contains('sector-selector')) {
        handleSelectSector(event);
      }
    });
    


    // listeners for wallinputs
    const editwallid = document.querySelector("#editwallid");
    const wallTexInput = document.querySelector("#wallTex");
    const texScaleXinput = document.querySelector("#texScaleX");
    const texScaleYinput = document.querySelector("#texScaleY");
    const sectorconnectorinput = document.querySelector("#sectorconnectorinput");

    wallTexInput.addEventListener('input', (e) => { handleValueChange(e, "tex"); });
    texScaleXinput.addEventListener('input', (e) => { handleValueChange(e, "sX"); });
    texScaleYinput.addEventListener('input', (e) => { handleValueChange(e, "sY"); });
    sectorconnectorinput.addEventListener('input', (e) => { handleValueChange(e, "sC"); });


    // Initial draw
    _lhelpers.drawGrid();
  };






/**
 * Public Methods
 */
return{
  init: init,
};
})();
