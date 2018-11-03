# Service Provider
this tool worked as service simulator or proxy consumed by front end.

## installation



## Usage
start up service via command: 
````
npm start
````
then you can access configuraiton page by following link:
````
http(s)://localhost:8079/__server_config__/view 
````
http or https depends on server configuration parameter **endpointServer.address**
### configuration
server configuration will influence server/service behavior, all the changes for server configuration need restarting to take effect

**workingMode**
1. proxy cache(0): worked as http proxy, support redirect to endpoint server
2. data provider(1):worked as data provider service, do not access other endpoint server
3. service provider(2):simulate service, it can access remote server , or load data from cache, depends on cache  stratigy
    
**cacheStrategy**
1. cacheFirst(0):  1 load cache -> 2 load remote -> 3 save cache -> 4 return.  working like data provider
2. remoteFirst(1): 1 load remote -> yes , return , no -> 2 load from cache.  working with stable remote server 

**port** configuration for server port

**sync** value true means will persistent response from remote server, false without persistent

**toDatabase** true will persitent response to database, false will persist directly to file

**databaseName** database name

**endpointServer.address** domain addres for remote server. protocol of your server is the same with endpointServer

**endpointServer.port** port for remote server, could be empty

**endpointServer.host** host for remote server

**endpointServer.user** user information if remote server require base authentication

**endpointServer.password** password if remote server require base authentication

**resourceRoute** router pattern for local static retources. this could be a regular expression, all request matched this pattern will load local resources but not request remote server

**relativePath** file path for local static resources

**proxy.host** host for network proxy if this necessary for accessing remote server

**proxy.port** port for network proxy if this necessary for accessing remote server




