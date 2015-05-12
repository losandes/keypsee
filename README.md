# keypsee
Keypsee is a simple JavaScript library for handling keystroke events.

You can create multiple instances of keypsee. By default, it binds to ``document``.
```JavaScript
var observer = new Keypsee();
```

To bind to a specific element, construct a new Keypsee instance with the ``DOMElement argument``:
```JavaScript
var observer = new Keypsee({ DOMElement: document.querySelector('.my-element') });

// or with jQuery
var observer = new Keypsee({ DOMElement: $('.my-element')[0] });
```

Observe key events:
```JavaScript
observer.observe('command+b', 'keypress', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});

```

Observe multiple key combinations for a single handler:
```JavaScript
observer.observe(['ctrl+b', 'command+b'], 'keypress', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

Observe complex key combinations. In the following example, the callback will fire
if the user presses ``command+shift+b``, but it will not fire if the user presses
``command+b`` or ``shift+b``:
```JavaScript
observer.observe('command+shift+b', 'keydown', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

If you're not sure whether you should bind to ``keyup`` or ``keydown``, let Keypsee
choose the best key event by using ``keypress``, but note that it's not fullproof. For
instance, to observe 'ctrl+plus', you must use the ``keydown`` event.
```JavaScript
observer.observe(['ctrl+b', 'command+b'], 'keypress', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

Handlers are appended to observations, they don't overwrite them. In the following example,
the callbacks of both observations will be executed when the user presses the key combinations:
```JavaScript
observer.observe('command+shift+b', 'keypress', true, function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});

observer.observe('command+shift+b', 'keypress', true, function (event, keyInfo) {
    console.log('Hello World!');
});

```

In order to observe the plus symbol, you must use the word "plus" because "+" is the
key delimiter. Note that the keydown event must be used to observe a plus.
```JavaScript
observer.observe('ctrl+plus', 'keydown', true, function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```
