/***************** SOCKET CODE ******************/

var socket  = io.connect();

socket.on('draw_line', function (data) {
  var line = data.line;
  //console.log("receiving signal from drawing tool "+line);
  var debugMode = data.debug;
  var newLine = data.newLine;
  draw(line, debugMode, newLine);
});

/***************** THREE JS ******************/

var camera, scene, renderer;
var scene2, renderer2;
var effect, controls;
var raycaster = new THREE.Raycaster();
var element, container;
var menuGroup;
var sides = 5;
var menuText = ['Brush', 'Exit', 'Clear', 'Thickness', 'Color'];
var menuButtons = []; // geometry planes
var textures = []; // normal button textures
var selectedTextures = []; // textures to use when button is selected
var selectedButton;
var lineColor, lineThickness;

var buttons = {
  'Brush': function () {
    // TODO: brush styles
    console.log("brush menu item clicked");
  },
  'Exit': function () {
    // TODO: show warning message and/or option to save?
    window.history.back();
  },
  'Clear': function () {
    socket.emit('clear');
    location.reload(false);
  },
  'Thickness': function () {
    // TODO: brush thickness
    var max = 20;
    var min = 1;
    lineThickness = Math.floor(Math.random() * (max - min + 1)) + min;
    socket.emit('change_thickness', { thickness: lineThickness } );
    console.log("thickness changed to "+lineThickness);
  },
  'Color': function () {
    // TODO: color
    lineColor = Math.random() * 0xffffff;
    socket.emit('change_color', { color: lineColor } );
    console.log("color changed to "+lineColor);
  }

}

var clock = new THREE.Clock();

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x000000, 1);
  element = renderer.domElement;
  container = document.getElementById('canvas');
  container.appendChild(element);

  scene = new THREE.Scene();

  effect = new THREE.CardboardEffect(renderer);

  camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
  camera.position.set(10, 20, 40); // TODO: play around with camera stuff

  /*********************** RETICLE **************************/
  Reticulum.init(camera, {
    proximity: false,
    clickevents: true,
    near: null, //near factor of the raycaster (shouldn't be negative and should be smaller than the far property)
    far: null, //far factor of the raycaster (shouldn't be negative and should be larger than the near property)
    reticle: {
      visible: true,
        restPoint: 5, //Defines the reticle's resting point when no object has been targeted
        color: 0xcc00cc,
        innerRadius: 0.0001,
        outerRadius: 0.008,
        hover: {
          color: 0x00cccc,
          innerRadius: 0.02,
          outerRadius: 0.024,
          speed: 5,
            vibrate: 50 //Set to 0 or [] to disable
          }
        },
        fuse: {
          visible: true,
          duration: 1, //.5 for testing
          color: 0x00fff6,
          innerRadius: 0.045,
          outerRadius: 0.06,
        vibrate: 100, //Set to 0 or [] to disable
        clickCancelFuse: false //If users clicks on targeted object fuse is canceled
      }
    });
  /*********************** END OF RETICLE **************************/

  scene.add(camera);

  controls = new THREE.OrbitControls(camera, element);
  //controls.rotateUp(Math.PI / 4);
  controls.target.set(camera.position.x, camera.position.y, camera.position.z - 5);
  controls.enableZoom = false;
  controls.enablePan = false;

  function setOrientationControls(e) {
    if (!e.alpha) {
      return;
    }

    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    controls.update();

    element.addEventListener('click', fullscreen, false);

    window.removeEventListener('deviceorientation', setOrientationControls, true);
  }
  window.addEventListener('deviceorientation', setOrientationControls, true);


  var light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
  scene.add(light);

  var texture = new THREE.TextureLoader().load('images/textures/patterns/checker.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat = new THREE.Vector2(50, 50);
  texture.anisotropy = renderer.getMaxAnisotropy();

  var material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 20,
    shading: THREE.FlatShading,
    map: texture
  });

  var geometry = new THREE.PlaneGeometry(1000, 1000);

  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  //scene.add(mesh);

  /** AXES FOR TESTING **/
    var material2 = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 5
  });

    var px = new THREE.Geometry();
