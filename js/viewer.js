/***************** SOCKET CODE ******************/

var socket  = io.connect();

socket.on('draw_line', function (data) {
  var line = data.line;
    //console.log("receiving signal from drawing tool "+line);
  draw(line);
});

/***************** THREE JS ******************/

var camera, scene, renderer;
var scene2, renderer2;
var effect, controls;
var element, container;
var group;
var sides = 5;

var clock = new THREE.Clock();

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  container = document.getElementById('canvas');
  container.appendChild(element);

  scene = new THREE.Scene();

  // CSS3D Scene
  scene2 = new THREE.Scene();

// Renderer
  renderer2 = new THREE.CSS3DRenderer();
  renderer2.setSize(window.innerWidth, window.innerHeight);
  renderer2.domElement.style.position = 'absolute';
  renderer2.domElement.style.top = 0;
  document.body.appendChild(renderer2.domElement);
  //container.appendChild(renderer2.domElement);

renderer.domElement.style.zIndex  = 1;
//renderer2.domElement.appendChild( renderer.domElement );

  effect = new THREE.CardboardEffect(renderer);


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

  /** END OF AXES FOR TESTING **/

    /*** CSS3D ***/
  createMenu();

  window.addEventListener('resize', resize, false);
  setTimeout(resize, 1);

  //setInterval(render, 1000/30);

}

/*** CAROUSEL **/
function createMenu() {
  group = new THREE.Object3D();

  var height = 7;
  //var tz = Math.round( ( height / 2) / Math.tan( Math.PI / sides ) );
  var tz = (height / 2) / Math.tan( Math.PI / sides );
  console.log('r = '+tz);
  for (i = 0; i < sides; i++) {
    var deg = i * 360 / sides;
    var panelMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color("hsl(" + deg + ", 80%, 50%)"), side: THREE.DoubleSide, overdraw: 0.5 });
    var plane = new THREE.Mesh(new THREE.PlaneGeometry( 15, height ), panelMaterial);
    plane.overdraw = true;
    var angle = 2*Math.PI * i/sides;
    plane.rotation.x = -angle - (Math.PI/2);
    //plane.rotateX(-angle - (Math.PI/2));
    console.log(-angle - (Math.PI/2));
    //plane.position = new THREE.Vector3(0, tz*Math.cos(angle), tz*Math.sin(angle));
    //plane.translateY(tz*Math.sin(angle));
    //plane.translateZ(tz*Math.cos(-angle - (Math.PI/2)));
    //plane.translateOnAxis(new THREE.Vector3(0, 1, 0), tz*Math.cos(angle));
    //plane.translateOnAxis(new THREE.Vector3(0,0,-1), tz*Math.sin(angle));
    /*plane.translateZ( tz );
    plane.rotateX( 2 * Math.PI * i / sides );*/
    plane.translateZ( tz );
    console.log(plane.position);
    group.add(plane);
  }

  group.position.set(0, 0, 5);
  scene.add(group);

  // create the plane mesh
  /*var material = new THREE.MeshBasicMaterial();
  var geometry = new THREE.PlaneGeometry();
  var planeMesh= new THREE.Mesh( geometry, material );
  //planeMesh.scale_x = 0.01;
  //planeMesh.scale_y = 0.01;
  // add it to the WebGL scene
  scene.add(planeMesh);*/

  // create the dom Element
  /*var element = document.createElement( 'div' );
  element.innerHTML = 'Plain text inside a div.';
  element.style.width = "200px";
  element.style.height = "100px";
  element.style.color = "#fff";

  // create the object3d for this element
  var cssObject = new THREE.CSS3DObject( element );
  // we reference the same position and rotation 
  cssObject.position = planeMesh.position;
  cssObject.rotation = planeMesh.rotation;
  cssObject.scale.x = 0.2;
  cssObject.scale.y = 0.2;
  // add it to the css scene
  //scene2.add(cssObject);
  //console.log(renderer2);
  scene.add(cssObject);*/
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
  
  renderer2.render(scene2, camera); // comment out and text won't appear
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

