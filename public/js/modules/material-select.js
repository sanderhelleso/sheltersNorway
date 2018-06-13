'use strict';

(function ($) {

  $.fn.material_select = function (callback) {
    $(this).each(function () {
      var $select = $(this);

      if ($select.hasClass('browser-default')) {
        return; // Continue to next (return false breaks out of entire loop)
      }

      var multiple = Boolean($select.attr('multiple')),
          lastID = $select.data('select-id'); // Tear down structure if Select needs to be rebuilt

      if (lastID) {
        $select.parent().find('span.caret').remove();
        $select.parent().find('input').remove();

        $select.unwrap();
        $('ul#select-options-' + lastID).remove();
      }

      // If destroying the select, remove the selelct-id and reset it to it's uninitialized state.
      if (callback === 'destroy') {
        $select.data('select-id', null).removeClass('initialized');
        return;
      }

      var uniqueID = guid(); // Materialize.guid();
      $select.data('select-id', uniqueID);
      var wrapper = $('<div class="select-wrapper"></div>');
      wrapper.addClass($select.attr('class'));
      var options = $('<ul id="select-options-' + uniqueID + '" class="dropdown-content select-dropdown ' + (multiple ? 'multiple-select-dropdown' : '') + '"></ul>'),
          selectChildren = $select.children('option, optgroup'),
          valuesSelected = [],
          optionsHover = false;

      var label = $select.find('option:selected').html() || $select.find('option:first').html() || '';

      // Added to search
      var applySeachInList = function applySeachInList() {

        var ul = $(this).closest('ul');
        var searchValue = $(this).val();
        var options = ul.find('li').find('span.filtrable');

        options.each(function () {
          if (typeof this.outerHTML === 'string') {
            var liValue = this.textContent.toLowerCase();

            if (liValue.indexOf(searchValue.toLowerCase()) === -1) {
              $(this).hide();
              $(this).parent().hide();
            } else {
              $(this).show();
              $(this).parent().show();
            }
          }
        });
      };

      // Added to search
      var setSearchableOption = function setSearchableOption() {
        var placeholder = $select.attr('searchable');
        var element = $('<span class="search-wrap"><div class="md-form"><input type="text" class="search form-control" placeholder="' + placeholder + '"></div></span>');
        options.append(element);
        element.find('.search').keyup(applySeachInList);
      };

      // Added to search
      var searchable = Boolean($select.attr('searchable'));

      // Added to search
      if (searchable) {
        setSearchableOption();
      }

      // Function that renders and appends the option taking into
      // account type and possible image icon.
      var appendOptionWithIcon = function appendOptionWithIcon(select, option, type) {
        // Add disabled attr if disabled
        var disabledClass = option.is(':disabled') ? 'disabled ' : '';
        var optgroupClass = type === 'optgroup-option' ? 'optgroup-option ' : '';

        // add icons
        var icon_url = option.data('icon');
        var classes = option.attr('class');
        if (icon_url) {
          var classString = '';
          if (classes) {
            classString = ' class="' + classes + '"';
          }

          // Check for multiple type.
          if (type === 'multiple') {
            options.append($('<li class="' + disabledClass + '"><img alt="" src="' + icon_url + '"' + classString + '><span class="filtrable"><input type="checkbox"' + disabledClass + '/><label></label>' + option.html() + '</span></li>'));
          } else {
            options.append($('<li class="' + disabledClass + optgroupClass + '"><img alt="" src="' + icon_url + '"' + classString + '><span class="filtrable">' + option.html() + '</span></li>'));
          }
          return true;
        }

        // Check for multiple type.
        if (type === 'multiple') {
          options.append($('<li class="' + disabledClass + '"><span class="filtrable"><input type="checkbox"' + disabledClass + '/><label></label>' + option.html() + '</span></li>'));
        } else {
          options.append($('<li class="' + disabledClass + optgroupClass + '"><span class="filtrable">' + option.html() + '</span></li>'));
        }
      };

      /* Create dropdown structure. */
      if (selectChildren.length) {
        selectChildren.each(function () {
          if ($(this).is('option')) {
            // Direct descendant option.
            if (multiple) {
              appendOptionWithIcon($select, $(this), 'multiple');
            } else {
              appendOptionWithIcon($select, $(this));
            }
          } else if ($(this).is('optgroup')) {
            // Optgroup.
            var selectOptions = $(this).children('option');
            options.append($('<li class="optgroup"><span>' + $(this).attr('label') + '</span></li>'));

            selectOptions.each(function () {
              appendOptionWithIcon($select, $(this), 'optgroup-option');
            });
          }
        });
      }

      // Check for optgroups
      var optgroup = false;
      if ($select.find('optgroup').length) {
        optgroup = true;
      }

      // Added to save
      var saveSelect = $select.parent().find('button.btn-save');
      var setSaveOption = function setSaveOption() {
        options.append(saveSelect);
      };

      // Save click trigger
      if (saveSelect.length) {
        setSaveOption();
        saveSelect.on('click', function () {
          $('input.select-dropdown').trigger('close');
        });
      }

      options.find('li:not(.optgroup)').each(function (i) {
        $(this).click(function (e) {
          // Check if option element is disabled
          if (!$(this).hasClass('disabled') && !$(this).hasClass('optgroup')) {
            var selected = true;

            if (multiple) {
              $('input[type="checkbox"]', this).prop('checked', function (i, v) {
                return !v;
              });
              if (searchable) {
                if (optgroup) {
                  selected = toggleEntryFromArray(valuesSelected, $(this).index() - $(this).prevAll('.optgroup').length - 1, $select);
                } else {
                  selected = toggleEntryFromArray(valuesSelected, $(this).index() - 1, $select);
                }
              } else if (optgroup) {
                selected = toggleEntryFromArray(valuesSelected, $(this).index() - $(this).prevAll('.optgroup').length, $select);
              } else {
                selected = toggleEntryFromArray(valuesSelected, $(this).index(), $select);
              }
              $newSelect.trigger('focus');
            } else {
              options.find('li').removeClass('active');
              $(this).toggleClass('active');
              $newSelect.val($(this).text());
            }

            activateOption(options, $(this));
            $select.find('option').eq(i).prop('selected', selected);
            // Trigger onchange() event
            $select.trigger('change');
            if (typeof callback !== 'undefined') {
              callback();
            }
          }

          e.stopPropagation();
        });
      });

      // Wrap Elements
      $select.wrap(wrapper);
      // Add Select Display Element
      var dropdownIcon = $('<span class="caret">&#9660;</span>');
      if ($select.is(':disabled')) {
        dropdownIcon.addClass('disabled');
      }

      // escape double quotes
      var sanitizedLabelHtml = label.replace(/"/g, '&quot;');

      var $newSelect = $('<input type="text" class="select-dropdown" readonly="true" ' + ($select.is(':disabled') ? 'disabled' : '') + ' data-activates="select-options-' + uniqueID + '" value="' + sanitizedLabelHtml + '"/>');
      $select.before($newSelect);
      $newSelect.before(dropdownIcon);

      $newSelect.after(options);
      // Check if section element is disabled
      if (!$select.is(':disabled')) {
        $newSelect.dropdown({
          hover: false,
          closeOnClick: false
        });
      }

      // Copy tabindex
      if ($select.attr('tabindex')) {
        $($newSelect[0]).attr('tabindex', $select.attr('tabindex'));
      }

      $select.addClass('initialized');

      $newSelect.on({
        focus: function focus() {
          if ($('ul.select-dropdown').not(options[0]).is(':visible')) {
            $('input.select-dropdown').trigger('close');
          }
          if (!options.is(':visible')) {
            $(this).trigger('open', ['focus']);
            var _label = $(this).val();
            var selectedOption = options.find('li').filter(function () {
              return $(this).text().toLowerCase() === _label.toLowerCase();
            })[0];
            activateOption(options, selectedOption);
          }
        },
        click: function click(e) {
          e.stopPropagation();
        }
      });

      // Changed to search to treat search
      $newSelect.on('blur', function () {

        if (!multiple && !searchable) {
          $(this).trigger('close');
        }
        options.find('li.selected').removeClass('selected');
      });

      // Added to search
      if (!multiple && searchable) {
        options.find('li').on('click', function () {
          $newSelect.trigger('close');
        });
      }

      options.hover(function () {
        optionsHover = true;
      }, function () {
        optionsHover = false;
      });

      // if select is wrapped in modal prevent hiding
      options.on('mousedown', function (e) {
        if ($('.modal-content').find(options).length) {
          if (this.scrollHeight > this.offsetHeight) {
            e.preventDefault();
          }
        }
      });

      // Changed to search to treat search
      $(window).on({
        click: function click() {
          (multiple || searchable) && (optionsHover || $newSelect.trigger('close'));
        }
      });

      // Add initial multiple selections.
      if (multiple) {
        $select.find('option:selected:not(:disabled)').each(function () {
          var index = $(this).index();

          toggleEntryFromArray(valuesSelected, index, $select);
          options.find('li').eq(index).find(':checkbox').prop('checked', true);
        });
      }

      // Make option as selected and scroll to selected position
      var activateOption = function activateOption(collection, newOption) {
        if (newOption) {
          collection.find('li.selected').removeClass('selected');
          var option = $(newOption);
          option.addClass('selected');
          // commented because it causes problems in multiselect with many options
          // options.scrollTo(option)
        }
      };

      // Allow user to search by typing
      // this array is cleared after 1 second
      var filterQuery = [],
          onKeyDown = function onKeyDown(e) {
        // TAB - switch to another input
        if (e.which == 9) {
          $newSelect.trigger('close');
          return;
        }

        // ARROW DOWN WHEN SELECT IS CLOSED - open select options
        if (e.which == 40 && !options.is(':visible')) {
          $newSelect.trigger('open');
          return;
        }

        // ENTER WHEN SELECT IS CLOSED - submit form
        if (e.which == 13 && !options.is(':visible')) {
          return;
        }

        e.preventDefault();

        // CASE WHEN USER TYPE LETTERS
        var letter = String.fromCharCode(e.which).toLowerCase(),
            nonLetters = [9, 13, 27, 38, 40];
        if (letter && nonLetters.indexOf(e.which) === -1) {
          filterQuery.push(letter);

          var string = filterQuery.join(''),
              newOption = options.find('li').filter(function () {
            return $(this).text().toLowerCase().indexOf(string) === 0;
          })[0];

          if (newOption) {
            activateOption(options, newOption);
          }
        }

        // ENTER - select option and close when select options are opened
        if (e.which == 13) {
          var activeOption = options.find('li.selected:not(.disabled)')[0];
          if (activeOption) {
            $(activeOption).trigger('click');
            if (!multiple) {
              $newSelect.trigger('close');
            }
          }
        }

        // ARROW DOWN - move to next not disabled option
        if (e.which == 40) {
          if (options.find('li.selected').length) {
            newOption = options.find('li.selected').next('li:not(.disabled)')[0];
          } else {
            newOption = options.find('li:not(.disabled)')[0];
          }
          activateOption(options, newOption);
        }

        // ESC - close options
        if (e.which == 27) {
          $newSelect.trigger('close');
        }

        // ARROW UP - move to previous not disabled option
        if (e.which == 38) {
          newOption = options.find('li.selected').prev('li:not(.disabled)')[0];
          if (newOption) {
            activateOption(options, newOption);
          }
        }

        // Automaticaly clean filter query so user can search again by starting letters
        setTimeout(function () {
          filterQuery = [];
        }, 1000);
      };

      $newSelect.on('keydown', onKeyDown);
    });

    function toggleEntryFromArray(entriesArray, entryIndex, select) {
      var index = entriesArray.indexOf(entryIndex),
          notAdded = index === -1;

      if (notAdded) {
        entriesArray.push(entryIndex);
      } else {
        entriesArray.splice(index, 1);
      }

      select.siblings('ul.dropdown-content').find('li:not(.optgroup)').eq(entryIndex).toggleClass('active');

      // use notAdded instead of true (to detect if the option is selected or not)
      select.find('option').eq(entryIndex).prop('selected', notAdded);
      setValueToInput(entriesArray, select);

      return notAdded;
    }

    function setValueToInput(entriesArray, select) {
      var value = '';

      for (var i = 0, count = entriesArray.length; i < count; i++) {
        var text = select.find('option').eq(entriesArray[i]).text();

        i === 0 ? value += text : value += ', ' + text;
      }

      if (value === '') {
        value = select.find('option:disabled').eq(0).text();
      }

      select.siblings('input.select-dropdown').val(value);
    }
    // };

    function guid() {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
      });
      return uuid;
    }
  };
})(jQuery);

jQuery('select').siblings('input.select-dropdown').on('mousedown', function (e) {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    if (e.clientX >= e.target.clientWidth || e.clientY >= e.target.clientHeight) {
      e.preventDefault();
    }
  }
});