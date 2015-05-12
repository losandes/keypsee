/*! keypsee-build 2015-05-12 */
Hilary.scope("keypsee").register({
    name: "Callback",
    dependencies: [ "KeyInfo", "console" ],
    factory: function(KeyInfo, console) {
        "use strict";
        var Callback;
        Callback = function(callback) {
            var self = this;
            callback = callback || {};
            self.key = callback.key;
            self.keyInfo = callback.keyInfo || new KeyInfo();
            self.func = callback.callback || function(event, eventKeyInfo) {
                console.log("event", event);
                console.log("keyInfo", eventKeyInfo);
            };
            self.eventType = callback.eventType;
        };
        return Callback;
    }
});

Hilary.scope("keypsee").register({
    name: "helpers",
    dependencies: [ "utils", "KeyInfo" ],
    factory: function(utils, KeyInfo) {
        "use strict";
        var init = function(maps) {
            var makeCallbackKey, registerCallback, removeCallback, executePasteCallback, executeOnePasteCallback, executeCallback, executeOneCallback, modifiersAreSame, getKeyInfo, getKeyInfoFromEvent, keysFromString, isModifier, getEventModifiers, pickBestEventType, characterFromEvent, Helpers;
            Helpers = function() {
                var self = this;
                self.registerCallback = registerCallback;
                self.removeCallback = removeCallback;
                self.executePasteCallback = executePasteCallback;
                self.executeCallback = executeCallback;
                self.getKeyInfo = getKeyInfo;
                self.getKeyInfoFromEvent = getKeyInfoFromEvent;
                self.maps = maps;
                self.dispose = function() {
                    maps.dispose();
                    delete self.maps;
                    self.maps = maps;
                };
            };
            makeCallbackKey = function(keyInfo) {
                return keyInfo.key + "::" + keyInfo.eventType;
            };
            registerCallback = function(keyInfo, callback) {
                var mappedCallback, callbackKey = makeCallbackKey(keyInfo);
                mappedCallback = maps.callbackMap[callbackKey];
                if (!mappedCallback) {
                    maps.callbackMap[callbackKey] = [ callback ];
                } else {
                    mappedCallback.push(callback);
                }
            };
            removeCallback = function(keyInfo) {
                var callbackKey = makeCallbackKey(keyInfo);
                if (maps.callbackMap[callbackKey]) {
                    delete maps.callbackMap[callbackKey];
                    return true;
                }
                return false;
            };
            executePasteCallback = function(keyInfo, event, items) {
                var i, callbacks;
                callbacks = maps.callbackMap[makeCallbackKey(keyInfo)];
                if (!callbacks) {
                    return;
                }
                for (i = 0; i < callbacks.length; i += 1) {
                    executeOnePasteCallback(keyInfo, event, callbacks[i], items);
                }
            };
            executeOnePasteCallback = function(eventKeyInfo, event, callback, items) {
                if (utils.isFunction(callback.func)) {
                    callback.func(event, eventKeyInfo, items);
                }
            };
            executeCallback = function(keyInfo, event) {
                var i, callbacks, eventType;
                callbacks = maps.callbackMap[makeCallbackKey(keyInfo)];
                if (!callbacks) {
                    return;
                }
                for (i = 0; i < callbacks.length; i += 1) {
                    executeOneCallback(keyInfo, event, callbacks[i]);
                }
            };
            executeOneCallback = function(eventKeyInfo, event, callback) {
                if (modifiersAreSame(eventKeyInfo, callback.keyInfo) && utils.isFunction(callback.func) && callback.func(event, eventKeyInfo) === false) {
                    utils.preventDefault(event);
                    utils.stopPropagation(event);
                }
            };
            modifiersAreSame = function(eventKeyInfo, callbackKeyInfo) {
                var areSame = true, i;
                if (eventKeyInfo.modifiers.length !== callbackKeyInfo.modifiers.length) {
                    return false;
                }
                for (i = 0; i < eventKeyInfo.modifiers.length; i += 1) {
                    if (callbackKeyInfo.modifiers.indexOf(eventKeyInfo.modifiers[i]) > -1) {
                        areSame = areSame && true;
                    } else {
                        areSame = false;
                    }
                }
                return areSame;
            };
            getKeyInfo = function(combination, eventType) {
                var key, keys, modifiers = [], i;
                keys = keysFromString(combination);
                for (i = 0; i < keys.length; i += 1) {
                    key = keys[i];
                    if (maps.aliases[key]) {
                        key = maps.aliases[key];
                    }
                    if (eventType && eventType !== "keypress" && maps.shiftMap[key]) {
                        key = maps.shiftMap[key];
                        modifiers.push("shift");
                    }
                    if (isModifier(key)) {
                        modifiers.push(key);
                    }
                }
                eventType = pickBestEventType(key, modifiers, eventType);
                return new KeyInfo({
                    key: key,
                    modifiers: modifiers,
                    eventType: eventType
                });
            };
            getKeyInfoFromEvent = function(event) {
                if (typeof event.which !== "number") {
                    event.which = event.keyCode;
                }
                var character = characterFromEvent(event);
                if (!character) {
                    return;
                }
                return new KeyInfo({
                    key: character,
                    modifiers: getEventModifiers(event),
                    eventType: event.type
                });
            };
            keysFromString = function(combination) {
                if (combination === "+") {
                    return [ "+" ];
                }
                var keys = combination.split("+"), i;
                if (combination.indexOf("plus") > -1) {
                    for (i = 0; i < keys.length; i += 1) {
                        if (keys[i] === "plus") {
                            keys[i] = "+";
                        }
                    }
                }
                return keys;
            };
            isModifier = function(key) {
                return key === "shift" || key === "ctrl" || key === "alt" || key === "meta";
            };
            getEventModifiers = function(event) {
                var modifiers = [];
                if (event.altKey) {
                    modifiers.push("alt");
                }
                if (event.ctrlKey) {
                    modifiers.push("ctrl");
                }
                if (event.metaKey) {
                    modifiers.push("meta");
                }
                if (event.shiftKey) {
                    modifiers.push("shift");
                }
                return modifiers;
            };
            pickBestEventType = function(key, modifiers, eventType) {
                if (!eventType) {
                    eventType = maps.getReverseMap()[key] ? "keydown" : "keypress";
                }
                if (eventType === "keypress" && modifiers.length) {
                    eventType = "keydown";
                }
                return eventType;
            };
            characterFromEvent = function(event) {
                if (event.type === "keypress") {
                    var character = String.fromCharCode(event.which);
                    if (!event.shiftKey) {
                        character = character.toLowerCase();
                    }
                    return character;
                } else if (maps.map[event.which]) {
                    return maps.map[event.which];
                } else if (maps.keycodeMap[event.which]) {
                    return maps.keycodeMap[event.which];
                }
                return String.fromCharCode(event.which).toLowerCase();
            };
            return new Helpers();
        };
        return {
            init: init
        };
    }
});

