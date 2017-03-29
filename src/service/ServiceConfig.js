'user strict';

const path = require("path")
	,constants = require('../utils/constants.js')
	 ,fs = require("fs");

class ServiceConfig
{
	 constructor(){

		 this.serviceMap = [];

		 try{
			 var _file =  fs.readFileSync(constants.SERVICE_CONFIG);
			 this.serviceMap = _file.length > 0? JSON.parse(_file):[];

		 }catch(e){
			 console.error(`failed to read file ${constants.SERVICE_CONFIG}, will create new empty file`);
			 console.error(e.message || e);
			 fs.writeFile(constants.SERVICE_CONFIG, '');
		 }
	 }

	 getServiceList(){
		 return this.serviceMap;
	 }

	 __saveServiceList(oService){

		 return new Promise((resolve, reject)=>{
			 fs.writeFile(constants.SERVICE_CONFIG, JSON.stringify(this.serviceMap), (err)=>{
				 if(err){
					 reject(err);
				 }else{
					 resolve(oService);
				 }
			 });
		 });
	 }

	 __hasService(oService){
		 return this.__findService(oService) >= 0;  
	 }

	 __findService(oService){

		 return this.serviceMap.findIndex(service=>{
			 if(oService.method === 'get'){
				 return service.url === oService.url && service.method === oService.method&& service.param === oService.param;
			 }else{
				 return service.url === oService.url && service.method === oService.method;
			 }
		 });

	 }

	 addServiceURL(oService){

		 return new Promise((resolve, reject)=>{
			 // only get can support multi param
			 if(!this.__hasService(oService)){

				 let __service = Object.assign({}, oService);
				 __service.data = null;
				 this.serviceMap.push(__service);
				 this.__saveServiceList(oService).then((data)=>{
					 resolve(data);
				 }).catch(err=>{
					 reject(err);
				 });

				 //			fs.writeFile(SERVICE_CONFIG, JSON.stringify(this.serviceMap), (err)=>{
				 //			fs.writeF	if(err){
				 //			fs.writeF		reject(err);
				 //			fs.writeF	}else{
				 //			fs.writeF		resolve(serviceUrl);
				 //			fs.writeF	}
				 //			fs.writeF});

			 }else{
				 resolve("no_change");

			 }
		 });
	 }

	 generatePath(oService){

		 if(oService.path && oService.path.indexOf("_config")>= 0){
			return oService.path;
		 }else{
			return path.join("./_config",oService.method + oService.path) + ".json";
		 }
		 	 }

	 __generateKey(oService){
		 return (oService.method === "get" &&oService.param&&  oService.param.length > 0)? oService.param: "data";
	 }
	 addService(oService){

		 var _path =  this.generatePath(oService);
		 // support multi-param only for GET method

		 var _key = this.__generateKey(oService);

		 return new Promise((resolve, reject)=>{

			 fs.readFile(_path,'utf-8',(err,data)=>{

				 if(err){

					 let _oCache = {};
					 _oCache[_key] = oService.data;
					 fs.writeFile(_path, JSON.stringify(_oCache),'utf-8', (err)=>{
						 if(err){
							 reject(err);
						 }else{
							 resolve(oService);
						 }
					 });

				 }else{

					 let cacheData = JSON.parse(data);
					 cacheData[_key] = oService.data;	
					 fs.writeFile(_path,JSON.stringify(cacheData), 'utf-8',(err)=>{
						 if(err){
							 reject(err);
						 }else{
							 resolve(oService);
						 }
					 } );
				 }
			 }); 
		 });
	 }

	 __deleteService(oService){

		 var _path = this.generatePath(oService);
		 return new Promise((resolve, reject)=>{

			 if(oService.method === 'get' && oService.param&&oService.param.length > 0){

				 fs.readFile(_path,'utf-8',(err, data)=>{
					 if(err){
						 console.error(err);
						 resolve('no-data');
					 }else{
						 let oData = JSON.parse(data);
						 delete oData[oService.param];
						 fs.writeFile(_path,JSON.stringify(oData) ,"utf-8",err=>{
							 if(err){
								 console.error(err);
								 reject(err);
							 }else{
								 resolve(oService);
							 }
						 });
					 }
				 } );
			 }else{
				 fs.unlink(_path, (err)=>{
					 if(err){
						 console.error(err);
						 reject(err);
					 }else{
						 resolve(oService);
					 }
				 });
			 }
		 });

	 }
	 deleteService(oService){
		 return new Promise((resolve, reject)=>{

			 if(!this.__hasService(oService)){
				 resolve("no_change");	
			 }else{
				 this.serviceMap.splice(this.__findService(oService), 1);

				 Promise.all([this.__saveServiceList(oService), this.__deleteService(oService)]).then(data=>{
					 resolve(data);
				 }).catch(err=>{
					 reject(err);
				 });
			 }
		 });
	 }

	 loadServiceData(oService){

		 return new Promise((resolve, reject)=>{
			 var _path = this.generatePath(oService);
			 fs.readFile(_path,'utf-8', (err,data)=>{
				 if(err){
					 console.error(err);
					 // resolve('no-data');
					 reject(err);
				 }else{
					 let rootKey = this.__generateKey(oService);
					 data = JSON.parse(data);
					 resolve(data[rootKey]);
				 }
			 });

		 });
	 }

	 constructServiceObject(req){

		 let oService = {};
		 oService.method = req.method.toLowerCase();

		 if(oService.method === 'get' ){
			 let _aUrl = req.url.split("?");
			 oService.url = _aUrl[0];

			 if(_aUrl[1]&& _aUrl[1].length > 0){
				 oService.param =decodeURIComponent(_aUrl[1].replace(/\+/g, '%20')); 
			 }
		 }else{
			 oService.url = req.url;
			 oService.param = decodeURIComponent(req.bodyData.replace(/\+/g, '%20'));
		 }

		 oService.path = oService.url.replace(/\//g, "_");
			 return oService;
	 }

	 tryLoadLocalData(req,res){

			 let oService = this.constructServiceObject(req);

			 return this.loadServiceData(oService).then(data=>{

				 res.writeHead(200,{
					 "Content-Type":constants.MIME.json
				 });

				 res.end(data);
				 return data;
			 });
	 }
 }

 module.exports = ServiceConfig;
