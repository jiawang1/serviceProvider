'user strict';

const defineConst = (obj) => {

	const __defineConst = (name, val) => {
		Object.defineProperty(exports, name, {
			value: val,
			enumerable: true,
			writable: false,
			configurable: false
		});
	};

	Object.keys(obj).map(key => {
		__defineConst(key, obj[key]);
	});
};


defineConst({
	SERVICE_CONFIG: './_config/serviceConfig.json',
	SERVER_CONFIG: './_config/serverConfig.json',
	MIME: {
		"js": "application/javascript",
		"json": "application/json",
		"mp3": "audio/mpeg",
		"ogg": "audio/ogg",
		"wav": "audio/x-wav",
		"gif": "image/gif",
		"jpeg": "image/jpeg",
		"jpg": "image/jpeg",
		"png": "image/png",
		"svg": "image/svg+xml",
		"ico": "image/x-icon",
		"html": "text/html",
		"htm": "text/html",
		"txt": "text/plain",
		"text": "text/plain",
		"css": "text/css",
		"csv": "text/csv",
		"less": "text/css",
		"mp4": "video/mp4"
	},
/**
 * cacheFirst:  1 load cache -> 2 load remote -> 3 save cache -> 4 return.  working like data provider
 * remoteFirst: 1 load remote  -> yes , return , no -> 2 load from cache.  working with stable remote server 
 * remoteSync: 1 load remote -> yes , save cache, return , no -> return.  sync data 
*/
	cacheStrategy: {
		cacheFirst: 0,
		remoteFirst: 1,
	},
	workingMode : {
		proxyCache: 0,			// worked as http proxy, support redirect to endpoint server, cache all kinds of response
		dataProvider: 1,		// worked as data provider service, do not access other endpoint server, ONLY SUPPORT JSON data
		serviceProvider: 2 	    // simulate service, it can access remote server , or load data from cache, depends on cache stratigy
	},
	cacheLevel : {
		no: 0,				// cache no will load data only from endpoint server, but ignore cache
		normal: 1,			// cache normal will load data from endpoint server first, if no, then try to load data from cache, and persistent server data to cache
		cacheOnly: 2			// cache only will load data from cache, but ignore enpoint server
	},
	method:{
		httpGet:'GET',
		httpPost:'POST',
		httpPut:'PUT',
		httpDelete:'DELETE',
		httpOptions:'OPTIONS'
	}

});


