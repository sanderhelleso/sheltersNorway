'use strict';

// Preloading script

$(document).ready(function () {
  $('#preloader-markup').load('mdb-addons/preloader.html', function () {
    $(window).on('load', function () {
      $('#mdb-preloader').fadeOut('slow');
    });
  });
});