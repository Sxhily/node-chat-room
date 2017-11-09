var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var nameUsed = [];
var currentRoom = {};

exports.listen = function(server){
	io = socketio.listen(server);
	io.set('log level', 1);
	io.sockets.on('connection',function(socket){
		guestNumber = assignGuestNumber(socket,guestNumber,nickNames,nameUsed);

		joinRoom(socket,'Lobby');

		handleMessageBrooadcasting(socket,nickNames);

		handleNameChangeAttempts(socket,nickNames,nameUsed);

		handleRoomJoining(socket);

		socket.on('rooms',function(){
			socket.emit('rooms',io.sockets.manager.rooms);
		});

		handleClientDisconnection(socket,nickNames,nameUsed);

	})
}

function assignGuestNumber(socket,guestNumber,nickNames,nameUsed){
        var name = 'Guest' + guestNumber;
        nickNames[socket.id] = name;
        socket.emit('nameResult',{
        	success: true,
        	name: name
        });
        nameUsed.push(name);
        return guestNumber + 1;
}

function joinRoom(socket,room){
	    socket.join(room);

	    currentRoom[socket.id] = room;

	    socket.emit('joinResult',{room: room});

	    socket.brocadcast.to(room).emit('message',{
	    	text:nickNames[socket.id] + 'has joined' + room + '.'
	    });

	    var usersInRoom = io.sockets.clients(room);

	    if(usersInRoom.length > 1){
                
            var usersInRoomSummary = 'Users currently in' + room + ':';

	    	for (var index in usersInRoom){
	    		var usersSocketId = usersInRoom[index].id;
	    		if(usersSocketId != socket.id){
	    			if(index > 0){
	    				usersInRoomSummary += ',';
	    			}
	    			usersInRoomSummary += nickNames[usersSocketId];
	    		}
	    	}
	    	usersInRoomSummary += ',';
	    	socket.emit('message',{text: usersInRoomSummary});
	    }

}

function handleNameChangeAttempts(socket, nickNames , nameUsed){
	socket.on('nameAttempt', function(name){
		if(name.indexOf('Guest' == 0)){
			socket.emit('nameResult',{
				success: false,
				message: 'names cannot begin with "Guest".'
			});
		} else {
            if(nameUsed.indexOf(name) == -1){
            	var previousName = nickNames[socket.id];
            	var previousNameIndex = nameUsed.indexOf(previousName);
            	nameUsed.push(name);
            	nickNames[socket.id] = name;
            	delete nameUsed[previousNameIndex];
            	socket.emit('nameResult',{
            		success: true,
            		name: name
            	});
            	socket.brocadcast.to(currentRoom[socket.id]).emit('message',{
            		text: previousName + 'is now know as' + name + '.'
            	});
            }else{
            	socket.emit('nameResult',{
            		success: false,
            		message: 'that name is already in use.'
            	})
            }
		}
	});
}
//发送聊天消息
function handleMessageBroadcasting(socket){
	socket.on('message',function(message){
		socket. brocadcast.to(message.room).emit('message',{
			text: nickNames[socket.id] + ':' + message.text
		});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
	});
}
//创建房间
function handleRoomJoining(socket){
	socket.on('join',function(room){
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket,room.newRoom);
	})
}
//用户断开连接
function handleClientdDisconnection(socket){
	socket.on('disconnect',function(){
		var nameIndex = nameUsed.indexOf(nickNames[socket.id]);
		delete nameUsed[nameIndex];
		delete nickNames[socket.id];
	});
}