/**
 * Zepto-Autocomplete
 * @author Yugal Jindle
 * @repo   https://github.com/yugal/zepto-autocomplete.git
 */

(function($) {
    'use strict';

    var methods = {
        init: function(settings) {
            var $currentOpt,
                $this = this, // selected jquery object
                settingsDefaults = {
                    data: [],
                    minLength: 1,
                    maxCount: Infinity,
                    extraClass: '',
                    appendTo: '',
                    position: true,
                    sort: function(data) {
                        return data.sort();
                    },
                    matcher: function(query, option) {
                        return option.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1;
                    },
                    renderOption: function(option) {
                        return option.toString();
                    },
                    selectOption: function(option) {
                        return option.toString(); // Returned value updates the input
                    }
                },
                storedData = $this[0]._autoCompleteData;

            settings = $.extend(settingsDefaults, settings);

            function createOptionsDiv() {
                var position, $appendDiv, $optionsContainerDiv;
                $optionsContainerDiv = $('<div>');
                if(settings.position) {
                    position = {
                        left: $this.offset().left,
                        top: $this.offset().top + $this.height()
                    };
                    $optionsContainerDiv.css('position', 'absolute').css('top', position.top).css('left', position.left).css('zIndex', 1000);
                }
                // Configure $optionsContainerDiv
                $optionsContainerDiv.addClass('autocomplete-options-container').addClass(settings.extraClass);  // Adds class autocomplete-options-container
                $this.attr('data-autocomplete', 'true');
                $optionsContainerDiv.on('mousedown.autocomplete', 'div', chooseOption);
                $optionsContainerDiv.hide();
                $appendDiv = (settings.appendTo)? $(settings.appendTo):$('body');
                $appendDiv.append($optionsContainerDiv);
                settings.data = settings.sort(settings.data);
                // Save
                $this[0]._autoCompleteData = {
                    settings: settings,
                    $optionsContainerDiv: $optionsContainerDiv
                };
            }
            function resetOptionsDiv() {
                var $optionsContainerDiv = $this[0]._autoCompleteData.$optionsContainerDiv;
                $optionsContainerDiv.hide();
                $optionsContainerDiv.empty();
            }
            function chooseOption(event, optIndex) {
                var value, option,
                    settings = $this[0]._autoCompleteData.settings;
                optIndex = optIndex || $(event.target).closest('.autocomplete-opt').attr('data-opt-index');
                option = settings.data[optIndex];
                value = settings.selectOption(option);
                if(value !== undefined) {
                    $this.val(value);
                }
                computeOptions();
                setTimeout(function() {
                    $this.focus();
                });
            }
            function changeCurrentOpt($other) {
                if($currentOpt) {
                    $currentOpt.removeClass('autocomplete-opt-curr');  // Removes class autocomplete-opt
                }
                $currentOpt = $other;
                $currentOpt.addClass('autocomplete-opt-curr');  // Adds class autocomplete-opt
            }
            function computeOptions() {
                var option,
                    $optionDiv,
                    $divs = $(), // List with jquery methods
                    value = $this.val(),
                    $optionsContainerDiv = $this[0]._autoCompleteData.$optionsContainerDiv,
                    settings = $this[0]._autoCompleteData.settings;
                $optionsContainerDiv.empty();
                // Honor minLength
                if(value.length<settings.minLength) {
                    $optionsContainerDiv.hide();
                    return;
                }
                for(var i=0; i<settings.data.length && $divs.length<=settings.maxCount; i++) {
                    option = settings.data[i];
                    if (settings.matcher(value, option)) {
                        // Adds class autocomplete-opt
                        $optionDiv = $('<div class="autocomplete-opt"></div>');
                        $optionDiv.attr('data-opt-index', i);
                        $optionDiv.append(settings.renderOption(option));
                        $divs = $divs.add($optionDiv);
                    }
                }
                if ($divs.length>0) {
                    $optionsContainerDiv.append($divs);
                    $optionsContainerDiv.show();
                    changeCurrentOpt($optionsContainerDiv.children().eq(0));
                }
            }
            function keyHandler(event) {
                var prev, next,
                    $optionsContainerDiv = $this[0]._autoCompleteData.$optionsContainerDiv;
                switch (event.keyCode) {
                    case 38: // Up
                        prev = $currentOpt.prev();
                        if(prev && prev.hasClass('autocomplete-opt')) {
                            changeCurrentOpt(prev);
                        }
                        break;
                    case 40: // Down
                        next = $currentOpt.next();
                        if(next && next.hasClass('autocomplete-opt')) {
                            changeCurrentOpt(next);
                        }
                        break;
                    case 13:  // Return
                        if($optionsContainerDiv.css('display') !== 'none') {
                            chooseOption(event, $currentOpt.attr('data-opt-index'));
                        }
                        break;
                    default:
                        computeOptions();
                        break;
                }
            }

            // if not initialized
            if (!storedData) {
                createOptionsDiv();
                computeOptions();
                return $this.each(function() {
                    $this.bind('focus.autocomplete', computeOptions).bind('keyup.autocomplete', keyHandler).bind('blur.autocomplete', resetOptionsDiv);
                });
            }
        },
        destroy: function() {
            return this.each(function() {
                var $this = $(this);
                $this.unbind('.autocomplete');
                $this[0]._autoCompleteData.$optionsContainerDiv.remove();
                delete $this[0]._autoCompleteData;
            });
        },
        add: function(option) {
            var $this = $(this),
                options,
                settings = $this[0]._autoCompleteData.settings;
            $this = this;
            // create unique
            function unique(arr) {
                var uniqArr = [];
                $.each(arr, function(idx, el) {
                    if($.inArray(el, uniqArr) === -1) {
                        uniqArr.push(el);
                    }
                });
                return uniqArr;
            }
            // option or options
            options = (option instanceof Array)? option:[options];
            options = unique(options.concat(settings.data));
            settings.data = settings.sort(settings.data);
        }
    };

    $.fn.autocomplete = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error(method + ' :: Not supported');
        }
    };
})(Zepto || jQuery);
