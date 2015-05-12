/*globals Keypsee, jQuery, console, window*/
(function ($, Keypsee) {
    "use strict";
    
    var when,
        observer = new Keypsee();
    
    
    observer.observePaste({
        preventDefault: true,
        stopPropagation: true,
        callback: function (event, keyInfo, clipboard) {
            var assert,
                then,
                item,
                html = '',
                i;

            for (i = 0; i < clipboard.items.length; i += 1) {
                item = clipboard.items[i];

                if (item.type.indexOf('image') > -1 && item.dataUrl) {
                    html = $('<img>')
                        .attr('src', item.dataUrl)
                        .attr('alt', 'user entered image');
                } else if (item.type.indexOf('text/html') > -1 && item.data) {
                    html = $(item.data);
                } else if (item.kind === 'string' && item.data) {
                    html = item.data;
                }

                $(event.target).append(html);
            }

            console.log('you pasted and image', {
                event: event,
                keyInfo: keyInfo,
                clipboard: clipboard
            });
        }
    });
    
    observer.observe(['command+b'], 'keypress', function (event, keyInfo) {
        console.log('you pressed command+b', {
            event: event,
            keyInfo: keyInfo
        });
    });
    
    observer.observe(['ctrl+plus'], 'keydown', function (event, keyInfo) {
        console.log('you pressed ctrl+plus', {
            event: event,
            keyInfo: keyInfo
        });
    });
    
    observer.observeOnce(['command+shift+o'], 'keypress', function (event, keyInfo) {
        console.log('you pressed command+o', {
            event: event,
            keyInfo: keyInfo
        });
    });
    
}(jQuery, Keypsee));
