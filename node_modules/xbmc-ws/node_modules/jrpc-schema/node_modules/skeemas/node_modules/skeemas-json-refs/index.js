var jsonPointer = require('skeemas-json-pointer');

var protoJsonRefs = {
	add: function(uri, subject) {
		if(typeof uri !== 'string')
			throw new Error('Unable to add JSON Ref: uri must be of type "string"');

		if(~uri.indexOf('#'))
			throw new Error('Unable to add JSON Ref (' + uri + '): uri cannot include a fragment identifier (#)');

		this.__refs[uri] = subject;
		return this;
	},

	remove: function(uri) {
		delete this.__refs[uri];
		return this;
	},

	get: function(uri, subject, ignoreFragment) {
		if(typeof uri !== 'string')
			throw new Error('Unable to get JSON Ref: uri must be of type "string"');

		var parts = uri.split('#');

		if(parts.length > 2)
			throw new Error('Unable to get JSON Ref (' + uri + '): uri cannot contain multiple fragment identifiers (#)');

		if(parts[0])
			subject = this.__refs[parts[0]];

		if(!subject)
			throw new Error('Unable to locate JSON Ref (' + parts[0] + ')');

		if(parts.length === 1 || ignoreFragment)
			return subject;

		return jsonPointer(parts[1]).get(subject);
	}
};

module.exports = function() {
	return Object.create(protoJsonRefs, {
		__refs: { writable:false, configurable:false, enumerable:false, value: {} }
	});
};
