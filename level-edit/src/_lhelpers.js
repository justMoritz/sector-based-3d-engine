_lhelpers = {

  clearGrid: function(){
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  },

  drawGrid: function(wall1, wall2){
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

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


    // draw all sectors
    for ( let i=0; i< mapdata.length; i++ ) {
      
      // zero is never a valid sector, skip
      if(i === 0){
        continue;
      }

      vertices = mapdata[i];


      // Draw points
      if( currentSector == i ){
        ctx.fillStyle = 'red';
      }else{
        ctx.fillStyle = '#ccc';
      }
      
      for (const vertex of vertices) {
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Print coordinates
        ctx.font = '10px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(`(${vertex.x.toFixed(2)/100}, ${vertex.y.toFixed(2)/100})`, vertex.x + 5, vertex.y - 5);
      }

      
      // Draw polygons
      if( currentSector == i ){
        ctx.strokeStyle = 'blue';
      } else {
        ctx.strokeStyle = '#000';
      }
      ctx.lineWidth = 2;
      if (vertices.length > 2) {
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        ctx.closePath(); // Close the path to form a closed polygon
        ctx.stroke();
      }
    }


    // draw highlighted line, if needed
    if(wall1 && wall2){
      // Set line properties
      ctx.strokeStyle = 'pink'; // Adjust color as needed
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
    console.log(vertices)
    for (let i = 0; i < vertices.length; i++) {
      const startPoint = vertices[i];
      const endPoint = vertices[(i + 1) % vertices.length]; // Connect last point to first point
      lineSegments.push([startPoint.x/100, startPoint.y/100, endPoint.x/100, endPoint.y/100]);
    }
    return lineSegments;
  },



  generateLevelData: function () {

    // console.log(mapdata);

    let tempMapData = [];
    tempMapData[0] = {
      "id": false,
    }

    for(let i=0; i< mapdata.length; i++){
      if(i === 0){
        continue
      }
      let sector = mapdata[i];
      let sectorFormattedWalls = _lhelpers.createLineSegments(sector);

      tempMapData[i] = {
        "id": "sector"+i,
        "walls": sectorFormattedWalls
      }
    }

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

  }

}