# skeemas-json-pointer

Lightweight implementation of [JSON Pointers](https://tools.ietf.org/html/rfc6901)

## Install
```bash
npm install skeemas-json-pointer
```

## Pointers for Getting Values
```js
var jsonPointer = require('skeemas-json-pointer');

// Getting values
jsonPointer('#/foo').get({ foo:'bar' }); 
// =>'bar'

jsonPointer('#/nested/foo').get({ 
	nested: { foo:'bar' }
}); 
// =>'bar'

jsonPointer('#/nested/foo/1').get({ 
	nested: { foo:['bar','bat','baz'] }
}); 
// =>'bat'
```

## Pointers for Setting Values
```js
var subject = { 
	nested: { foo:'bar' },
	list: [0, 1, 2]
};

// Change a property value
jsonPointer('#/nested/foo').set('baz'); 

// Change an array item
jsonPointer('#/list/1').set('one'); 

// Append an array item
jsonPointer('#/list/-').set('last'); 

assert.deepEqual(subject, {
	nested: { foo:'baz' },
	list: [0, 'one', 2, 'last']
});
```
