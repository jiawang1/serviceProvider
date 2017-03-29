 
 exports.wrapToPromise = (fn, context) => (...args) => {

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



