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

    // Apply transformations
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);


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



      for (const wall of element) {

          // Retrieve start and end points of the wall segment
          const startX = wall.a.x * scale + offsetX;
          const startY = wall.a.y * scale + offsetY;
          const endX = wall.b.x * scale + offsetX;
          const endY = wall.b.y * scale + offsetY;

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
          ctx.fillStyle = `rgba(255, 155, 55, ${(mapSecMeta[i].floor/10 + 0.02)})`;
          // console.log(ctx.fillStyle);
          ctx.beginPath();
          ctx.moveTo(element[0].a.x * scale + offsetX, element[0].a.y * scale + offsetY);
          for (const wall of element) {
              const startX = wall.a.x * scale + offsetX;
              const startY = wall.a.y * scale + offsetY;
              ctx.lineTo(startX, startY);
          }
          ctx.closePath();
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
      ctx.fillText(`Sector ${i}`, centroidX * scale + offsetX, centroidY * scale + offsetY);
      
    }


    if(mapdataObj.length > 1){
      // Draws the current sector on top again
      for (const wall of mapdataObj[currentSector]) {

        // Retrieve start and end points of the wall segment
        const startX = wall.a.x * scale + offsetX;
        const startY = wall.a.y * scale + offsetY;
        const endX = wall.b.x * scale + offsetX;
        const endY = wall.b.y * scale + offsetY;

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

    // Restore transformations
    ctx.restore();
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
    const roundToNearest = nearest || 25;
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
          wall.sX,
          wall.sY,
          wall.sC
        ]
        sectorWalls[j] = sectorFormattedWallData;
      }

      // Formats each sector
      tempMapData[i] = {
        "id": "sector"+i,
        "walls": sectorWalls,
        "floor": 0,
        "ceil": 2,
        "floorTex": "Y",
        "ceilTex": "U"
      }
    }

    // combines all the data into level data
    leveldata = { 
      "fDepth": fDepth,
      "fPlayerX": fPlayerX,
      "fPlayerY": fPlayerY,
      "fPlayerA": fPlayerA,
      "fPlayerH": fPlayerH,
      "startingSector": startingSector,
      "sprites": {
      },
      "map": tempMapData
    }

    console.log(leveldata);

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



}