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

    let wallPoints = _lhelpers.isClickedOnWall( clickX, clickY, mapdataObj[currentSector] );

    _lhelpers.drawGrid(wallPoints.a, wallPoints.b);

    if (!wallPoints ){
      document.querySelector(".right-sidebar__walls").classList.add("disabled");
    }else{
      document.querySelector(".right-sidebar__walls").classList.remove("disabled");
      editwallid.innerHTML = wallPoints.id;
      wallTexInput.value = wallPoints.tex;
      texScaleXinput.value = wallPoints.sX;
      texScaleYinput.value = wallPoints.sY;
      sectorconnectorinput.value = wallPoints.sC;
    }
    // opens the edit window, and pulls in data




  };


  /**
   * 
   * Delete Mode
   */
  function handleDeleteMode(event) {
    const clickX = (event.clientX - offsetX) / scale;
    const clickY = (event.clientY - offsetY) / scale;
    const clickPoint = { x: clickX, y: clickY };
    const sectorWalls = mapdataObj[currentSector];

    let newStartingPoint;
    let newEndingPoint;
    let insertAtThisElement;
    let removeThisElement0;
    let removeThisElement1;

    let clickedPoints = _lhelpers.findClickedPoint2(clickX, clickY, mapdataObj[currentSector]);
    console.log(`Found these points:`);
    console.log(clickedPoints);


    console.log(sectorWalls);


    // found points
    if (clickedPoints.length > 0) {

      // store the points of those walls that were NOT clicked
      let firstWallId = clickedPoints[0].wallID;
      let secondWallId = clickedPoints[1].wallID;
      let clickedPoint = clickedPoints[0].point;

      for (let j = 0; j < mapdataObj[currentSector].length; j++) {
        const wall = mapdataObj[currentSector][j];

        // // checks first wall
        if (wall.id == firstWallId) {
          if( _lhelpers.pointsAreEqual(clickedPoint, wall.a) ){
            // console.log('clicked point is the same as point a, therefore save point b');
            newStartingPoint = wall.b;
          } 
          else if( _lhelpers.pointsAreEqual(clickedPoint, wall.b) ){
            // console.log('clicked point is the same as point b, therefore save point a');
            newStartingPoint = wall.a;
          }
          insertAtThisElement = j;
          removeThisElement0 = j;
        }

        // // checks second wall
        else if (wall.id == secondWallId) {
          if( _lhelpers.pointsAreEqual(clickedPoint, wall.a) ){
            // console.log('clicked point is the same as point a, therefore save point b');
            newEndingPoint = wall.b;
          } 
          else if( _lhelpers.pointsAreEqual(clickedPoint, wall.b) ){
            // console.log('clicked point is the same as point b, therefore save point a');
            newEndingPoint = wall.a;
          }
          removeThisElement1 = j;
        }
      }

      
      // Remove the two old walls
      sectorWalls.splice(removeThisElement0, 1);
      sectorWalls.splice(removeThisElement1-1, 1);



      // create a new walls connecting the two saved points
      let newWall = { 
        // "id": _lhelpers.generateRandomId() ,
        "id": "XXXXXX" ,
        "a": newStartingPoint, 
        "b": newEndingPoint, 
        "tex": wallDefaults.tex,
        "sX": wallDefaults.sX,
        "sY": wallDefaults.sY,
        "sC": wallDefaults.sC,
      };

      
      sectorWalls.splice(insertAtThisElement, 0, newWall);
      console.log(sectorWalls)

    }

    _lhelpers.drawGrid(); // Redraw the grid
    
  }



  /**
   * 
   * Add Mode
   * 
   */
  function handleAddMode(event) {
    const clickX = (event.clientX - offsetX) / scale;
    const clickY = (event.clientY - offsetY) / scale;
    const clickPoint = { x: clickX, y: clickY };

    // Iterate through each sector
    for (let i = 0; i < mapdataObj.length; i++) {

      if(i == 0){
        continue;
      }
      const sectorWalls = mapdataObj[i];
      
      // Iterate through each wall in the sector
      for (let j = 0; j < sectorWalls.length; j++) {
        const wall = sectorWalls[j];
        const startPoint = wall.a;
        const endPoint = wall.b;

        // Calculate the distance from the click point to the wall segment
        const distance = _lhelpers.pointToLineDistance(clickPoint, startPoint, endPoint);

        // Check if the distance is within a certain threshold (e.g., 5px)
        if (distance <= 5) {
          // Split the wall segment at the click point
          const newWall1 = { 
            "id": _lhelpers.generateRandomId(),
            "a": startPoint, 
            "b": clickPoint, 
            "tex": wallDefaults.tex,
            "sX": wallDefaults.sX,
            "sY": wallDefaults.sY,
            "sC": wallDefaults.sC,
          };
          const newWall2 = { 
            "id": _lhelpers.generateRandomId() ,
            "a": clickPoint, 
            "b": endPoint, 
            "tex": wallDefaults.tex,
            "sX": wallDefaults.sX,
            "sY": wallDefaults.sY,
            "sC": wallDefaults.sC,
          };

          // Replace the old wall with the new ones
          sectorWalls.splice(j, 1, newWall1, newWall2);
          _lhelpers.drawGrid(); // Redraw the grid
          return; // Exit the function after splitting the wall
        }
      }
    }
}



  /**
   * 
   * Draw Mode
   * 
   */
  function handleDrawMode(event) {
    // console.log(currentSector)
    let clickX = (event.clientX - offsetX) / scale;
    let clickY = (event.clientY - offsetY) / scale;
    clickX = _lhelpers.roundToNearest(clickX);
    clickY = _lhelpers.roundToNearest(clickY);

    if (drawMeta[currentSector].DMfirstPoint === null) {
        // First click, store it as the firstPoint
        drawMeta[currentSector].DMfirstPoint = { x: clickX, y: clickY };
        drawMeta[currentSector].DMprevPoint = { x: clickX, y: clickY }; // Also set prevPoint for the next line segment
        drawMeta[currentSector].DMdrawCounter++;
    } else {
      // get rid of the last wall in the list after on the 3rd vertex (when shapes close)
      if( drawMeta[currentSector].DMdrawCounter > 2 ){
        mapdataObj[currentSector].pop();
      }

      // Second click onwards, create line segments
      const wallSegment = { 
        "id": _lhelpers.generateRandomId(), 
        "a": { x: drawMeta[currentSector].DMprevPoint.x, y: drawMeta[currentSector].DMprevPoint.y }, 
        "b": { x: clickX, y: clickY },
        "tex": wallDefaults.tex,
        "sX": wallDefaults.sX,
        "sY": wallDefaults.sY,
        "sC": wallDefaults.sC,
      };

      mapdataObj[currentSector].push(wallSegment);
      
      // close after the first wall is drawn 
      if( drawMeta[currentSector].DMdrawCounter > 1 ){

        // Connect the last point to the first point to close the polygon
        const closingSegment = { 
          "id": _lhelpers.generateRandomId(), 
          "a": { x: clickX, y: clickY }, 
          "b": { x: drawMeta[currentSector].DMfirstPoint.x, y: drawMeta[currentSector].DMfirstPoint.y },
          "tex": wallDefaults.tex,
          "sX": wallDefaults.sX,
          "sY": wallDefaults.sY,
          "sC": wallDefaults.sC,
        };
        mapdataObj[currentSector].push(closingSegment);
      }
      
      // Reset prevPoint for the next line segment
      drawMeta[currentSector].DMprevPoint = { x: clickX, y: clickY };
      drawMeta[currentSector].DMdrawCounter++
    }
  
    // console.log('drew this:')
    // console.log(mapdataObj[currentSector])

    _lhelpers.drawGrid()
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

    let dragOffsetX;
    let dragOffsetY;

    if( !isDragging ){
      gDraggedPoint0 = null;
      gDraggedPoint1 = null;
    }
    
    // Check if the mouse is over any point
    let clickedPoints = _lhelpers.findClickedPoint2(mouseX, mouseY, mapdataObj[currentSector]);
    // console.log(`Found this points:`);
    // console.log(clickedPoints);

    if (clickedPoints.length > 0) {
      // console.log('this should only run one time');
      isDragging = true;
      
      // Start dragging the clicked point
      gDraggedPoint0 = clickedPoints[0];
      gDraggedPoint1 = clickedPoints[1];
      dragOffsetX = _lhelpers.roundToNearest(mouseX) - gDraggedPoint0.point.x;
      dragOffsetY = _lhelpers.roundToNearest(mouseY) - gDraggedPoint0.point.y;
      // dragOffsetX = _lhelpers.roundToNearest(mouseX) - gDraggedPoint1.point.x;
      // dragOffsetY = _lhelpers.roundToNearest(mouseY) - gDraggedPoint1.point.y;
      _lhelpers.drawGrid();
    }
    else{

      // Continue dragging
      gDraggedPoint0.point.x = _lhelpers.roundToNearest(mouseX);
      gDraggedPoint0.point.y = _lhelpers.roundToNearest(mouseY);
      gDraggedPoint1.point.x = _lhelpers.roundToNearest(mouseX);
      gDraggedPoint1.point.y = _lhelpers.roundToNearest(mouseY);

      _lhelpers.drawGrid();
    }
  }


  /**
   * Adding a new sector, (addsector, addnewsectors, sectoradd)
   */
  var handleAddNewSector = function () {
    let buttonToAppend = sectorSelectorTemplate.replace(new RegExp("XXX", 'g'), sectorCounter);
    selectorlist.insertAdjacentHTML('beforeend', buttonToAppend);

    currentSector = sectorCounter;
    // initialize empty sectorWalls
    mapdata[currentSector] = [];
    
    // init new sector meta, with defaults
    mapSecMeta[currentSector] = {
      "id": "sector"+currentSector,
      "floor": sectorDefaults.floor,
      "ceil": sectorDefaults.ceil,
      "ceilTex": sectorDefaults.ceilTex,
      "floorTex": sectorDefaults.floorTex,
    };

    console.log(mapSecMeta);


    // Preparing variables for Draw Mode
    mapdataObj[currentSector] = [];
    drawMeta[currentSector] = {};
    drawMeta[currentSector].DMwallsObject = [];
    drawMeta[currentSector].DMfirstPoint = null;
    drawMeta[currentSector].DMprevPoint = null;
    drawMeta[currentSector].DMdrawCounter = 0;
    
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
   * Select a given sector selector ( sectorselect, selectsector, switchsector )
   */
  var handleSelectSector = function (event) {
    document.querySelectorAll(".sector-selector").forEach( (ss) => { ss.classList.remove("this--active") });
    event.target.classList.add('this--active');
    // sets the Global current sector we're working with
    currentSector = event.target.dataset.id;
    
    // writes the current sector Meta into the files
    floorInput.value = mapSecMeta[currentSector].floor;
    ceilInput.value = mapSecMeta[currentSector].ceil;
    ceilTexInput.value = mapSecMeta[currentSector].ceilTex;
    floorTexInput.value = mapSecMeta[currentSector].floorTex;

    _lhelpers.drawGrid();
  }





  handleValueChangeWall = function( event, type ){
    const currentWallId = editwallid.innerHTML;

    // find the wallID in the mapdataObj[sector] we are editing
    for (let i = 0; i < mapdataObj[currentSector].length; i++) {
      const currentWall = mapdataObj[currentSector][i];
      if( currentWall.id == currentWallId ){
        currentWall[type] = event.target.value
      }
    }
  }


  handleValueChangeSector = function( event, type ){
    console.log('running');
    // find the wallID in the mapSecMeta we are editing
    for (let i = 0; i < mapSecMeta.length; i++) {
      const thisSector = mapSecMeta[i];
      console.log(thisSector);
      if( thisSector.id == "sector"+currentSector ){
        thisSector[type] = event.target.value
      }
    }
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
    editwallid = document.querySelector("#editwallid");
    wallTexInput = document.querySelector("#wallTex");
    texScaleXinput = document.querySelector("#texScaleX");
    texScaleYinput = document.querySelector("#texScaleY");
    sectorconnectorinput = document.querySelector("#sectorconnectorinput");

    floorInput = document.querySelector("#floor");
    ceilInput = document.querySelector("#ceil");
    ceilTexInput = document.querySelector("#ceilTex");
    floorTexInput = document.querySelector("#floorTex");

    wallTexInput.addEventListener('input', (e) => { handleValueChangeWall(e, "tex"); });
    texScaleXinput.addEventListener('input', (e) => { handleValueChangeWall(e, "sX"); });
    texScaleYinput.addEventListener('input', (e) => { handleValueChangeWall(e, "sY"); });
    sectorconnectorinput.addEventListener('input', (e) => { handleValueChangeWall(e, "sC"); });

    floorInput.addEventListener('input', (e) => { handleValueChangeSector(e, "floor"); });
    ceilInput.addEventListener('input', (e) => { handleValueChangeSector(e, "ceil"); });
    ceilTexInput.addEventListener('input', (e) => { handleValueChangeSector(e, "ceilTex"); });
    floorTexInput.addEventListener('input', (e) => { handleValueChangeSector(e, "floorTex"); });


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
