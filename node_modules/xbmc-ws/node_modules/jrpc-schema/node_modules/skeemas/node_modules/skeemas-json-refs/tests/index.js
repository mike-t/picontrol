var assert = require('chai').assert,
	jsonRefs = require('../');


describe('jsonRefs', function() {
	it('should have chainable "add" method', function() {
		var refs = jsonRefs();
		assert.strictEqual(refs.add('/foobar', {}), refs);
	});

	it('should have chainable "remove" method', function() {
		var refs = jsonRefs();
		assert.strictEqual(refs.remove('/foobar'), refs);
	});



	describe('"add"', function() {
		it('should error if uri is not a string', function() {
			assert.throws(function() {
				jsonRefs().add(42, {});
			});
		});

		it('should error if uri container fragment identifier', function() {
			assert.throws(function() {
				jsonRefs().add('/foo#/bar', {});
			});
		});

		it('should save a reference', function() {
			var uri = 'some',
				ref = {},
				refs = jsonRefs().add(uri, ref);
			assert.strictEqual(refs.__refs[uri], ref);
		});

		it('should save a relative file reference', function() {
			var uri = 'some/path.json',
				ref = {},
				refs = jsonRefs().add(uri, ref);
			assert.strictEqual(refs.__refs[uri], ref);
		});

		it('should save an absolute file reference', function() {
			var uri = '/some/path.json',
				ref = {},
				refs = jsonRefs().add(uri, ref);
			assert.strictEqual(refs.__refs[uri], ref);
		});

		it('should save a url reference', function() {
			var uri = 'http://www.foo-bar.com/some/path.json',
				ref = {},
				refs = jsonRefs().add(uri, ref);
			assert.strictEqual(refs.__refs[uri], ref);
		});
	});



	describe('"get"', function() {
		it('should error if uri is not a string', function() {
			assert.throws(function() {
				jsonRefs().get(42);
			});
		});

		it('should error if uri has multiple #', function() {
			assert.throws(function() {
				jsonRefs().get('/foo#/bar#/baz');
			});
		});

		it('should error if reference is missing', function() {
			assert.throws(function() {
				jsonRefs().get('/foo');
			});
		});

		it('should return a value from an object', function() {
			var refs = jsonRefs(),
				val = refs.get('#/type', { type:'test' });
			assert.strictEqual(val, 'test');
		});

		it('should return a full reference', function() {
			var ref = {},
				refs = jsonRefs().add('/foo', ref),
				val = refs.get('/foo');
			assert.strictEqual(val, ref);
		});

		it('should return a value from a reference', function() {
			var refs = jsonRefs().add('/foo', { type:'test' }),
				val = refs.get('/foo#/type');
			assert.strictEqual(val, 'test');
		});

		it('should return a nested value from a reference', function() {
			var refs = jsonRefs().add('/foo', { defs: { type:'test' } }),
				val = refs.get('/foo#/defs/type');
			assert.strictEqual(val, 'test');
		});

		it('should return an array from a reference', function() {
			var ref = [1, 2, 3],
				refs = jsonRefs().add('/foo', { bars:ref }),
				val = refs.get('/foo#/bars');
			assert.strictEqual(val, ref);
		});

		it('should return an array item from a reference', function() {
			var refs = jsonRefs().add('/foo', { bars:[1, 2, 3] }),
				val = refs.get('/foo#/bars/1');
			assert.strictEqual(val, 2);
		});
	});
});
