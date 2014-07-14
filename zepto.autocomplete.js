/**
 * 
 * Zepto-Autocomplete
 * @author Yugal Jindle
 * @date   Jul 10, 2014
 * 
 */

(function($) {
    var methods = {
        init: function(settings) {
            var $currentOpt,
                $this = this, // selected jquery object
                settingsDefaults = {
                    data: [],
                    minLength: 1,
                    maxCount: 100,
                    extraClass: '',
                    sort: function(data) {
                        return data.sort();
                    },
                    matcher: function(query, option) {
                        return option.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1;
                    },
                    renderOption: function(option) {
                        return option.toString();
                    },
                    selectOption: function(option) {}
                };
                storedData = $this[0]._autoCompleteData;

            settings = $.extend(settingsDefaults, settings);
            // if not initialized
            if (!storedData) {
                createOptionsDiv();
                return $this.each(function() {
                    $this.bind('focus.autocomplete', computeOptions).bind('keyup.autocomplete', keyHandler).bind('blur.autocomplete', closeOptionsDiv);
                });
            }

            function createOptionsDiv() {
                var $optionsContainerDiv,
                    position = {
                        left: $this.offset().left,
                        top: $this.offset().top + $this.height()
                    };
                // Configure $optionsContainerDiv
                $optionsContainerDiv = $('<div>');
                $optionsContainerDiv.addClass('autocomplete-options-container').addClass(settings.extraClass).css('zIndex', 1000);  // Adds class autocomplete-options-container
                $optionsContainerDiv.css('position', 'absolute').css('top', position.top).css('left', position.left).css('border', '1px solid black').css('background', 'white');
                $this.attr('data-autocomplete', 'true');
                $optionsContainerDiv.on('mousedown.autocomplete', 'div', chooseOption);
                $optionsContainerDiv.hide();
                $('body').append($optionsContainerDiv);
                settings.data = settings.sort(settings.data);
                // Save
                $this[0]._autoCompleteData = {
                    settings: settings,
                    $optionsContainerDiv: $optionsContainerDiv
                };
            }
            function resetOptionsDiv() {
                $optionsContainerDiv = $this[0]._autoCompleteData.$optionsContainerDiv;
                $optionsContainerDiv.hide();
                $optionsContainerDiv.empty();
            }
            function closeOptionsDiv() {
                var $optionsContainerDiv = $this[0]._autoCompleteData.$optionsContainerDiv;
                $optionsContainerDiv[0].scrollTop = 0;
                $optionsContainerDiv.hide();
            }
            function chooseOption(event) {
                var settings = $this[0]._autoCompleteData.settings,
                    optIndex = $(event.target).closest('.autocomplete-opt').attr('data-opt-index'),
                    option = settings.data[optIndex];
                $this.val(option.toString());
                closeOptionsDiv();
                settings.selectOption(option);
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
                resetOptionsDiv();
                // Honor minLength
                if(value.length<settings.minLength) {
                    return;
                }
                for(var i=0; i<settings.data.length && $divs.length<=settings.maxCount; i++) {
                    option = settings.data[i];
                    if (value && settings.matcher(value, option)) {
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
                    settings = $this[0]._autoCompleteData.settings,
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
                            $this.val($currentOpt.html());
                            resetOptionsDiv();
                        }
                        break;
                    default:
                        computeOptions();
                        break;
                }
            }
        },
        destroy: function() {
            return this.each(function() {
                $this = $(this);
                $this.unbind('.autocomplete');
                $this[0]._autoCompleteData.$optionsContainerDiv.remove();
                delete $this[0]._autoCompleteData;
            });
        },
        add: function(option) {
            var options,
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
