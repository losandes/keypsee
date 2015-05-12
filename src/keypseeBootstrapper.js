/*globals Hilary, FileReader, JSON, console*/
(function (exports, scope) {
    "use strict";
    
    // COMPOSE
    (function () {
        
        scope.register({
            name: 'FileReader',
            factory: function () {
                return FileReader;
            }
        });
        
        scope.register({
            name: 'JSON',
            factory: function () {
                return JSON;
            }
        });
        
        scope.register({
            name: 'console',
            factory: function () {
                return console;
            }
        });
        
    }());
    
    exports.Keypsee = function (options) {
        options = options || {};
        
        var maps = scope.resolve('maps'),
            helpers = scope.resolve('helpers').init(maps);
        return scope.resolve('observer').init(helpers, options.DOMElement || document);
    };
    
}(window, Hilary.scope('keypsee')));