Hilary.scope("keypsee").register({
    name: "KeyInfo",
    factory: function() {
        "use strict";
        var KeyInfo;
        KeyInfo = function(keyinfo) {
            var self = this;
            keyinfo = keyinfo || {};
            self.key = keyinfo.key;
            self.modifiers = keyinfo.modifiers;
            self.eventType = keyinfo.eventType;
        };
        return KeyInfo;
    }
});

Hilary.scope("keypsee").register({
    name: "maps",
    factory: function() {
        "use strict";
        var i, map, keycodeMap, shiftMap, reverseMap, getReverseMap, aliases, callbackMap = {}, Maps;
        Maps = function() {
            var self = this;
            self.map = map;
            self.keycodeMap = keycodeMap;
            self.shiftMap = shiftMap;
            self.aliases = aliases;
            self.getReverseMap = getReverseMap;
            self.callbackMap = callbackMap;
            self.dispose = function() {
                delete self.callbackMap;
                callbackMap = {};
                self.callbackMap = callbackMap;
            };
        };
        map = {
            8: "backspace",
            9: "tab",
            13: "enter",
            16: "shift",
            17: "ctrl",
            18: "alt",
            20: "capslock",
            27: "esc",
            32: "space",
            33: "pageup",
            34: "pagedown",
            35: "end",
            36: "home",
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            45: "ins",
            46: "del",
            91: "meta",
            93: "meta",
            224: "meta"
        };
        keycodeMap = {
            106: "*",
            107: "+",
            109: "-",
            110: ".",
            111: "/",
            186: ";",
            187: "=",
            188: ",",
            189: "-",
            190: ".",
            191: "/",
            192: "`",
            219: "[",
            220: "\\",
            221: "]",
            222: "'"
        };
        shiftMap = {
            "~": "`",
            "!": "1",
            "@": "2",
            "#": "3",
            $: "4",
            "%": "5",
            "^": "6",
            "&": "7",
            "*": "8",
            "(": "9",
            ")": "0",
            _: "-",
            "+": "=",
            ":": ";",
            '"': "'",
            "<": ",",
            ">": ".",
            "?": "/",
            "|": "\\"
        };
        aliases = {
            option: "alt",
            command: "meta",
            "return": "enter",
            escape: "esc",
            plus: "+",
            mod: /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "meta" : "ctrl"
        };
        for (i = 1; i < 20; i += 1) {
            map[111 + i] = "f" + i;
        }
        for (i = 0; i <= 9; i += 1) {
            map[i + 96] = i;
        }
        getReverseMap = function() {
            if (!reverseMap) {
                var key;
                reverseMap = {};
                for (key in map) {
                    if (map.hasOwnProperty(key) && !(key > 95 && key < 112)) {
                        reverseMap[map[key]] = key;
                    }
                }
            }
            return reverseMap;
        };
        return new Maps();
    }
});

