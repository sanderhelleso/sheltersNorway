'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// SMOOTH SCROLL
var SMOOTH_SCROLL_DURATION = 700;

$('.smooth-scroll').on('click', 'a', function () {
  var elAttr = $(this).attr('href');
  if ((typeof elAttr === 'undefined' ? 'undefined' : _typeof(elAttr)) !== (typeof undefined === 'undefined' ? 'undefined' : _typeof(undefined)) && elAttr.indexOf('#') == 0) {
    var offset = $(this).attr('data-offset') ? $(this).attr('data-offset') : 0;
    var setHash = $(this).closest('ul').attr('data-allow-hashes');
    $('body,html').animate({
      scrollTop: $(elAttr).offset().top - offset
    }, SMOOTH_SCROLL_DURATION);
    if ((typeof setHash === 'undefined' ? 'undefined' : _typeof(setHash)) !== (typeof undefined === 'undefined' ? 'undefined' : _typeof(undefined)) && setHash !== false) {
      history.replaceState(null, null, elAttr);
    }

    return false;
  }
});