var ledit = (function(){

  handleMouseInteraction = function (event) {
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
    let clickedPoint = _lhelpers.findClickedPoint(clickX, clickY);
    
    console.log(vertices);

    for (let p = 0; p < vertices.length; p++) {
      if( vertices[p] === clickedPoint ){
        vertices = _lhelpers.removeNthElement(vertices, p);
      }
    }

    console.log(vertices);
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
    for (let i = 0; i < vertices.length - 1; i++) {
      const point1 = vertices[i];
      const point2 = vertices[i + 1];
      const distanceToLine = _lhelpers.pointToLineDistance({ x: clickX, y: clickY }, point1, point2);
      if (distanceToLine <= 3) {
        // Insert new vertex between point1 and point2
        vertices.splice(i + 1, 0, { x: clickX, y: clickY });

        console.log(vertices);
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

    console.log(vertices);
    // Add new vertex
    vertices.push({ x: clickX, y: clickY });
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

    if( !isDragging ){
      gDraggedPoint = null;
    }
    
    // Check if the mouse is over any point
    let clickedPoint = _lhelpers.findClickedPoint(mouseX, mouseY);

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



  var init = function(){

    // Sets up Canvas
    gridCanvas = document.getElementById('gridCanvas');
    ctx = gridCanvas.getContext('2d');
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;

    // sets up buttons
    allLSBbuttons = document.querySelectorAll('.left-sidebar__button');


    // Attach event listeners
    window.addEventListener('wheel', _lhelpers.handleScroll, { passive: false });

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
