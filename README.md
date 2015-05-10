# keypsee
Keypsee is a JavaScript library for handling keystroke events.

```JavaScript
var observer = new Keypsee();
```

Observe multiple key combinations for a single handler:
```JavaScript
observer.observe(['ctrl+b', 'command+b'], 'keypress', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});

```

Observe *strict* key combinations. In the following example, the callback will fire
if the user presses ``ctrl+command+b``, but it will not fire if the user presses
``ctrl+b`` or ``command+b``:
```JavaScript
observer.observe('ctrl+command+b', 'keydown', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

Observe *optional* key combinations. In the following example, the callback will fire
if the user presses ``ctrl+b`` or ``command+b``:
```JavaScript
observer.observe('ctrl+command+b', 'keydown', true, function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

If you're not sure whether you should bind to ``keyup`` or ``keydown``, let Keypsee
choose the best key event by using ``keypress``:
```JavaScript
observer.observe(['ctrl+b', 'command+b'], 'keypress', function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});
```

Handlers are appended to observations, they don't overwrite them. In the following example, 
the callbacks of both observations will be executed when the user presses the key combinations:
```JavaScript
observer.observe('command+ctrl+b', 'keypress', true, function (event, keyInfo) {
    console.log('event', event);
    console.log('keyInfo', keyInfo);
});

observer.observe('command+ctrl+b', 'keypress', true, function (event, keyInfo) {
    console.log('Hello World!');
});

```
