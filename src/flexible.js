;(function (win) {
  var doc = win.document;
  var docEl = doc.documentElement;
  var metaEl = doc.querySelector('meta[name="viewport"]');
  var flexibleEl = doc.querySelector('meta[name="flexible"]');
  var scale = 0;
  var dpr = 0;
  var tid;

  if (metaEl) {
    console.warn('将根据已有的meta标签来设置缩放比例');
    var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
    if (match) {
      scale = parseFloat(match[1]);
      dpr = parseInt(1 / scale);
    }
  } else if (flexibleEl) {
    var content = flexibleEl.getAttribute('content');
    if (content) {
      var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
      if (initialDpr) {
        dpr = parseFloat(initialDpr[1]);
        scale = parseFloat((1 / dpr).toFixed(2));
      }
    }
  }

  // 没有初始化的dpr则，根据pixel去计算
  if (!scale) {
    dpr = win.devicePixelRatio;

    // 添加字体标识，现在似乎都用rem来写字体了，保存在这里。
    // 考虑到android上回出现devicePixelRatio非整数
    if (dpr >= 3) {
      dpr = 3
    } else if (dpr >= 2){
      dpr = 2
    } else {
      dpr = 1
    }

    scale = 1 / dpr;
  }

  function addViewPort(metaEl) {
    if (docEl.firstElementChild) {
      docEl.firstElementChild.appendChild(metaEl);
    } else {
      var wrap = doc.createElement('div');
      wrap.appendChild(metaEl);
      doc.write(wrap.innerHTML);
    }
  }

  function updateViewPortContent(content) {
    docEl.querySelector('meta[name="viewport"]').setAttribute('content', content)
  }

  if (!metaEl) {
    metaEl = doc.createElement('meta');
    metaEl.setAttribute('name', 'viewport');
    metaEl.setAttribute('content', 'target-densitydpi=device-dpi,user-scalable=no,initial-scale=' + scale + ',maximum-scale=' + scale + ', minimum-scale=' + scale);
    addViewPort(metaEl)

    // 不通过加入具体设备的白名单，通过此特征检测 docEl.clientWidth == 980
    // initial-scale=1不能省，因为上面设置为其他的scale了，需要重置回来
    if (docEl.clientWidth === 980) {
      updateViewPortContent('target-densitydpi=device-dpi,width=device-width,user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=1')
      dpr = 1
    }
  }

  docEl.setAttribute('data-dpr', dpr + '');

  // adjust body font size
  function setBodyFontSize () {
    if (document.body) {
      document.body.style.fontSize = (12 * dpr) + 'px'
    }
    else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize)
    }
  }
  setBodyFontSize();

  // set 1rem = viewWidth / 10
  function refreshRem () {
    var rem = docEl.clientWidth / 10
    docEl.style.fontSize = rem + 'px'
  }

  refreshRem();

  win.addEventListener('resize', function () {
    clearTimeout(tid);
    tid = setTimeout(refreshRem, 300);
  });

  win.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      clearTimeout(tid);
      tid = setTimeout(refreshRem, 300);
    }
  });
})(window);
