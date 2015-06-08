function fastMap(array, fn) {
	var len = array.length,
		result = new Array(len);

	for(var i = 0; i < len; i++) result[i] = fn(array[i]);

	return result;
}

function decodeToken(ref) {
	return decodeURI(ref.replace(/~1/g, '/').replace(/~0/g, '~'));
}

function parse(strPointer) {
	if(typeof strPointer !== 'string')
		throw new Error('Invalid JSON Pointer: invalid type (' + (typeof strPointer) + ')');

	// Remove the leading hash if it exists
	var arrPointer = fastMap((strPointer[0] === '#' ? strPointer.substr(1) : strPointer).split('/'), decodeToken);

	if(arrPointer[0] !== '')
		throw new Error('Invalid JSON Pointer ("' + strPointer + '"): non-empty pointers must begin with "/" or "#/"');

	return arrPointer;
}

function get(arrPointer, subject) {
	for(var i = 1, len = arrPointer.length; i < len; i++) {
		subject = subject && subject[arrPointer[i]];
		if(subject === undefined) return;
	}
	return subject;
}

function set(arrPointer, subject, value) {
	for(var i = 1, len = arrPointer.length - 1; i < len; i++) {
		subject = (subject || undefined) && subject[arrPointer[i]];
		if(subject === undefined) return false;
	}

	if(typeof subject !== 'object') return false;

	var key = arrPointer[i];
	if(key === '-') {
		if(!Array.isArray(subject)) return false;
		subject[subject.length] = value;
		return true;
	}

	subject[key] = value;
	return true;
}

var protoPointer = {
	get: function(subject) {
		return get(this.__arrPointer, subject);
	},
	set: function(subject, value) {
		return set(this.__arrPointer, subject, value);
	}
};

module.exports = function(sPointer) {
	return Object.create(protoPointer, {
		__sPointer: { writable:false, configurable:false, enumerable:false, value: sPointer },
		__arrPointer: { writable:false, configurable:false, enumerable:false, value: parse(sPointer) }
	});
};
