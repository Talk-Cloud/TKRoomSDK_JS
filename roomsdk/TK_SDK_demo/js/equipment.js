(function () {
    var _usingDevices = {} ; // 当前使用的设备集合
    var _deviceDetectioning = false ; // 是否正在设备检测中
    var _devices = {}; // 设备列表，存储系统中所有媒体设备
    var _audioInputDevices = {}; // 音频输入设备列表
    var _videoInputDevices = {}; // 视频输入设备列表
    var _audioOutputDevices = {}; // 音频输出设备列表
    var _selectedDevices = {};  // 当前选中的设备集合
    var isMirror = false;

    TK.DeviceMgr.addDeviceChangeListener(onLocalDevicesChanged);

    enumerateDevices();

    /*点击设置按钮的后续操作*/
    theElement('setting').onclick = startDevicesTest;

    /*点击镜像按钮使视频镜像*/
    theElement('videoprofile').onclick =  function setVideoProfile() {
        if(theElement('videoprofile').checked){
            TK.DeviceMgr.stopCameraTest();
            TK.DeviceMgr.startCameraTest(_selectedDevices.videoinput, 'deviceDetectionVideoPlayerContainer',function (err) {TK.Logger.error("startCameraTest error: ", err);},{mirror:true});
            isMirror = true;
        }else{
            TK.DeviceMgr.stopCameraTest();
            TK.DeviceMgr.startCameraTest(_selectedDevices.videoinput, 'deviceDetectionVideoPlayerContainer',function (err) {TK.Logger.error("startCameraTest error: ", err);},{mirror:false});
            isMirror = false;
        }
    };

    /*关闭设备检测框*/
    theElement('stopDevicesTestBox').onclick = function stopDevicesTest() {
        _deviceDetectioning = false ;
        TK.DeviceMgr.stopCameraTest();
        TK.DeviceMgr.stopMicrophoneTest();
        _selectedDevices.videoinput =  _usingDevices.videoinput ;
        _selectedDevices.audioinput =  _usingDevices.audioinput ;
        _selectedDevices.audiooutput =   _usingDevices.audiooutput ;
        theElement('deviceDetectionAudioPlayerVolume').innerHTML = 0 ;
        theElement('deviceDetectionBox').style.display = 'none';
            try{
                theElement('deviceDetectionAudiooutput').pause();
            }catch (err){
                TK.Logger.error( 'deviceDetectionAudiooutput audio element pause error:' , err );
            }
    };

    /*视频选择元素发生改变后续操作*/
    theElement('selectVideoInputDevices').onchange = selectVideoInputDevices;

    /*麦克风选择元素发生改变后续操作*/
    theElement('selectAudioInputDevices').onchange =  selectAudioInputDevices;

    /*扬声器选择元素发生改变后续操作*/
    theElement('selectAudioOutputDevices').onchange = selectAudioOutputDevices;

    /*点击切换设备按钮后续操作*/
    theElement('finishDevicesTestBox').onclick = function finishDevicesTest() {
        _deviceDetectioning = false ;
        TK.DeviceMgr.stopCameraTest();
        TK.DeviceMgr.stopMicrophoneTest();
        theElement('deviceDetectionAudioPlayerVolume').innerHTML = '0' ;
        theElement('deviceDetectionBox').style.display = 'none';
        _usingDevices.videoinput  =  _selectedDevices.videoinput ;
        _usingDevices.audioinput  =  _selectedDevices.audioinput ;
        _usingDevices.audiooutput =  _selectedDevices.audiooutput ;
            try{
                theElement('deviceDetectionAudiooutput').pause();
            }catch (err){
                TK.Logger.error( 'deviceDetectionAudiooutput audio element pause error:' , err );
            }
        setLocalDevices();
        _room.setLocalVideoMirror(isMirror);
    };

    /*设置选中设备*/
    function setLocalDevices(){
        var selectDeviceInfo = _selectedDevices;
        TK.Logger.debug('selectDeviceInfo  ====', selectDeviceInfo);
        TK.DeviceMgr.setDevices(selectDeviceInfo, function() {
            TK.Logger.error('set device failed');
        });
    }

    /*切换视频选中设备*/
    function selectVideoInputDevices(obj){
        _selectedDevices.videoinput = obj.target.value;
        TK.DeviceMgr.startCameraTest(_selectedDevices.videoinput, 'deviceDetectionVideoPlayerContainer');
    };

    /*切换麦克风选中设备*/
    function selectAudioInputDevices(obj){
        _selectedDevices.audioinput = obj.target.value;

        var successCallback = function (volume) {
            //TK.Logger.error('mic test', volume);
            theElement('deviceDetectionAudioPlayerVolume').innerHTML = volume;
        };
        var failureCallback = function (err) {
            TK.Logger.error('selectAudioInputDevices failed, failure info:' , err);
        };

        TK.DeviceMgr.startMicrophoneTest(_selectedDevices.audioinput, 'deviceDetectionAudioPlayerContainer', successCallback, failureCallback);
    };

    /*切换扬声器选中设备*/
    function selectAudioOutputDevices(obj){
        _selectedDevices.audiooutput = obj.target.value;
        TK.Logger.info('选中的音频输出设备id:'+_selectedDevices.audiooutput);
            var setAudiooutputAvElements = [] ; //需要设置扬声器的节点数组
            var deviceDetectionVideoPlayerAVElements = theElement('deviceDetectionVideoPlayerContainer').querySelectorAll('video,audio') ;
            var deviceDetectionAudioPlayerAVElements = theElement('deviceDetectionAudioPlayerContainer').querySelectorAll('video,audio') ;
            var deviceDetectionAudiooutputElement = theElement('deviceDetectionAudiooutput') ;
            for( var  i = 0 ; i < deviceDetectionVideoPlayerAVElements.length ; i++ ){
                setAudiooutputAvElements.push( deviceDetectionVideoPlayerAVElements[i] );
            }
            for( var  i = 0 ; i < deviceDetectionAudioPlayerAVElements.length ; i++ ){
                setAudiooutputAvElements.push( deviceDetectionAudioPlayerAVElements[i] );
            }
            setAudiooutputAvElements.push( deviceDetectionAudiooutputElement );
            TK.DeviceMgr.associateElementsToSpeaker( setAudiooutputAvElements, _selectedDevices.audiooutput , function () {
                    TK.Logger.info('set audiooutput finished!');
                }
            );
    };

    /*枚举设备*/
    function enumerateDevices(){
        var paramsJson = {isSetlocalStorage: false} ;
        TK.DeviceMgr.getDevices(function (deviceInfo) {
            data = {
                action:'deviceManagement' ,
                type:'sendDeviceInfo' ,
                deviceData:{deviceInfo:deviceInfo} ,
            };
            _devices = deviceInfo.devices;
            _audioInputDevices = _devices.audioinput;
            _videoInputDevices = _devices.videoinput;
            _audioOutputDevices = _devices.audiooutput;
            var videoinputSelectItem = theElement('selectVideoInputDevices');
            videoinputSelectItem.innerHTML = '';
            _usingDevices.videoinput = deviceInfo.useDevices.videoinput ;
            _usingDevices.audioinput = deviceInfo.useDevices.audioinput ;
            _usingDevices.audiooutput = deviceInfo.useDevices.audiooutput  ;

            for(var i=0;i<_videoInputDevices.length;i++){
                var option = new Option(_videoInputDevices[i].label, _videoInputDevices[i].deviceId) ;
                if(_videoInputDevices[i].deviceId === _usingDevices.videoinput ){
                    option.selected = true ;
                }
                videoinputSelectItem.options.add(option);
            }
            var audioinputSelectItem = theElement('selectAudioInputDevices');
            audioinputSelectItem.innerHTML = '';
            for(var i=0;i<_audioInputDevices.length;i++){
                var option = new Option(_audioInputDevices[i].label, _audioInputDevices[i].deviceId) ;
                if(_audioInputDevices[i].deviceId ===  _usingDevices.audioinput ){
                    option.selected = true ;
                }
                audioinputSelectItem.options.add(option);
            }
            var audiooutputSelectItem = theElement('selectAudioOutputDevices');
            audiooutputSelectItem.innerHTML = '';
            for(var i=0;i<_audioOutputDevices.length;i++){
                var option = new Option(_audioOutputDevices[i].label, _audioOutputDevices[i].deviceId) ;
                if(_audioOutputDevices[i].deviceId === _usingDevices.audiooutput ){
                    option.selected = true ;
                }
                audiooutputSelectItem.options.add(option);
            }
            if( _deviceDetectioning ){
                startDevicesTest();
            }
        }, paramsJson);
    };

    /*设备切换*/
    function onLocalDevicesChanged(evt) {
        enumerateDevices();
    };

    /*开始设备检测*/
    function startDevicesTest() {
        _deviceDetectioning = true ;
        TK.DeviceMgr.stopCameraTest();
        TK.DeviceMgr.stopMicrophoneTest();

        theElement('deviceDetectionAudioPlayerVolume').innerHTML = '0';
        try{
            theElement('deviceDetectionAudiooutput').pause();
        }catch (err){
            TK.Logger.error( 'deviceDetectionAudiooutput audio element pause error:' , err );
        }

        _selectedDevices.videoinput = _usingDevices.videoinput;
        _selectedDevices.audioinput = _usingDevices.audioinput;
        _selectedDevices.audiooutput = _usingDevices.audiooutput;

        var videoinputSelectItem = theElement('selectVideoInputDevices');
        for(var i=0; i<videoinputSelectItem.options.length; i++){
            if(videoinputSelectItem.options[i].value === _usingDevices.videoinput ){
                videoinputSelectItem.options[i].selected = true ;
            }
        }
        var audioinputSelectItem = theElement('selectAudioInputDevices');
        for(var i=0; i<audioinputSelectItem.options.length; i++){
            if(audioinputSelectItem.options[i].value ===  _usingDevices.audioinput ){
                audioinputSelectItem.options[i].selected = true ;
            }
        }
        var audiooutputSelectItem = theElement('selectAudioOutputDevices');
        for(var i=0; i<audiooutputSelectItem.options.length; i++){
            if(audiooutputSelectItem.options[i].value === _usingDevices.audiooutput ){
                audiooutputSelectItem.options[i].selected = true ;
            }
        }

        selectVideoInputDevices({target:{value: _selectedDevices.videoinput }});
        selectAudioInputDevices({target:{value: _selectedDevices.audioinput }});
        selectAudioOutputDevices({target:{value: _selectedDevices.audiooutput }});
        theElement('deviceDetectionBox').style.display = 'block';
    };

    /*通过元素ID获取该元素*/
    function theElement(id) {
        return document.getElementById(id);
    };

})();