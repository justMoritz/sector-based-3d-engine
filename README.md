# 3D (2.5D) Sector based 3D Engine!

The continuation of the old ASCII-based raycaster engine (with perspective-correct looking up and down!). This is turning into a Build-style engine!

This new engine uses sector-based rendering which allows such cool features such as:

- Any angle walls
- Different height sectors
- Windows
- Platforms
- Voxel-objects (again, think Build Engine)
- NES-color pallet (and probably more in the future!)
- All while retaining the ascii-based renderer :)

And so much more! The limits are endless!



This is pretty helpful possibly



//we check if the wall reaches the bottom of the canvas
 // this.wallToBorder = (400 - wallHeight) / 2;
        
 if (this.wallToBorder > 0) {
    
 // we calculate how many pixels we have from bottom of wall to border of canvas
 var pixelsToBottom = Math.floor(this.wallToBorder);
    
 //we calculate the distance between the first pixel at the bottom of the wall and the player eyes (canvas.height / 2) 
 var pixelRowHeight = 200 - pixelsToBottom;
         
 // then we loop through every pixels until we reach the border of the canvas  
    
 for (let i = pixelRowHeight; i < 200; i += 1) {
    
   // we calculate the straight distance between the player and the pixel
      var directDistFloor = (this.screenDist * 200) / (Math.floor(i));
    
   // we calculate it's real world distance with the angle relative to the player
      var realDistance = (directDistFloor / Math.cos(this.angleR));
    
   // we calculate it's real world coordinates with the player angle
      this.floorPointx = this.player.x + Math.cos(this.angle) * realDistance / (this.screenDist / 100);
    this.floorPointy = this.player.y + Math.sin(this.angle) * realDistance / (this.screenDist / 100);
    
    // we map the texture
            var textY = Math.floor(this.floorPointx % 64);
            var textX = Math.floor(this.floorPointy % 64);

    // we modify floorSprite array:
            if (floorData && ceilData) {
    
              floorSprite.data[(this.index * 4) + (i + 200) * 4 * 600] = floorData.data[textY * 4 * 64 + textX * 4]
              floorSprite.data[(this.index * 4) + (i + 200) * 4 * 600 + 1] = floorData.data[textY * 4 * 64 + textX * 4 + 1]
              floorSprite.data[(this.index * 4) + (i + 200) * 4 * 600 + 2] = floorData.data[textY * 4 * 64 + textX * 4 + 2]
              floorSprite.data[(this.index * 4) + (i + 200) * 4 * 600 + 3] = 255;
    
              floorSprite.data[(this.index * 4) + (200 - i) * 4 * 600] = ceilData.data[textY * 4 * 64 + textX * 4]
              floorSprite.data[(this.index * 4) + (200 - i) * 4 * 600 + 1] = ceilData.data[textY * 4 * 64 + textX * 4 + 1]
              floorSprite.data[(this.index * 4) + (200 - i) * 4 * 600 + 2] = ceilData.data[textY * 4 * 64 + textX * 4 + 2]
              floorSprite.data[(this.index * 4) + (200 - i) * 4 * 600 + 3] = 255;
            }
          }
        }
      }
    }