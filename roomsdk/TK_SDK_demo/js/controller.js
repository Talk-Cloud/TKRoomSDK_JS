
(function () {
    window._room = TK.Room();
    window.prefixStr = 'container';
    window.volStr = 'vol';
    window.TKevent = TK. EventDispatcher();
    var RoomEvent = {};//房间事件
    var _videoMirror = false;
    var _videoLoader = true;
    var _videoMode = TK_VIDEO_MODE.ASPECT_RATIO_COVER; // 视频显示模式
    var _isRoomOnlyAudio = false; // 房间是否只有音频
    var _isDebugLog = getParams('debug') === 'true' ; //是否是debug级别日志
    var OperationState = {
        Stopped: '_STOPPED_',
        Started: '_STARTED_',
        Paused: '_PAUSED_',
    };
    var _serverRecordState = OperationState.Stopped; // 服务器录制状态
    _room.setLogIsDebug(_isDebugLog) ;
    Object.defineProperties(RoomEvent, {
        roomError: { //room-connected 房间连接成功事件
            value: 'room-error',
            writable: false,
            enumerable: true,
        },
        roomConnected: { //room-connected 房间连接成功事件
            value: 'room-connected',
            writable: false,
            enumerable: true,
        },
        roomConnectFail: { //room-connect-fail 房间连接失败事件
            value: 'room-connect-fail',
            writable: false,
            enumerable: true,
        },
        roomCheckroom: { //room-checkroom 房间检测事件
            value: 'room-checkroom',
            writable: false,
            enumerable: true,
        },
        roomCheckroomPlayback: { //room-checkroom-playback 回放的checkroom事件
            value: 'room-checkroom-playback',
            writable: false,
            enumerable: true,
        },
        roomAudiovideostateSwitched: { //room-audiovideostate-switched 纯音频房间切换事件
            value: 'room-audiovideostate-switched',
            writable: false,
            enumerable: true,
        },
        roomModeChanged: { //room-mode-changed 房间模式切换
            value: 'room-mode-changed',
            writable: false,
            enumerable: true,
        },
        roomParticipantLeave: {  //room-participant_leave  参与者离开房间事件
            value: 'room-participant_leave',
            writable: false,
            enumerable: true,
        },
        roomParticipantEvicted: {  //room-participant_evicted 参与者被踢事件
            value: 'room-participant_evicted',
            writable: false,
            enumerable: true,
        },
        roomTextMessage: { //	room-text-message 聊天消息事件
            value: 'room-text-message',
            writable: false,
            enumerable: true,
        },
        roomUservideostateChanged: {  //room-uservideostate-changed 用户视频发布状态改变
            value: 'room-uservideostate-changed',
            writable: false,
            enumerable: true,
        },
        roomUseraudiostateChanged: {  //room-useraudiostate-changed 用户音频发布状态改变
            value: 'room-useraudiostate-changed',
            writable: false,
            enumerable: true,
        },
        roomLeaveroom: {  //room-leaveroom：sockit断开
            value: 'room-leaveroom',
            writable: false,
            enumerable: true,
        },
        getUserMediaFailure:{//getUserMedia_failure：getUserMeida失败的事件通知
            value: 'getUserMedia_failure',
            writable: false,
            enumerable: true,
        },
        roomErrorNotice:{ //room-error-notice 错误消息通知
            value: 'room-error-notice',
            writable: false,
            enumerable: true,
        },
    });

    window.onload = function(){
        document.documentElement.style.fontSize = (document.documentElement.clientWidth || document.body.clientWidth)/1920*100 + "px";
        registerEventToRoom();
        _room.init('82AUScqguvqXzhUh',function () {
            document.getElementById('loginbtn').style.display = 'block';
        },function (err) {
            TK.Logger.error("Room initialization failed. Please check. error:" + err);
        });
    };

    window.onresize = function(){
        document.documentElement.style.fontSize = (document.documentElement.clientWidth || document.body.clientWidth)/1920*100 + "px";
    };

    function getParams(key) {        //获取参数
        // var urlAdd = decodeURI(window.location.href);
        var urlAdd = decodeURIComponent(window.location.href);
        var urlIndex = urlAdd.indexOf("?");
        var urlSearch = urlAdd.substring(urlIndex + 1);
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");   //reg表示匹配出:$+url传参数名字=值+$,并且$可以不存在，这样会返回一个数组
        var arr = urlSearch.match(reg);
        if(arr != null) {
            return arr[2];
        } else {
            return "";
        }
    }

    // 加入房间
    function joinRoom(host,serial,password,nick) {
        var host = host;
        var serial = serial;
        var password = password;
        var nick = nick;
        if (host === '') {
            alert('请输入web服务器地址...');
            return;
        }
        if (nick === '') {
            alert('请输入您的昵称...');
            return;
        }
        if (serial === '') {
            alert('请输入房间号...');
            return;
        }

        var myOpt = {
            class: 'one',
            grade: 'two',
        };
        _room.joinroom(host, 443, nick, '', {serial:serial, password:password}, myOpt);
    };

    // 加入房间触发事件
    function loginTrigger (){
        var host = document.getElementById('ihost');
        var serial = document.getElementById('iserial');
        var password = document.getElementById('ipassword');
        var nick = document.getElementById('inick');
        joinRoom(host.value,serial.value,password.value,nick.value);
        serial.value = password.value = nick.value='';
    };

    function registerEventToRoom(){
        for(let eventKey in RoomEvent ){
            _room.addEventListener(RoomEvent[eventKey], function(recvEventData) {
                let isLog = true ;
                if(recvEventData.type === 'room-usernetworkstate-changed'){
                    isLog = false ;
                }
                if(isLog){
                    L.Logger.debug(RoomEvent[eventKey]+" event:" , recvEventData );
                }
                TKevent.dispatchEvent(recvEventData , false);
            });
        }
    };

    function isHas(liList,userId,attrName,Flag){
        var number = 0;
        for(var i = 0;i<liList.length;i++){
            if(liList[i].getAttribute('extensionId') === userId){
                number+=1;
                liList[i].setAttribute(attrName,Flag);
            }
        }
        return number
    };

    function removeDom(liList,mainDom,id,flag){
        for(var i = 0;i<liList.length;i++){
            if((liList[i].getAttribute('audio') === 'false') &&(liList[i].getAttribute('video') === 'false')) {
                if (flag) {
                    mainDom.removeChild(liList[i]);
                } else if (!flag && liList[i].getAttribute('extensionid') !== id) {
                    mainDom.removeChild(liList[i]);
                }
            }
        }
    };

    // 登录页点击进入房间
    document.getElementById('loginbtn').onclick = loginTrigger;

    // 切换房间音视频状态
    document.getElementById('switch-onlyaudio').onclick = function () {
        if (_isRoomOnlyAudio){
            _isRoomOnlyAudio = false ;
            document.getElementById('switch-onlyaudio-text').innerText = '切换为纯音频教室';
            _room.switchOnlyAudioRoom(false);
        } else{
            _isRoomOnlyAudio = true ;
            document.getElementById('switch-onlyaudio-text').innerText = '切换为音视频教室';
            _room.switchOnlyAudioRoom(true);
        }
    };

    // 开启关闭服务器录制
    document.getElementById('start-transcribe').onclick = function () {
        if (_serverRecordState !== OperationState.Started) {
            var spec = {
                recordType: TK.REC_TYPE_VIDEOLIST,
                convert: 0,
            };
            _room.startServerRecord(spec);
            _serverRecordState = OperationState.Started;
            document.getElementById('start-transcribe-text').innerText = '停止服务器端录制';
        } else {
            _room.stopServerRecord();
            _serverRecordState = OperationState.Stopped;
            document.getElementById('start-transcribe-text').innerText = '开始服务器端录制';
        }
    };

    // 房间连接成功
    TKevent.addEventListener(RoomEvent.roomConnected, function (roomEvent) {
        TK.Logger.info('room-connected', roomEvent);
        /* 发布 音视频 */
        _room.publishVideo();
        _room.publishAudio();
        /*创建视频区域*/
        var roomInfo = _room.getRoomProperties();
        createVideoBlock(_room.getMySelf().id, _room.getMySelf().nickname, true , {width:roomInfo.videowidth,height:roomInfo.videoheight,fps:roomInfo.videoframerate});
        // 播放本地视频
        _room.playVideo(_room.getMySelf().id || '', prefixStr + _room.getMySelf().id, {
            mirror: _videoMirror,
            loader: _videoLoader,
            mode: _videoMode
        }, function (err) {
            TK.Logger.error("play video error: ", err);
        });
        /*视频框音量监听*/
        var volSpan = document.getElementById(volStr + _room.getMySelf().id);
        _room.registerAudioVolumeListener(_room.getMySelf().id, 80, function (vol) {
            volSpan.innerText = 'vol:' + vol;
        }, function (err) {
            TK.Logger.error('registerAudioVolumeListener error', err);
        });


        _room.getVideoProfile(function (profile) {
            TK.Logger.info('room video profile: ', profile);
        });

        _room.setAutoProcessDeviceChangeEvent(true);

        var logiDiv = document.getElementById('login');
        logiDiv.style.display='none';
    });

    // 加入房间失败
    _room.addEventListener(RoomEvent.roomError, function(roomEvent) {
        TK.Logger.error("join room error: ", roomEvent);
        alert('加入房间失败，请核对您输入的信息！');
    });

    // 监听到用户视频状态改变
    TKevent.addEventListener(RoomEvent.roomUservideostateChanged,function (event) {
        var videoUl = document.getElementById('videoContainer');
        var liList = videoUl.getElementsByTagName('li');
        if(event.message.userId === _room.getMySelf().id){
            if(event.message.published){
                _room.playVideo(_room.getMySelf().id || '', prefixStr+_room.getMySelf().id, {mirror: _videoMirror, loader: _videoLoader, mode: _videoMode})
            }else{
                _room.unplayVideo(_room.getMySelf().id);
            }
        }else{
            if(event.message.published){
                if(isHas(liList,event.message.userId,"video",'true')===0){
                    createVideoBlock(event.message.userId,_room.getUser(event.message.userId).nickname,false);
                    _room.playVideo(event.message.userId,'container'+event.message.userId,{mirror: _videoMirror, loader: _videoLoader, mode: _videoMode});
                }else{
                    _room.playVideo(event.message.userId,'container'+event.message.userId,{mirror: _videoMirror, loader: _videoLoader, mode: _videoMode});
                }
            }else{
                    _room.unplayVideo(event.message.userId);
                isHas(liList,event.message.userId,"video",'false')
            }
            removeDom(liList,videoUl,_room.getMySelf().id,false);
        }
    });

    // 监听到用户音频状态改变
    TKevent.addEventListener(RoomEvent.roomUseraudiostateChanged,function (event) {
        var videoUl = document.getElementById('videoContainer');
        var liList = videoUl.getElementsByTagName('li');
        if(event.message.userId === _room.getMySelf().id){
            if(event.message.published){
                var volSpan = document.getElementById(volStr+event.message.userId);
                if(volSpan){
                    _room.registerAudioVolumeListener(event.message.userId, 80, function(vol) {
                        volSpan.innerText = 'vol:'+vol;
                    }, function(err) {
                        TK.Logger.error('registerAudioVolumeListener error', err);
                    })
                }
            }else{
                var volSpan = document.getElementById(volStr+event.message.userId);
                if(volSpan){
                    volSpan.innerText = '';
                    _room.unregisterAudioVolumeListener(event.message.userId);
                }
            }
        }else{
            if(event.message.published){
                if(isHas(liList,event.message.userId,"audio",'true')===0){
                    createVideoBlock(event.message.userId,_room.getUser(event.message.userId).nickname,false);
                    _room.playAudio(event.message.userId,'container'+event.message.userId,{mirror: _videoMirror, loader: _videoLoader, mode: _videoMode});
                }else{
                    _room.playAudio(event.message.userId,'container'+event.message.userId);
                }
                var volSpan = document.getElementById(volStr+event.message.userId);
                if(volSpan){
                    _room.registerAudioVolumeListener(event.message.userId, 80, function(vol) {
                        volSpan.innerText = 'vol:'+vol;
                    }, function(err) {
                        TK.Logger.error('registerAudioVolumeListener error', err);
                    })
                }
            }else {
                var volSpan = document.getElementById(volStr+event.message.userId);
                if(volSpan){
                    volSpan.innerText = '';
                    _room.unregisterAudioVolumeListener(event.message.userId);
                }
                _room.unplayAudio(event.message.userId);
                isHas(liList, event.message.userId, "audio", 'false');
            }
            removeDom(liList,videoUl,_room.getMySelf().id,false);
        }

    });

    // 监听用户被踢出房间
    TKevent.addEventListener(RoomEvent.roomParticipantEvicted,function (event) {
        var videoUl = document.getElementById('videoContainer');
        var logiDiv = document.getElementById('login');
        var liList = videoUl.getElementsByTagName('li');
        for(var i = 0;i<liList.length;i++){
            if(liList[i].getAttribute('extensionId') === event.userid){
                liList[i].setAttribute('audio','false');
                liList[i].setAttribute('video','false');
            }
        }
        removeDom(liList,videoUl,event.userid,true);

        _room.uninit(function () {
            document.getElementById('loginbtn').style.display = 'none';
        },function (err) {
            TK.Logger.error("uninit uninit error: ", err);
        });
        
        _room.init('82AUScqguvqXzhUh',function () {
            document.getElementById('loginbtn').style.display = 'block';
        },function (err) {
            TK.Logger.error("Room initialization failed. Please check. error:" + err);
        });

        logiDiv.style.display='block';
        alert('您已被踢出房间，将不会再收到房间消息！');
    });

    // 房间音视频状态切换
    _room.addEventListener(RoomEvent.roomAudiovideostateSwitched, function(evt) {
        TK.Logger.info('room-audiovideostate-switched', evt);
        var iconBoxs = document.getElementsByClassName('iconBlock');
        if (evt.message.onlyAudio === true) {
            if(iconBoxs){
                for(var i=0;i<iconBoxs.length;i++){
                    if(iconBoxs[i]){
                        var itemLi = iconBoxs[i].parentNode.parentNode;
                        if(itemLi && itemLi.tagName === 'LI'){
                            iconBoxs[i].parentNode.parentNode.setAttribute('video','false');
                            var itemBox = iconBoxs[i].getElementsByTagName('div')[0];
                            if(itemBox && itemLi.getAttribute('extensionId') === _room.getMySelf().id){
                                itemBox.className = 'btn ';
                                itemBox.classList.add('permissionOpen');
                                itemBox.classList.add('disabled');
                            }
                        }
                    }
                }
            }
            document.getElementById('switch-onlyaudio-text').innerText = '切换为音视频教室';
            _isRoomOnlyAudio = true;
        } else {
            if(iconBoxs){
                for(var i=0;i<iconBoxs.length;i++){
                    if(iconBoxs[i]){
                        var itemLi = iconBoxs[i].parentNode.parentNode;
                        if(itemLi && itemLi.tagName === 'LI'){
                            iconBoxs[i].parentNode.parentNode.setAttribute('video','true');
                            var itemBox = iconBoxs[i].getElementsByTagName('div')[0];
                            if(itemBox && itemLi.getAttribute('extensionId') === _room.getMySelf().id){
                                itemBox.classList.remove('permissionOpen');
                                itemBox.classList.remove('disabled');
                            }
                        }
                    }
                }
            }
            document.getElementById('switch-onlyaudio-text').innerText = '切换为纯音频教室';
            _isRoomOnlyAudio = false;
        }
    });


})();
