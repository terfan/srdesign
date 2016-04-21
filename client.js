var brush = { 
   pos: {x:0, y:0},
   pos_prev: false,
   color: "#ffffff",
   thickness: 5,
};

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
   if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion, false);
   } else {
      document.getElementById('msg').innerHTML = "DeviceMotion not supported."
   }

   // register touch event handlers
   canvas.addEventListener('touchstart', function(e) {
      // If there's exactly one finger inside this element
      if (e.targetTouches.length == 1) {
         var touch = e.targetTouches[0];
         line = {
           // scale coordinates to screen dimensions 
           x: touch.pageX / width,
           y: touch.pageY / height,
           color: brush.color,
           thickness: brush.thickness
         };
         brush.pos_prev = {x: line.x, y: line.y};
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
         
         socket.emit('draw_line', { line: [ brush.pos, brush.pos_prev, brush.color, brush.thickness ] });
      };
      e.preventDefault();
      brush.pos_prev = {x: brush.pos.x, y: brush.pos.y};
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

   // received color change signal from menu
   socket.on('change_color', function (data) {
      brush.color = data.color;
   });

   // received thickness change signal from menu
   socket.on('change_thickness', function (data) {
      brush.thickness = data.thickness;
   });
});

function handleMotion(event) {
   var aUp = event.acceleration.y;
   var aRight = event.acceleration.x;

   if (aUp != 0 || aRight != 0) {

      var thicknessFromAcc = Math.sqrt(Math.pow(aUp, 2) + Math.pow(aRight, 2)) * 2;

            document.getElementById('msg').innerHTML = thicknessFromAcc;

      if (thicknessFromAcc < 1) {
         brush.thickness = 1;
      } else if (thicknessFromAcc > 20) {
         brush.thickness = 20;
      } else {
         brush.thickness = thicknessFromAcc;
      }
   }
   /*console.log(event.acceleration.x + ' m/s2 in x');
   console.log(event.acceleration.y + ' m/s2 in y');
   console.log(event.acceleration.z + ' m/s2 in z');*/
}