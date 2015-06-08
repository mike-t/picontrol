var assert = require('chai').assert,
	jsonPointer = require('../');

function make() {
	return {
		"val": "value",
		"nested": { "deeply": { "deeper":"deep value" } },
		"foo": ["bar", "baz"],
		"": 0,
		"a/b": 1,
		"c%d": 2,
		"e^f": 3,
		"g|h": 4,
		"i\\j": 5,
		"k\"l": 6,
		" ": 7,
		"m~n": 8
	};
}


describe('jsonPointer', function() {
	it('should have a "get" method', function() {
		var ptr = jsonPointer('');
		assert.isFunction(ptr.get);
	});

	it('should have a "set" method', function() {
		var ptr = jsonPointer('');
		assert.isFunction(ptr.set);
	});

	it('should throw an error if pointer is not a string', function() {
		assert.throws(function() {
			jsonPointer(42);
		});
	});

	it('should throw an error if pointer is an array', function() {
		assert.throws(function() {
			jsonPointer(['n', 'o']);
		});
	});

	it('should throw an error if pointer does not start with "/"', function() {
		assert.throws(function() {
			jsonPointer('foo/bar');
		});
	});

	it('should throw an error if pointer does not start with "#/"', function() {
		assert.throws(function() {
			jsonPointer('#foo/bar');
		});
	});



	describe('"get"', function() {
		var subject = make();

		it('with "" should return the whole object', function() {
			var val = jsonPointer('').get(subject);
			assert.strictEqual(val, subject);
		});

		it('with "#" should return the whole object', function() {
			var val = jsonPointer('#').get(subject);
			assert.strictEqual(val, subject);
		});

		it('should retrieve a value', function() {
			var val = jsonPointer('/val').get(subject);
			assert.strictEqual(val, 'value');
		});

		it('should retrieve a value with uri fragment identifier', function() {
			var val = jsonPointer('#/val').get(subject);
			assert.strictEqual(val, 'value');
		});

		it('should retrieve an array', function() {
			var val = jsonPointer('/foo').get(subject);
			assert.isArray(val);
			assert.strictEqual(val, subject.foo);
		});

		it('should retrieve an array item', function() {
			var val = jsonPointer('/foo/0').get(subject);
			assert.strictEqual(val, 'bar');
		});

		it('should retrieve an object', function() {
			var val = jsonPointer('/nested').get(subject);
			assert.strictEqual(val, subject.nested);
		});

		it('should retrieve a deeply nested value', function() {
			var val = jsonPointer('/nested/deeply/deeper').get(subject);
			assert.strictEqual(val, 'deep value');
		});

		it('should retrieve a property named ""', function() {
			var val = jsonPointer('/').get(subject);
			assert.strictEqual(val, 0);
		});

		it('should retrieve a property with "/"', function() {
			var val = jsonPointer('/a~1b').get(subject);
			assert.strictEqual(val, 1);
		});

		it('should retrieve a property with "%"', function() {
			var val = jsonPointer('/c%d').get(subject);
			assert.strictEqual(val, 2);
		});

		it('should retrieve a property with "^"', function() {
			var val = jsonPointer('/e^f').get(subject);
			assert.strictEqual(val, 3);
		});

		it('should retrieve a property with "|"', function() {
			var val = jsonPointer('/g|h').get(subject);
			assert.strictEqual(val, 4);
		});

		it('should retrieve a property with "\\"', function() {
			var val = jsonPointer('/i\\j').get(subject);
			assert.strictEqual(val, 5);
		});

		it('should retrieve a property with \'"\'', function() {
			var val = jsonPointer('/k\"l').get(subject);
			assert.strictEqual(val, 6);
		});

		it('should retrieve a property named " "', function() {
			var val = jsonPointer('/ ').get(subject);
			assert.strictEqual(val, 7);
		});

		it('should retrieve a property with "~"', function() {
			var val = jsonPointer('/m~0n').get(subject);
			assert.strictEqual(val, 8);
		});
	});



	describe('"set"', function() {
		it('should set a value', function() {
			var subject = make();
			jsonPointer('/val').set(subject, 'test');
			assert.strictEqual(subject.val, 'test');
		});

		it('should set a nested value', function() {
			var subject = make();
			jsonPointer('/nested/deeply/deeper').set(subject, 'test');
			assert.strictEqual(subject.nested.deeply.deeper, 'test');
		});

		it('should set an object', function() {
			var subject = make(),
				val = {};
			jsonPointer('/nested/deeply').set(subject, val);
			assert.strictEqual(subject.nested.deeply, val);
		});

		it('should set an array', function() {
			var subject = make(),
				val = [];
			jsonPointer('/nested/deeply').set(subject, val);
			assert.strictEqual(subject.nested.deeply, val);
		});

		it('should set an array item', function() {
			var subject = make();
			jsonPointer('/foo/0').set(subject, 'test');
			assert.strictEqual(subject.foo[0], 'test');
		});

		it('should append an array item', function() {
			var subject = make();
			jsonPointer('/foo/-').set(subject, 'test');
			assert.lengthOf(subject.foo, 3);
			assert.strictEqual(subject.foo[2], 'test');
		});

		it('should retrieve a property named ""', function() {
			var subject = make();
			jsonPointer('/').set(subject, 'test');
			assert.strictEqual(subject[''], 'test');
		});

		it('should retrieve a property with "/"', function() {
			var subject = make();
			jsonPointer('/a~1b').set(subject, 'test');
			assert.strictEqual(subject['a/b'], 'test');
		});

		it('should retrieve a property with "%"', function() {
			var subject = make();
			jsonPointer('/c%d').set(subject, 'test');
			assert.strictEqual(subject['c%d'], 'test');
		});

		it('should retrieve a property with "^"', function() {
			var subject = make();
			jsonPointer('/e^f').set(subject, 'test');
			assert.strictEqual(subject['e^f'], 'test');
		});

		it('should retrieve a property with "|"', function() {
			var subject = make();
			jsonPointer('/g|h').set(subject, 'test');
			assert.strictEqual(subject['g|h'], 'test');
		});

		it('should retrieve a property with "\\"', function() {
			var subject = make();
			jsonPointer('/i\\j').set(subject, 'test');
			assert.strictEqual(subject['i\\j'], 'test');
		});

		it('should retrieve a property with \'"\'', function() {
			var subject = make();
			jsonPointer('/k\"l').set(subject, 'test');
			assert.strictEqual(subject['k"l'], 'test');
		});

		it('should retrieve a property named " "', function() {
			var subject = make();
			jsonPointer('/ ').set(subject, 'test');
			assert.strictEqual(subject[' '], 'test');
		});

		it('should retrieve a property with "~"', function() {
			var subject = make();
			jsonPointer('/m~0n').set(subject, 'test');
			assert.strictEqual(subject['m~n'], 'test');
		});
	});
});
