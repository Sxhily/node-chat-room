var http = require('http');

var fs = require('fs');

var mime = require('mime');

var path = require('path');

var cache = {};

var chatServer = require('./lib/chat_server');
chatServer.listen(server);

function send404(response){
    response.writeHead(404,{'content-type':'text/css'});
    response.write('Error 404: resource not found.');
    response.end();
}

function sendFile(response,filePath,fileContents){
    response.writeHead(200,{'content-type':mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

function serveStatic(response,cache,absPath){
	if(cache[absPath]) {
		sendFile(response,absPath,cache[absPath]);
	}else{
		fs.exists(absPath, function(exists){
           if(exists) {
           	fs.readFile(absPath, function(err, data){
               if(err){
               	send404(response);
               }else{
               	cache[absPath] = data;
               	sendFile(response,absPath,data)
               }
           	})
           }else{
           	send404(response);
           }
		});
	}
}

var server = http.createServer(function(request,response){
	var filePath = false;

	if(request.url = '/'){
		filePath = 'public/chat.html';
	}else{
		filePath = 'public'+ request.url;
	}
	var absPath = './' + filePath;

	serveStatic(response,cache,absPath);
});

server.listen(3000,function(){
	console.log("3000");
})