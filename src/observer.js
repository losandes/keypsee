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
            enumerateKeys,
            isInitialized = false,
            keyEventHandler,
            helpers,
            Observer,
            ObservedDOMElement;
        
        // this is what is returned by this function
        Observer = function () {
            var self = this,
                observeKeyEvents,
                observeDomEvent;
            
            
            self.init = function (helprs, DOMElement) {
                if (isInitialized) {
                    return self;
                }

                helpers = helprs;
                observeKeyEvents(DOMElement);
                isInitialized = true;
                ObservedDOMElement = DOMElement;
                
                return self;
            };

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
            // @param {Function} callback the function to be executed when the key event is observed
            // @returns this observer
            */
            self.observe = function (keys, eventType, callback) {
                var opts;
                
                if (utils.isObject(keys)) {
                    opts = keys;
                } else {
                    opts = {
                        keys: utils.isArray(keys) ? keys : [keys],
                        eventType: eventType || 'keypress',
                        callback: callback
                    };
                }
                
                observe(opts.keys, opts.eventType, opts.callback);

                return self;
            };
            
            /*
            // makes and event observable one-time only. after the event fires once,
            // keypsee will stop observing this event.
            //
            // can be a single key, a combination of keys separated with +,
            // an array of keys, or a sequence of keys separated by spaces
            //
            // be sure to list the modifier keys first to make sure that the
            // correct key ends up getting bound (the last key in the pattern)
            //
            // @param {string|Array} keys
            // @param {string=} eventType - 'keypress', 'keydown', or 'keyup'
            // @param {Function} callback the function to be executed when the key event is observed
            // @returns this observer
            */
            self.observeOnce = function (keys, eventType, callback) {
                var wrappedCallback = function (event, keyInfo, other) {
                    // the order matters!
                    callback(event, keyInfo, other);
                    self.stopObserving(keys, eventType);
                };
                
                return self.observe(keys, eventType, wrappedCallback);
            };

            /*
            // stops observing key combination(s). The keycombo+eventType has to be
            // exactly the same as it was defined in the bind method.
            //
            // @param {string|Array} keys
            // @param {string} eventType
            // @returns void
            */
            self.stopObserving = function (keys, eventType) {
                var outcome = {};
                
                enumerateKeys(keys, function (key) {
                    var keyInfo = helpers.getKeyInfo(key, eventType);
                    
                    outcome[key] = {
                        removed: helpers.removeCallback(keyInfo)
                    };
                });
                
                return outcome;
            };
            
            self.dispose = function () {
                helpers.dispose();
            };

            /*
            // trigger a keyboard event programmatically
            //
            // @param {Object} mockEvent
            */
            self.trigger = function (mockEvent) {
                if (typeof mockEvent === 'string') {
                    
                    
                    var eventData = {
                        type: 'keydown',
                        bubbles : true,
                        cancelable : true,
                        char : "B",
                        key : "b",
                        ctrlKey: true,
                        keyCode : 66 // i.e. 66 /*b*/
                    };
                    
                    keyEventHandler(eventData);
                } else if (utils.isObject(mockEvent)) {
                    keyEventHandler(mockEvent);
                } else {
                    throw new Error('Unable to trigger the event');
                }
            };
            
            self.getMaps = function () {
                return helpers.maps;
            };
            
            /*
            // observe DOM events of a give type (i.e. keydown) for a given DOM object (i.e. document, body, $('#mydiv')[0])
            */
            observeDomEvent = function (DOMElement, eventType) {
                utils.observeDomEvent(DOMElement, eventType, keyEventHandler);

                return self;
            };

            /*
            // observe all key events (i.e. keydown, keyup and keypress) for a given DOM object (i.e. document, body, $('#mydiv')[0])
            */
            observeKeyEvents = function (DOMElement) {
                observeDomEvent(DOMElement, 'keypress');
                observeDomEvent(DOMElement, 'keydown');
                observeDomEvent(DOMElement, 'keyup');

                return self;
            };
        };
        
        enumerateKeys = function (keys, handler) {
            if (!utils.isFunction(handler)) {
                throw new Error('The handler must be a function');
            }
            
            var currentKey,
                i;
            
            for (i = 0; i < keys.length; i += 1) {
                handler(keys[i]);
            }
        };

        observe = function (keys, eventType, callback) {
            enumerateKeys(keys, function (key) {
                if (key === 'paste') {
                    observePaste(callback);
                } else {
                    observeOne(key, eventType, callback);
                }
            });
        };

        observeOne = function (key, eventType, callback) {
            var keyInfo = helpers.getKeyInfo(key, eventType),
                callbackObj;

            callbackObj = new Callback({ key: key, keyInfo: keyInfo, callback: callback, eventType: eventType });

            helpers.registerCallback(keyInfo, callbackObj);
        };

        observePaste = function (callback) {
            var keyInfo = helpers.getKeyInfo('paste', 'void'),
                DOMEle = ObservedDOMElement.onpaste !== undefined ? ObservedDOMElement : document,
                callbackObj;

            callbackObj = new Callback({ key: 'paste', keyInfo: keyInfo, callback: callback, eventType: 'void' });
            helpers.registerCallback(keyInfo, callbackObj);
            
            if (DOMEle.onpaste !== undefined) {
                DOMEle.onpaste = function (event) {
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
                                pasteObj.toDataUrl();
                            }

                            output.items.push(pasteObj);
                        }
                    }

                    helpers.executePasteCallback(keyInfo, event, output);
                };
            }
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

        return new Observer();
    }
});