px.vertices.push(
  new THREE.Vector3( 0, 0, 0 ),
  new THREE.Vector3( 50, 0, 0 )
);
    var xaxis = new THREE.Line( px, material2 );
    scene.add(xaxis);
        var py = new THREE.Geometry();
py.vertices.push(
  new THREE.Vector3( 0, -50, 0 ),
  new THREE.Vector3( 0, 50, 0 )
);
    var yaxis = new THREE.Line( py, material2 );
    scene.add(yaxis);
    var pz = new THREE.Geometry();
    pz.vertices.push(
  new THREE.Vector3( 0, 0, -50 ),
  new THREE.Vector3( 0, 0, 50 )
);
    var zaxis = new THREE.Line (pz, material2);
    scene.add(zaxis);

  /** END OF AXES FOR TESTING **/

  menuGroup = new THREE.Object3D();
  createMenu();
  menuGroup.position.set(0, 20, 10);
  menuGroup.rotationAutoUpdate = true;
  scene.add(menuGroup);
  //highlightButton(4, true);

  window.addEventListener('resize', resize, false);
  setTimeout(resize, 1);

  //setInterval(render, 1000/30);
}

function resize() {
  var width = container.offsetWidth;
  var height = container.offsetHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  effect.setSize(width, height);
}

function update(dt) {
  resize();

  camera.updateProjectionMatrix();
  controls.update(dt);
}

function render() {
  //geometry.verticesNeedUpdate = true; // unnecessary?
  effect.render(scene, camera);
}

function animate(t) {
  requestAnimationFrame(animate);

  Reticulum.update();
  camera.updateMatrixWorld();

  update(clock.getDelta());
  render(clock.getDelta());
}

function fullscreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
  screen.orientation.lock( 'any' )
}

/*********************** CAROUSEL UI ***********************/

function createMenu() {

  var width = 15;
  var height = 7;
  var tz = Math.round( ( height / 2) / Math.tan( Math.PI / sides ) );
  for (i = 0; i < sides; i++) {

    var bitmap = document.createElement('canvas');
    var ctx = bitmap.getContext('2d');
    ctx.width = width * 20;
    ctx.height = height * 20;
    ctx.font = 'normal 50px Helvetica';
    var deg = i * 360 / sides;
    ctx.fillStyle = 'hsl(' + deg + ', 80%, 25%)';
    ctx.fillRect(0, 0, ctx.width, ctx.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(menuText[i], ctx.width / 2, ctx.height / 2);
    
    // Create highlighted version of texture
    var bitmap2 = document.createElement('canvas');
    var ctx2 = bitmap2.getContext('2d');
    ctx2.width = width * 20;
    ctx2.height = height * 20;
    ctx2.font = 'normal 50px Helvetica';
    ctx2.fillStyle = 'hsl(' + deg + ', 80%, 60%)';
    ctx2.fillRect(0, 0, ctx.width, ctx.height);
    ctx2.fillStyle = 'white';
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    ctx2.fillText(menuText[i], ctx.width / 2, ctx.height / 2);

    // canvas contents will be used for a texture
    var texture1 = new THREE.Texture(bitmap);
    var texture2 = new THREE.Texture(bitmap2);
    texture1.needsUpdate = true;
    texture2.needsUpdate = true;
    textures[i] = texture1;
    selectedTextures[i] = texture2;

    var panelMaterial = new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide, overdraw: 0.5 });
    panelMaterial.needsUpdate = true;
    var plane = new THREE.Mesh(new THREE.PlaneGeometry( width, height ), panelMaterial);
    plane.overdraw = true;
    plane.rotateX( 2 * Math.PI * i / sides );
    plane.translateZ( tz );
    plane.userData.id = i;

    function setMenuControl(e) {
      var ab = Math.abs(e.beta);
      var flipped = (ab < 90 && e.gamma < 0) || (ab > 90 && e.gamma > 0);
      var gammaRotation =
        ((flipped ? e.gamma : -e.gamma) + (ab < 90 ? 90 : -90)) * (Math.PI / 180);
 
      menuGroup.rotateX(gammaRotation * 0.1);
      //console.log(gammaRotation);
    }
    
    Reticulum.add( plane, {
      onGazeOver: function(){
        // do something when user targets object
        window.addEventListener('deviceorientation', setMenuControl, true);
      },
      onGazeOut: function(){
        // do something when user moves reticle off targeted object
        this.material.map = textures[this.userData.id];
        window.removeEventListener('deviceorientation', setMenuControl, true);

      },
      onGazeLong: function(){
        // do something user targetes object for specific time

        // rot = - id * deltaRotation; if rot == 0 then active plane
        /*if (this.rotation.x == (Math.PI/2)) {
          console.log(this.rotation.x);
          this.material.map = selectedTextures[this.userData.id];         
        }*/
        window.removeEventListener('deviceorientation', setMenuControl, true);

      },
      onGazeClick: function(){
        // have the object react when user clicks / taps on targeted object
        var id = this.userData.id;
        this.material.map = selectedTextures[id];
        //highlightButton(this.userData.id, true);
        window.removeEventListener('deviceorientation', setMenuControl, true);
        clickSelected(id);
      }
    });

    menuGroup.add(plane);

    menuButtons[i] = plane;

  }
}

