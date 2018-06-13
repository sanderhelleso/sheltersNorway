'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* SideNav */
(function ($) {

  var MENU_WIDTH = 240;
  var SN_BREAKPOINT = 1440;
  var MENU_WIDTH_HALF = 2;
  var MENU_LEFT_MIN_BORDER = 0.3;
  var MENU_LEFT_MAX_BORDER = -0.5;
  var MENU_RIGHT_MIN_BORDER = -0.3;
  var MENU_RIGHT_MAX_BORDER = 0.5;
  var MENU_VELOCITY_OFFSET = 10;

  var SideNav = function () {
    function SideNav(element, options) {
      var _this = this;

      _classCallCheck(this, SideNav);

      var menuOut = false;

      var defaults = {
        MENU_WIDTH: MENU_WIDTH,
        edge: 'left',
        closeOnClick: false
      };

      options = $.extend(defaults, options);

      this.options = options;

      var $element = element;
      this.menu_id = $('#' + $element.attr('data-activates'));
      var mask_id = $('#' + this.menu_id.attr('id') + '> .sidenav-bg');

      // let menuOut = false;

      if (options.MENU_WIDTH !== MENU_WIDTH) {
        this.menu_id.css('width', options.MENU_WIDTH);
        mask_id.css('width', options.MENU_WIDTH);
      }

      var dragTarget = $('<div class="drag-target"></div>');
      $('body').append(dragTarget);

      if (options.edge === 'left') {
        this.menu_id.css('transform', 'translateX(-100%)');
        dragTarget.css({
          left: 0
        });
      } else {
        this.menu_id.addClass('right-aligned').css('transform', 'translateX(100%)');
        dragTarget.css({
          right: 0
        });
      }

      if (this.menu_id.hasClass('fixed')) {

        if (window.innerWidth > SN_BREAKPOINT) {
          this.menu_id.css('transform', 'translateX(0)');
        }

        $(window).resize(function () {
          if (window.innerWidth > SN_BREAKPOINT) {
            if ($('#sidenav-overlay').length) {
              _this.removeMenu(true);
            } else {
              _this.menu_id.css('transform', 'translateX(0%)');
            }
          } else if (menuOut === false) {
            if (options.edge === 'left') {
              _this.menu_id.css('transform', 'translateX(-100%)');
            } else {
              _this.menu_id.css('transform', 'translateX(100%)');
            }
          }
        });
      }

      if (this.options.closeOnClick === true) {
        this.menu_id.on('click', 'a:not(.collapsible-header)', function () {
          _this.removeMenu();
        });
      }

      $element.click(function (e) {
        e.preventDefault();
        if (menuOut === true) {
          menuOut = false;
          _this.removeMenu();
        } else {
          var $body = $('body');
          var overlay = $('<div id="sidenav-overlay"></div>');
          $body.append(overlay);

          if (_this.options.edge === 'left') {
            _this.menu_id.velocity({
              translateX: [0, -1 * options.MENU_WIDTH]
            }, {
              duration: 300,
              queue: false,
              easing: 'easeOutQuad'
            });
          } else {
            _this.menu_id.velocity({
              translateX: [0, options.MENU_WIDTH]
            }, {
              duration: 300,
              queue: false,
              easing: 'easeOutQuad'
            });
          }

          overlay.click(function () {
            _this.removeMenu();
          });
        }
      });

      // Touch Event
      dragTarget.click(function () {
        _this.removeMenu();
      });

      dragTarget.hammer({
        prevent_default: false
      }).bind('pan', function (e) {

        if (e.gesture.pointerType === 'touch') {

          var x = e.gesture.center.x;

          // Disable Scrolling
          var $body = $('body');
          var oldWidth = $body.innerWidth();
          $body.css('overflow', 'hidden');
          $body.width(oldWidth);

          // If overlay does not exist, create one and if it is clicked, close menu
          if ($('#sidenav-overlay').length === 0) {
            var overlay = $('<div id="sidenav-overlay"></div>');
            overlay.css('opacity', 0).click(function () {
              _this.removeMenu();
            });
            $('body').append(overlay);
          }

          // Keep within boundaries
          if (options.edge === 'left') {
            if (x > options.MENU_WIDTH) {
              x = options.MENU_WIDTH;
            } else if (x < 0) {
              x = 0;
            }
          }

          if (options.edge === 'left') {
            // Left Direction
            if (x < options.MENU_WIDTH / MENU_WIDTH_HALF) {
              menuOut = false;
            }
            // Right Direction
            else if (x >= options.MENU_WIDTH / MENU_WIDTH_HALF) {
                menuOut = true;
              }
            _this.menu_id.css('transform', 'translateX(' + (x - options.MENU_WIDTH) + 'px)');
          } else {
            // Left Direction
            if (x < window.innerWidth - options.MENU_WIDTH / MENU_WIDTH_HALF) {
              menuOut = true;
            }
            // Right Direction
            else if (x >= window.innerWidth - options.MENU_WIDTH / MENU_WIDTH_HALF) {
                menuOut = false;
              }
            var rightPos = x - options.MENU_WIDTH / MENU_WIDTH_HALF;
            if (rightPos < 0) {
              rightPos = 0;
            }

            _this.menu_id.css('transform', 'translateX(' + rightPos + 'px)');
          }

          // Percentage overlay
          var overlayPerc = void 0;
          if (options.edge === 'left') {
            overlayPerc = x / options.MENU_WIDTH;
            $('#sidenav-overlay').velocity({
              opacity: overlayPerc
            }, {
              duration: 10,
              queue: false,
              easing: 'easeOutQuad'
            });
          } else {
            overlayPerc = Math.abs((x - window.innerWidth) / options.MENU_WIDTH);
            $('#sidenav-overlay').velocity({
              opacity: overlayPerc
            }, {
              duration: 10,
              queue: false,
              easing: 'easeOutQuad'
            });
          }
        }
      }).bind('panend', function (e) {

        if (e.gesture.pointerType === 'touch') {
          var velocityX = e.gesture.velocityX;
          var x = e.gesture.center.x;
          var leftPos = x - options.MENU_WIDTH;
          var rightPos = x - options.MENU_WIDTH / MENU_WIDTH_HALF;
          if (leftPos > 0) {
            leftPos = 0;
          }
          if (rightPos < 0) {
            rightPos = 0;
          }
          // panning = false;

          if (options.edge === 'left') {
            // If velocityX <= 0.3 then the user is flinging the menu closed so ignore menuOut
            if (menuOut && velocityX <= MENU_LEFT_MIN_BORDER || velocityX < MENU_LEFT_MAX_BORDER) {
              if (leftPos !== 0) {
                _this.menu_id.velocity({
                  translateX: [0, leftPos]
                }, {
                  duration: 300,
                  queue: false,
                  easing: 'easeOutQuad'
                });
              }

              // menu_id.css({'translateX': 0});
              $('#sidenav-overlay').velocity({
                opacity: 1
              }, {
                duration: 50,
                queue: false,
                easing: 'easeOutQuad'
              });
              // dragTarget.css({width: '50%', right: 0, left: ''});
              dragTarget.css({
                width: '10px',
                right: '',
                left: 0
              });
            } else if (!menuOut || velocityX > MENU_LEFT_MIN_BORDER) {
              // Enable Scrolling
              $('body').css({
                overflow: '',
                width: ''
              });
              // Slide menu closed
              _this.menu_id.velocity({
                translateX: [-1 * options.MENU_WIDTH - MENU_VELOCITY_OFFSET, leftPos]
              }, {
                duration: 200,
                queue: false,
                easing: 'easeOutQuad'
              });
              $('#sidenav-overlay').velocity({
                opacity: 0
              }, {
                duration: 200,
                queue: false,
                easing: 'easeOutQuad',
                complete: function complete() {
                  $(this).remove();
                }
              });
              // dragTarget.css({width: '50%', right: 0, left: ''});
              dragTarget.css({
                width: '10px',
                right: '',
                left: 0
              });
            }
          } else if (menuOut && velocityX >= MENU_RIGHT_MIN_BORDER || velocityX > MENU_RIGHT_MAX_BORDER) {

            _this.menu_id.velocity({
              translateX: [0, rightPos]
            }, {
              duration: 300,
              queue: false,
              easing: 'easeOutQuad'
            });
            $('#sidenav-overlay').velocity({
              opacity: 1
            }, {
              duration: 50,
              queue: false,
              easing: 'easeOutQuad'
            });
            dragTarget.css({
              width: '50%',
              right: '',
              left: 0
            });
          } else if (!menuOut || velocityX < MENU_RIGHT_MIN_BORDER) {
            // Enable Scrolling
            $('body').css({
              overflow: '',
              width: ''
            });

            // Slide menu closed
            _this.menu_id.velocity({
              translateX: [options.MENU_WIDTH + MENU_VELOCITY_OFFSET, rightPos]
            }, {
              duration: 200,
              queue: false,
              easing: 'easeOutQuad'
            });
            $('#sidenav-overlay').velocity({
              opacity: 0
            }, {
              duration: 200,
              queue: false,
              easing: 'easeOutQuad',
              complete: function complete() {
                $(_this).remove();
              }
            });
            dragTarget.css({
              width: '10px',
              right: 0,
              left: ''
            });
          }
        }
      });
    }

    _createClass(SideNav, [{
      key: 'removeMenu',
      value: function removeMenu(restoreMenu) {
        var _this2 = this;

        $('body').css({
          overflow: '',
          width: ''
        });

        if (this.options.edge === 'left') {
          this.menu_id.velocity({
            translateX: '-100%'
          }, {
            duration: 200,
            queue: false,
            easing: 'easeOutCubic',
            complete: function complete() {
              if (restoreMenu === true) {
                _this2.menu_id.removeAttr('style');
                _this2.menu_id.css('width', _this2.options.MENU_WIDTH);
              }
            }
          });
        } else {
          this.menu_id.velocity({
            translateX: '100%'
          }, {
            duration: 200,
            queue: false,
            easing: 'easeOutCubic',
            complete: function complete() {
              if (restoreMenu === true) {
                _this2.menu_id.removeAttr('style');
                _this2.menu_id.css('width', _this2.options.MENU_WIDTH);
              }
            }
          });
        }

        $('#sidenav-overlay').velocity({
          opacity: 0
        }, {
          duration: 200,
          queue: false,
          easing: 'easeOutQuad',
          complete: function complete() {
            $('#sidenav-overlay').remove();
          }
        });
      }
    }, {
      key: 'show',
      value: function show() {
        this.trigger('click');
      }
    }, {
      key: 'hide',
      value: function hide() {
        $('#sidenav-overlay').trigger('click');
      }
    }]);

    return SideNav;
  }();

  $.fn.sideNav = function (options) {
    return this.each(function () {
      new SideNav($(this), options);
    });
  };
})(jQuery);