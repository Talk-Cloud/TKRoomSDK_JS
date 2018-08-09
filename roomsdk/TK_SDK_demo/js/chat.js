
(function () {
    var sendText = document.getElementById('sendText');
    var chatContainer = document.getElementById('chatContainer');
    var textSource = document.getElementById('textSource');

    // 接收聊天消息的事件
    TKevent.addEventListener('room-text-message', function (roomEvent){
        TK.Logger.debug('room-text-message' , roomEvent);
        var msg =  roomEvent.message.msg ;
        var isme = roomEvent.userid === _room.getMySelf().id;
        chatSend(msg , isme );
    });

    // 发送聊天消息
    function chatSend(msg,isme) {
        var li = document.createElement('li');
        li.className = isme?'chat-list isme ':'chat-list ';
        var divFirst = document.createElement('div');
        var divLast = document.createElement('div');
        divLast.innerText=msg;
        li.appendChild( divFirst );
        li.appendChild( divLast );
        chatContainer.appendChild( li );
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // 点击发送按钮的相关事件
    sendText.onclick = sendIng;

    // 发送方法
    function sendIng(){
        var reg = /\S/;
        if(reg.test(textSource.value)){
            _room.sendMessage(textSource.value);
            textSource.value = '';
        }else{
            textSource.value = '';
            alert('请输入有效字符');
        }
    }

    // 按下回车发送聊天消息
    textSource.onkeydown = function(e){
        if(e.keyCode === 13){
            sendIng();
        }
    };

})();
