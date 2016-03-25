/***************** SOCKET CODE ******************/

var socket  = io.connect();

socket.on('draw_line', function (data) {
  var line = data.line;
    //console.log("receiving signal from drawing tool "+line);
  draw(line);
});

/***************** THREE JS ******************/

var camera, scene, renderer;
var effect, controls;
var element, container;

var clock = new THREE.Clock();

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  container = document.getElementById('canvas');
  container.appendChild(element);

  effect = new THREE.CardboardEffect(renderer);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
  camera.position.set(20, 20, 40); // TODO: play around with camera stuff
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
  scene.add(mesh);

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

  /** END OF AXES FOR TESTING **/

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
}

/***************** DRAW ******************/

var points = [];
var materials = [];
var geometry = new THREE.Geometry();
var prevPoint = new THREE.Vector3();

function draw(line) {
  var material = new THREE.LineBasicMaterial({
    color: new THREE.Color( line[2] ),
    linewidth: 5
  });

  var point = new THREE.Vector3();

  var p1 = new THREE.Vector3();
  p1.x = line[0].x;
  p1.y = line[0].y;
  p1.z = line[0].z;
  var p2 = new THREE.Vector3();
  p2.x = line[1].x;
  p2.y = line[1].y;
  p2.z = line[1].z;

  if (p2.equals(prevPoint)) { // continuing a line

    for (var i = 0; i < 2; i++) {
      point.x = line[i].x; 
      point.y = line[i].y;
      point.z = 0;
      geometry.vertices.push( point );
    }

    var scale_x = window.innerWidth / 10;
    var scale_y = window.innerHeight / 10;
    var scale_z = 1; // TODO

    points.push( geometry );

    materials.push(material);
    //console.log('LOOK HERE '+points.length);
    /*for (var i = 0; i < points.length; i++) {
    var line = new THREE.Line( points[i], materials[i] );*/
    var line = new THREE.Line( geometry, material );
    line.scale.set(scale_x, scale_y, scale_z);
    line.rotateX(Math.PI);
    line.translateOnAxis(new THREE.Vector3(0, -1, 0), scale_y);
    scene.add(line);
    //console.log("added a line");
    //}
    //render();
  }
  else {
    console.log('detected new line');
    geometry = new THREE.Geometry();
  }

  prevPoint = p1;
}
