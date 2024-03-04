var ledit = (function(){


  // Handles all functionality related to mouseclicks on the cancas
  handleMouseClick = function (event) {
    /**
     * 
     * Draw Mode
     * 
     */
    if (appMode === "draw") {
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
    else if (appMode === "add") {
      const clickX = (event.clientX - offsetX) / scale;
      const clickY = (event.clientY - offsetY) / scale;

      // Check if clicked on a line segment between vertices
      for (let i = 0; i < vertices.length - 1; i++) {
        const vertex1 = vertices[i];
        const vertex2 = vertices[i + 1];
        const distanceToLine = _lhelpers.pointToLineDistance({ x: clickX, y: clickY }, vertex1, vertex2);
        if (distanceToLine <= 3) {
          // Insert new vertex between vertex1 and vertex2
          vertices.splice(i + 1, 0, { x: clickX, y: clickY });
          _lhelpers.drawGrid();
          return;
        }
      }
    }
  }


  var init = function(){

    // Sets up Canvas
    gridCanvas = document.getElementById('gridCanvas');
    ctx = gridCanvas.getContext('2d');
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;

    // sets up buttons
    allLSBbuttons = document.querySelectorAll('.left-sidebar__button')


    // Attach event listeners
    window.addEventListener('wheel', _lhelpers.handleScroll, { passive: false });
    gridCanvas.addEventListener('click', handleMouseClick);

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
    };

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
