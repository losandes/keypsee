/*globals Keypsee, jQuery, console, window*/
(function ($, Keypsee) {
    "use strict";
    
    var observer = new Keypsee(),
        enumerateClipboard,
        appendTarget,
        observeImagePaste,
        observeImageStringAndHtmlPaste;
    
    enumerateClipboard = function (clipboard, callback) {
        var item,
            i;
        
        for (i = 0; i < clipboard.items.length; i += 1) {
            item = clipboard.items[i];

            callback(item);
        }
    };
    
    appendTarget = function (event, keyInfo, clipboard, html) {
        $(event.target).append(html);
        
        console.log('you pasted and image', {
            event: event,
            keyInfo: keyInfo,
            clipboard: clipboard
        });
    };
    
    observeImagePaste = function () {
        observer.observePaste({
            syncCallback: function (event, keyInfo, clipboard) {
                var prevent = false;

                enumerateClipboard(clipboard, function (item) {
                    if (item.type.indexOf('image') > -1) {
                        prevent = true;
                    }
                });

                if (prevent) {
                    observer.eventHelpers.preventDefault(event);
                    observer.eventHelpers.stopPropagation(event);
                }
                // otherwise, let the default behavior happen
            },
            asyncCallback: function (event, keyInfo, clipboard) {
                var html = '';

                enumerateClipboard(clipboard, function (item) {
                    if (item.type.indexOf('image') > -1 && item.dataUrl) {
                        html = $('<img>')
                            .attr('src', item.dataUrl)
                            .attr('alt', 'user entered image');
                        
                        appendTarget(event, keyInfo, clipboard, html);
                    }
                });
            }
        });
    };
    
    observeImageStringAndHtmlPaste = function () {
        observer.observePaste({
            asyncCallback: function (event, keyInfo, clipboard) {
                var html = '';

                enumerateClipboard(clipboard, function (item) {
                    if (item.type.indexOf('image') > -1 && item.dataUrl) {
                        html = $('<img>')
                            .attr('src', item.dataUrl)
                            .attr('alt', 'user entered image');
                        
                        appendTarget(event, keyInfo, clipboard, html);
                    } else if (item.type.indexOf('text/html') > -1 && item.data) {
                        html = $(item.data);
                        appendTarget(event, keyInfo, clipboard, html);
                    } else if (item.kind === 'string' && item.data) {
                        html = item.data;
                        appendTarget(event, keyInfo, clipboard, html);
                    }
                });
            }
        });
    };
    
    //observeImagePaste();
    observeImageStringAndHtmlPaste();
    
    
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
