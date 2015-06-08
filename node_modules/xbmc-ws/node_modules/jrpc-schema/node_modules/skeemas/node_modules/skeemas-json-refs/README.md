# skeemas-json-refs

Lightweight solution for resolving [JSON Refs](http://tools.ietf.org/html/draft-pbryan-zyp-json-ref-03)

## Install
```bash
npm install skeemas-json-refs
```

## Usage
```js
var jsonRefs = require('skeemas-json-refs'),
	refs = jsonRefs();

refs.add('/some/uri/ref', { 
	nested: { foo:'bar' },
	list: [0, 1, 2]
});

refs.get('/some/uri/ref'); 
// => the whole object

refs.get('/some/uri/ref#/nested/foo'); 
// => 'bar'

refs.get('/some/uri/ref#/list'); 
// => [0, 1, 2]
```