Hilary.scope("keypsee").register({
    name: "observer",
    dependencies: [ "utils", "Callback", "PasteObject", "JSON" ],
    factory: function(utils, Callback, PasteObject, JSON) {
        "use strict";
        var observe, observeOne, observePaste, defaultSyncPasteCallback, enumerateKeys, isInitialized = false, keyEventHandler, when, helpers, Observer, ObservedDOMElement;
        Observer = function() {
            var self = this, observeKeyEvents, observeDomEvent;
            self.init = function(helprs, DOMElement) {
                if (isInitialized) {
                    return self;
                }
                helpers = helprs;
                observeKeyEvents(DOMElement);
                isInitialized = true;
                ObservedDOMElement = DOMElement;
                return self;
            };
            self.observe = function(keys, eventType, callback) {
                var opts;
                if (utils.isObject(keys)) {
                    opts = keys;
                } else {
                    opts = {
                        keys: utils.isArray(keys) ? keys : [ keys ],
                        eventType: eventType || "keypress",
                        callback: callback
                    };
                }
                observe(opts.keys, opts.eventType, opts.callback);
                return self;
            };
            self.observeOnce = function(keys, eventType, callback) {
                var wrappedCallback = function(event, keyInfo, other) {
                    callback(event, keyInfo, other);
                    self.stopObserving(keys, eventType);
                };
                return self.observe(keys, eventType, wrappedCallback);
            };
            self.observePaste = function(options) {
                if (!utils.isObject(options) || !utils.isFunction(options.asyncCallback)) {
                    throw new Error("An object literal with at least a callback property is required to call observePaste");
                }
                options.syncCallback = options.syncCallback || defaultSyncPasteCallback;
                observePaste(options.asyncCallback, options.syncCallback);
            };
            self.stopObserving = function(keys, eventType) {
                var outcome = {};
                enumerateKeys(keys, function(key) {
                    var keyInfo = helpers.getKeyInfo(key, eventType);
                    outcome[key] = {
                        removed: helpers.removeCallback(keyInfo)
                    };
                });
                return outcome;
            };
            self.eventHelpers = {
                preventDefault: utils.preventDefault,
                stopPropagation: utils.stopPropagation
            };
            self.dispose = function() {
                helpers.dispose();
            };
            self.trigger = function(mockEvent) {
                if (typeof mockEvent === "string") {
                    var eventData = {
                        type: "keydown",
                        bubbles: true,
                        cancelable: true,
                        "char": "B",
                        key: "b",
                        ctrlKey: true,
                        keyCode: 66
                    };
                    keyEventHandler(eventData);
                } else if (utils.isObject(mockEvent)) {
                    keyEventHandler(mockEvent);
                } else {
                    throw new Error("Unable to trigger the event");
                }
            };
            self.getMaps = function() {
                return helpers.maps;
            };
            observeDomEvent = function(DOMElement, eventType) {
                utils.observeDomEvent(DOMElement, eventType, keyEventHandler);
                return self;
            };
            observeKeyEvents = function(DOMElement) {
                observeDomEvent(DOMElement, "keypress");
                observeDomEvent(DOMElement, "keydown");
                observeDomEvent(DOMElement, "keyup");
                return self;
            };
        };
        defaultSyncPasteCallback = function(event) {
            utils.preventDefault(event);
            utils.stopPropagation(event);
        };
        enumerateKeys = function(keys, handler) {
            if (!utils.isFunction(handler)) {
                throw new Error("The handler must be a function");
            }
            var currentKey, i;
            for (i = 0; i < keys.length; i += 1) {
                handler(keys[i]);
            }
        };
        observe = function(keys, eventType, callback) {
            enumerateKeys(keys, function(key) {
                if (key === "paste") {
                    observePaste(callback, defaultSyncPasteCallback);
                } else {
                    observeOne(key, eventType, callback);
                }
            });
        };
        observeOne = function(key, eventType, callback) {
            var keyInfo = helpers.getKeyInfo(key, eventType), callbackObj;
            callbackObj = new Callback({
                key: key,
                keyInfo: keyInfo,
                callback: callback,
                eventType: eventType
            });
            helpers.registerCallback(keyInfo, callbackObj);
        };
        observePaste = function(asyncCallback, syncCallback) {
            var asyncKeyInfo = helpers.getKeyInfo("paste", "async"), asyncCallbackObj, syncKeyInfo = helpers.getKeyInfo("paste", "sync"), syncCallbackObj, DOMEle = ObservedDOMElement.onpaste !== undefined ? ObservedDOMElement : document;
            asyncCallbackObj = new Callback({
                key: "paste",
                keyInfo: asyncKeyInfo,
                callback: asyncCallback,
                eventType: "async"
            });
            syncCallbackObj = new Callback({
                key: "paste",
                keyInfo: syncKeyInfo,
                callback: syncCallback,
                eventType: "sync"
            });
            helpers.registerCallback(asyncKeyInfo, asyncCallbackObj);
            helpers.registerCallback(syncKeyInfo, syncCallbackObj);
            if (DOMEle.onpaste !== undefined) {
                DOMEle.onpaste = function(event) {
                    var i, items, item, pasteObj, wait = [], assert, then, output = {
                        items: [],
                        json: ""
                    };
                    items = (event.clipboardData || event.originalEvent.clipboardData).items;
                    output.json = JSON.stringify(items);
                    for (i in items) {
                        if (items.hasOwnProperty(i) && items[i].kind && items[i].type) {
                            item = items[i];
                            pasteObj = new PasteObject({
                                kind: item.kind,
                                type: item.type
                            });
                            if (item.kind === "file" && item.getAsFile) {
                                wait.push({
                                    item: pasteObj,
                                    property: "dataUrl"
                                });
                                pasteObj.file = item.getAsFile();
                                pasteObj.toDataUrl();
                            } else if (item.getData) {
                                wait.push({
                                    item: pasteObj,
                                    property: "data"
                                });
                                pasteObj.data = item.getData(pasteObj.type);
                            } else if (item.getAsString) {
                                wait.push({
                                    item: pasteObj,
                                    property: "data"
                                });
                                item.getAsString(function(data) {
                                    pasteObj.data = data;
                                });
                            }
                            output.items.push(pasteObj);
                        }
                    }
                    assert = function() {
                        var outcome = true, i;
                        for (i = 0; i < wait.length; i += 1) {
                            if (typeof wait[i].item[wait[i].property] !== undefined) {
                                outcome = outcome && true;
                            } else {
                                outcome = false;
                            }
                        }
                        return outcome;
                    };
                    then = function() {
                        helpers.executePasteCallback(asyncKeyInfo, event, output);
                    };
                    helpers.executePasteCallback(syncKeyInfo, event, output);
                    if (wait.length > 0) {
                        when(assert, then, 0, 9e3, 10);
                    } else {
                        then();
                    }
                };
            }
        };
        when = function(assert, then, waitCount, waitThreshold, sleepTime) {
            if (typeof assert !== "function" || typeof then !== "function") {
                return false;
            }
            if (waitCount < waitThreshold) {
                setTimeout(function() {
                    if (assert()) {
                        waitCount = 0;
                        return then();
                    } else {
                        waitCount += 1;
                        return when(assert, then, waitCount, waitThreshold, sleepTime);
                    }
                }, sleepTime);
            } else {
                waitCount = 0;
                return false;
            }
        };
        keyEventHandler = function(event) {
            var info = helpers.getKeyInfoFromEvent(event);
            if (!info.key) {
                return;
            }
            helpers.executeCallback(info, event);
        };
        return new Observer();
    }
});

