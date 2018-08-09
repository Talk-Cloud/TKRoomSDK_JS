
/*创建视频 , 以及一些相关点击事件*/
function createVideoBlock(id,nickname,isme,sizeObj) {
    var li = document.createElement('li');
    var mainDiv = document.createElement('div');
    var divFirst = document.createElement('div');
    if(isme){
        var diva = document.createElement('div');
        var divaa = document.createElement('div');
        var divb = document.createElement('div');
        var divbb = document.createElement('div');
        var divc = document.createElement('div');
        var divcc = document.createElement('div');
    }else{
        var divd = document.createElement('div');
        var divdd = document.createElement('div');
    }
    var divLast = document.createElement('div');
    var spanFirst = document.createElement('span');
    var spanLast = document.createElement('span');
    spanLast.innerText = nickname;
    li.setAttribute("extensionId",id);
    li.setAttribute("audio",true);
    li.setAttribute("video",true);
    spanFirst.id = volStr+id;
    divLast.appendChild(spanFirst);
    divLast.appendChild(spanLast);
    mainDiv.className = 'videoBlock ';
    mainDiv.id = prefixStr+id;
    divFirst.className = 'iconBlock ';
    divLast.className = 'infoBlock ';
    if(isme){
        diva.className = divb.className = divc.className = 'btn';
        divaa.className = 'btn-video ';
        divbb.className = 'btn-audio ';
        divcc.className = 'btn-pps ';
    }else{
        divd.className = 'btn';
        divdd.className = 'btn-tick ';
    }
    if(isme){
        diva.appendChild(divaa);
        divb.appendChild(divbb);
        divc.appendChild(divcc);
        divFirst.appendChild(diva);
        divFirst.appendChild(divb);
        divFirst.appendChild(divc);
    }else{
        divd.appendChild(divdd);
        divFirst.appendChild(divd);
    }
    mainDiv.appendChild(divFirst);
    mainDiv.appendChild(divLast);
    li.appendChild(mainDiv);
    videoContainer.appendChild(li);
    if(isme){
        diva.onclick = function (e) {
            var findEdLi = findLiDom(e.path);
            if(findEdLi.getAttribute('video') === 'true'){
                _room.unpublishVideo();
                findEdLi.setAttribute('video','false');
                diva.className = 'btn permissionOpen '
            }else if(findEdLi.getAttribute('video') === 'false'){
                _room.publishVideo();
                findEdLi.setAttribute('video','true');
                diva.className = 'btn '
            }
        };
        divb.onclick = function (e) {
            var findEdLi = findLiDom(e.path);
            if(findEdLi.getAttribute('audio') === 'true'){
                _room.unpublishAudio();
                findEdLi.setAttribute('audio','false');
                divb.className = 'btn permissionOpen '
            }else if(findEdLi.getAttribute('audio') === 'false'){
                _room.publishAudio();
                findEdLi.setAttribute('audio','true');
                divb.className = 'btn '
            }
        };
    }else{
        divd.onclick = function (e) {
            _room.evictUser(findLiDom(e.path).getAttribute('extensionId'))
        }
    }
    if(sizeObj && isme){
        createSwitch(sizeObj.width,sizeObj.height,mainDiv,sizeObj.fps,divc)
    }
};

/*取到最近的一个li元素*/
function findLiDom(path) {
    for(var i = 0;i<path.length;i++ ){
        if(path[i].tagName === 'LI'){
            return path[i]
        }
    }
};

/*创建切换分辨率的元素组，以及一些相关事件*/
function createSwitch(width,height,Dom ,maxfps,trigger) {
    var array = ['176*144','320*180','320*240','640*480','1280*720','1920*1080'];
    var index = array.findIndex((item) => {
        return eval(item) === width * height
    });
    var SwitchAry = array.slice(0, index+1);
    if(index < 0){
        SwitchAry.unshift(width + '*' + height)
    };
    var mainDiv = document.createElement('div');
    mainDiv.className = 'SwitchBox ';
    mainDiv.id = 'clickSwitchBox';
    SwitchAry.forEach((item)=>{
        var div = document.createElement('div');
        div.innerText = item;
        mainDiv.appendChild(div);
    });
    if(index > 0){
        if(mainDiv.getElementsByTagName('div')[index]){
            mainDiv.getElementsByTagName('div')[index].className = 'active ';
        }
    }else{
        if( mainDiv.getElementsByTagName('div')[0]){
            mainDiv.getElementsByTagName('div')[0].className = 'active ';
        }
    }
    Dom.appendChild(mainDiv);
    mainDiv.onclick = function (e) {
        if(e.target.parentNode.id === 'clickSwitchBox'){
            var reg=/^([\s\S]+)\*([\s\S]+)/;
            var size = reg.exec(e.target.innerText);
            if(size){
                _room.setVideoProfile({width:Number(size[1]),height:Number(size[2]),maxfps:Number(maxfps)});
                var allBox = mainDiv.getElementsByTagName('div');
                for(var i = 0;i<allBox.length;i++){
                    allBox[i].className=''
                }
                e.target.className = 'active ';
                mainDiv.style.display='none';
            }
        }
    };

    trigger.onclick = function (e) {
        if(getComputedStyle(mainDiv).display === 'none'){
            mainDiv.style.display='block';
        }else{
            mainDiv.style.display='none';
        }
    };
};