function highlightButton(id, highlight) { // true to highlight, false to unhighlight
  var button1 = menuButtons[id];
  var button2 = selectedButton;

  if (highlight) {
    button1.material.map = selectedTextures[id];
    if (selectedButton) {
      button2.material.map = textures[id];
    }
    selectedButton = button1;
  } else {
    button1.material.map = textures[id];
    selectedButton = null;
  }

  var targetRotation = 2 * Math.PI * id / sides;
  menuGroup.rotation.x -= (targetRotation - menuGroup.rotation.x);

}

function clickSelected(id) {
  (buttons[menuText[id]])();
}


/***************** DRAW ******************/

var points = [];
var materials = [];
var geometry = new THREE.Geometry();
var prevPoint = new THREE.Vector3();

function draw(line, debugMode, newLine) {

  var p1 = new THREE.Vector3();
  p1.x = line[0].x;
  p1.y = line[0].y;
  p1.z = line[0].z;
  var p2 = new THREE.Vector3();
  p2.x = line[1].x;
  p2.y = line[1].y;
  p2.z = line[1].z;

  if (debugMode) {
    if (p2.equals(prevPoint)) { // continuing a line
      continueLine(line, debugMode);
    } else {
      //console.log('detected new line');
      geometry = new THREE.Geometry();
      var direction = camera.getWorldDirection();
      socket.emit('move_gaze', { gaze: direction } );
    }
  } else {
    if (newLine) {
      //console.log('detected new line');
      geometry = new THREE.Geometry();
      //TODO socket emit new starting pos?
      camera.updateMatrixWorld(); //???
      var direction = camera.getWorldDirection();
      console.log('direction: '+direction.x+' '+direction.y+' '+direction.z);
      socket.emit('move_gaze', { gaze: direction } );
    } else {
      continueLine(line, debugMode);
    }
  }
  prevPoint = p1;
}

function continueLine(line, debugMode) {
  var material = new THREE.LineBasicMaterial({
    color: new THREE.Color( line[2] ),
    linewidth: ( line[3] ? line[3] : 5 )
  });
  var point = new THREE.Vector3();

  for (var i = 0; i < 2; i++) {
      point.x = line[i].x; 
      point.y = line[i].y;
      point.z = line[i].z;
      //console.log('point is '+point.x + ' ' + point.y + ' ' + point.z);
      geometry.vertices.push( point );
    }

    var scale_x = window.innerWidth / 10;
    var scale_y = window.innerHeight / 10;
    var scale_z = 1; // TODO

    points.push( geometry );
    materials.push(material);

    var line = new THREE.Line( geometry, material );
    if (debugMode) {
      line.scale.set(scale_x, scale_y, scale_z);
      line.rotateX(Math.PI);
      line.translateOnAxis(new THREE.Vector3(0, -1, 0), scale_y);     
    }
    scene.add(line);
}

