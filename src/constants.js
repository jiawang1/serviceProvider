'user strict';

const __defineConst = (name, val)=>{

	Object.defineProperty(exports, name, {
		value: val,
		enumerable:   true,
		writable:     false,
		configurable: false
	});
};

const defineConst = (obj)=>{

	Object.keys(obj).map(key=>{
		__defineConst(key, obj[key]);
	});
};


defineConst({
	SERVICE_CONFIG: './_config/serviceConfig.json',
	SERVER_CONFIG: './_config/serverConfig.json',
	MIME:{
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

});


