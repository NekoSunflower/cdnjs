addEventListener('load', function() {
  var msgEle, loadEle, textEle, wrapper, toolbar;
  var isHideMsg = false;
  var isMenuInited = false;

    msgEle  = document.getElementById('msg-mask');
    loadEle = document.getElementById('anime');
    textEle = document.getElementById('msg-text');
    wrapper = document.getElementById('wrapper');

var options = {
  remoteid : REMOTEID,
  host     : HOST,
  ssl      : true,
  port     : 443,
  debug    : false
};
if (AUTH) {
  options.auth = AUTH;
}
  var topSize = 0;

// START 向日葵远程桌面
var client = new SunloginControl.Client(options);

// 页面unload关闭客户端连接
window.onunload = function() {
  client.disconnect();
}

updateMessage('开始连接');

client
.connect() // 客户端连接开始
// 向日葵客户端流程： 登录验证 => P2P连接，嵌入SDK不需要
.then(() => {
  updateMessage('正在登录客户端');
  if (ISFASTCODE) {
    return client.fastLogin();
  } else {
    return client.login();
  }
})
.then(() => {
  updateMessage('正在连接P2P服务器');
  // return client.forward('slp2p-live01.oray.net');
  return client.forward(P2P);
})
.then(() => {
  // 连接桌面插件
  const desktop = new SunloginControl.Plugin.Desktop({quality: 10});
  client.connectPlugin(desktop);

  client.on('disconnect', function() {
      updateMessage('连接已断开');
      client.disconnect();
  });

  updateMessage('连接成功，等待桌面图像');

  // 初始化桌面
  var view = new SunloginControl.DesktopView(document.getElementById('wrapper'));
  setInterval(()=>{
	var info = view._imageInfo;
	if (info) {
        var scale = calcScale(info);
        view.zoom(scale);
        desktop.setScale(scale);
        $("canvas").css("marginTop", info.height - $("canvas").attr("height"));
	}
   }
  , 1000);

  // imageinfo 桌面图像信息
  desktop.on('imageinfo', (info) => {
    view.setImageInfo(info);
    var scale = calcScale(info);
    view.zoom(scale);
    // document.getElementById('wrapper').style.marginTop = (topSize / scale) + 'px';
    desktop.setScale(scale);
  });

  desktop.on('session', (sessions) => {
    console.log(sessions);
  });

  desktop.on('stream', (stream, info) => {
    view.decode(stream, info);
    hideMessage();
  });

  desktop.transportMouseEvent(document.getElementById('wrapper'));
  desktop.transportKeyBoardEvent(document.getElementById('wrapper'));

})
.catch((e) => {
  console.log("Error occured: ", e);
});

// 计算缩放比例
function calcScale(info) {
    var dw = $(window).width();
    var dh = $(window).height() - topSize;
    var scale = 1;

    if (dw < info.width || dh < info.height) {
        var scaleW = Math.min(dw / info.width, 1);
        var scaleH = Math.min(dh / info.height, 1);
    
        var scale = Math.min(scaleW, scaleH);
    }
    return scale;
}

function updateMessage(text, isLoading) {
    if (typeof(isLoading) == 'undefined') {
        isLoading = true;
    }

    msgEle.style.display = '';
    isHideMsg = false;

    textEle.innerHTML = text;
    if (isLoading) {
        loadEle.style.display = 'inline-block';
    } else {
        loadEle.style.display = 'none';
    }
}

function hideMessage() {
    if (isHideMsg) {
        return ;
    }
    msgEle.style.display = 'none';
    isHideMsg = true;
}

});  // end addEventListener load