/*********************** CAROUSEL UI ***********************/

  /*var onUpDown;
  var selectedIdx = -1;
  var rotating = false;
  var transformProp = Modernizr.prefixed('transform');

  var maxIdx = Object.size(buttons) - 1;

  function openSelected() {
    var i = 0;
    for (var name in window.buttons) {
      if (i == selectedIdx) {
        (window.buttons[name])();
        break;
      }
      i++;
    }
  }

  function upButton() {
    selectedIdx = ((selectedIdx <= 0) ? maxIdx : selectedIdx - 1);
    onUpDown(-1);
  }

  function downButton() {
    selectedIdx = ((selectedIdx == maxIdx) ? 0 : selectedIdx + 1);
    onUpDown(1);
  }

  function selectItemFromClicks(num) {
    var idx = num % (maxIdx + 1);
    for (var i = 0; i < idx; ++i) {
      downButton();
    }
  }

  function Carousel3D(el, offset) {
    this.element = el;

    this.rotation = 0;
    this.panelCount = this.element.children.length;
    this.theta = 0;
    this.offset = offset;
  }

  Carousel3D.prototype.modify = function () {

    var panel, angle, i;

    this.panelSize = this.element['offsetHeight'];
    this.theta = 360 / this.panelCount;

    // Figure out the carousel size in 3D space

    this.radius =
      Math.round(
        (this.panelSize / 2) / Math.tan(Math.PI / this.panelCount)
      );

    for (i = 0; i < this.panelCount; i++) {
      panel = this.element.children[i];
      angle = this.theta * -i;
      panel.style.opacity = 1;
      panel.style.backgroundColor =
        'hsla(' + angle + ', 100%, 20%, 0.8)';

      // Rotate panel, then push it out in 3D space

      panel.style[transformProp] =
        'rotateX(' + angle + 'deg) ' +
        'translateZ(' + this.radius + 'px)';
    }

    // Adjust rotation so panels are always flat

    this.rotation =
      Math.round(this.rotation / this.theta) * this.theta;

    this.transform();
  };

  Carousel3D.prototype.transform = function () {

    // Push the carousel back in 3D space, and rotate it

    this.element.style[transformProp] =
      'translateZ(-' + this.radius + 'px) ' +
      'rotateX(' + this.rotation + 'deg) ' +
      'rotateY(' + this.offset + 'deg)';
  };

  function highlightFrontPanel(carousel) {
    var kid, trans, idx, rot, num, front, angle;
    for (var name in carousel.element.children) {
      kid = carousel.element.children[name];
      if (kid.style) {
        trans = kid.style[transformProp];
        idx = trans.indexOf("rotateX(") + "rotateX(".length;
        rot = trans.substring(idx);
        num = parseFloat(rot);
        angle = Math.abs(carousel.rotation + num) % 360.0;
        front = (angle < 5 || angle > 355);
        kid.style.color =
          front ? "rgb(255, 255, 255)" : "rgb(34, 34, 34)";
      }
    }
  }

  var init = function () {

    // Populate our initial UI with a set of buttons, one for each
    // function in the Buttons object

    var panel1 = document.getElementById('cont1');
    var panel2 = document.getElementById('cont2');

    var div1 = document.createElement('div');
    div1.setAttribute('id', 'carousel1');
    div1.setAttribute(
      'style',
      'transform: translateZ(-442px) rotateX(-360deg) rotateY(0deg);'
    );

    var div2 = document.createElement('div');
    div2.setAttribute('id', 'carousel2');
    div2.setAttribute(
      'style',
      'transform: translateZ(-442px) rotateX(-360deg) rotateY(0deg);'
    );

    panel1.appendChild(div1);
    panel2.appendChild(div2);

    var i = 0;
    for (var name in window.buttons) {
      var fn = window.buttons[name];
  
      var fig1 = document.createElement('figure');
      fig1.setAttribute(
        'style',
        "opacity: 1; transform: rotateX(" +
        (i * 18) + "deg) translateZ(442px); " +
        "color: #222;"
      );
  
      fig1.innerHTML = name;
      fig1.onclick = (function (name) {
        return function () { name(); };
      })(fn);
  
      div1.appendChild(fig1);
  
      var fig2 = document.createElement('figure');
      fig2.setAttribute(
        'style',
        "opacity: 1; transform: rotateX(" +
        (i * 18) + "deg) translateZ(442px); " +
        "color: #222;"
      );

      fig2.innerHTML = name;
      fig2.onclick = (function (name) {
        return function () { name(); };
      })(fn);

      div2.appendChild(fig2);

      i = i + 1;
    }

    var car1 = new Carousel3D(div1, -0.5),
        car2 = new Carousel3D(div2, 0.5);
    highlightCarouselPanels = function() {
      highlightFrontPanel(car1);
      highlightFrontPanel(car2);
    },
    onUpDown = function (inc) {
      car1.rotation += car1.theta * inc;
      car1.transform();
      car2.rotation += car2.theta * inc;
      car2.transform();
      highlightCarouselPanels();
    };

    car1.modify();
    car2.modify();
    
    setTimeout(function () {
      document.body.addClassName('ready');
    }, 0);

    setTimeout(function () {
      highlightCarouselPanels();
    }, 1000);
  };

  window.addEventListener('DOMContentLoaded', init, false);*/