Hilary.scope("keypsee").register({
    name: "PasteObject",
    dependencies: [ "FileReader" ],
    factory: function(FileReader) {
        "use strict";
        var PasteObject;
        PasteObject = function(pasteobj) {
            var self = this;
            pasteobj = pasteobj || {};
            self.kind = pasteobj.kind;
            self.type = pasteobj.type;
            self.file = pasteobj.file;
            self.data = pasteobj.data;
            self.dataUrl = pasteobj.dataUrl;
            self.toDataUrl = function() {
                if (!FileReader) {
                    return;
                }
                var reader = new FileReader();
                reader.onload = function(event) {
                    self.dataUrl = event.target.result;
                };
                return reader.readAsDataURL(self.file);
            };
        };
        return PasteObject;
    }
});

Hilary.scope("keypsee").register({
    name: "utils",
    factory: function() {
        "use strict";
        var preventDefault, stopPropagation, observeDomEvent, getType, isArray, isFunction, isBoolean, isObject, objProto = Object.prototype, objProtoToStringFunc = objProto.toString, objProtoHasOwnFunc = objProto.hasOwnProperty, class2Types = {}, class2ObjTypes = [ "Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error" ], Utils;
        Utils = function() {
            var self = this, name, i;
            for (i = 0; i < class2ObjTypes.length; i += 1) {
                name = class2ObjTypes[i];
                class2Types["[object " + name + "]"] = name.toLowerCase();
            }
            self.preventDefault = preventDefault;
            self.stopPropagation = stopPropagation;
            self.observeDomEvent = observeDomEvent;
            self.isArray = isArray;
            self.isFunction = isFunction;
            self.isBoolean = isBoolean;
            self.isObject = isObject;
        };
        preventDefault = function(event) {
            if (event.preventDefault) {
                event.preventDefault();
                return;
            }
            event.returnValue = false;
        };
        stopPropagation = function(event) {
            if (event.stopPropagation) {
                event.stopPropagation();
                return;
            }
            event.cancelBubble = true;
        };
        observeDomEvent = function(DOMElement, type, callback) {
            if (DOMElement.addEventListener) {
                DOMElement.addEventListener(type, callback, false);
                return;
            } else if (DOMElement.attachEvent) {
                DOMElement.attachEvent("on" + type, callback);
            } else {
                throw new Error("<KeypseeIncompatibilityError>: This browser does not support addEventListener or attachEvent.");
            }
        };
        getType = function(obj) {
            if (typeof obj === "undefined") {
                return "undefined";
            }
            if (obj === null) {
                return String(obj);
            }
            return typeof obj === "object" || typeof obj === "function" ? class2Types[objProtoToStringFunc.call(obj)] || "object" : typeof obj;
        };
        isArray = function(obj) {
            return getType(obj) === "array";
        };
        isFunction = function(obj) {
            return getType(obj) === "function";
        };
        isBoolean = function(obj) {
            return getType(obj) === "boolean";
        };
        isObject = function(obj) {
            return getType(obj) === "object";
        };
        return new Utils();
    }
});

(function(exports, scope) {
    "use strict";
    (function() {
        scope.register({
            name: "FileReader",
            factory: function() {
                return FileReader;
            }
        });
        scope.register({
            name: "JSON",
            factory: function() {
                return JSON;
            }
        });
        scope.register({
            name: "console",
            factory: function() {
                return console;
            }
        });
    })();
    exports.Keypsee = function(options) {
        options = options || {};
        var maps = scope.resolve("maps"), helpers = scope.resolve("helpers").init(maps);
        return scope.resolve("observer").init(helpers, options.DOMElement || document);
    };
})(window, Hilary.scope("keypsee"));