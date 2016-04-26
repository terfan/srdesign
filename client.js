var debugMode = false;

var brush = { 
   pos: {x:10, y:20, z:0}, // set initial position to where camera faces
   pos_prev: false,
   color: "#ffffff",
   thickness: 5,
};

var touchReleased = true;
var vx = vy = vz = 0;
var aRight = aUp = aForward = 0;
var sensitivity = 0.2;

document.addEventListener("DOMContentLoaded", function() {
   // get canvas element and create context
   var canvas  = document.getElementById('canvas');
   var context = canvas.getContext('2d');
   var width   = window.innerWidth;
   var height  = window.innerHeight;
   var socket  = io.connect();
   var line;

   // set canvas to full browser width/height
   canvas.width = width;
   canvas.height = height;

   // register device motion handlers
   if (!window.DeviceMotionEvent) {
      document.getElementById('msg').innerHTML = "DeviceMotion not supported."
      debugMode = true;
   }

   // drawing by finger motion
   if (debugMode) {
      // register touch event handlers
      canvas.addEventListener('touchstart', function(e) {
         // If there's exactly one finger inside this element
         if (e.targetTouches.length == 1) {
            var touch = e.targetTouches[0];
            line = {
               // scale coordinates to screen dimensions 
               x: touch.pageX / width,
               y: touch.pageY / height,
               z: brush.pos.z,
               color: brush.color,
               thickness: brush.thickness
            };
            brush.pos_prev = {x: line.x, y: line.y, z: line.z};
         };
         e.preventDefault();
      }, false);

      // temporary functionality for testing - eventually brush will be controlled by phone position tracking, not touch tracking
      canvas.addEventListener('touchmove', function(e) {
         // If there's exactly one finger inside this element
         if (e.targetTouches.length == 1) {
            var touch = e.targetTouches[0];
            var moveX = touch.pageX / width - line.x,
            moveY = touch.pageY / height - line.y;
            var ret = move(moveX, moveY);
            brush.pos.x = ret.x;
            brush.pos.y = ret.y;
         
            socket.emit('draw_line', { line: [ brush.pos, brush.pos_prev, brush.color, brush.thickness ], debug: debugMode, newLine: false });
         };
         e.preventDefault();
         brush.pos_prev = {x: brush.pos.x, y: brush.pos.y, z: brush.pos.z};
      }, false);

      function move(changeX, changeY) {
         return {
         x: line.x + changeX,
         y: line.y + changeY
         };
      }

      // draw line received from server
      socket.on('draw_line', function (data) {
         var line = data.line;
         context.strokeStyle = line[2];
         context.beginPath();
         context.moveTo(line[0].x * width, line[0].y * height);
         context.lineTo(line[1].x * width, line[1].y * height);
         context.stroke();
         context.closePath();
      });
   
   } else { // drawing by phone motion
      canvas.addEventListener('touchstart', function(e) {
                        document.getElementById('msg').innerHTML = 'detected touchstart';

         // If there's exactly one finger inside this element
         if (e.targetTouches.length == 1) {
            var touch = e.targetTouches[0];
            if (touch.force) {
               var max = 20;
               var min = 1;
               brush.thickness = Math.floor(touch.force * (max - min + 1)) + min;
            }
            
            line = {
               // scale coordinates to screen dimensions 
               x: brush.pos.x,
               y: brush.pos.y,
               z: brush.pos.z,
               color: brush.color,
               thickness: brush.thickness
            };
            brush.pos_prev = {x: line.x, y: line.y, z: line.z};
         };
         e.preventDefault();
         window.addEventListener('devicemotion', handleMotion, false);
      }, false);

      canvas.addEventListener('touchend', function(e) {
         window.removeEventListener('devicemotion', handleMotion);
         document.getElementById('msg').innerHTML = 'no longer detecting motion';
         // TODO: set brush.pos to viewer's gaze?
         touchReleased = true;
      }, false);

      function move(changeX, changeY, changeZ) {
         return {
            x: line.x + changeX,
            y: line.y + changeY,
            z: line.z + changeZ
         };
      }
   }

   function handleMotion(e) {
               document.getElementById('msg').innerHTML = 'in handlemotion';

      aRight = e.acceleration.x * sensitivity;
      // assuming phone is being held flat (screen-up)
      aUp = e.acceleration.z * sensitivity;
      aForward = e.acceleration.y * sensitivity;

      vx += aRight;
      vy += aUp;
      vz += aForward;

      var x = y = z = 0;
      x = brush.pos.x + vx;
      y = brush.pos.y + vy;
      z = brush.pos.z + vz;
      if (x > 699) {
         x = 699;
      }
      if (y > 699) {
         y = 699;
      }
      if (z = 699) {
         z = 699;
      }

      var ret = move(vx, vy, -vz); // reflect z coordinates
      brush.pos.x = ret.x;
      brush.pos.y = ret.y;
      brush.pos.z = ret.z;
      
      socket.emit('draw_line', { line: [ brush.pos, brush.pos_prev, brush.color, brush.thickness ], debug: debugMode, newLine: touchReleased });
      brush.pos_prev = {x: brush.pos.x, y: brush.pos.y, z: brush.pos.z};
      touchReleased = false;
   }
   
   // received color change signal from menu
   socket.on('change_color', function (data) {
      brush.color = data.color;
   });

   // received thickness change signal from menu
   socket.on('change_thickness', function (data) {
      brush.thickness = data.thickness;
   });
});