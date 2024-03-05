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
    }
  }


  /**
   * 
   * Delete Mode
   * 
   */
  handleDeleteMode = function () {
    const clickX = (event.clientX - offsetX) / scale;
    const clickY = (event.clientY - offsetY) / scale;
    let clickedPoint = _lhelpers.findClickedPoint(clickX, clickY, mapdata[currentSector]);
    

    // console.log(mapdata[currentSector]);

    for (let p = 0; p < mapdata[currentSector].length; p++) {
      if( mapdata[currentSector][p] === clickedPoint ){
        mapdata[currentSector] = _lhelpers.removeNthElement(mapdata[currentSector], p);
      }
    }

    // console.log(mapdata[currentSector]);
    _lhelpers.drawGrid();


  }


  /**
   * 
   * Add Mode
   * 
   */
  handleAddMode = function () {
    const clickX = (event.clientX - offsetX) / scale;
    const clickY = (event.clientY - offsetY) / scale;

    // Check if clicked on a line segment between vertices
    for (let i = 0; i < mapdata[currentSector].length - 1; i++) {
      const point1 = mapdata[currentSector][i];
      const point2 = mapdata[currentSector][i + 1];
      const distanceToLine = _lhelpers.pointToLineDistance({ x: clickX, y: clickY }, point1, point2);
      if (distanceToLine <= 3) {
        // Insert new vertex between point1 and point2
        mapdata[currentSector].splice(i + 1, 0, { x: clickX, y: clickY });

        // console.log(mapdata[currentSector]);
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
  handleDrawMode = function(){
    const clickX = (event.clientX - offsetX) / scale;
    const clickY = (event.clientY - offsetY) / scale;

    // console.log(mapdata[currentSector]);
    // Add new vertex
    mapdata[currentSector].push({ x: clickX, y: clickY });
    _lhelpers.drawGrid();
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
      dragOffsetX = mouseX - clickedPoint.x;
      dragOffsetY = mouseY - clickedPoint.y;
      _lhelpers.drawGrid();
    }
  
    // Continue dragging
    gDraggedPoint.x = mouseX - dragOffsetX;
    gDraggedPoint.y = mouseY - dragOffsetY;
    _lhelpers.drawGrid();
  }


  /**
   * Adding a new sector, (addsector, addnewsectors)
   */
  var handleAddNewSector = function () {
    // console.log(sectorCounter);
    let buttonToAppend = sectorSelectorTemplate.replace(new RegExp("XXX", 'g'), sectorCounter);
    selectorlist.insertAdjacentHTML('beforeend', buttonToAppend);

    currentSector = sectorCounter;
    // initialize empty array
    mapdata[currentSector] = [];

    // console.log(mapdata)
    
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
    // console.log(currentSector);
    _lhelpers.drawGrid();
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
      console.log('mouseUP');
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
