//将相关信息发送给服务器
var Chat = function(socket){
	this.socket = socket;
}
Chat.prototype.sendMessage = function(room,text){
	var message = {
		room: room,
		text: text
	};
	this.socket.emit('message',message);
};
Chat.prototype.changeRoom = function(room){
	this.socket.emit('join',{
		newRoom: room
	});
};
//处理聊天命令
Chat.prototype.processCommand = function(command){
	var words = command.split('');
	var command = woeds[0]
	                      .substring(1, words[0].length)
	                      .toLowerCase();
	var message = false;

	switch(command){
		case 'join':
		    words.shift();
		    var room = words.join('');
		    this.changeRoom(room);
		    break;
		case 'nick':
            words.shift();
		    var name = words.join('');
		    this.socket.emit('nameAttempt',name);
		    break;
		default:
		    message = 'Unrecongnized command';
		    break;
	}
	return message;
}