/*globals Hilary*/
/*
// The observer will become the public nicephore when initialized
*/
Hilary.scope('keypsee').register({
    name: 'PasteObserver',
    dependencies: ['utils', 'Callback', 'PasteObject', 'JSON'],
    factory: function (utils, Callback, PasteObject, JSON) {
        "use strict";

        var observePaste,
            helpers,
            observedDOMElement,
            defaultSyncPasteCallback,
            enumerateClipboardItems,
            handleClipboardItem,
            makeAssertion,
            makePasteHandler,
            when,
            pollingSettings = {
                maxAttempts: 9000,
                attemptInterval: 10
            },
            PasteObserver;
        
        // this is what is returned by this function
        PasteObserver = function (options) {
            var self = this;
            
            helpers = options.helpers;
            observedDOMElement = options.DOMElement;

            if (options.pollingSettings
                    && typeof options.pollingSettings.maxAttempts === 'number'
                    && typeof options.pollingSettings.attemptInterval === 'number') {
                pollingSettings = options.pollingSettings;
            }
            
            /*
            // makes the paste event observable
            //
            // @param {Object} options: the options for the paste event
            // @param {Function} options.syncCallback: a synchronous callback that can be used to effect
            //      behavior, such as preventDefault and stopPropagation
            // @param {Function} options.asyncCallback: an asynchronous callback that is exectuted after
            //      all clipboard data is parsed (i.e. file reads)
            */
            self.observePaste = function (options) {
                if (!utils.isObject(options) || !utils.isFunction(options.asyncCallback)) {
                    throw new Error('An object literal with at least a callback property is required to call observePaste');
                }
                
                options.syncCallback = options.syncCallback || defaultSyncPasteCallback;
                
                observePaste(options.asyncCallback, options.syncCallback);
            };
        };
        
        defaultSyncPasteCallback = function (event) {
            utils.preventDefault(event);
            utils.stopPropagation(event);
        };

        observePaste = function (asyncCallback, syncCallback) {
            var DOMEle = observedDOMElement.onpaste !== undefined ? observedDOMElement : document,
                asyncKeyInfo,
                asyncCallbackObj,
                syncKeyInfo,
                syncCallbackObj;
            
            if (DOMEle.onpaste !== undefined) {
                asyncKeyInfo = helpers.getKeyInfo('paste', 'async');
                syncKeyInfo = helpers.getKeyInfo('paste', 'sync');
                
                asyncCallbackObj = new Callback({ key: 'paste', keyInfo: asyncKeyInfo, callback: asyncCallback, eventType: 'async' });
                syncCallbackObj = new Callback({ key: 'paste', keyInfo: syncKeyInfo, callback: syncCallback, eventType: 'sync' });
                helpers.registerCallback(asyncKeyInfo, asyncCallbackObj);
                helpers.registerCallback(syncKeyInfo, syncCallbackObj);
                
                DOMEle.onpaste = makePasteHandler(asyncKeyInfo, syncKeyInfo);
            } else {
                throw new Error('<KeypseeIncompatibilityError>: this browser does not support the onpaste event');
            }
        };
        
        enumerateClipboardItems = function (items, waitList, clipboard) {
            var i;
            
            for (i in items) {
                if (items.hasOwnProperty(i) && items[i].kind && items[i].type) {
                    handleClipboardItem(items[i], waitList, clipboard);
                }
            }
        };
        
        handleClipboardItem = function (item, waitList, clipboard) {
            var pasteObj = new PasteObject({
                kind: item.kind,
                type: item.type
            });

            if (item.kind === 'file' && item.getAsFile) {
                waitList.push({
                    item: pasteObj,
                    property: 'dataUrl'
                });
                pasteObj.file = item.getAsFile();
                pasteObj.toDataUrl();
            } else if (item.getData) {
                waitList.push({
                    item: pasteObj,
                    property: 'data'
                });
                pasteObj.data = item.getData(pasteObj.type);
            } else if (item.getAsString) {
                waitList.push({
                    item: pasteObj,
                    property: 'data'
                });
                item.getAsString(function (data) {
                    pasteObj.data = data;
                });
            }

            clipboard.items.push(pasteObj);
        };
        
        makeAssertion = function (waitList) {
            return function () {
                var outcome = true,
                    i;

                for (i = 0; i < waitList.length; i += 1) {
                    if (typeof waitList[i].item[waitList[i].property] !== undefined) {
                        outcome = outcome && true;
                    } else {
                        outcome = false;
                    }
                }

                return outcome;
            };
        };
            
        makePasteHandler = function (asyncKeyInfo, syncKeyInfo) {
            return function (event) {
                var i,
                    items,
                    item,
                    pasteObj,
                    waitList = [],
                    assert = makeAssertion(waitList),
                    then,
                    clipboard = {
                        items: [],
                        json: ''
                    };

                items = (event.clipboardData || event.originalEvent.clipboardData).items;
                clipboard.json = JSON.stringify(items); // will give you the mime types
                then = function () { // then is the async callback
                    helpers.executePasteCallback(asyncKeyInfo, event, clipboard);
                };

                enumerateClipboardItems(items, waitList, clipboard);

                // execute the synchronous callback
                helpers.executePasteCallback(syncKeyInfo, event, clipboard);

                if (waitList.length > 0) {
                    // try every 10ms for up to 1.5 minutes
                    when(assert, then, 0, pollingSettings.maxAttempts, pollingSettings.attemptInterval);
                } else {
                    then();
                }
            };
        };
        
        when = function (assert, then, waitCount, maxAttempts, attemptInterval) {
            if (typeof assert !== 'function' || typeof then !== 'function') {
                return false;
            }

            if (waitCount < maxAttempts) {
                // at this point, the file is still being read to the dataUrl
                setTimeout(function () {
                    if (assert()) {
                        waitCount = 0;
                        return then();
                    } else {
                        waitCount += 1;
                        return when(assert, then, waitCount, maxAttempts, attemptInterval);
                    }
                }, attemptInterval);
            } else {
                waitCount = 0;
                return false;
            }
        };

        return PasteObserver;
    }
});
