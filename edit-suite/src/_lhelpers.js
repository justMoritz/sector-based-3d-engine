_lhelpers = {

  clearGrid: function(){
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  },

  drawRules: function(){
      // Calculate visible grid range
      const visibleWidth = gridCanvas.width / scale;
      const visibleHeight = gridCanvas.height / scale;
      const startX = -offsetX / scale;
      const startY = -offsetY / scale;
      const endX = startX + visibleWidth;
      const endY = startY + visibleHeight;
    // Draw sub-rules
    ctx.beginPath();
    ctx.strokeStyle = '#dadada'; // Lighter color for sub-rules
    for (let x = Math.floor(startX / subRuleInterval) * subRuleInterval; x <= endX; x += subRuleInterval) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }
    for (let y = Math.floor(startY / subRuleInterval) * subRuleInterval; y <= endY; y += subRuleInterval) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Draw main rules
    ctx.beginPath();
    ctx.strokeStyle = '#555';
    for (let x = Math.floor(startX / mainRuleInterval) * mainRuleInterval; x <= endX; x += mainRuleInterval) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }
    for (let y = Math.floor(startY / mainRuleInterval) * mainRuleInterval; y <= endY; y += mainRuleInterval) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }
    ctx.stroke();
  },

  drawGrid: function(wall1, wall2) {
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    // XXXXX
    // Apply transformations for zooming and panning
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(offsetX, offsetY);
    
    

    // Calculate visible grid range
    const visibleWidth = gridCanvas.width / scale;
    const visibleHeight = gridCanvas.height / scale;
    const startX = -offsetX / scale;
    const startY = -offsetY / scale;
    const endX = startX + visibleWidth;
    const endY = startY + visibleHeight;

    // Draw sub-rules
    ctx.beginPath();
    ctx.strokeStyle = '#dadada'; // Lighter color for sub-rules
    for (let x = Math.floor(startX / subRuleInterval) * subRuleInterval; x <= endX; x += subRuleInterval) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }
    for (let y = Math.floor(startY / subRuleInterval) * subRuleInterval; y <= endY; y += subRuleInterval) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Draw main rules
    ctx.beginPath();
    ctx.strokeStyle = '#555';
    for (let x = Math.floor(startX / mainRuleInterval) * mainRuleInterval; x <= endX; x += mainRuleInterval) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }
    for (let y = Math.floor(startY / mainRuleInterval) * mainRuleInterval; y <= endY; y += mainRuleInterval) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Draw red line at (0, 0) if it's within visible range
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.moveTo(0, startY);
    ctx.lineTo(0, endY);
    ctx.moveTo(startX, 0);
    ctx.lineTo(endX, 0);
    ctx.stroke();

    // iterate over the map object and draw each wall
    for (let i = 0; i < mapdataObj.length; i++) {
      if (i === 0) {
          continue;
      }

      const element = mapdataObj[i];

      // Calculate centroid
      let centroidX = 0;
      let centroidY = 0;
      for (const wall of element) {
          centroidX += (wall.a.x + wall.b.x) / 2;
          centroidY += (wall.a.y + wall.b.y) / 2;
      }
      centroidX /= element.length;
      centroidY /= element.length;

      var fillColorBasedOnHeight = `rgba(255, ${144 - (mapSecMeta[i].floor * 10)}, ${50+(mapSecMeta[i].floor * 20)}, ${(mapSecMeta[i].floor/10 + 0.1)})`;
      if ( mapSecMeta[i].floor > 6 && mapSecMeta[i].floor <= 12 ){
        fillColorBasedOnHeight = `rgba(${144 - ((mapSecMeta[i].floor-5) * 10)}, ${50+((mapSecMeta[i].floor-5) * 20)}, 255, ${((mapSecMeta[i].floor-5)/10 + 0.1)})`;
      }
      if ( mapSecMeta[i].floor > 12 ){
        fillColorBasedOnHeight = `rgba(${144 - ((mapSecMeta[i].floor-11) * 10)}, 255, ${50+((mapSecMeta[i].floor-11) * 20)}, ${((mapSecMeta[i].floor-11)/10 + 0.1)})`;
      }


      if ( Object.keys(element).length > 0 ) {
        for (const wall of element) {
          // Retrieve start and end points of the wall segment
          const startX = wall.a.x * scale + 0;
          const startY = wall.a.y * scale + 0;
          const endX = wall.b.x * scale + 0;
          const endY = wall.b.y * scale + 0;

          // Print Each Wall 
          ctx.strokeStyle = '#444';
          if( wall.sC != 0 ){
            ctx.strokeStyle = '#F44';
          }
          ctx.lineWidth = 2;

          // Draw the line segment
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Print Coordinates
          ctx.fillStyle = '#aaa';
          ctx.font = '10px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(`(${startX.toFixed(2)/100}, ${startY.toFixed(2)/100})`, startX + 5, startY - 5);
          ctx.fillText(`(${endX.toFixed(2)/100}, ${endY.toFixed(2)/100})`, endX + 5, endY - 5);

          // print points
          ctx.beginPath();
          ctx.fillStyle = '#ccc';
          ctx.arc(startX, startY, 3, 0, Math.PI * 2);
          ctx.arc(endX, endY, 3, 0, Math.PI * 2);

          ctx.fill();


          // Draws the fill based on the floor height
          ctx.fillStyle = fillColorBasedOnHeight;
          // console.log(ctx.fillStyle);
          ctx.beginPath();
          ctx.moveTo(element[0].a.x * scale + 0, element[0].a.y * scale + 0);
          for (const wall of element) {
              const startX = wall.a.x * scale + 0;
              const startY = wall.a.y * scale + 0;
              ctx.lineTo(startX, startY);
          }
          ctx.closePath();
        }
        ctx.fill();
      }

      // Draw sector name
      ctx.fillStyle = '#444';
      if (currentSector == i) {
        ctx.fillStyle = 'rebeccapurple';
      }
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      // ctx.textBaseline = 'middle';
      ctx.fillText(`Sector ${i}`, centroidX * scale + 0, centroidY * scale + 0);
      
    }


    if(mapdataObj.length > 1 && currentSector !== 0 ){
      // Draws the current sector on top again
      for (const wall of mapdataObj[currentSector]) {

        // Retrieve start and end points of the wall segment
        const startX = wall.a.x * scale + 0;
        const startY = wall.a.y * scale + 0;
        const endX = wall.b.x * scale + 0;
        const endY = wall.b.y * scale + 0;

        // Print Each Wall 
        ctx.strokeStyle = '#a3a';
        if( wall.sC != 0 ){
          ctx.strokeStyle = '#f6c';
        }
        ctx.lineWidth = 2;

        // Draw the line segment
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Print Coordinates
        ctx.fillStyle = '#111';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`(${startX.toFixed(2)/100}, ${startY.toFixed(2)/100})`, startX + 5, startY - 5);
        ctx.fillText(`(${endX.toFixed(2)/100}, ${endY.toFixed(2)/100})`, endX + 5, endY - 5);

        // print points
        ctx.beginPath();
        ctx.fillStyle = 'blue';

        ctx.arc(startX, startY, 3, 0, Math.PI * 2);
        ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // draw highlighted line, if needed
    if (wall1 && wall2) {
        // Set line properties
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 2;

        // Begin drawing the line
        ctx.beginPath();
        ctx.moveTo(wall1.x, wall1.y);
        ctx.lineTo(wall2.x, wall2.y);
        ctx.stroke();
    }


    // draw light gizmos
    for (const id in lightsObj) {
      const L = lightsObj[id];
      const lightX = L.x * scale;
      const lightY = L.y * scale;

      // draw light position
      ctx.beginPath();
      ctx.arc(lightX, lightY, 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#f90';
      ctx.lineWidth = 2;
      ctx.stroke();

      // radius ring
      ctx.beginPath();
      ctx.arc(lightX, lightY, L.r * scale, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Restore transformations
    ctx.restore();

    // also draws the level data
    _lhelpers.generateLevelData()
},



  // Function to calculate the distance between a point and a line segment
  pointToLineDistance: function (point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) // in case of 0 length line
        param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
    } else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
    } else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  },


  // Zoom in and out on scroll
  handleScroll: function (event) {
    event.preventDefault();
    const scaleFactor = 0.01;
    if (event.deltaY < 0) {
        // Zoom in
        scale += scaleFactor;
    } else {
        // Zoom out
        scale -= scaleFactor;
    }
    scale = Math.max(0.1, scale); // Limit minimum scale
    _lhelpers.drawGrid();
  },


  findClickedPoint: function( clickX, clickY, vertices ){
    let clickedPoint = null;

    for (const point of vertices) {
      const distance = Math.sqrt((clickX - point.x) ** 2 + (clickY - point.y) ** 2);
      if (distance <= 3) {
        clickedPoint = point;
        break;
      }
    }
    return clickedPoint;
  },


  findClickedPoint2: function( clickX, clickY, wallsObj ){
    let clickedPoints = [];

    for (let i = 0; i < wallsObj.length; i++) {
      const currentWall = wallsObj[i];

      // Test Wall point A
      const distanceA = Math.sqrt((clickX - currentWall.a.x) ** 2 + (clickY - currentWall.a.y) ** 2);
      if (distanceA <= 3) {
        clickedPoints.push( {"wallID": currentWall.id, "point": currentWall.a, "pointID":  "a"} );
      }

      // Test Wall point B
      const distanceB = Math.sqrt((clickX - currentWall.b.x) ** 2 + (clickY - currentWall.b.y) ** 2);
      if (distanceB <= 3) {
        clickedPoints.push( {"wallID": currentWall.id, "point": currentWall.b, "pointID":  "b"} );
      }
    }

    // returns each point, the id of the wall the point belongs to, as well as which point of the wall it is.
    // This will allow us to modify the exact point of in the mapdataObj Object :)
    return clickedPoints;
  },


  findClosestPointsToClick: function  ( clickX, clickY, vertices) {
    // Initialize variables to keep track of the closest points and their distances
    let closestPoints = [];
    let closestDistances = [Infinity, Infinity]; // Initialize with maximum values

    // Iterate over each pair of points to calculate distances
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        // Calculate the distance between the click point and the line formed by the current pair of points
        const distance = Math.abs((vertices[j].y - vertices[i].y) * clickX - (vertices[j].x - vertices[i].x) * clickY + vertices[j].x * vertices[i].y - vertices[j].y * vertices[i].x) / Math.sqrt((vertices[j].y - vertices[i].y) ** 2 + (vertices[j].x - vertices[i].x) ** 2);
        
        // Check if this distance is within the error margin
        if (distance <= 5) {
          // Check if this distance is closer than the current closest distances
          if (distance < closestDistances[1]) {
            // Update closestDistances
            closestDistances[1] = distance;
            closestDistances.sort((a, b) => a - b);

            // Update closestPoints
            closestPoints = [vertices[i], vertices[j]];
          }
        }
      }
    }
    return closestPoints;
  },


  removeNthElement: function (array, n) {
    if (n >= 0 && n < array.length) {
      array.splice(n, 1);
    }
    return array;
  },


  roundToNearest: function ( number, nearest ){
    const roundToNearest = nearest || 12.5;
    return  Math.round(number / roundToNearest) * roundToNearest;
  },


  createLineSegments: function (vertices) {
    const lineSegments = [];
    // console.log(vertices)
    for (let i = 0; i < vertices.length; i++) {
      const startPoint = vertices[i];
      const endPoint = vertices[(i + 1) % vertices.length]; // Connect last point to first point
      lineSegments.push([startPoint.x/100, startPoint.y/100, endPoint.x/100, endPoint.y/100, "#", 2, 2, false]);
    }
    return lineSegments;
  },


  generateRandomId: function () {
    let length = 8;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return result;
  },


  // Converts data from the level editor to a workable level file
  // export, exportlevel, exportdata, levelexport
  generateLevelData: function () {
 
    let tempMapData = [];
    tempMapData[0] = {
      "id": false,
    }

    for(let i=0; i< mapdataObj.length; i++){
      if(i === 0){
        continue
      }
      let currentSector = mapdataObj[i];
      let sectorWalls = [];

      // Formats all the walls in the current sector
      for(let j=0; j< currentSector.length; j++){
        const wall = currentSector[j];
        let sectorFormattedWallData = [
          wall.a.x/100,
          wall.a.y/100,
          wall.b.x/100,
          wall.b.y/100,
          wall.tex,
          parseFloat(wall.sX),
          parseFloat(wall.sY),
          parseFloat(wall.oX),
          parseFloat(wall.oY),
          parseInt(wall.sC)
        ]
        sectorWalls[j] = sectorFormattedWallData;
      }

      // Formats each sector
      tempMapData[i] = {
        "id": "sector"+i,
        "walls": sectorWalls,
        "floor": parseFloat(mapSecMeta[i].floor),
        "ceil": parseFloat(mapSecMeta[i].ceil),
        "floorTex": mapSecMeta[i].floorTex,
        "ceilTex": mapSecMeta[i].ceilTex
      }
    }

    // combines all the data into level data
    leveldata = { 
      "fDepth": parseFloat(fDepth),
      "fPlayerX": parseFloat(fPlayerX),
      "fPlayerY": parseFloat(fPlayerY),
      "fPlayerA": parseFloat(fPlayerA),
      "fPlayerH": parseFloat(fPlayerH),
      "startingSector": parseInt(startingSector),
      "sprites": spritesObject,
      "map": tempMapData
    }

    console.log(leveldata);
    outputareaTA.value = JSON.stringify(leveldata);

  },


  isClickedOnWall: function (clickX, clickY, walls) {
    // Define an error margin for clicking on a wall segment
    const errorMargin = 10; // Adjust as needed

    // Iterate through each wall segment
    for (const wall of walls) {
        // Extract the coordinates of the wall segment's endpoints
        const { a, b } = wall;
        const ax = a.x;
        const ay = a.y;
        const bx = b.x;
        const by = b.y;

        // Calculate vectors representing the wall segment and the vector from point A to the click point
        const wallVector = { x: bx - ax, y: by - ay };
        const pointToAVector = { x: clickX - ax, y: clickY - ay };

        // Calculate the dot product of the wall segment vector and the vector from point A to the click point
        const dotProduct = wallVector.x * pointToAVector.x + wallVector.y * pointToAVector.y;

        // Calculate the length squared of the wall segment
        const lengthSquared = wallVector.x ** 2 + wallVector.y ** 2;

        // Calculate the parameter t, which represents the position of the projection of the click point onto the wall segment
        const t = Math.max(0, Math.min(1, dotProduct / lengthSquared));

        // Calculate the coordinates of the projection point onto the wall segment
        const projectionX = ax + t * wallVector.x;
        const projectionY = ay + t * wallVector.y;

        // Calculate the distance between the click point and the projection point
        const distanceSquared = (clickX - projectionX) ** 2 + (clickY - projectionY) ** 2;

        // If the distance is within the error margin, the click point is near the wall segment
        if (distanceSquared <= errorMargin ** 2) {
            return wall;
        }
    }

    // If no wall segment was clicked, return false
    return false;
  },


  // Function to check if two points are equal
  pointsAreEqual: function (point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
  },

  handleZoom: function(delta) {
    scale += delta; // Adjust the scale factor

    // Ensure scale is within reasonable bounds
    scale = Math.max(0.1, Math.min(scale, 10)); // Example bounds

    // Redraw the canvas with the updated scale
    _lhelpers.drawGrid();
  },

  handlePan: function (deltaX, deltaY) {
    offsetX += deltaX;
    offsetY += deltaY;

    // Redraw the canvas with the updated offset
    _lhelpers.drawGrid();
  },

  findClickedSector: function (clickX, clickY, sectors) {
    // Iterate through each sector
    for (let i = 0; i < sectors.length; i++) {
      if (i==0) {
        continue;
      }

      const walls = sectors[i];
      // Initialize counters for winding number algorithm
      let wn = 0;

      // Iterate through each wall in the sector
      for (let j = 0; j < walls.length; j++) {
        const wall = walls[j];
        const startX = wall.a.x;
        const startY = wall.a.y;
        const endX = wall.b.x;
        const endY = wall.b.y;

        // Check if the click point is within the vertical range of the wall
        if ((startY <= clickY && clickY < endY) || (endY <= clickY && clickY < startY)) {
          // Calculate the edge slope
          const slope = (endX - startX) / (endY - startY);
          // Calculate the x-coordinate of the point on the edge at the same y-coordinate as the click point
          const edgeX = startX + (clickY - startY) * slope;

          // Check if the click point falls to the right of the edge
          if (clickX < edgeX) {
            // Increment or decrement winding number based on the edge orientation
            if (startY < endY) {
              wn++;
            } else {
              wn--;
            }
          }
        }
      }

      // If the winding number is non-zero, the click point is inside the sector
      if (wn !== 0) {
          // Return the ID of the sector
          return i;
      }
    }

    // If no sector contains the click point, return null
    return null;
  },


  copyToClipBoard: function(){
    navigator.clipboard.writeText( outputareaTA.value ).then().catch();
    // console.log(navigator.clipboard);
    // old version
    // document.querySelector("textarea").select();
    // document.execCommand('copy');
  },


  handleImportFromFile: function(){
    console.log('Importing');
    // console.log( inputareaTA.value );

    try {
      importedJSON = JSON.parse( inputareaTA.value); 
    } catch (e) {
      alert(`Level file format corrupt`);
      return console.error(e); 
    }

    // sets global map variables
    fDepth = importedJSON.fDepth;
    fPlayerX = importedJSON.fPlayerX;
    fPlayerY = importedJSON.fPlayerY;
    fPlayerA = importedJSON.fPlayerA;
    fPlayerH = importedJSON.fPlayerH;
    startingSector = importedJSON.startingSector;
    // TODO: Sprites

    spritesObject = importedJSON.sprites;


    // sets global settings
    fDepthInput.value = fDepth;
    fPlayerXInput.value = fPlayerX;
    fPlayerYInput.value = fPlayerY;
    fPlayerAInput.value = fPlayerA;
    fPlayerHInput.value = fPlayerH;
    startingSectorInput.value = startingSector; 

    // imports all the walls into the mapdata object
    let tempSectors = importedJSON.map;

    for (let i = 0; i < tempSectors.length; i++) {
      if (i == 0) {
        continue;
      }
      const curSecFromMap = tempSectors[i];

      // assembles the sector meta for sector
      let curTempSecMeta = {
        "id": curSecFromMap.id,
        "ceil": curSecFromMap.ceil,
        "floor": curSecFromMap.floor,
        "ceilTex": curSecFromMap.ceilTex,
        "floorTex": curSecFromMap.floorTex,
      }
      
      mapSecMeta[i] = curTempSecMeta;


      // assembles the walls for each sector
      // console.log(curSecFromMap);
      const curWallsFromSector = curSecFromMap.walls;
      let curTempMapSecData = [];

      for (let j = 0; j < curWallsFromSector.length; j++) {
        const curWall = curWallsFromSector[j];

        curTempMapSecData[j] = {
          "id": _lhelpers.generateRandomId(),
          "a": {
            "x": curWall[0]*100,
            "y": curWall[1]*100,
          },
          "b": {
            "x": curWall[2]*100,
            "y": curWall[3]*100,
          },
          "tex": curWall[4],
          "sX": curWall[5],
          "sY": curWall[6],
          "oY": curWall[7],
          "oY": curWall[8],
          "sC": curWall[9],
        }
      }

      mapdataObj[i] = curTempMapSecData;
    }
    // console.log(mapdataObj);


    // Adds the required amount and numbers of sector selectors in the UI
    for (let s = 1; s < tempSectors.length; s++) {
      let buttonToAppend = sectorSelectorTemplate.replace(new RegExp("XXX", 'g'), s);
      selectorlist.insertAdjacentHTML('beforeend', buttonToAppend);
      sectorCounter = s+1;
    }

    _lhelpers.drawGrid();

    // console.log( importedJSON );
    // console.log( importedJSON.fPlayerA );
  },


  handleMouseDown: function(event) {
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  },


  handleMouseMove: function (event) {
    if (isDragging) {
      let deltaX = event.clientX - lastMouseX;
      let deltaY = event.clientY - lastMouseY;

      // Update offsetX and offsetY based on mouse movement
      offsetX += deltaX;
      offsetY += deltaY;

      // Redraw the grid with the updated offset values
      _lhelpers.drawGrid();

      // Update last mouse position
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }
},

  handleMouseUp: function(event) {
    isDragging = false;
  }


}