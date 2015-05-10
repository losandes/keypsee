/*globals Hilary*/
/*
// Utilities / Helpers for the keyboard observer
*/
Hilary.scope('keypsee').register({
    name: 'helpers',
    dependencies: ['utils', 'KeyInfo'],
    factory: function (utils, KeyInfo) {
        "use strict";
        
        var init = function (maps) {

            var makeCallbackKey,
                registerCallback,
                executePasteCallback,
                executeOnePasteCallback,
                executeCallback,
                executeOneCallback,
                modifiersAreSame,
                getKeyInfo,
                getKeyInfoFromEvent,
                keysFromString,
                isModifier,
                getEventModifiers,
                pickBestEventType,
                characterFromEvent,
                Helpers;

            // This is what will be returned by this function
            Helpers = function () {
                var self = this;

                /*
                //
                */
                self.registerCallback = registerCallback;

                /*
                //
                */
                self.executePasteCallback = executePasteCallback;

                /*
                // actually calls the callback function
                //
                // if your callback function returns false this will use the jquery
                // convention - prevent default and stop propogation on the event
                //
                // @param {Function} callback
                // @param {Event} event
                // @returns void
                */
                self.executeCallback = executeCallback;

                /*
                // Gets info for a specific key combination
                //
                // @param  {string} combination key combination ("command+s" or "a" or "*")
                // @param  {string=} eventType
                // @returns {Object}
                */
                self.getKeyInfo = getKeyInfo;

                /*
                //
                */
                self.getKeyInfoFromEvent = getKeyInfoFromEvent;
                
                self.maps = maps;
                
                self.dispose = function () {
                    maps.dispose();
                    delete self.maps;
                    self.maps = maps;
                };
            };

            // generates a key to be used for storing and retrieving callback registrations
            makeCallbackKey = function (keyInfo) {
                return keyInfo.key + '::' + keyInfo.eventType;
            };

            // registers a callback for a given keystroke
            registerCallback = function (keyInfo, callback) {
                var mappedCallback,
                    callbackKey = makeCallbackKey(keyInfo);

                mappedCallback = maps.callbackMap[callbackKey];

                if (!mappedCallback) {
                    maps.callbackMap[callbackKey] = [callback];
                } else {
                    mappedCallback.push(callback);
                }
            };

            executePasteCallback = function (keyInfo, event, items) {
                var i,
                    callbacks;

                callbacks = maps.callbackMap[makeCallbackKey(keyInfo)];

                if (!callbacks) {
                    return;
                }

                for (i = 0; i < callbacks.length; i += 1) {
                    executeOnePasteCallback(keyInfo, event, callbacks[i], items);
                }
            };

            executeOnePasteCallback = function (eventKeyInfo, event, callback, items) {
                if (utils.isFunction(callback.func)
                        && callback.func(event, eventKeyInfo, items) === false) {
                    utils.preventDefault(event);
                    utils.stopPropagation(event);
                }
            };

            executeCallback = function (keyInfo, event) {
                var i,
                    callbacks,
                    eventType;

                callbacks = maps.callbackMap[makeCallbackKey(keyInfo)];

                if (!callbacks) {
                    return;
                }

                for (i = 0; i < callbacks.length; i += 1) {
                    executeOneCallback(keyInfo, event, callbacks[i]);
                }
            };

            executeOneCallback = function (eventKeyInfo, event, callback) {
                if (modifiersAreSame(eventKeyInfo, callback.keyInfo)
                        && utils.isFunction(callback.func)
                        && callback.func(event, eventKeyInfo) === false) {
                    utils.preventDefault(event);
                    utils.stopPropagation(event);
                }
            };

            modifiersAreSame = function (eventKeyInfo, callbackKeyInfo) {
                var i, k, areSame = false, matchAnyModifier = callbackKeyInfo.matchAnyModifier;

                if (matchAnyModifier) {
                    for (i in eventKeyInfo.modifiers) {
                        if (eventKeyInfo.modifiers.hasOwnProperty(i) && callbackKeyInfo.modifiers.indexOf(eventKeyInfo.modifiers[i]) > -1) {
                            areSame = true;
                        }
                    }
                } else {
                    areSame = true;

                    if (eventKeyInfo.modifiers.length !== callbackKeyInfo.modifiers.length) {
                        return false;
                    }

                    for (i in eventKeyInfo.modifiers) {
                        if (eventKeyInfo.modifiers.hasOwnProperty(i)) {
                            if (callbackKeyInfo.modifiers.indexOf(eventKeyInfo.modifiers[i]) > -1) {
                                areSame = areSame && true;
                            } else {
                                areSame = false;
                            }
                        }
                    }
                }

                return areSame;
            };

            getKeyInfo = function (combination, eventType) {
                var key,
                    keys,
                    modifiers = [],
                    i;

                // take the keys from this pattern and figure out what the actual
                // pattern is all about
                keys = keysFromString(combination);

                for (i = 0; i < keys.length; i += 1) {
                    key = keys[i];

                    // normalize key names
                    if (maps.aliases[key]) {
                        key = maps.aliases[key];
                    }

                    // if this is not a keypress event then we should
                    // be smart about using shift keys
                    // this will only work for US keyboards however
                    if (eventType && eventType !== 'keypress' && maps.shiftMap[key]) {
                        key = maps.shiftMap[key];
                        modifiers.push('shift');
                    }

                    // if this key is a modifier then add it to the list of modifiers
                    if (isModifier(key)) {
                        modifiers.push(key);
                    }
                }

                // depending on what the key combination is
                // we will try to pick the best event for it
                eventType = pickBestEventType(key, modifiers, eventType);

                return new KeyInfo({
                    key: key, // the last key in the combo (i.e. ctrl+b will result in "b" being the key)
                    modifiers: modifiers,
                    eventType: eventType
                });
            };

            getKeyInfoFromEvent = function (event) {
                // normalize e.which for key events
                // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
                if (typeof event.which !== 'number') {
                    event.which = event.keyCode;
                }

                var character = characterFromEvent(event);

                // no character found then stop
                if (!character) {
                    return;
                }

                return new KeyInfo({
                    key: character, // the last key in the combo (i.e. ctrl+b will result in "b" being the key)
                    modifiers: getEventModifiers(event),
                    eventType: event.type
                });
            };

            /**
             * Converts from a string key combination to an array
             *
             * @param  {string} combination like "command+shift+l"
             * @return {Array}
             */
            keysFromString = function (combination) {
                if (combination === '+') {
                    return ['+'];
                }

                return combination.split('+');
            };

            /**
            * determines if the keycode specified is a modifier key or not
            *
            * @param {string} key
            * @returns {boolean}
            */
            isModifier = function (key) {
                return key === 'shift' || key === 'ctrl' || key === 'alt' || key === 'meta';
            };

            getEventModifiers = function (event) {
                var modifiers = [];

                // keep these in alphabetical order
                if (event.altKey) {
                    modifiers.push('alt');
                }

                if (event.ctrlKey) {
                    modifiers.push('ctrl');
                }

                if (event.metaKey) {
                    modifiers.push('meta');
                }

                if (event.shiftKey) {
                    modifiers.push('shift');
                }

                return modifiers;
            };

            /**
             * picks the best eventType based on the key combination
             *
             * @param {string} key - character for key
             * @param {Array} modifiers
             * @param {string=} eventType passed in
             */
            pickBestEventType = function (key, modifiers, eventType) {

                // if no eventType was picked in we should try to pick the one
                // that we think would work best for this key
                if (!eventType) {
                    eventType = maps.getReverseMap()[key] ? 'keydown' : 'keypress';
                }

                // modifier keys don't work as expected with keypress,
                // switch to keydown
                if (eventType === 'keypress' && modifiers.length) {
                    eventType = 'keydown';
                }

                return eventType;
            };

            characterFromEvent = function (event) {

                // for keypress events we should return the character as is
                if (event.type === 'keypress') {
                    var character = String.fromCharCode(event.which);

                    // if the shift key is not pressed then it is safe to assume
                    // that we want the character to be lowercase.  this means if
                    // you accidentally have caps lock on then your key bindings
                    // will continue to work
                    //
                    // the only side effect that might not be desired is if you
                    // bind something like 'A' cause you want to trigger an
                    // event when capital A is pressed caps lock will no longer
                    // trigger the event.  shift+a will though.
                    if (!event.shiftKey) {
                        character = character.toLowerCase();
                    }

                    return character;
                } else if (maps.map[event.which]) {
                    // for non keypress events the special maps are needed
                    return maps.map[event.which];
                } else if (maps.keycodeMap[event.which]) {
                    return maps.keycodeMap[event.which];
                }

                // if it is not in the special map

                // with keydown and keyup events the character seems to always
                // come in as an uppercase character whether you are pressing shift
                // or not.  we should make sure it is always lowercase for comparisons
                return String.fromCharCode(event.which).toLowerCase();
            };

            return new Helpers();
        }; // init

        return {
            init: init
        };
        
    } // /factory
});
