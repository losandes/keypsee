# keypsee
Keypsee is a simple JavaScript library for handling keystroke events.

You can create multiple instances of keypsee. By default, it binds to ``document``.
```JavaScript
var keypsee = new Keypsee();
```

To bind to a specific element, construct a new Keypsee instance with the ``DOMElement argument``:
```JavaScript
var keypsee = new Keypsee({ DOMElement: document.querySelector('.my-element') });

// or with jQuery
var keypsee = new Keypsee({ DOMElement: $('.my-element')[0] });
```

Observe key events:
```JavaScript
keypsee.observe('command+b', 'keypress', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

Observe multiple key combinations for a single handler:
```JavaScript
keypsee.observe(['ctrl+b', 'command+b'], 'keypress', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

Observe complex key combinations. In the following example, the callback will fire
if the user presses ``command+shift+b``, but it will not fire if the user presses
``command+b`` or ``shift+b``:
```JavaScript
keypsee.observe('command+shift+b', 'keydown', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

If you're not sure whether you should bind to ``keyup`` or ``keydown``, let Keypsee
choose the best key event by using ``keypress``, but note that it's not fullproof. For
instance, to observe 'ctrl+plus', you must use the ``keydown`` event.
```JavaScript
keypsee.observe(['ctrl+b', 'command+b'], 'keypress', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

Handlers are appended to observations, they don't overwrite them. In the following example,
the callbacks of both observations will be executed when the user presses the key combinations:
```JavaScript
keypsee.observe('command+shift+b', 'keypress', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});

keypsee.observe('command+shift+b', 'keypress', function (event, keyInfo) {
    console.log('Hello World!');
});
```

In order to observe the plus symbol, you must use the word "plus" because "+" is the
key delimiter. Note that the keydown event must be used to observe a plus.
```JavaScript
keypsee.observe('ctrl+plus', 'keydown', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

You can observe an event one-time-only using ``observeOnce``. After the event is triggered
a single time, it will no longer be observed by keypsee.
```JavaScript
keypsee.observeOnce('command+shift+b', 'keypress', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});

keypsee.observeOnce(['command+b', 'ctrl+b'], 'keypress', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

To stop observing an event:
```JavaScript
keypsee.stopObserving('command+shift+b', 'keypress');
keypsee.stopObserving(['command+b', 'ctrl+b'], 'keypress');
```

To stop observing all events:
To stop observing an event:
```JavaScript
keypsee.dispose();
```

Observing a paste event is a special case: ``observePaste``. The handler accepts three arguments:
``event, keyInfo, clipboard``. The ``clipboard`` object has two properties: ``items``,
which is a list of the pasted items, and ``json``, which is the serialized version of
the clipboard. By default, keypsee will prevent default behavior and propagation, when you
observe paste events. The following example overrides the paste behavior of a page and supports pasting
images, html and strings into a target.
```JavaScript
var enumerateClipboard,
    appendTarget;

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

keypsee.observePaste({
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
```

If you require more control over default behavior, propagation or if you need to take
synchronous action on a paste event, you can override the synchronous callback. The following
example only intercepts image file paste events. Other paste events, such as strings and HTML
are left alone.
```JavaScript
var enumerateClipboard,
    appendTarget;

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

keypsee.observePaste({
    syncCallback: function (event, keyInfo, clipboard) {
        var prevent = false;

        enumerateClipboard(clipboard, function (item) {
            if (item.type.indexOf('image') > -1) {
                prevent = true;
            }
        });

        if (prevent) {
            keypsee.eventHelpers.preventDefault(event);
            keypsee.eventHelpers.stopPropagation(event);
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
```
