/*globals Hilary*/
/*
// Keyboard mappings for event handling
*/
Hilary.scope('keypsee').register({
    name: 'maps',
    factory: function () {
        "use strict";

        var i,
            map,
            keycodeMap,
            shiftMap,
            reverseMap,
            getReverseMap,
            aliases,
            callbackMap = {},
            Maps;
        
        // this is the object that is returned by this function
        Maps = function () {
            var self = this;
            
            /*
            // mapping of special keycodes to their corresponding keys
            //
            // everything in this dictionary cannot use keypress events
            // so it has to be here to map to the correct keycodes for
            // keyup/keydown events
            //
            // @type {Object}
            */
            self.map = map;

            /*
            // mapping for special characters so they can support
            //
            // this dictionary is only used incase you want to bind a
            // keyup or keydown event to one of these keys
            //
            // @type {Object}
            */
            self.keycodeMap = keycodeMap;

            /*
            // this is a mapping of keys that require shift on a US keypad
            // back to the non shift equivelents
            //
            // this is so you can use keyup events with these keys
            //
            // note that this will only work reliably on US keyboards
            //
            // @type {Object}
            */
            self.shiftMap = shiftMap;

            /*
            // this is a list of special strings you can use to map
            // to modifier keys when you specify your keyboard shortcuts
            //
            // @type {Object}
            */
            self.aliases = aliases;

            /*
            // reverses the map lookup so that we can look for specific keys
            // to see what can and can't use keypress
            //
            // @return {Object}
            */
            self.getReverseMap = getReverseMap;

            /*
            // where the registered callbacks are stored
            */
            self.callbackMap = callbackMap;
            
            /*
            // disposes the callbackMap
            */
            self.dispose = function () {
                delete self.callbackMap;
                callbackMap = {};
                self.callbackMap = callbackMap;
            };
        };

        map = {
            8: 'backspace',
            9: 'tab',
            13: 'enter',
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            20: 'capslock',
            27: 'esc',
            32: 'space',
            33: 'pageup',
            34: 'pagedown',
            35: 'end',
            36: 'home',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            45: 'ins',
            46: 'del',
            91: 'meta',
            93: 'meta',
            224: 'meta'
        };

        keycodeMap = {
            106: '*',
            107: '+',
            109: '-',
            110: '.',
            111 : '/',
            186: ';',
            187: '=',
            188: ',',
            189: '-',
            190: '.',
            191: '/',
            192: '`',
            219: '[',
            220: '\\',
            221: ']',
            222: '\''
        };

        shiftMap = {
            '~': '`',
            '!': '1',
            '@': '2',
            '#': '3',
            '$': '4',
            '%': '5',
            '^': '6',
            '&': '7',
            '*': '8',
            '(': '9',
            ')': '0',
            '_': '-',
            '+': '=',
            ':': ';',
            '\"': '\'',
            '<': ',',
            '>': '.',
            '?': '/',
            '|': '\\'
        };

        aliases = {
            'option': 'alt',
            'command': 'meta',
            'return': 'enter',
            'escape': 'esc',
            'plus': '+',
            'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
        };

        /**
         * loop through the f keys, f1 to f19 and add them to the map
         * programatically
         */
        for (i = 1; i < 20; i += 1) {
            map[111 + i] = 'f' + i;
        }

        /**
         * loop through to map numbers on the numeric keypad
         */
        for (i = 0; i <= 9; i += 1) {
            map[i + 96] = i;
        }

        getReverseMap = function () {
            if (!reverseMap) {
                var key;
                reverseMap = {};

                for (key in map) {
                    // only process the key if it exists in the map and the key is
                    // not from the numeric keypad
                    if (map.hasOwnProperty(key) && !(key > 95 && key < 112)) {
                        reverseMap[map[key]] = key;
                    }
                } // /for

            } // /if

            return reverseMap;
        };

        return new Maps();
    }
});
