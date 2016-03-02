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
//animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  container = document.getElementById('canvas');
  container.appendChild(element);

  effect = new THREE.StereoEffect(renderer);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
  camera.position.set(0, 10, 5);
  scene.add(camera);

  controls = new THREE.OrbitControls(camera, element);
  controls.rotateUp(Math.PI / 4);
  controls.target.set(
    camera.position.x + 0.1,
    camera.position.y,
    camera.position.z
    );
  controls.noZoom = true;
  controls.noPan = true;

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

  window.addEventListener('resize', resize, false);
  setTimeout(resize, 1);

  setInterval(render, 1000/30);
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
  geometry.verticesNeedUpdate = true;

    var material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 3
  });
  for (var i = 0; i < points.length; i++) {
    var line = new THREE.Line( geometry, material );
    scene.add(line);
  }
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
var geometry = new THREE.Geometry();

function draw(line) {
  var color = '0x' + line[2].substring(1); // reformat color to be in correct format for three.js

  var material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 3
  });

  var point = new THREE.Vector3();
/*geometry.vertices.push(
  new THREE.Vector3( 0, 0, 0 )
);*/
  for (var i = 0; i < 2; i++) {
    point.x = line[i].x * 10; // note: window.innerWidth and innerHeight are too big to scale by...
    point.y = line[i].y * 10;
    point.z = 0;

    console.log("added point at "+point.x + " "+point.y + " "+point.z);

    geometry.vertices.push( point );
  }

  //var line = new THREE.Line( geometry, material );
  //scene.add(line);
  points.push(geometry);
  render();
}
