/*globals Hilary*/
/*
// The observer will become the public nicephore when initialized
*/
Hilary.scope('keypsee').register({
    name: 'observer',
    dependencies: ['utils', 'Callback', 'PasteObject', 'JSON'],
    factory: function (utils, Callback, PasteObject, JSON) {
        "use strict";

        var observe,
            observeOne,
            observePaste,
            observeDomEvent,
            observeKeyEvents,
            stopObserving,
            isStarted = false,
            keyEventHandler,
            helpers,
            Observer;
        
        // this is what is returned by this function
        Observer = function () {
            var self = this;
            
            
            self.start = function (helprs) {
                if (isStarted) {
                    return self;
                }

                helpers = helprs;
                observeKeyEvents(document);
                isStarted = true;

                return self;
            };

            /*
            // observe DOM events of a give type (i.e. keydown) for a given DOM object (i.e. document, body, $('#mydiv')[0])
            */
            self.observeDomEvent = observeDomEvent;

            /*
            // observe all key events (i.e. keydown, keyup and keypress) for a given DOM object (i.e. document, body, $('#mydiv')[0])
            */
            self.observeKeyEvents = observeKeyEvents;

            /*
            // makes and event observable
            //
            // can be a single key, a combination of keys separated with +,
            // an array of keys, or a sequence of keys separated by spaces
            //
            // be sure to list the modifier keys first to make sure that the
            // correct key ends up getting bound (the last key in the pattern)
            //
            // @param {string|Array} keys
            // @param {string=} eventType - 'keypress', 'keydown', or 'keyup'
            // @param {bool|Function} matchAnyModifier: when true, the modifier keys (i.e. control, command) will
            //      match using OR logic, otherwise the keys will match using AND logic. When this is a function,
            //      it is treated as the callback, and the fourth parameter is ignored
            // @param {Function} callback the function to be executed when the key event is observed
            // @returns this observer
            */
            self.observe = function (keys, eventType, matchAnyModifier, callback) {
                keys = utils.isArray(keys) ? keys : [keys];

                if (utils.isFunction(matchAnyModifier)) {
                    // observe(keys, eventType, false, matchAnyModifier /*as callback*/);
                    observe(keys, eventType, false, matchAnyModifier);
                } else {
                    observe(keys, eventType, matchAnyModifier, callback);
                }

                return self;
            };

            /*
            // unbinds an event to mousetrap
            //
            // the unbinding sets the callback function of the specified key combo
            // to an empty function and deletes the corresponding key in the
            // _directMap dict.
            //
            // TODO: actually remove this from the _callbacks dictionary instead
            // of binding an empty function
            //
            // the keycombo+eventType has to be exactly the same as
            // it was defined in the bind method
            //
            // @param {string|Array} keys
            // @param {string} eventType
            // @returns void
            */
            self.stopObserving = stopObserving;

            self.trigger = function (mockEvent) {
                keyEventHandler(mockEvent);
            };
            
            self.getMaps = function () {
                return helpers.maps;
            };
            
            self.dispose = function () {
                helpers.dispose();
            };
        };

        observe = function (keys, eventType, matchAnyModifier, callback) {
            var currentKey,
                i;
            
            for (i = 0; i < keys.length; i += 1) {
                currentKey = keys[i];

                if (currentKey === 'paste') {
                    observePaste(callback);
                } else {
                    observeOne(currentKey, eventType, matchAnyModifier, callback);
                }
            }
        };

        observeOne = function (key, eventType, matchAnyModifier, callback) {
            var keyInfo = helpers.getKeyInfo(key, eventType),
                callbackObj;

            keyInfo.matchAnyModifier = matchAnyModifier;
            callbackObj = new Callback({ key: key, keyInfo: keyInfo, callback: callback, eventType: eventType });

            helpers.registerCallback(keyInfo, callbackObj);
        };

        observePaste = function (callback) {
            var keyInfo = helpers.getKeyInfo('paste', 'void'),
                callbackObj;

            callbackObj = new Callback({ key: 'paste', keyInfo: keyInfo, callback: callback, eventType: 'void' });
            helpers.registerCallback(keyInfo, callbackObj);

            if (document.onpaste !== undefined) {
                document.onpaste = function (event) {
                    var i,
                        items,
                        output = {
                            items: [],
                            json: ''
                        },
                        item,
                        pasteObj;

                    items = (event.clipboardData || event.originalEvent.clipboardData).items;
                    output.json = JSON.stringify(items); // will give you the mime types

                    for (i in items) {
                        if (items.hasOwnProperty(i)) {
                            item = items[i];
                            pasteObj = new PasteObject({
                                kind: item.kind,
                                type: item.type
                            });

                            if (item.kind === 'file' && item.getAsFile) {
                                pasteObj.file = item.getAsFile();
                                pasteObj.readToDataUrl();
                            }

                            output.items.push(pasteObj);
                        }
                    }

                    helpers.executePasteCallback(keyInfo, event, output);
                };
            }
        };

        stopObserving = function (keys, eventType) {
            throw new Error('stopObserving is not implemented');
        };

        /**
         * handles a keydown event
         *
         * @param {Event} e
         * @returns void
         */
        keyEventHandler = function (event) {
            var info = helpers.getKeyInfoFromEvent(event);

            // no character found then stop
            if (!info.key) {
                return;
            }

            helpers.executeCallback(info, event);
        };

        observeDomEvent = function (domObject, eventType) {
            utils.observeDomEvent(domObject, eventType, keyEventHandler);

            return this;
        };

        observeKeyEvents = function (domObject) {
            observeDomEvent(domObject, 'keypress');
            observeDomEvent(domObject, 'keydown');
            observeDomEvent(domObject, 'keyup');

            return this;
        };

        return new Observer();
    }
});
