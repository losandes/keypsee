/*globals Hilary*/
/*
//
*/
Hilary.scope('keypsee').register({
    name: 'KeyInfo',
    factory: function () {
        "use strict";
        
        var KeyInfo;
        
        KeyInfo = function (keyinfo) {
            var self = this;
            
            keyinfo = keyinfo || {};
            
            self.key = keyinfo.key;
            self.modifiers = keyinfo.modifiers;
            self.eventType = keyinfo.eventType;
        };
        
        return KeyInfo;
    }
});
