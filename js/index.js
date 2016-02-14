var root = this;
var ua = root.navigator.userAgent;
var landingPage = document.getElementById( 'landing_page' );
var launchCanvasButton = document.getElementById( 'canvas_button' );
var launchDrawButton = document.getElementById( 'draw_button' );
var popupWindow = document.getElementById( 'popup_window' );
var popupCloseButton = document.getElementById( 'popup_close_button' );
var tryAnywayLink = document.getElementById( 'try_anyway' );

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

	if (has.mobile) {
        landingPage.className += ' mobile';
	} else {
		landingPage.className += ' desktop';
	}

	var canRun = true;
	if (canRun) {
      if (!has.mobile) {
      	launchCanvasButton.addEventListener( 'click', onOpenPopupClicked, true );
      	popupCloseButton.addEventListener( 'click', onClosePopupClicked, true );
        tryAnywayLink.addEventListener( 'click', onLaunchCanvasClicked, true );
      } else {
      	launchCanvasButton.addEventListener( 'click', onLaunchCanvasClicked, true );
      }
      launchDrawButton.addEventListener( 'click', onLaunchDrawClicked, true);
	}
});

function onLaunchCanvasClicked(ev) {
	console.log("launching canvas");
  window.location = '/viewer.html';
}

function onLaunchDrawClicked(ev) {
	console.log("launching drawing tool");
  window.location = '/draw.html';
}

function onOpenPopupClicked(ev) {
  ev.preventDefault();
  popupWindow.style.display = 'block';
}
  
function onClosePopupClicked(ev) {
  ev.preventDefault();
  popupWindow.style.display = 'none';
}

