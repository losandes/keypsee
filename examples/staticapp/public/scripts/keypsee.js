/*! keypsee-build 2015-05-09 */
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
            var makeCallbackKey, registerCallback, executePasteCallback, executeOnePasteCallback, executeCallback, executeOneCallback, modifiersAreSame, getKeyInfo, getKeyInfoFromEvent, keysFromString, isModifier, getEventModifiers, pickBestEventType, characterFromEvent, Helpers;
            Helpers = function() {
                var self = this;
                self.registerCallback = registerCallback;
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
                if (utils.isFunction(callback.func) && callback.func(event, eventKeyInfo, items) === false) {
                    utils.preventDefault(event);
                    utils.stopPropagation(event);
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
                return combination.split("+");
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
            if (typeof keyinfo.matchAnyModifier !== "undefined") {
                self.matchAnyModifier = keyinfo.matchAnyModifier;
            } else {
                self.matchAnyModifier = false;
            }
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
            self.reverseMap = reverseMap;
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
        var observe, observeOne, observePaste, observeDomEvent, observeKeyEvents, stopObserving, isStarted = false, keyEventHandler, helpers, Observer;
        Observer = function() {
            var self = this;
            self.start = function(helprs) {
                if (isStarted) {
                    return self;
                }
                helpers = helprs;
                observeKeyEvents(document);
                isStarted = true;
                return self;
            };
            self.observeDomEvent = observeDomEvent;
            self.observeKeyEvents = observeKeyEvents;
            self.observe = function(keys, eventType, matchAnyModifier, callback) {
                keys = utils.isArray(keys) ? keys : [ keys ];
                if (utils.isFunction(matchAnyModifier)) {
                    observe(keys, eventType, false, matchAnyModifier);
                } else {
                    observe(keys, eventType, matchAnyModifier, callback);
                }
                return self;
            };
            self.stopObserving = stopObserving;
            self.trigger = function(mockEvent) {
                keyEventHandler(mockEvent);
            };
            self.getMaps = function() {
                return helpers.maps;
            };
            self.dispose = function() {
                helpers.dispose();
            };
        };
        observe = function(keys, eventType, matchAnyModifier, callback) {
            var currentKey, i;
            for (i = 0; i < keys.length; i += 1) {
                currentKey = keys[i];
                if (currentKey === "paste") {
                    observePaste(callback);
                } else {
                    observeOne(currentKey, eventType, matchAnyModifier, callback);
                }
            }
        };
        observeOne = function(key, eventType, matchAnyModifier, callback) {
            var keyInfo = helpers.getKeyInfo(key, eventType), callbackObj;
            keyInfo.matchAnyModifier = matchAnyModifier;
            callbackObj = new Callback({
                key: key,
                keyInfo: keyInfo,
                callback: callback,
                eventType: eventType
            });
            helpers.registerCallback(keyInfo, callbackObj);
        };
        observePaste = function(callback) {
            var keyInfo = helpers.getKeyInfo("paste", "void"), callbackObj;
            callbackObj = new Callback({
                key: "paste",
                keyInfo: keyInfo,
                callback: callback,
                eventType: "void"
            });
            helpers.registerCallback(keyInfo, callbackObj);
            if (document.onpaste !== undefined) {
                document.onpaste = function(event) {
                    var i, items, output = {
                        items: [],
                        json: ""
                    }, item, pasteObj;
                    items = (event.clipboardData || event.originalEvent.clipboardData).items;
                    output.json = JSON.stringify(items);
                    for (i in items) {
                        if (items.hasOwnProperty(i)) {
                            item = items[i];
                            pasteObj = new PasteObject({
                                kind: item.kind,
                                type: item.type
                            });
                            if (item.kind === "file" && item.getAsFile) {
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
        stopObserving = function(keys, eventType) {
            throw new Error("stopObserving is not implemented");
        };
        keyEventHandler = function(event) {
            var info = helpers.getKeyInfoFromEvent(event);
            if (!info.key) {
                return;
            }
            helpers.executeCallback(info, event);
        };
        observeDomEvent = function(domObject, eventType) {
            utils.observeDomEvent(domObject, eventType, keyEventHandler);
            return this;
        };
        observeKeyEvents = function(domObject) {
            observeDomEvent(domObject, "keypress");
            observeDomEvent(domObject, "keydown");
            observeDomEvent(domObject, "keyup");
            return this;
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
        var preventDefault, stopPropagation, observeDomEvent, getType, isArray, isFunction, objProto = Object.prototype, objProtoToStringFunc = objProto.toString, objProtoHasOwnFunc = objProto.hasOwnProperty, class2Types = {}, class2ObjTypes = [ "Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error" ], Utils;
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
        observeDomEvent = function(obj, type, callback) {
            if (obj.addEventListener) {
                obj.addEventListener(type, callback, false);
                return;
            }
            obj.attachEvent("on" + type, callback);
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
    exports.Keypsee = function() {
        var maps = scope.resolve("maps"), helpers = scope.resolve("helpers").init(maps);
        return scope.resolve("observer").start(helpers);
    };
})(window, Hilary.scope("keypsee"));