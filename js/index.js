var root = this;
var launchButton = document.getElementById( 'launch_button' );
var popupWindow = document.getElementById( 'popup_window' );
var ua = root.navigator.userAgent;

  	var has = {

    // Mobile Detection
    Android: !!ua.match(/Android/ig),
    Blackberry: !!ua.match(/BlackBerry/ig),
    iOS: !!ua.match(/iPhone|iPad|iPod/ig),
    OperaMini: !!ua.match(/Opera Mini/ig),
    Windows: !!ua.match(/IEMobile/ig),
    WebOS: !!ua.match(/webOS/ig),

    // Browser Detection
    Arora: !!ua.match(/Arora/ig),
    Chrome: !!ua.match(/Chrome/ig),
    Epiphany: !!ua.match(/Epiphany/ig),
    Firefox: !!ua.match(/Firefox/ig),
    InternetExplorer: !!ua.match(/MSIE/ig),
    Midori: !!ua.match(/Midori/ig),
    Opera: !!ua.match(/Opera/ig),
    Safari: !!ua.match(/Safari/ig),

    webgl: (function() { try { return !!window.WebGLRenderingContext && !!(document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('experimental-webgl')); } catch(e) { return false; } })(),

  	};

  	has.mobile = has.Android || has.Blackberry || has.iOS || has.OperaMini || has.Windows || has.WebOS;

  	root.has = has;



document.addEventListener('DOMContentLoaded', function() {

	var canRun = true;
	if (canRun) {
      if (!has.mobile) {
      	launchButton.addEventListener( 'click', onOpenPopupClicked, true );

      } else {
      	launchButton.addEventListener( 'click', onLaunchClicked, true );
      }
	}
});

function onLaunchClicked(ev) {
	console.log("hi");
  window.location = '/viewer.html';
}

function onOpenPopupClicked(ev) {
  ev.preventDefault();
  popupWindow.style.display = 'block';
}
  
function onClosePopupClicked(ev) {
  ev.preventDefault();
  popupWindow.style.display = 'none';
}

