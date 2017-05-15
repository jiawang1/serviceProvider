 
const wrapToPromise = (fn, context) => (...args) => {

	return new Promise((resolve, reject) => {
		fn.call(context || null, ...args, (err, ...val) => {
			if (err) {
				reject(err);
			} else {
				resolve(...val);
			}
		})
	});
};

const bind = (fn, context)=> {
	return function () {
		return fn.apply(context, [].slice.call(arguments));
	}
}


module.exports = {
	wrapToPromise, 
	bind
};

const __isType = (type)=>(oTarget)=>{
	return Object.prototype.toString.call(target).replace(/^.*\s(.*)]$/, '$1') === type;
};

var oType = module.exports;
['String', 'Object', 'Number','Undefined','Function'].forEach((_type)=>{
	oType[`is${_type}`] = __isType(_type);
});


