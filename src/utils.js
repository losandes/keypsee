/*globals Hilary*/
/*
// Utilities / Helpers for the keyboard observer
*/
Hilary.scope('keypsee').register({
    name: 'utils',
    factory: function () {
        "use strict";
        
        var preventDefault,
            stopPropagation,
            observeDomEvent,
            getType,
            isArray,
            isFunction,
            objProto = Object.prototype,
            objProtoToStringFunc = objProto.toString,
            objProtoHasOwnFunc = objProto.hasOwnProperty,
            class2Types = {},
            class2ObjTypes = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error"],
            Utils;
        
        // this is what is returned by this function
        Utils = function () {
            var self = this,
                name,
                i;
            
            for (i = 0; i < class2ObjTypes.length; i += 1) {
                name = class2ObjTypes[i];
                class2Types["[object " + name + "]"] = name.toLowerCase();
            }
            
            /*
            // prevents default for this event
            //
            // @param {Event} event
            // @returns void
            */
            self.preventDefault = preventDefault;

            /*
            // stops propogation for this event
            //
            // @param {Event} e
            // @returns void
            */
            self.stopPropagation = stopPropagation;

            /*
            // cross browser add event method
            //
            // @param {Element|HTMLDocument} object
            // @param {string} type
            // @param {Function} callback
            // @returns void
            */
            self.observeDomEvent = observeDomEvent;

            self.isArray = isArray;
            self.isFunction = isFunction;
        };

        preventDefault = function (event) {
            if (event.preventDefault) {
                event.preventDefault();
                return;
            }

            event.returnValue = false;
        };

        stopPropagation = function (event) {
            if (event.stopPropagation) {
                event.stopPropagation();
                return;
            }

            event.cancelBubble = true;
        };

        observeDomEvent = function (obj, type, callback) {
            if (obj.addEventListener) {
                obj.addEventListener(type, callback, false);
                return;
            }

            obj.attachEvent('on' + type, callback);
        };

        getType = function (obj) {
            if (typeof (obj) === "undefined") {
                return "undefined";
            }
            if (obj === null) {
                return String(obj);
            }

            return typeof obj === "object" || typeof obj === "function" ?
                    class2Types[objProtoToStringFunc.call(obj)] || "object" :
                    typeof obj;
        };

        isArray = function (obj) {
            return getType(obj) === 'array';
        };

        isFunction = function (obj) {
            return getType(obj) === 'function';
        };

        return new Utils();
    }
});
