/*globals Hilary*/
/*
//
*/
Hilary.scope('keypsee').register({
    name: 'Callback',
    dependencies: ['KeyInfo', 'console'],
    factory: function (KeyInfo, console) {
        "use strict";
        
        var Callback;
        
        Callback = function (callback) {
            var self = this;
            
            callback = callback || {};
            
            self.key = callback.key;
            self.keyInfo = callback.keyInfo || new KeyInfo();
            self.func = callback.callback || function (event, eventKeyInfo) {
                console.log('event', event);
                console.log('keyInfo', eventKeyInfo);
            };
            
            self.eventType = callback.eventType;
        };
        
        return Callback;
    }
});
