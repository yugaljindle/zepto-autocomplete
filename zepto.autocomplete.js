/**
 * 
 * Zepto-Autocomplete
 * @author Yugal Jindle
 * @date   Jul 10, 2014
 * 
 */

/**
 * Desiered features:
 *  - support for custom events
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
					matcher: function(query, item) {
						return item.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1;
					},
					renderOption: function(item) {
						return '<div>'+item.toString()+'</div>';
					}
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
				var $optionsDiv,
				    position = {
						left: $this.offset().left,
						top: $this.offset().top + $this.height()
					};
				// Configure $optionsDiv
				$optionsDiv = $('<div>');
				$optionsDiv.addClass('autocomplete-options').addClass(settings.extraClass).css('zIndex', 1000);  // Adds class autocomplete-options
				$optionsDiv.css('position', 'absolute').css('top', position.top).css('left', position.left).css('border', '1px solid black').css('background', 'white');
				$this.attr('data-autocomplete', 'true');
				$optionsDiv.on('mousedown.autocomplete', 'div', chooseOption);
				$optionsDiv.hide();
				$('body').append($optionsDiv);
				settings.data = settings.sort(settings.data);
 				// Save
				$this[0]._autoCompleteData = {
					settings: settings,
					$optionsDiv: $optionsDiv
				};
			}
			function resetOptionsDiv() {
				$optionsDiv = $this[0]._autoCompleteData.$optionsDiv;
				$optionsDiv.hide();
				$optionsDiv.empty();
			}
			function closeOptionsDiv() {
				var $optionsDiv = $this[0]._autoCompleteData.$optionsDiv;
				$optionsDiv[0].scrollTop = 0;
				$optionsDiv.hide();
			}
			function chooseOption(event) {
				$this.val(event.target.innerHTML);
			}
			function changeCurrentOpt($other) {
				if($currentOpt) {
					$currentOpt.removeClass('autocomplete-opt-curr');  // Removes class autocomplete-opt
				}
				$currentOpt = $other;
				$currentOpt.addClass('autocomplete-opt-curr');  // Adds class autocomplete-opt
			}
			function computeOptions() {
				var dataItem,
					$divs = $(), // List with jquery methods
					value = $this.val(),
					$optionsDiv = $this[0]._autoCompleteData.$optionsDiv,
					settings = $this[0]._autoCompleteData.settings;
				resetOptionsDiv();
				// Honor minLength
				if(value.length<settings.minLength) {
					return;
				}
				for(var i=0; i<settings.data.length && $divs.length<=settings.maxCount; i++) {
					dataItem = settings.data[i];
					if (value && settings.matcher(value, dataItem)) {
						// Adds class autocomplete-opt
						$divs = $divs.add($('<div class="autocomplete-opt"></div>').append(settings.renderOption(dataItem)));
					}
				}
				if ($divs.length>0) {
					$optionsDiv.append($divs);
					$optionsDiv.show();
					changeCurrentOpt($optionsDiv.children().eq(0));
				}
			}
			function keyHandler(event) {
				var prev, next,
					settings = $this[0]._autoCompleteData.settings,
					$optionsDiv = $this[0]._autoCompleteData.$optionsDiv;
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
						if($optionsDiv.is(':visible')) {
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
				$this[0]._autoCompleteData.$optionsDiv.remove();
				delete $this[0]._autoCompleteData;
			});
		},
		add: function(item) {
			var items,
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
			// item or items
			items = (item instanceof Array)? item:[items];
			items = unique(items.concat(settings.data));
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
