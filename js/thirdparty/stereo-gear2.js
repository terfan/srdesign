var viewerLeft, viewerRight;
var updatingLeft = false, updatingRight = false;
var leftLoaded, rightLoaded, cleanedModel;
var leftPos, baseDir, upVector, initLeftPos;
var initZoom;
var expFac = 0, exp = 0;
var targExp = 0.5, xfac = 0.05, zfac = 0.3;
var direction = true;
var deg2rad = Math.PI / 180;
var wasFlipped;

Object.size = function (obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

var buttons = {
  'Color': function () {
    // TODO: color
    console.log("color menu item clicked");
  },
  'Brush': function () {
    // TODO: thickness and brush styles
    console.log("brush menu item clicked");
  },
  'Exit': function () {
    // TODO: show warning message and/or option to save?
    window.history.back();
  }
}

function highlightButton(idx) {
  changeButtonStyle(idx, true);
}

function unhighlightButton(idx) {
  changeButtonStyle(idx, false);
}

function changeButtonStyle(idx, highlight) {
  var ids = idx.toString();
  var button1 = document.getElementById('button-1-' + ids);
  var button2 = document.getElementById('button-2-' + ids);
  var oldStyle = highlight ? 'cmd-btn' : 'cmd-hover';
  var newStyle = highlight ? 'cmd-hover' : 'cmd-btn';
  if (button1) {    
    button1.classList.remove(oldStyle);
    button1.classList.add(newStyle);
  }
  if (button2) {
    button2.classList.remove(oldStyle);
    button2.classList.add(newStyle);
  }
}

var commands = {
  'down': function () {
    downButton();
  },
  'up': function () {
    upButton();
  },
  'open': function () {
    openSelected();
  },
  'explode': function () {
    if (checkViewers()) {
      expFac = expFac + 1;
      explode(true);
    }
  },
  'combine': function () {
    if (checkViewers()) {
      if (expFac > 0) {
        expFac = expFac - 1;
        explode(false);
      }
    }
  },
  'in': function () {
    if (checkViewers()) {
      zoomInwards(-zfac);
    }
  },
  'out': function () {
    if (checkViewers()) {
      zoomInwards(zfac);
    }
  },
  'reset': function () {
    if (checkViewers()) {
      expFac = 0;
      explode(false);

      if (initLeftPos) {
        var trg = viewerLeft.navigation.getTarget();
        var up = viewerLeft.navigation.getCameraUpVector();

        leftPos = initLeftPos.clone();
        zoom(viewerLeft, initLeftPos, trg, up);
      }
    }
  },
  'reload': function () {
    location.reload();
  },
  'front': function () {
    if (checkViewers()) {
      zoomToCube('front');
    }
  },
  'back': function () {
    if (checkViewers()) {
      zoomToCube('back');
    }
  },
  'top': function () {
    if (checkViewers()) {
      zoomToCube('top');
    }
  },
  'bottom': function () {
    if (checkViewers()) {
      zoomToCube('bottom');
    }
  },
  'left': function () {
    if (checkViewers()) {
      zoomToCube('left');
    }
  },
  'right': function () {
    if (checkViewers()) {
      zoomToCube('right');
    }
  }
};

var faces = {
  'front': new THREE.Vector3(0, 0, 1),
  'back': new THREE.Vector3(0, 0, -1),
  'top': new THREE.Vector3(0, 1, 0),
  'bottom': new THREE.Vector3(0, -1, 0),
  'left': new THREE.Vector3(-1, 0, 0),
  'right': new THREE.Vector3(1, 0, 0)
};

var faceUps = {
  'top': new THREE.Vector3(0, 1, 0),
  'bottom': new THREE.Vector3(0, 1, 0)
};

function initialize() {

  // speech recognition
  /*if (annyang) {

    // Add our buttons and commands to annyang

    annyang.addCommands(buttons);
    annyang.addCommands(commands);

    // Start listening

    //annyang.debug(true);
    annyang.start({ autoRestart: true, continuous: true });
  }*/

  watchTilt();
}

function checkViewers() {
  if (viewerLeft && viewerRight)
    return viewerLeft.running && viewerRight.running;
  return false;
}


// Progress listener to set the view once the data has started
// loading properly (we get a 5% notification early on that we
// need to ignore - it comes too soon)

function progressListener(e) {

  // If we haven't cleaned this model's materials and set the view
  // and both viewers are sufficiently ready, then go ahead

  if (!cleanedModel &&
    ((e.percent > 0.1 && e.percent < 5) || e.percent > 5)) {

    if (e.target.clientContainer.id === 'viewLeft')
      leftLoaded = true;
    else if (e.target.clientContainer.id === 'viewRight')
      rightLoaded = true;

    if (leftLoaded && rightLoaded && !cleanedModel) {

      if (initZoom) {

        // Iterate the materials to change any red ones to grey

        // (We only need this for the Morgan model, which has
        // translation issues from Fusion 360... which is also
        // the only model to provide an initial zoom function)

        for (var p in viewerLeft.impl.matman().materials) {
          var m = viewerLeft.impl.matman().materials[p];
          if (m.color.r >= 0.5 && m.color.g == 0 && m.color.b == 0) {
            m.color.r = m.color.g = m.color.b = 0.5;
            m.needsUpdate = true;
          }
        }
        for (var p in viewerRight.impl.matman().materials) {
          var m = viewerRight.impl.matman().materials[p];
          if (m.color.r >= 0.5 && m.color.g == 0 && m.color.b == 0) {
            m.color.r = m.color.g = m.color.b = 0.5;
            m.needsUpdate = true;
          }
        }

        // If provided, use the "initial zoom" function

        initZoom();
      }

      setTimeout(
        function () {
          initLeftPos = viewerLeft.navigation.getPosition();

          transferCameras(true);
        },
        500
      );

      cleanedModel = true;
    }
  }
  else if (cleanedModel && e.percent > 10) {

    // If we have already cleaned and are even further loaded,
    // remove the progress listeners from the two viewers and
    // watch the cameras for updates

    unwatchProgress();

    watchCameras();
  }
}

function requestFullscreen() {

  // Must be performed from a UI event handler

  var el = document.documentElement;
  if (el.requestFullScreen)
    el.requestFullScreen();
  else if (el.mozRequestFullScreen)
    el.mozRequestFullScreen();
  else if (el.webkitRequestFullScreen)
    el.webkitRequestFullScreen();
  else if (el.msRequestFullscreen)
    el.msRequestFullscreen();
}

// Add and remove the pre-viewer event handlers

function watchCameras() {
  viewerLeft.addEventListener('cameraChanged', left2right);
  viewerRight.addEventListener('cameraChanged', right2left);
}

function unwatchCameras() {
  viewerLeft.removeEventListener('cameraChanged', left2right);
  viewerRight.removeEventListener('cameraChanged', right2left);
}

function unwatchProgress() {
  viewerLeft.removeEventListener('progress', progressListener);
  viewerRight.removeEventListener('progress', progressListener);
}

function watchTilt() {
  if (window.DeviceOrientationEvent)
    window.addEventListener('deviceorientation', orb);
}

// Event handlers for the cameraChanged events

function left2right() {
  if (!updatingRight) {
    updatingLeft = true;
    transferCameras(true);
    setTimeout(function () { updatingLeft = false; }, 500);
  }
}

function right2left() {
  if (!updatingLeft) {
    updatingRight = true;
    transferCameras(false);
    setTimeout(function () { updatingRight = false; }, 500);
  }
}

// And for the deviceorientation event

function orb(e) {

  if (e.alpha && e.gamma) {


    // Remove our handlers watching for camera updates,
    // as we'll make any changes manually
    // (we won't actually bother adding them back, afterwards,
    // as this means we're in mobile mode and probably inside
    // a Google Cardboard holder)

    if (checkViewers()) {
      unwatchCameras();
    }

    // gamma is the front-to-back in degrees (with
    // this screen orientation) with +90/-90 being
    // vertical and negative numbers being 'downwards'
    // with positive being 'upwards'

    var ab = Math.abs(e.beta);
    var flipped =
      (ab < 90 && e.gamma < 0) || (ab > 90 && e.gamma > 0);
    var vert =
      ((flipped ? e.gamma : -e.gamma) + (ab < 90 ? 90 : -90))
      * deg2rad;

    // When the orientation changes, reset the base direction

    if (wasFlipped != flipped) {

      // If the angle goes below/above the horizontal, we don't
      // flip direction (we let it go a bit further)

      if (Math.abs(e.gamma) < 45) {
        flipped = wasFlipped;
      }
      else {

        // Our base direction allows us to make relative horizontal
        // rotations when we rotate left & right

        wasFlipped = flipped;
        baseDir = e.alpha;
      }
    }
    // alpha is the compass direction the device is
    // facing in degrees. This equates to the
    // left - right rotation in landscape
    // orientation (with 0-360 degrees)

    var horiz = (e.alpha - baseDir) * deg2rad;

    /*
    var h = (e.alpha - baseDir);
    var v =
      ((flipped ? e.gamma : -e.gamma) + (ab < 90 ? 90 : -90));
    function round(x) { return Math.round(x * 100) / 100; }
    console.log(
      'A:' + round(e.alpha) +
      ' B: ' + round(e.beta) +
      ' G: ' + round(e.gamma) +
      ' V:' + round(v) +
      ' H:' + round(h) +
      ' F:' + flipped
    );
    */

    if (checkViewers()) {

      orbitViews(vert, horiz);
    }
    else {
      console.debug("Vert: " + vert + " Horiz: " + horiz);
      if (window.upButton && window.downButton) {
        if ((vert > 0.2 || vert < -0.1) && !rotating) {
          rotating = true;
          if (vert > 0.2) {
            window.upButton();
            if (vert > 0.5) {
              window.upButton();
            }
          }
          else {
            window.downButton();
            if (vert < -0.5) {
              window.downButton();
            }
          }
          setTimeout(function () { rotating = false; }, 1000);
        }
      }
    }
  }
}

function transferCameras(leftToRight) {

  // The direction argument dictates the source and target

  var source = leftToRight ? viewerLeft : viewerRight;
  var target = leftToRight ? viewerRight : viewerLeft;

  var pos = source.navigation.getPosition();
  var trg = source.navigation.getTarget();

  // Set the up vector manually for both cameras

  source.navigation.setWorldUpVector(upVector);
  target.navigation.setWorldUpVector(upVector);

  // Get the new position for the target camera

  var up = source.navigation.getCameraUpVector();

  // Get the position of the target camera

  var newPos = offsetCameraPos(source, pos, trg, leftToRight);

  // Save the left-hand camera position: device tilt orbits
  // will be relative to this point

  leftPos = leftToRight ? pos : newPos;

  // Zoom to the new camera position in the target

  zoom(target, newPos, trg, up);
}

function getDistance(v1, v2) {

  var diff = v1.clone().sub(v2);
  return diff.length();
}

function offsetCameraPos(source, pos, trg, leftToRight) {

  // Use a small fraction of the distance for the camera offset

  var disp = getDistance(pos, trg) * 0.04;

  // Clone the camera and return its X translated position

  var clone = source.autocamCamera.clone();
  clone.translateX(leftToRight ? disp : -disp);
  return clone.position;
}

function orbitViews(vert, horiz) {

  if (!leftPos)
    return;

  // We'll rotate our position based on the initial position
  // and the target will stay the same

  var pos = leftPos.clone();
  var trg = viewerLeft.navigation.getTarget();

  // Start by applying the left/right orbit
  // (we need to check the up/down value, though)

  if (vert < 0)
    horiz = horiz + Math.PI;

  var zAxis = upVector.clone();
  pos.applyAxisAngle(zAxis, horiz);

  // Now add the up/down rotation

  var axis = trg.clone().sub(pos).normalize();
  axis.cross(zAxis);
  pos.applyAxisAngle(axis, -vert);

  // Determine the camera up vector: this is important if
  // getting to the extremities, to stop direction flipping

  var camUp = pos.clone().sub(trg).normalize();
  camUp.cross(axis).normalize();
  viewerLeft.navigation.setCameraUpVector(camUp);

  // Zoom in with the lefthand view

  zoom(viewerLeft, pos, trg, camUp);

  // Get a camera slightly to the right

  var pos2 = offsetCameraPos(viewerLeft, pos, trg, true);

  // And zoom in with that on the righthand view, too

  zoom(viewerRight, pos2, trg, camUp);
}

function explode(outwards) {

  if (outwards != direction)
    direction = outwards;

  setTimeout(
    function () {
      exp = exp + (direction ? xfac : -xfac);
      setTimeout(function () { viewerLeft.explode(exp); }, 0);
      setTimeout(function () { viewerRight.explode(exp); }, 0);
      if ((direction && exp < targExp * expFac) ||
        (!direction && exp > targExp * expFac))
        explode(direction);
    },
    50
  );
}

function zoomAlongCameraDirection(viewer, factor) {

  var pos = leftPos.clone();
  var trg = viewer.navigation.getTarget();

  var disp = trg.clone().sub(pos).multiplyScalar(factor);
  pos.sub(disp);

  return pos;
}

function zoomInwards(factor) {

  leftPos = zoomAlongCameraDirection(viewerLeft, factor);
  if (!baseDir) {
    orbitViews(0, 0);
  }
}

function zoomToCube(face) {

  var trg = viewerLeft.navigation.getTarget();
  var dist = getDistance(leftPos, trg);

  var pos = faces[face].clone().multiplyScalar(dist);
  var up = faceUps[face];
  zoom(viewerLeft, pos, trg, up);

  transferCameras(true);
  baseDir = null;
}

// Set the camera based on a position, target and optional up vector

function zoom(viewer, pos, trg, up) {

  // Make sure our up vector is correct for this model

  viewer.navigation.setWorldUpVector(upVector, true);

  viewer.navigation.setView(pos, trg);

  if (up) {
    viewer.navigation.setCameraUpVector(up);
  }
}