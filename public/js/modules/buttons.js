'use strict';

(function ($) {
  $(document).ready(function () {

    // jQuery reverse
    $.fn.reverse = [].reverse;

    // Hover behaviour: make sure this doesn't work on .click-to-toggle FABs!
    $(document).on('mouseenter.fixedActionBtn', '.fixed-action-btn:not(.click-to-toggle)', function () {
      var $this = $(this);
      openFABMenu($this);
    });
    $(document).on('mouseleave.fixedActionBtn', '.fixed-action-btn:not(.click-to-toggle)', function () {
      var $this = $(this);
      closeFABMenu($this);
    });

    // Toggle-on-click behaviour.
    $(document).on('click.fixedActionBtn', '.fixed-action-btn.click-to-toggle > a', function () {
      var $this = $(this);
      var $menu = $this.parent();
      if ($menu.hasClass('active')) {
        closeFABMenu($menu);
      } else {
        openFABMenu($menu);
      }
    });
  });

  $.fn.extend({
    openFAB: function openFAB() {
      openFABMenu($(this));
    },
    closeFAB: function closeFAB() {
      closeFABMenu($(this));
    }
  });

  var openFABMenu = function openFABMenu(btn) {
    var $this = btn;
    if ($this.hasClass('active') === false) {

      // Get direction option
      var horizontal = $this.hasClass('horizontal');
      var offsetY = void 0,
          offsetX = void 0;

      if (horizontal === true) {
        offsetX = 40;
      } else {
        offsetY = 40;
      }

      $this.addClass('active');
      $this.find('ul .btn-floating').velocity({
        scaleY: '.4',
        scaleX: '.4',
        translateY: offsetY + 'px',
        translateX: offsetX + 'px'
      }, {
        duration: 0
      });

      var time = 0;
      $this.find('ul .btn-floating').reverse().each(function () {
        $(this).velocity({
          opacity: '1',
          scaleX: '1',
          scaleY: '1',
          translateY: '0',
          translateX: '0'
        }, {
          duration: 80,
          delay: time
        });
        time += 40;
      });
    }
  };

  var closeFABMenu = function closeFABMenu(btn) {
    $this = btn;
    // Get direction option
    var horizontal = $this.hasClass('horizontal');
    var offsetY = void 0,
        offsetX = void 0;

    if (horizontal === true) {
      offsetX = 40;
    } else {
      offsetY = 40;
    }

    $this.removeClass('active');
    var time = 0;
    $this.find('ul .btn-floating').velocity('stop', true);
    $this.find('ul .btn-floating').velocity({
      opacity: '0',
      scaleX: '.4',
      scaleY: '.4',
      translateY: offsetY + 'px',
      translateX: offsetX + 'px'
    }, {
      duration: 80
    });
  };

  $('.fixed-action-btn').on({
    click: function click(e) {
      e.preventDefault();
      toggleFABMenu($('.fixed-action-btn'));
      return false;
    }
  });

  function toggleFABMenu(btn) {

    $this = btn;
    if ($this.hasClass('active') === false) {
      $this.addClass('active');
      $this.find('ul .btn-floating').velocity({
        scaleY: '.4',
        scaleX: '.4',
        translateY: '40px'
      }, {
        duration: 0
      });

      var time = 0;
      $this.find('ul .btn-floating').reverse().each(function () {
        $(this).velocity({
          opacity: '1',
          scaleX: '1',
          scaleY: '1',
          translateY: '0'
        }, {
          duration: 80,
          delay: time
        });
        time += 40;
      });
    } else {
      $this.removeClass('active');
      var _time = 0;
      $this.find('ul .btn-floating').velocity('stop', true);
      $this.find('ul .btn-floating').velocity({
        opacity: '0',
        scaleX: '.4',
        scaleY: '.4',
        translateY: '40px'
      }, {
        duration: 80
      });
    }
  }
})(jQuery);