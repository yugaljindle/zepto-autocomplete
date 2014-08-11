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
                $this = this, // selected zepto/jquery input
                settingsDefaults = {
                    data: [],
                    dataMethod: undefined,
                    minLength: 1,
                    maxCount: Infinity,
                    extraClass: '',
                    appendTo: undefined,
                    position: true,
                    sort: function(data) {
                        // Skip sorting if data received from `dataMethod`
                        return (this.dataMethod instanceof Function)? data:data.sort();
                    },
                    matcher: function(query, option) {
                        return option.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1;
                    },
                    lookUp: function(data, option) {
                        var options = [];
                        $.each(data, function(idx, val) {
                            options.push(val.toString());
                        });
                        return options.indexOf(option.toString());
                    },
                    renderOption: function(option) {
                        return option.toString();
                    },
                    onOptionSelect: function(option) {
                        return option.toString(); // Returned value updates the input
                    },
                    onBlur: function(closeCallback) {
                        closeCallback();
                    }
                },
                storedData = $this[0]._autoCompleteData;

            settings = $.extend(settingsDefaults, settings);
            // Disable `position` if appendTo
            settings.position = (settings.appendTo)? false:settings.position;

            function createOptionsDiv() {
                var position, $appendDiv, $optionsContainerDiv;
                $optionsContainerDiv = $('<div>').css('display', 'none');
                if(settings.position) {
                    position = {
                        left: $this.offset().left,
                        top: $this.offset().top + $this.height()
                    };
                    $optionsContainerDiv.css('position', 'relative').css('top', position.top).css('left', position.left).css('zIndex', 1000);
                }
                // Configure $optionsContainerDiv
                $optionsContainerDiv.addClass('ac-options').addClass(settings.extraClass);  // Adds class ac-options
                $this.attr('data-ac', 'true');
                $optionsContainerDiv.on('mousedown.ac', 'div', chooseOption);
                $appendDiv = (settings.appendTo)? $(settings.appendTo):$('body');
                $appendDiv.append($optionsContainerDiv);
                settings.data = settings.sort(settings.data);
                // Save
                $this[0]._autoCompleteData = {
                    settings: settings,
                    $optionsContainerDiv: $optionsContainerDiv
                };
            }
            function open() {
                var $optionsContainerDiv = $this[0]._autoCompleteData.$optionsContainerDiv;
                $optionsContainerDiv.show();
                $this.trigger('opened');
            }
            function close() {
                var $optionsContainerDiv = $this[0]._autoCompleteData.$optionsContainerDiv;
                $optionsContainerDiv.hide();
                $this.trigger('closed');
            }
            function onBlur() {
                var settings = $this[0]._autoCompleteData.settings;
                settings.onBlur(close);
            }
            function chooseOption(event, optIndex) {
                var value, option,
                    settings = $this[0]._autoCompleteData.settings;
                optIndex = optIndex || $(event.target).closest('.ac-opt').attr('data-opt-idx');
                option = settings.data[optIndex];
                value = settings.onOptionSelect(option);
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
                    $currentOpt.removeClass('ac-opt-curr');  // Removes class ac-opt-curr
                }
                $currentOpt = $other;
                $currentOpt.addClass('ac-opt-curr');  // Adds class ac-opt-curr
            }
            function computeOptions() {
                var option,
                    callback,
                    $optionDiv,
                    $divs = $(), // List with zepto/jQuery methods
                    query = $this.val(),
                    $optionsContainerDiv = $this[0]._autoCompleteData.$optionsContainerDiv,
                    settings = $this[0]._autoCompleteData.settings;
                $optionsContainerDiv.empty(); // No events on `options` (safe)
                // Honor minLength
                if(query.length<settings.minLength) {
                    close();
                    return;
                }
                // Compute callback
                callback = function(data) {
                    settings.data = settings.sort(data);
                    for(var i=0; i<data.length && $divs.length<=settings.maxCount; i++) {
                        option = data[i];
                        // Don't match if data received from `dataMethod`
                        if (settings.dataMethod instanceof Function || settings.matcher(query, option)) {
                            // Adds class ac-opt
                            $optionDiv = $('<div></div>').addClass('ac-opt');
                            $optionDiv.attr('data-opt-idx', i);
                            $optionDiv.append(settings.renderOption(option));
                            $divs = $divs.add($optionDiv);
                        }
                    }
                    if ($divs.length>0) {
                        $optionsContainerDiv.append($divs);
                        open();
                    }
                };
                if(settings.dataMethod instanceof Function) {
                    settings.dataMethod(query, callback);
                } else {
                    callback(settings.data);
                }
            }
            function keyHandler(event) {
                var prev, next,
                    $optionsContainerDiv = $this[0]._autoCompleteData.$optionsContainerDiv;
                switch (event.keyCode) {
                    case 38: // Up
                        if(!$currentOpt) {
                            changeCurrentOpt($optionsContainerDiv.children().eq(0));
                            prev = $currentOpt;
                        } else {
                            prev = $currentOpt.prev();
                        }
                        if(prev && prev.hasClass('ac-opt')) {
                            changeCurrentOpt(prev);
                        }
                        break;
                    case 40: // Down
                        if(!$currentOpt) {
                            changeCurrentOpt($optionsContainerDiv.children().eq(0));
                            next = $currentOpt;
                        } else {
                            next = $currentOpt.next();
                        }
                        if(next && next.hasClass('ac-opt')) {
                            changeCurrentOpt(next);
                        }
                        break;
                    case 13:  // Return
                        if($optionsContainerDiv.css('display') !== 'none') {
                            chooseOption(event, $currentOpt.attr('data-opt-idx'));
                        }
                        break;
                    default:
                        computeOptions();
                        break;
                }
            }

            // if not initialized
            if(!storedData) {
                createOptionsDiv();
                computeOptions();
                return $this.each(function() {
                    $this.bind('focus.ac', computeOptions).bind('keyup.ac', keyHandler).bind('blur.ac', onBlur);
                });
            }
        },
        destroy: function() {
            return this.each(function() {
                var $this = $(this);
                $this.unbind('.ac');
                $this[0]._autoCompleteData.$optionsContainerDiv.remove();
                delete $this[0]._autoCompleteData;
            });
        },
        add: function(options) {
            var $this = this, // selected jquery object
                settings = $this[0]._autoCompleteData.settings;
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
            // options ~ Array
            options = (options instanceof Array)? options:[options];
            options = unique(options.concat(settings.data));
            settings.data = settings.sort(options);
        },
        remove: function(options) {
            var index,
                $this = this, // selected jquery object
                settings = $this[0]._autoCompleteData.settings;
            // options ~ Array
            options = (options instanceof Array)? options:[options];
            $.each(options, function(idx, option) {
                index = settings.lookUp(settings.data, option);
                if(index !== -1) {
                    settings.data.splice(index, 1);
                }
            });
        }
    };

    $.fn.autocomplete = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error(method + ': not-supported');
        }
    };
})(Zepto || jQuery);
