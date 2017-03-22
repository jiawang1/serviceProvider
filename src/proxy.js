"use strict";

const http = require("http")
	 ,https = require("https")
	, ServiceConfig = require('./ServiceConfig.js')
	 ,path = require("path")
	 ,fs = require("fs")
	 ,CacheStream = require("./cacheStream")
	 ,View = require('./View')
	 ,zlib = require('zlib')
	 ,utils = require('./utils');
	 ,constructRoute = require('./route')
	, constants = require('./constants.js');

 const cacheLevel = {
	 no: 0,				// cache no will load data only from endpoint server, but ignore cache
	 normal: 1,			// cache normal will load data from endpoint server first, if no, then try to load data from cache, and persistent server data to cache
	 cacheOnly: 2			// cache only will load data from cache, but ignore enpoint server

 };

/**
 * cacheFirst:  1 load cache -> 2 load remote -> 3 save cache -> 4 return.  working like data provider
 * remoteFirst: 1 load remote  -> yes , save cache, return , no -> 2 load from cache.  working with stable remote server 
 * remoteSync: 1 load remote -> yes , save cache, return , no -> return.  sync data 
*/
 const cacheStrategy = {
	cacheFirst: 0,  
	remoteFirst: 1,
	remoteSync:2    
 };

 const workingMode = {
	 proxyCache: 0,			// worked as http proxy, support redirect to endpoint server, cache all kinds of response
	 dataProvider: 1,		// worked as data provider service, do not access other endpoint server, ONLY SUPPORT JSON data
	 serviceProvider: 2 	// simulate service, it can access remote server , or load data from cache, depends on cache stratigy
 };

 Map.prototype.copyFrom = function(...aMap){	  

	 aMap.forEach((_map)=>{
		 _map.forEach((v, k)=>{
			 this.set(k, v);
		 }); 
	 });
 };

 Map.prototype.toJson = function(){
	 return JSON.stringify([...this]);
 };

 Map.fromJson = function(jsonStr){
	 return new Map(JSON.parse(jsonStr));
 };


 class ServerConfig{

	 static getDefault(){
		 var __map =  new Map([
			 ["port", 8079]
			,["cacheLevel", cacheLevel.normal]
			,["workingMode", workingMode.dataProvider]
			,["endpointServer.address","https://localhost" ]
		//	,["endpointServer.address","https://www3.lenovo.com"]
			,["endpointServer.port", 9002 ]
			,["endpointServer.host", undefined]
			,["endpointServer.user", undefined]
			,["endpointServer.password", undefined]
			,["cacheFile","proxyCache.json" ]
			,["SSLKey","/Users/i054410/Documents/develop/self-cert/key.pem" ]
			,["SSLCert","/Users/i054410/Documents/develop/self-cert/cert.pem" ]
			,["relativePath","./../gitaws/hybris/bin/custom/ext-b2c/b2cstorefront/web/webroot"]
		//	,["proxy.host","proxy.pal.sap.corp"]
			//	,["proxy.port",8080]
			,["proxy.host",undefined]
			,["proxy.port",undefined]

		 ]);

		 let __defaultConfig = {};

		 for (let [key, val] of __map){

			 let tmp = __defaultConfig;
			 key.split('.').forEach((K, inx, arr)=>{

				 if(inx === arr.length -1){
					 tmp[K] = val;
				 }else{
					 tmp = tmp[K]?tmp[K]:tmp[K]={};
				 }
			 });
		 }

		 __defaultConfig.keys = function(){

			 return __map.keys();
		 }

		 ServerConfig.getDefault = function(){
			 return __defaultConfig;
		 }
		 return __defaultConfig;
	 }

	 static get fields(){
		 return Array.from(ServerConfig.getDefault().keys());
	 }

	 set (key, val){
		 if(ServerConfig.fields.indexOf(key) >= 0){
			 let _o = this.serverMap;
			 key.split('.').some((key, inx, arr)=>{
				 if(inx === arr.length-1){
					 if(_o[key] !== val){
						 this.isChanged = true;
						 _o[key] = val;
					 }
					 return true;
				 }else{
					 _o = _o[key];
				 }
			 });	
		 }
		 return this;
	 }

	 save(){
		 return  new Promise((resolve, reject)=>{
			 if(this.isChanged){
				 fs.writeFile(constants.SERVER_CONFIG, JSON.stringify(this.serverMap),(err)=>{

					 if(err){
						 reject(err);

					 }else{
						 resolve('success');
						 this.isChanged = false;
					 }
				 }) 

			 }else{
				 resolve('no change');
			 }

		 });
	 }

	 get(key){

		 if(key ==="endpointServer.host"){
			 return this.get("endpointServer.address").match(/^http(?:s)?:\/\/([^\/]+)/)[1];
		 }

		 var _o = this.serverMap;
		 key.split('.').forEach(key=>{
			 _o = _o[key];
		 });

		 return _o;

	 }
	 hasProxy(){
		 return !!(this.get("proxy")&&this.get("proxy").host&&this.get("proxy").host.length > 0);
	 }

	 isSSL(){
		 return this.get("endpointServer.address").indexOf("https") >= 0;
	 }

	 __retrieveSymbol(key){
		 return  this.__symbolMap.get(key) || this.__symbolMap.set(key, Symbol(key)).get(key);
	 }

	 __loadEnvironmentConfig(){

		 const aKeys = ServerConfig.fields;
		 var args = {}, envmap = {};

		 // load from package.json first if start up by npm
		 aKeys.forEach((key)=>{
			 if(process.env["npm_package_config_" + key]){
				 //	 envmap.set(key, process.env["npm_package_config_" + key]);
				 assignValue(key, process.env["npm_package_config_" + key], envmap )

			 }
		 });

		 // load from command line
		 process.argv.slice().reduce((pre, item)=>{
			 let matches;
			 if((matches = pre.match(/^--(.*)/)) &&( aKeys.indexOf(matches[1].toLowerCase()) >= 0)){
				 //envmap.set(matches[1].toLowerCase(), item);
				 //envmap[matches[1].toLowerCase()] = item;
				 assignValue(matches[1].toLowerCase(), item,envmap);

			 }	
			 return item;
		 });
		 return envmap;
	 }


	 calConfig(){

		 return this;
	 }

	 loadConfigFile(){
		 try{
			 fs.statSync(constants.SERVER_CONFIG);
			 var __config = fs.readFileSync(constants.SERVER_CONFIG,'utf-8');
			 return __config.length > 0 ? JSON.parse(__config): {};
			 //  return Map.fromJson(__config);

		 }catch(e){

			 try{
				 var stat = fs.statSync('./_config');

			 }catch(e){
				 fs.mkdirSync('./_config');
			 }
			 fs.writeFile(constants.SERVER_CONFIG, '');
			 return {};

		 }	
	 }

	 constructor(){
		 this.isChanged = false;
		 let defaultMap = ServerConfig.getDefault();
		 this.serverMap = {};
		 Object.assign(this.serverMap,defaultMap, this.loadConfigFile(), this.__loadEnvironmentConfig() );
		 //	 this.serverMap.copyFrom(defaultMap,this.loadConfigFile(),this.__loadEnvironmentConfig());
	 }
 }
 class Cache{
	 constructor(config){
		 this.cacheLevel = config.get("cacheLevel");
		 this.cacheFile = path.normalize(config.get("cacheFile"));
		 try{
			 this.cache = JSON.parse(fs.readFileSync(this.cacheFile,{encoding: "utf-8"}));
		 }catch(e){
			 this.cache = {};
		 }	
	 }	

	 tryLoadLocalData(req, res){
		 return new Promise((resolve, reject)=>{
			 if(this.cacheLevel > cacheLevel.no){
				 let __cacheRes = this.cache[this.generateCacheKey(req)];
				 if(__cacheRes){
					 res.statusCode = "200";
					 Object.keys(__cacheRes.header).forEach((item)=>{
						 res.setHeader(item, __cacheRes.header[item] );
					 });
					 res.end(__cacheRes.data);
					 resolve("done");
				 }else{
					 reject("no-data");
				 }	
			 }else{
				 reject("no-data");
			 }
		 });
	 }

	 generateCacheKey(req){
		 return req.method + req.url;
	 }

	 handlePersistence(req,res){
		 fs.writeFile(this.cacheFile, JSON.stringify(this.cache),(err)=>{
			 if(err){
				 res.statusCode=500;
				 res.statusMessage = `persistence cache to file failed: ${err.message} `;
				 res.end(res.statusMessage);
				 return;
			 }
			 res.statusCode=200;
			 res.statusMessage = `persistence cache to file ${this.cacheFile} succeed`;
			 res.end(res.statusMessage);
		 });
		 return;	
	 }
 }

 function handleStatic(req,res,cb,urlPart){

	 let url = req.url;
	 let _path = path.join("..", url);
	 sendFile(_path, res);

 }

 function assignValue(key, val, oo){

	 key.split('.').forEach((key, inx, arr)=>{
		 if(inx === arr.length -1 ){
			 oo[key] = val;
		 }else{
			 if(oo[key] === undefined){
				 oo[key] = {};
			 }
		 }
	 });

 }
 function retrieveBody(req,res,cb){

	 if(req.method.toUpperCase() === "POST"){
		 var __reqBody = "";
		 req.on("data", (data)=>{
			 __reqBody += data;
		 }).on("end",()=>{
			 req.bodyData = __reqBody;
			 cb(req,res);
		 });
	 }else{
		 cb(req,res);
	 }

 }

 function bind(fn, context){
	 return function(){
		 return fn.apply(context, [].slice.call(arguments));
	 }
 }

 function handleResource(req, res, cb, urlPart){

	 let matched  = req.url.match(urlPart)[0];
	 let _path = path.normalize(config.get("relativePath") + matched);

	 sendFile(_path, res);
 }

 function sendFile(_path, res){
	 let ext = path.extname(_path).toLowerCase().replace("." , "");
	 let mime = constants.MIME[ext] || MIME['text'];

	 let fileRaw = fs.createReadStream(_path);

	 fileRaw.on("open", ()=>{
		 res.writeHead(200,{
			 "Cache-Control":"no-cache",
			 "Content-Type": mime,
			 "content-encoding":"gzip"
		 });

	 }).on("error",(err)=>{
		 console.error(err);
		 res.statusCode = 404;
		 res.statusMessage = "file not found by proxy";
		 res.end(res.statusMessage);

	 });

	 fileRaw.pipe(zlib.createGzip()).pipe(res);	

 }

 const handleViewModel = (viewName)=>{

	 let _path = path.join("../public",viewName + ".ejs");
	 let model = {};
	 switch (viewName){

		 case 'config':

			 ServerConfig.fields.forEach(field=>{
				 model[field] = config.get(field);
			 });

			 return {
				 path:_path,
				 model:{
					 model: model,
					 serviceList: serviceConfig.getServiceList()
				 }
			 };
		 default:
			 return {
				 path:_path,
				 model:{
					 model: model
				 }
			 };
	 }
 };

 /**
  *  used to handle service configuraiton
  * */
 function handleServerConfiguration(req, res, cb, urlPart){
	 let aMathed = req.url.match(urlPart)[1].trim().split('?');
	 let matched = aMathed[0];
	 if(matched.indexOf('/view') === 0){

		 let viewName = matched.slice(1).split("/")[1] || "config" ;
		 let viewModel = handleViewModel(viewName);
		 oView.render(viewModel.path, viewModel.model ,req, res );

	 }else{
		 // handle action from configuration page
		 let oService = {};
		 switch(matched){
			 case '/save_server_config':

				 extractParam(req.bodyData).map(pair=>{
					 config.set(pair.key, pair.val);
				 });

				 config.save().then(()=>{

					 res.writeHead(200,{
						 "Content-Type":constants.MIME.json
					 });
					 res.end(JSON.stringify({"status":"sucess"}));		
				 }).catch((err)=>{
					 res.writeHead(200,{
						 "Content-Type":constants.MIME.json
					 });
					 res.end(JSON.stringify({"status":"sucess","content":err.message}));		
				 });
				 break;

			 case '/save_service_config':
				 extractParam(req.bodyData).map(bind(mapParam,oService));
				 if(oService.data){
					 Promise.all([serviceConfig.addServiceURL(oService),serviceConfig.addService(oService )]).then(args=>{
						 res.writeHead(200,{
							 "Content-Type":constants.MIME.json
						 });
						 res.end(JSON.stringify(args[0]));		

					 }).catch(err=>{
						 res.statusCode=500;
						 res.statusMessage = err.message;
						 res.end(res.statusMessage);	
					 });
				 }else{
					 serviceConfig.addServiceURL(oService).then(args=>{
						 res.writeHead(200,{
							 "Content-Type":constants.MIME.json
						 });
						 res.end(JSON.stringify(args));			
					 }).catch(err=>{
						 res.statusCode=500;
						 res.statusMessage = err.message;
						 res.end(res.statusMessage);		
					 });
				 }
				 break;
			 case "/delete_service_config":	

				 extractParam(req.bodyData).map(bind(mapParam,oService));
				 serviceConfig.deleteService(oService).then(data=>{
					 res.writeHead(200,{
						 "Content-Type":constants.MIME.json
					 });
					 res.end(JSON.stringify({url: data}));	 
				 }).catch(err=>{
					 res.statusCode=500;
					 res.statusMessage = err.message;
					 res.end(res.statusMessage);	
				 }); 
				 break;

			 case '/load_service':
				 extractParam(aMathed[1]).map(bind(mapParam,oService));
				 serviceConfig.loadServiceData(oService).then((data)=>{
					 res.writeHead(200,{
						 "Content-Type":constants.MIME.json
					 });
					 oService.data = data;

					 res.end(JSON.stringify(oService));	
				 }).catch(err=>{

					res.writeHead(200,{
						 "Content-Type":constants.MIME.json
					 });
					 oService.data = 'no-data';
					 res.end(JSON.stringify(oService));	

				 });
				 break;

			 case '/sync_all':
				
				 var count  = serviceConfig.getServiceList().length,
					 aSuccessResults = [],
					 aFailedResults = [];
				function waitResult(){
					if(aSuccessResults.length + aFailedResults.length === count){
						res.end(JSON.stringify({
							"success": aSuccessResults,
							"failed":aFailedResults 
						}));
					}
				}
				 batchSyncService(res).map(results=>{
					 results.then((oResult)=>{
						 aSuccessResults.push(oResult.service);	
						 waitResult();
					 }).catch((oResult)=>{
						 aSuccessResults.push(oResult.service);	
						 waitResult();
					 });
				 });
				 break;
		 }
		

		function batchSyncService(res){
		
					return serviceConfig.getServiceList().map((oService)=>{
					 var oRequestDuck = {
						 headers:{
						 	 "content-type":"application/json",
							"accept":"application/json",
							"__ignore-cache__":true,
						 },
						 url:oService.url,
						 method:oService.method
					 };
					 if(oRequestDuck.method === 'post' && oService.param && oService.param.length > 0){
						oRequestDuck.bodyData = oService.param;
					 } 
					 return new Promise((resolve, reject)=>{
						requestEndpointServer(oRequestDuck, res, (err, hostRes,res,req)=>{
							if(err){
								reject({
									error: err,
									service: oService
								});
							}else{
								resolve({
									response: hostRes,
									service : oService
								});
							}	
						});
					 });
				 });
		}

		function mapParam(pair){
			if(pair.key === 'serviceUrl'){
				this.url = pair.val;
				this.path = pair.val.replace(/\//g, "_");
			}else if(pair.key === 'serviceData'){
				if(pair.val && pair.val.length > 0){
					this.data = pair.val;		
				}		 
			}else if (pair.key === 'serviceMethod'){
				this.method = pair.val.toLowerCase();	

			}else if (pair.key === 'serviceParam'){
				this.param = pair.val.length > 0?pair.val: undefined;	
			}
		}
	 }

	 function extractParam(sTarget){
		 return sTarget.split("&").map(pair=>{
			 let aParam = pair.split("=");
			 return {
				 key: aParam[0],
				 val: decodeURIComponent(aParam[1].replace(/\+/g, '%20'))
			 };
		 });
	 }	
 }
 function retrieveDomainName(url){
	 var aResults = url.match(/^http(?:s)?:\/\/([^\/]+)\/.*$/);
	 return aResults&&aResults[1];
 }

 function replaceDomain(url, domain){
	 return url.replace(/^(http(?:s)?:\/\/)(?:[^\/]+)(\/.*)$/, "$1" + domain + "$2");
 }

 function handeRemoteResponse(error,hostRes, res,req){

	 if(error){
		 errResponse(error, res); 
		 return ;
	 }
	 res.statusCode = hostRes.statusCode;
	 var __ignoreCache = req.headers["__ignore-cache__"];

	 Object.keys(hostRes.headers).forEach((item)=>{
		 res.setHeader(item, hostRes.headers[item] );
	 });

	 var __status = Math.floor(hostRes.statusCode/100);

	 if(__status === 2){

		 if(config.get("cacheLevel") > cacheLevel.no || __ignoreCache ){
			 if(config.get('workingMode') === workingMode.proxyCache){
				 hostRes.pipe(new CacheStream({key: oCache.generateCacheKey(req),cache: oCache.cache, header:Object.assign({},hostRes.headers)})).pipe(res);
			 }else{
				 let oService = {};
				 oService.method = req.method.toLowerCase();
				 oService.header = hostRes.headers;

				 if(oService.method === 'get'){
					 let aUrl = req.url.split('?');
					 oService.url = aUrl[0];
					 oService.param = aUrl.length>1?aUrl[1]:undefined;
				 }else{
					oService.url = req.url;
				 }
				oService.path = serviceConfig.generatePath({method: oService.method, path:req.url.replace(/^(.*)\?.*/, "$1").replace(/\//g, "_") });
				hostRes.pipe(new CacheStream({ oService:oService  ,serviceConfig: serviceConfig })).pipe(res);	
			 }
		 }else{
			 hostRes.pipe(res);
		 }

	 }else if(__status === 3){

		 console.log(`status is ${__status}`);
		 var redirect = res.getHeader("location");

		 if(redirect && retrieveDomainName(redirect) && (retrieveDomainName(redirect) === config.get("endpointServer.host"))) {
			 res.setHeader("location",replaceDomain(redirect, req.headers.host ));	
		 }
		 hostRes.pipe(res);
	 }else if(__status >= 4){
		 console.log(`status is ${__status}`);
	
		 if(config.get("cacheLevel") > cacheLevel.no &&!__ignoreCache){
			 oDataProxy.tryLoadLocalData(req, res).then(data=>{
				 console.log("find from cache");
			 }).catch(err=>{
				 hostRes.pipe(res);
			 });
		 }else{
			 hostRes.pipe(res);
		 }
	 }
 }

 function errResponse(err, res){
	 res.statusCode = 503;
	 res.statusMessage = err.message;
	 res.end(err.message);
 }

function requestRemoteServer(req,res){

	var endServerHost = config.get("endpointServer.host"),
		__ignoreCache = req.headers["__ignore-cache__"],
		endServerPort = config.get("endpointServer.port"),
		oAuth;
	if(config.get("endpointServer.user")){
		oAuth ='Basic ' + new Buffer(config.get("endpointServer.user") + ':' + config.get("endpointServer.password")).toString('base64');		
	}
	/* 
	* https via proxy, request via tunnel.
	* this kind of request have to create socket to proxy first, the use this as
	* tunnel to connect to end point server
	*/
	if(config.isSSL() && config.hasProxy() ){
			return requestViaProxy({
				path: req.url,
				host:endServerHost,
				prot:endServerPort,
				method: req.method,
				auth: oAuth,
				bodyData:req.bodyData
			});
			
			// .then((endPointRes)=>{		//TODO deal with cb
			// 		cb(null,endPointRes, res,req);
			// }).catch(err=>{
			// 		cb(err, req,res);
			// });
		}else{
			var __option = {};
			__option.method = req.method;
			__option.headers=Object.assign(__option.headers || {}, req.headers);
			__option.headers.host = endServerHost;
			oAuth&&(__option.headers.Authorization = oAuth);
			if(config.hasProxy()){

				let oProxy = config.get("proxy");
				__option.hostname =  oProxy.host;
				__option.port = oProxy.port;
				__option.path = config.get("endpointServer.address") + req.url;

			}else{
				__option.hostname = __option.headers.host;
				(endServerPort)&&(__option.port =endServerPort);
				__option.path = req.url;
			}

			if(config.isSSL()){
				// by this way, to get rid of untruseted https site
				__option.strictSSL=false;
				__option.agent = new https.Agent({
					host: endServerHost
				, port: endServerPort
				, path: req.url
				, rejectUnauthorized: false
				});
			}

			return new Promise((resolve, reject)=>{
				var __req = (config.isSSL()?https:http).request(__option,(hostRes)=>{
					//cb(null,hostRes, res,req);
					resolve(hostRes);
				});

				__req.on("error", (e)=>{
					//cb(e, req, res); 
					reject(e);
				});
				__req.setTimeout(100000, ()=>{
					reject({message:"request has timeout : 10000"});
					// /cb({message:"request has timeout : 10000"}, req,res);
				});	
				req.bodyData&&__req.write(req.bodyData);			// post request body
				__req.end();
			});
		}
}

 function requestEndpointServer(req,res, cb){
 
	var endServerHost = config.get("endpointServer.host"),
		__ignoreCache = req.headers["__ignore-cache__"],
		endServerPort = config.get("endpointServer.port"),
		oAuth;

		if(config.get("endpointServer.user")){
			oAuth ='Basic ' + new Buffer(config.get("endpointServer.user") + ':' + config.get("endpointServer.password")).toString('base64');		
		}

		/* 
		* https via proxy, request via tunnel.
		* this kind of request have to create socket to proxy first, the use this as
		* tunnel to connect to end point server
		*/
		if(config.isSSL() && config.hasProxy() ){
			requestViaProxy({
				path: req.url,
				host:endServerHost,
				prot:endServerPort,
				method: req.method,
				auth: oAuth,
				bodyData:req.bodyData
			}, (err, endPointRes)=>{
				if(err){
					if(config.get("cacheLevel") > cacheLevel.no && !__ignoreCache){

						oDataProxy.tryLoadLocalData(req, res).then(data=>{
							console,log("got cache");
						}).catch(err=>{
							cb(err, req,res);
						})
					}else{
							cb(err, req,res);
					}
				}else{
					cb(null,endPointRes, res,req);	
				}
			});

		}else{

			var __option = {};
			__option.method = req.method;
			__option.headers=Object.assign(__option.headers || {}, req.headers);
			__option.headers.host = endServerHost;
			oAuth&&(__option.headers.Authorization = oAuth);
			if(config.hasProxy()){

				let oProxy = config.get("proxy");
				__option.hostname =  oProxy.host;
				__option.port = oProxy.port;
				__option.path = config.get("endpointServer.address") + req.url;

			}else{
				__option.hostname = __option.headers.host;
				(endServerPort)&&(__option.port =endServerPort);
				__option.path = req.url;
			}

			if(config.isSSL()){
				// by this way, to get rid of untruseted https site
				__option.strictSSL=false;
				__option.agent = new https.Agent({
					host: endServerHost
				, port: endServerPort
				, path: req.url
				, rejectUnauthorized: false
				});
			}

			var __req = (config.isSSL()?https:http).request(__option,(hostRes)=>{
				cb(null,hostRes, res,req);
			});

			__req.on("error", (e)=>{

				if(config.get("cacheLevel") > cacheLevel.no &&!__ignoreCache){
					oDataProxy.tryLoadLocalData(req, res).then(data=>{
						console.log("got cache");
					}).catch(err=>{
						cb(err, req,res);
					});

				}else{
				cb(e, req, res); 
				}
			});
			__req.setTimeout(100000, ()=>{

				if(config.get("cacheLevel") > cacheLevel.no &&!__ignoreCache){
					oDataProxy.tryLoadLocalData(req, res).then(data=>{
						console.log("got from cache");
					}).catch(err=>{				 
					cb({message:"request has timeout : 10000"}, req,res);
					});
				}else{
				cb({message:"request has timeout : 10000"}, req,res);
				}
			});	
			req.bodyData&&__req.write(req.bodyData);			// post request body
			__req.end();

		}	 
 }

 function serverCb(req, res) {
	 
	 if(req.url === "/favicon.ico"){
		 res.end("");
		 return;
	 }
	 var _reqeustHeader = req.headers;
	 var __ignoreCache = _reqeustHeader["__ignore-cache__"];

	 if(config.get("workingMode") == workingMode.dataProvider && !__ignoreCache){     // cache only
		 serviceConfig.tryLoadLocalData(req, res).then(data=>{
			 console.log("find cache");
		 }).catch(err=>{
			 res.statusCode = 404;
			 res.end(`can not find cache for ${req.url}`);
		 });
	 }else if(config.get("workingMode") == workingMode.serviceProvider){

		if(config.get("cacheStrategy") === cacheStrategy.cacheFirst){
			serviceConfig.tryLoadLocalData(req, res).then(data=>{
				console.log(`find cache ${req.url}`);
			}).catch(err=>{
				console.log(err.stack || err);
				//TODO request remote
			});



		}else{
			requestEndpointServer(req, res,handeRemoteResponse);
		}

		
	 }else{
		 //TODO proxy
	 }
 }
var config = new ServerConfig();
var serviceConfig = new ServiceConfig();
var oCache = new Cache(config);

var oView = new View();
var oDataProxy = config.get('workingMode') == workingMode.serviceProvider? serviceConfig : oCache;
const aRoutes = [
	{target: new RegExp(".*"), cb: retrieveBody},
	{target: new RegExp("_service_persistent"), cb: bind( oCache.handlePersistence, oCache)},
	{target: new RegExp("/__server_config__(.*)"), cb: handleServerConfiguration},
	{target: new RegExp("/_ui/(.*)"), cb: handleResource},
	{target: new RegExp("/public/"), cb:handleStatic },
	{target: new RegExp(".*"), cb: serverCb},
]; 
const route = constructRoute(aRoutes);
  
const requestViaProxy = ((fn,proxyOp)=>{
	 return function(){
		 return utils.wrapToPromise(fn,null)(...[proxyOp].concat([].slice.call(arguments)));
		 //fn.apply(null, [proxyOp].concat([].slice.call(arguments)));
	 };
 })((proxyOp, target, cb)=>{

	 var targetPort = ":" + (target.port || 443 );
	 http.request({
		 hostname:proxyOp.host
			,port:proxyOp.port
			,method:"CONNECT"
			,agent: false
			,path: target.host + targetPort  //"www3.lenovo.com:443"
			,headers:{
		host:target.host + targetPort  //"www3.lenovo.com:443"
			}
	 }).on("connect", (proxyRes, socket, head)=>{

		 let ops = {
			 socket:socket,
			 agent: false,
			 hostname: target.host,
			 path: target.path,
			 method: target.method
		 };
		 target.auth&&(ops.headers = {Authorization: target.auth});
		 let proxyReq = https.request(ops, (res)=>{
			 cb.call(null,null,res);
		 }).on("error",(err)=>{
			 reportError(err, cb);		
		 })
		 target.bodyData&&proxyReq.write(target.bodyData);
		 proxyReq.end();
	 }).on("error",(err)=>{
		 reportError(err, cb);			
	 }).end();

	 function reportError(err , cb){
		 console.error("error when connect to endpoint site via proxy");
		 console.error(err);
		 cb.call(null, err);	
	 }
 }, config.get("proxy")|| {});

 var server = !config.isSSL() ? http.createServer(route) : https.createServer({
	 key: fs.readFileSync(path.normalize(config.get("SSLKey"))),
	 cert: fs.readFileSync(path.normalize(config.get("SSLCert")))
 }, route);

server.listen(config.get("port"));
console.log(`Server is running at 127.0.0.1 , port ${config.get("port")}`);
