/**
 * ToyLab 布局原型 - 简单交互
 */

document.addEventListener('DOMContentLoaded', function () {
  window.__TOYLAB_DEBUG_BLOCKS = true;

  // ===== 视图路由 =====
  var NAV_VIEWS = [
    { btn: 'btnInspiration', view: 'inspo'   },
    { btn: 'btnShop',        view: 'shop'    },
    { btn: 'btnStudio',      view: 'studio'  },
    { btn: 'btnMakeX',       view: 'makex'   },
    { btn: 'btnMyLibrary',   view: 'library' },
  ];
  var ALL_VIEWS = ['view-inspo', 'view-shop', 'view-studio', 'view-makex', 'view-library'];

  var btnInspiration = document.getElementById('btnInspiration');
  var btnMyLibrary   = document.getElementById('btnMyLibrary');

  function setView(view) {
    document.body.classList.remove.apply(document.body.classList, ALL_VIEWS);
    document.body.classList.add('view-' + view);
    NAV_VIEWS.forEach(function (item) {
      var el = document.getElementById(item.btn);
      if (el) el.classList.toggle('btn-topbar-nav--active', item.view === view);
    });
  }

  // 绑定导航按钮
  NAV_VIEWS.forEach(function (item) {
    var el = document.getElementById(item.btn);
    if (el) el.addEventListener('click', function () { setView(item.view); });
  });

  // 默认进入发现页
  setView('inspo');

  // 商城页面 — 左侧分类切换（含二级子项）
  var shopNavItems = document.querySelectorAll('#shopPage [data-shop-category]');
  var shopPageTitle = document.querySelector('.shop-page-title');
  var shopCategoryLabels = {
    // 一级分组
    electronics: '全部电子模块', mechanical: '全部机械配件',
    // 电子模块子分类
    input: '输入模块', output: '输出模块', motor: '动力模块',
    power: '电源模块', mcu: '主控模块', wire: '线束',
    // 机械配件子分类
    gear: '齿轮', pulley: '带轮', bearing: '轴承',
    spring: '弹簧', shaft: '轴', screw: '螺丝', hinge: '合页', tire: '轮胎',
    // 收藏
    favorites: '我的收藏', recent: '最近浏览',
    // 我的零件库
    'my-electronics': '我的电子模块', 'my-mechanical': '我的机械零件'
  };

  // 商城主区域中的内嵌面板 & 商品网格
  var shopGrid          = document.getElementById('shopGrid');
  var shopMyElectronics = document.getElementById('shopMyElectronics');
  var shopMyMechanical  = document.getElementById('shopMyMechanical');
  var shopFavPanel      = document.getElementById('shopFavPanel');
  var shopTopbar        = document.querySelector('.shop-page .inspo-topbar');

  /** 显示商品卡片网格，恢复顶栏，隐藏所有我的零件库面板 */
  function showShopGrid() {
    if (shopTopbar)        shopTopbar.hidden        = false;
    if (shopGrid)          shopGrid.hidden          = false;
    if (shopMyElectronics) shopMyElectronics.hidden = true;
    if (shopMyMechanical)  shopMyMechanical.hidden  = true;
    if (shopFavPanel)      shopFavPanel.hidden      = true;
  }

  /** 隐藏顶栏与商品网格，仅显示指定零件库面板 */
  function showMyPanel(which) {
    if (shopTopbar)        shopTopbar.hidden        = true;
    if (shopGrid)          shopGrid.hidden          = true;
    if (shopMyElectronics) shopMyElectronics.hidden = (which !== 'electronics');
    if (shopMyMechanical)  shopMyMechanical.hidden  = (which !== 'mechanical');
    if (shopFavPanel)      shopFavPanel.hidden      = true;
  }

  /** 显示商城收藏面板 */
  function showShopFavPanel() {
    if (shopTopbar)        shopTopbar.hidden        = true;
    if (shopGrid)          shopGrid.hidden          = true;
    if (shopMyElectronics) shopMyElectronics.hidden = true;
    if (shopMyMechanical)  shopMyMechanical.hidden  = true;
    if (shopFavPanel)      shopFavPanel.hidden      = false;
  }

  shopNavItems.forEach(function (item) {
    item.addEventListener('click', function () {
      shopNavItems.forEach(function (n) { n.classList.remove('active'); });
      item.classList.add('active');
      var cat = item.getAttribute('data-shop-category');
      // 更新标题
      if (shopPageTitle && shopCategoryLabels[cat]) {
        shopPageTitle.textContent = shopCategoryLabels[cat];
      }
      // 切换视图
      if (cat === 'my-electronics') {
        showMyPanel('electronics');
      } else if (cat === 'my-mechanical') {
        showMyPanel('mechanical');
      } else if (cat === 'favorites') {
        showShopFavPanel();
      } else {
        showShopGrid();
      }
    });
  });

  // ===== 收藏功能 =====
  var inspoFavPanel = document.getElementById('inspoFavPanel');
  var inspoGrid     = document.getElementById('inspoGrid');

  // badge 元素
  var shopFavBadge  = document.querySelector('[data-shop-category="favorites"] .inspo-badge');
  var inspoFavBadge = document.querySelector('[data-category="favorites"] .inspo-badge');

  // 已收藏的卡片标题集合（shop / inspo 分开）
  var shopFavTitles  = new Set();
  var inspoFavTitles = new Set();

  function updateBadge(el, count) {
    if (!el) return;
    el.textContent = count;
    el.style.display = count > 0 ? '' : 'none';
  }

  /** 重新渲染商城收藏网格 */
  function renderShopFavPanel() {
    if (!shopFavPanel) return;
    shopFavPanel.innerHTML = '';
    document.querySelectorAll('#shopGrid .inspo-card').forEach(function (card) {
      var t = card.querySelector('.inspo-card-title');
      if (t && shopFavTitles.has(t.textContent)) {
        var clone = card.cloneNode(true);
        var cloneBtn = clone.querySelector('.inspo-fav-btn');
        if (cloneBtn) {
          cloneBtn.classList.add('inspo-fav-btn--active');
          cloneBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var title = t.textContent;
            shopFavTitles.delete(title);
            // 同步原卡片按钮状态
            var origBtn = card.querySelector('.inspo-fav-btn');
            if (origBtn) origBtn.classList.remove('inspo-fav-btn--active');
            renderShopFavPanel();
            updateBadge(shopFavBadge, shopFavTitles.size);
          });
        }
        shopFavPanel.appendChild(clone);
      }
    });
    if (shopFavPanel.children.length === 0) {
      shopFavPanel.innerHTML = '<p style="grid-column:1/-1;color:#9ca3af;font-size:14px;text-align:center;padding:48px 0">还没有收藏任何零件</p>';
    }
  }

  /** 重新渲染发现页收藏网格 */
  function renderInspoFavPanel() {
    if (!inspoFavPanel) return;
    inspoFavPanel.innerHTML = '';
    document.querySelectorAll('#inspoGrid .inspo-card').forEach(function (card) {
      var t = card.querySelector('.inspo-card-title');
      if (t && inspoFavTitles.has(t.textContent)) {
        var clone = card.cloneNode(true);
        var cloneBtn = clone.querySelector('.inspo-fav-btn');
        if (cloneBtn) {
          cloneBtn.classList.add('inspo-fav-btn--active');
          cloneBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var title = t.textContent;
            inspoFavTitles.delete(title);
            var origBtn = card.querySelector('.inspo-fav-btn');
            if (origBtn) origBtn.classList.remove('inspo-fav-btn--active');
            renderInspoFavPanel();
            updateBadge(inspoFavBadge, inspoFavTitles.size);
          });
        }
        inspoFavPanel.appendChild(clone);
      }
    });
    if (inspoFavPanel.children.length === 0) {
      inspoFavPanel.innerHTML = '<p style="grid-column:1/-1;color:#9ca3af;font-size:14px;text-align:center;padding:48px 0">还没有收藏任何案例</p>';
    }
  }

  /** 绑定收藏按钮点击事件 */
  function bindFavBtn(btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var card = btn.closest('.inspo-card');
      if (!card) return;
      var isShop = card.classList.contains('shop-card');
      var titleEl = card.querySelector('.inspo-card-title');
      var title = titleEl ? titleEl.textContent : '';
      var favSet = isShop ? shopFavTitles : inspoFavTitles;
      var badge  = isShop ? shopFavBadge  : inspoFavBadge;

      if (btn.classList.contains('inspo-fav-btn--active')) {
        btn.classList.remove('inspo-fav-btn--active');
        favSet.delete(title);
      } else {
        btn.classList.add('inspo-fav-btn--active');
        favSet.add(title);
      }
      updateBadge(badge, favSet.size);
      if (isShop) renderShopFavPanel(); else renderInspoFavPanel();
    });
  }

  document.querySelectorAll('.inspo-fav-btn').forEach(bindFavBtn);

  // 发现页"我的收藏"点击 → 切换面板
  var inspoNavItems2 = document.querySelectorAll('.inspo-page .inspo-nav-item[data-category]');
  inspoNavItems2.forEach(function (item) {
    item.addEventListener('click', function () {
      var cat = item.getAttribute('data-category');
      if (cat === 'favorites') {
        if (inspoGrid)     inspoGrid.hidden     = true;
        if (inspoFavPanel) inspoFavPanel.hidden = false;
      } else {
        if (inspoGrid)     inspoGrid.hidden     = false;
        if (inspoFavPanel) inspoFavPanel.hidden = true;
      }
    });
  });

  // 灵感页面 — 左侧分类切换
  var inspoNavItems = document.querySelectorAll('.inspo-nav-item');
  var inspoPageTitle = document.querySelector('.inspo-page-title');
  var categoryLabels = {
    all: '全部玩具', car: '玩具车', game: '游戏机',
    boardgame: '桌游', pet: '宠物玩具', tool: '工具',
    peripheral: '电脑周边', appliance: '家电',
    favorites: '我的收藏', recent: '最近浏览',
    'my-purchases': '我的购买', 'my-designs': '我的设计'
  };
  inspoNavItems.forEach(function (item) {
    item.addEventListener('click', function () {
      inspoNavItems.forEach(function (n) { n.classList.remove('active'); });
      item.classList.add('active');
      var cat = item.getAttribute('data-category');
      if (inspoPageTitle && categoryLabels[cat]) inspoPageTitle.textContent = categoryLabels[cat];
    });
  });

  // 灵感页面 — 收藏按钮切换
  document.querySelectorAll('.inspo-card-fav-text').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var active = btn.getAttribute('data-fav') === '1';
      var countEl = btn.querySelector('span');
      var count = parseInt(countEl.textContent, 10) || 0;
      if (active) {
        btn.setAttribute('data-fav', '0');
        btn.classList.remove('inspo-card-fav-text--active');
        countEl.textContent = count - 1;
      } else {
        btn.setAttribute('data-fav', '1');
        btn.classList.add('inspo-card-fav-text--active');
        countEl.textContent = count + 1;
      }
    });
  });

  // 保留旧的返回按钮兼容（如有残留 DOM）
  var btnLibraryBack = document.getElementById('btnLibraryBack');
  if (btnLibraryBack) btnLibraryBack.addEventListener('click', function () { setView('inspo'); });
  var btnInspoBack = document.getElementById('btnInspoBack');
  if (btnInspoBack) btnInspoBack.addEventListener('click', function () { setView('inspo'); });

  // 模型库标签页切换
  var libTabs = document.querySelectorAll('.lib-tab');
  var libPanels = {
    projects: document.getElementById('libPanelProjects'),
    modules:  document.getElementById('libPanelModules')
  };
  libTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-tab');
      libTabs.forEach(function (t) { t.classList.remove('lib-tab--active'); });
      tab.classList.add('lib-tab--active');
      Object.keys(libPanels).forEach(function (key) {
        if (libPanels[key]) {
          if (key === target) libPanels[key].removeAttribute('hidden');
          else libPanels[key].setAttribute('hidden', '');
        }
      });
    });
  });

  // 设置对话框
  var btnSettings = document.getElementById('btnSettings');
  var settingsOverlay = document.getElementById('settingsOverlay');
  var settingsClose = document.getElementById('settingsClose');
  var toggleSnapSound = document.getElementById('toggleSnapSound');
  var toggleConsole = document.getElementById('toggleConsole');
  window.__snapSoundEnabled = true;

  // 控制台默认隐藏，从设置中读取是否显示
  (function initConsoleVisibility() {
    var saved = localStorage.getItem('toylab_console_visible');
    var show = saved === 'true';
    if (toggleConsole) toggleConsole.setAttribute('aria-checked', String(show));
    if (show) document.body.classList.add('console-visible');
  })();

  if (btnSettings && settingsOverlay) {
    btnSettings.addEventListener('click', function () {
      settingsOverlay.classList.add('open');
      settingsOverlay.removeAttribute('aria-hidden');
    });
    if (settingsClose) settingsClose.addEventListener('click', closeSettings);
    settingsOverlay.addEventListener('click', function (e) {
      if (e.target === settingsOverlay) closeSettings();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSettings();
    });
    function closeSettings() {
      settingsOverlay.classList.remove('open');
      settingsOverlay.setAttribute('aria-hidden', 'true');
    }
    // 显示控制台开关
    if (toggleConsole) {
      toggleConsole.addEventListener('click', function () {
        var checked = toggleConsole.getAttribute('aria-checked') === 'true';
        var next = !checked;
        toggleConsole.setAttribute('aria-checked', String(next));
        document.body.classList.toggle('console-visible', next);
        localStorage.setItem('toylab_console_visible', String(next));
      });
      toggleConsole.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleConsole.click(); }
      });
    }
    // 块吸附音开关
    if (toggleSnapSound) {
      toggleSnapSound.addEventListener('click', function () {
        var checked = toggleSnapSound.getAttribute('aria-checked') === 'true';
        var next = !checked;
        toggleSnapSound.setAttribute('aria-checked', String(next));
        window.__snapSoundEnabled = next;
      });
      toggleSnapSound.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleSnapSound.click(); }
      });
    }
  }

  // 文件菜单下拉
  var fileMenuWrap = document.querySelector('.file-menu-wrap');
  var btnFileMenu = document.getElementById('btnFileMenu');
  if (fileMenuWrap && btnFileMenu) {
    btnFileMenu.addEventListener('click', function (e) {
      e.stopPropagation();
      fileMenuWrap.classList.toggle('open');
    });
    document.addEventListener('click', function () {
      fileMenuWrap.classList.remove('open');
    });
    document.getElementById('fileDropdown').addEventListener('click', function () {
      fileMenuWrap.classList.remove('open');
    });
  }

  /* ===== 颜色字段：多模式色盘 ===== */

  /* --- 颜色转换工具 --- */
  function hsbToRgb(h, s, b) {
    s /= 100; b /= 100;
    var i = Math.floor(h / 60) % 6, f = h / 60 - Math.floor(h / 60);
    var p = b*(1-s), q = b*(1-f*s), t = b*(1-(1-f)*s);
    var r = [[b,t,p],[q,b,p],[p,b,t],[p,q,b],[t,p,b],[b,p,q]][i];
    return r.map(function(v){ return Math.round(v*255); });
  }
  function rgbToHsb(r, g, b) {
    r/=255; g/=255; b/=255;
    var max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min, h=0;
    if(d){ if(max===r) h=((g-b)/d+6)%6; else if(max===g) h=(b-r)/d+2; else h=(r-g)/d+4; h*=60; }
    return [h, max===0?0:d/max*100, max*100];
  }
  function rgbToCss(r,g,b){ return 'rgb('+r+','+g+','+b+')'; }
  function hsbToCss(h,s,b){ var c=hsbToRgb(h,s,b); return rgbToCss(c[0],c[1],c[2]); }
  function rgbToLab(r,g,b) {
    r/=255; g/=255; b/=255;
    function lin(c){ return c>0.04045?Math.pow((c+0.055)/1.055,2.4):c/12.92; }
    r=lin(r); g=lin(g); b=lin(b);
    var x=(r*0.4124+g*0.3576+b*0.1805)/0.95047;
    var y=(r*0.2126+g*0.7152+b*0.0722)/1.00000;
    var z=(r*0.0193+g*0.1192+b*0.9505)/1.08883;
    function f(t){ return t>0.008856?Math.pow(t,1/3):(7.787*t)+16/116; }
    return [116*f(y)-16, 500*(f(x)-f(y)), 200*(f(y)-f(z))];
  }
  function labToRgb(L,a,b) {
    var fy=(L+16)/116, fx=a/500+fy, fz=fy-b/200;
    function fi(t){ var t3=t*t*t; return t3>0.008856?t3:(t-16/116)/7.787; }
    var x=fi(fx)*0.95047, y=fi(fy), z=fi(fz)*1.08883;
    var r=x*3.2406+y*(-1.5372)+z*(-0.4986);
    var g2=x*(-0.9689)+y*1.8758+z*0.0415;
    var b2=x*0.0557+y*(-0.2040)+z*1.0570;
    function gam(c){ return c>0.0031308?1.055*Math.pow(c,1/2.4)-0.055:12.92*c; }
    return [gam(r),gam(g2),gam(b2)].map(function(v){ return Math.max(0,Math.min(255,Math.round(v*255))); });
  }
  function rgbToCmyk(r,g,b) {
    r/=255; g/=255; b/=255;
    var k=1-Math.max(r,g,b);
    if(k===1) return [0,0,0,100];
    return [(1-r-k)/(1-k)*100,(1-g-k)/(1-k)*100,(1-b-k)/(1-k)*100,k*100];
  }
  function cmykToRgb(c,m,y,k) {
    c/=100; m/=100; y/=100; k/=100;
    return [Math.round(255*(1-c)*(1-k)),Math.round(255*(1-m)*(1-k)),Math.round(255*(1-y)*(1-k))];
  }

  /* --- 滑动条渐变背景 --- */
  function setSliderBg(slider, type, vals) {
    var g;
    if(type==='hue') {
      g='linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))';
    } else if(type==='sat') {
      g='linear-gradient(to right,'+hsbToCss(vals[0],0,vals[2])+','+hsbToCss(vals[0],100,vals[2])+')';
    } else if(type==='bri') {
      g='linear-gradient(to right,'+hsbToCss(vals[0],vals[1],0)+','+hsbToCss(vals[0],vals[1],100)+')';
    } else if(type==='red') {
      g='linear-gradient(to right,'+rgbToCss(0,vals[1],vals[2])+','+rgbToCss(255,vals[1],vals[2])+')';
    } else if(type==='green') {
      g='linear-gradient(to right,'+rgbToCss(vals[0],0,vals[2])+','+rgbToCss(vals[0],255,vals[2])+')';
    } else if(type==='blue') {
      g='linear-gradient(to right,'+rgbToCss(vals[0],vals[1],0)+','+rgbToCss(vals[0],vals[1],255)+')';
    } else if(type==='lum') { g='linear-gradient(to right,#000,#fff)';
    } else if(type==='lab-a') { g='linear-gradient(to right,#00b300,#b30000)';
    } else if(type==='lab-b') { g='linear-gradient(to right,#0000af,#afaf00)';
    } else if(type==='cyan')    { g='linear-gradient(to right,#fff,#00ffff)';
    } else if(type==='magenta') { g='linear-gradient(to right,#fff,#ff00ff)';
    } else if(type==='yellow')  { g='linear-gradient(to right,#fff,#ffff00)';
    } else if(type==='key')     { g='linear-gradient(to right,#fff,#000)';
    } else { g='linear-gradient(to right,#ddd,#333)'; }
    slider.style.background = g;
  }

  /* --- 模式定义 --- */
  var CP_MODES = {
    HSB: {
      channels: [
        {label:'H', unit:'°', min:0, max:360, bg:'hue'},
        {label:'S', unit:'%', min:0, max:100, bg:'sat'},
        {label:'B', unit:'%', min:0, max:100, bg:'bri'}
      ],
      fromRgb: function(r,g,b){ return rgbToHsb(r,g,b); },
      toRgb: function(v){ return hsbToRgb(v[0],v[1],v[2]); }
    },
    RGB: {
      channels: [
        {label:'R', unit:'', min:0, max:255, bg:'red'},
        {label:'G', unit:'', min:0, max:255, bg:'green'},
        {label:'B', unit:'', min:0, max:255, bg:'blue'}
      ],
      fromRgb: function(r,g,b){ return [r,g,b]; },
      toRgb: function(v){ return v; }
    },
    Lab: {
      channels: [
        {label:'L', unit:'', min:0,   max:100, bg:'lum'},
        {label:'a', unit:'', min:-128, max:127, bg:'lab-a'},
        {label:'b', unit:'', min:-128, max:127, bg:'lab-b'}
      ],
      fromRgb: function(r,g,b){ return rgbToLab(r,g,b); },
      toRgb: function(v){ return labToRgb(v[0],v[1],v[2]); }
    },
    CMYK: {
      channels: [
        {label:'C', unit:'%', min:0, max:100, bg:'cyan'},
        {label:'M', unit:'%', min:0, max:100, bg:'magenta'},
        {label:'Y', unit:'%', min:0, max:100, bg:'yellow'},
        {label:'K', unit:'%', min:0, max:100, bg:'key'}
      ],
      fromRgb: function(r,g,b){ return rgbToCmyk(r,g,b); },
      toRgb: function(v){ return cmykToRgb(v[0],v[1],v[2],v[3]); }
    }
  };

  var _colourPopup = null;
  function closeColourPopup() {
    if(_colourPopup){ _colourPopup.remove(); _colourPopup = null; }
  }
  document.addEventListener('mousedown', function(e) {
    if(_colourPopup && !_colourPopup.contains(e.target) && !e.target.classList.contains('block-field-colour'))
      closeColourPopup();
  }, true);

  function openColourPicker(swatchEl) {
    closeColourPopup();
    var initH = parseFloat(swatchEl.dataset.h)||0;
    var initS = parseFloat(swatchEl.dataset.s||0);
    var initB = parseFloat(swatchEl.dataset.b||100);
    var rgb = hsbToRgb(initH, initS, initB); // [r,g,b] 0-255，内部状态
    var currentMode = 'HSB';

    var popup = document.createElement('div');
    popup.className = 'colour-picker-popup';
    _colourPopup = popup;

    /* 预览条 + 模式下拉（同一行） */
    var topRow = document.createElement('div');
    topRow.className = 'cp-top-row';

    var preview = document.createElement('div');
    preview.className = 'cp-preview';
    topRow.appendChild(preview);

    /* 自定义模式下拉（支持玻璃拟态样式） */
    var modeWrapper = document.createElement('div');
    modeWrapper.className = 'cp-mode-wrapper';

    var modeTrigger = document.createElement('div');
    modeTrigger.className = 'cp-mode-trigger';
    modeTrigger.textContent = currentMode;
    modeWrapper.appendChild(modeTrigger);

    var modeDropdown = document.createElement('div');
    modeDropdown.className = 'cp-mode-dropdown';
    Object.keys(CP_MODES).forEach(function(mode) {
      var item = document.createElement('div');
      item.className = 'cp-mode-item' + (mode === currentMode ? ' active' : '');
      item.textContent = mode;
      item.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        currentMode = mode;
        modeTrigger.textContent = mode;
        modeDropdown.querySelectorAll('.cp-mode-item').forEach(function(el) {
          el.classList.toggle('active', el.textContent === mode);
        });
        modeWrapper.classList.remove('open');
        renderChannels();
      });
      modeDropdown.appendChild(item);
    });
    modeWrapper.appendChild(modeDropdown);

    modeTrigger.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      modeWrapper.classList.toggle('open');
    });
    document.addEventListener('mousedown', function closeModeDropdown() {
      modeWrapper.classList.remove('open');
    }, { once: false, capture: false });
    popup.addEventListener('mousedown', function(e) { e.stopPropagation(); });

    topRow.appendChild(modeWrapper);
    popup.appendChild(topRow);

    /* 通道容器 */
    var channelsEl = document.createElement('div');
    channelsEl.className = 'cp-channels';
    popup.appendChild(channelsEl);

    function updatePreview() {
      var css = rgbToCss(rgb[0], rgb[1], rgb[2]);
      preview.style.background = css;
      swatchEl.style.background = css;
      var hsb = rgbToHsb(rgb[0], rgb[1], rgb[2]);
      swatchEl.dataset.h = hsb[0]; swatchEl.dataset.s = hsb[1]; swatchEl.dataset.b = hsb[2];
    }

    function renderChannels() {
      channelsEl.innerHTML = '';
      var def = CP_MODES[currentMode];
      var vals = def.fromRgb(rgb[0], rgb[1], rgb[2]).map(function(v){ return Math.round(v*10)/10; });

      def.channels.forEach(function(ch, idx) {
        var row = document.createElement('div');
        row.className = 'cp-channel-row';

        var lbl = document.createElement('span');
        lbl.className = 'cp-channel-label';
        lbl.textContent = ch.label;
        row.appendChild(lbl);

        var slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'cp-slider';
        slider.min = ch.min; slider.max = ch.max; slider.step = 1;
        slider.value = vals[idx];
        setSliderBg(slider, ch.bg, vals);
        row.appendChild(slider);

        var numInput = document.createElement('input');
        numInput.type = 'number';
        numInput.className = 'cp-num-input';
        numInput.min = ch.min; numInput.max = ch.max;
        numInput.value = Math.round(vals[idx]);
        row.appendChild(numInput);

        function applyChange(newVal) {
          newVal = Math.max(ch.min, Math.min(ch.max, parseFloat(newVal)||0));
          vals[idx] = newVal;
          slider.value = newVal;
          numInput.value = Math.round(newVal);
          var newRgb = def.toRgb(vals);
          rgb = newRgb.map(function(v){ return Math.max(0,Math.min(255,Math.round(v))); });
          updatePreview();
          /* 更新各滑动条渐变背景 */
          var freshVals = def.fromRgb(rgb[0],rgb[1],rgb[2]);
          row.parentNode.querySelectorAll('.cp-slider').forEach(function(s, si) {
            setSliderBg(s, def.channels[si].bg, freshVals);
          });
        }

        slider.addEventListener('input', function(){ applyChange(slider.value); numInput.value = Math.round(slider.value); });
        numInput.addEventListener('change', function(){ applyChange(numInput.value); });
        numInput.addEventListener('keydown', function(e){ if(e.key==='Enter') numInput.blur(); });

        channelsEl.appendChild(row);
      });
    }

    updatePreview();
    renderChannels();

    popup.addEventListener('mousedown', function(e){ e.stopPropagation(); });
    document.body.appendChild(popup);

    var rect = swatchEl.getBoundingClientRect();
    var pw = 260, ph = 260;
    var left = Math.min(rect.left, window.innerWidth - pw - 8);
    var top = rect.bottom + 6;
    if(top + ph > window.innerHeight) top = rect.top - ph - 6;
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
  }

  /* ── 数学运算块 ── */
  var MATH_OPS = [
    { id: 'round', label: '四舍五入' },
    { id: 'abs',   label: '绝对值'   },
    { id: 'floor', label: '向下取整' },
    { id: 'ceil',  label: '向上取整' },
    { id: 'sq',    label: '平方'     },
    { id: 'sqrt',  label: '平方根'   }
  ];

  function computeMath(opId, n) {
    switch (opId) {
      case 'round': return Math.round(n);
      case 'abs':   return Math.abs(n);
      case 'floor': return Math.floor(n);
      case 'ceil':  return Math.ceil(n);
      case 'sq':    return n * n;
      case 'sqrt':
        var r = Math.sqrt(n);
        return isNaN(r) ? 'NaN' : (r % 1 === 0 ? r : parseFloat(r.toFixed(4)));
      default: return n;
    }
  }

  function createMathField(initNum, initOpId) {
    var wrapper = document.createElement('span');
    wrapper.className = 'block-field-math';

    /* 当前运算状态 */
    var currentOp = (initOpId && MATH_OPS.find(function(o){ return o.id === initOpId; })) || MATH_OPS[0];

    /* 数字输入框 */
    var numInp = document.createElement('input');
    numInp.type = 'number';
    numInp.className = 'block-field-number';
    numInp.value = (initNum !== undefined && initNum !== null) ? initNum : '0';
    resizeNumberInput(numInp);
    numInp.addEventListener('mousedown', function(e) { e.stopPropagation(); });
    numInp.addEventListener('click',     function(e) { e.stopPropagation(); });

    /* 分隔符 + 结果展示（先创建，供 updateResult 引用） */
    var sep = document.createElement('span');
    sep.className = 'block-field-math-sep';
    sep.textContent = '=';

    var resultEl = document.createElement('span');
    resultEl.className = 'block-field-math-result';
    resultEl.textContent = '0';

    /* 更新计算结果，并把状态存在 wrapper 上供外部读取 */
    function updateResult() {
      var n = parseFloat(numInp.value);
      if (isNaN(n)) n = 0;
      var result = computeMath(currentOp.id, n);
      resultEl.textContent = result;
      resizeNumberInput(numInp);
      wrapper.dataset.mathNum  = numInp.value;
      wrapper.dataset.mathOpId = currentOp.id;
    }
    numInp.addEventListener('input', updateResult);
    /* 初始化 dataset */
    updateResult();

    /* 运算模式触发按钮 */
    var modeTrigger = document.createElement('span');
    modeTrigger.className = 'block-math-mode-trigger';
    modeTrigger.textContent = currentOp.label;

    /* 下拉列表：挂到 document.body，用 fixed 定位逃离任何 overflow/filter 容器 */
    var modeDropdown = document.createElement('div');
    modeDropdown.className = 'block-math-mode-dropdown';
    modeDropdown.style.position = 'fixed';
    modeDropdown.style.display = 'none';
    document.body.appendChild(modeDropdown);

    MATH_OPS.forEach(function(op, idx) {
      var item = document.createElement('div');
      item.className = 'block-math-mode-item' + (idx === 0 ? ' active' : '');
      item.textContent = op.label;
      item.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        e.preventDefault();
        currentOp = op;
        modeTrigger.textContent = op.label;
        modeDropdown.querySelectorAll('.block-math-mode-item').forEach(function(el) {
          el.classList.toggle('active', el === item);
        });
        closeDropdown();
        updateResult();
        wrapper.dataset.mathOpId = op.id;
      });
      modeDropdown.appendChild(item);
    });

    var dropdownOpen = false;

    function openDropdown() {
      var rect = modeTrigger.getBoundingClientRect();
      modeDropdown.style.top  = (rect.bottom + 4) + 'px';
      modeDropdown.style.left = rect.left + 'px';
      modeDropdown.style.display = 'block';
      dropdownOpen = true;
    }
    function closeDropdown() {
      modeDropdown.style.display = 'none';
      dropdownOpen = false;
    }

    modeTrigger.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      e.preventDefault();
      if (dropdownOpen) closeDropdown(); else openDropdown();
    });

    /* 点击其他地方关闭 */
    document.addEventListener('mousedown', function(e) {
      if (dropdownOpen && !modeDropdown.contains(e.target) && e.target !== modeTrigger) {
        closeDropdown();
      }
    });

    /* 块被移除时清理 DOM 中的下拉层 */
    wrapper.addEventListener('remove-math-dropdown', function() {
      modeDropdown.remove();
    });

    wrapper.appendChild(numInp);
    wrapper.appendChild(modeTrigger);
    wrapper.appendChild(sep);
    wrapper.appendChild(resultEl);
    return wrapper;
  }

  /* 根据输入值长度自动调整跑道圆宽度
     - 最小 52px（高度≈26px，直径×2），确保跑道形状
     - 超过默认显示范围时按字符宽度扩展 */
  function resizeNumberInput(inp) {
    var val = String(inp.value !== '' ? inp.value : '0');
    var len = val.length;
    /* 11px font-size，每字符约 7px；两端 padding 各 10px = 20px；最小 52px */
    var computed = len * 7 + 20;
    inp.style.width = Math.max(35, computed) + 'px';
  }

  function createColourField(h, s, b) {
    if(h===undefined) h=0; if(s===undefined) s=0; if(b===undefined) b=100;
    var swatch = document.createElement('span');
    swatch.className = 'block-field-colour';
    swatch.dataset.h = h; swatch.dataset.s = s; swatch.dataset.b = b;
    swatch.style.background = hsbToCss(h, s, b);
    swatch.title = '点击设置颜色';
    swatch.addEventListener('mousedown', function(e){ e.stopPropagation(); });
    swatch.addEventListener('click', function(e){ e.stopPropagation(); openColourPicker(swatch); });
    return swatch;
  }
  /* ===== END 颜色字段 ===== */
  // 编程区 Tab 切换
  document.querySelectorAll('.programming-tabs .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabId = this.getAttribute('data-tab');
      document.querySelectorAll('.programming-tabs .tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.programming-content .tab-pane').forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');
      var pane = document.getElementById('pane-' + tabId);
      if (pane) pane.classList.add('active');
    });
  });

  // 控制台 Tab 切换
  var consoleTabs = document.querySelectorAll('.console-tabs .console-tab');
  var consolePanes = document.querySelectorAll('.console-body .console-pane');
  consoleTabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      consoleTabs.forEach(function (t) { t.classList.remove('active'); });
      consolePanes.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      if (consolePanes[i]) consolePanes[i].classList.add('active');
    });
  });
  var btnClearOutput = document.querySelector('.console-actions button[type="button"]');
  if (btnClearOutput && btnClearOutput.textContent.indexOf('清空') !== -1) {
    btnClearOutput.addEventListener('click', function () {
      var pre = document.querySelector('.console-body .console-pane pre');
      if (pre) {
        pre.textContent = '# Python print() 输出将显示在这里';
      }
    });
  }

  // 连接按钮：切换状态与写入设备可用；同步 body.device-connected 供画布 LED 灯亮/灭
  var btnConnect = document.querySelector('.btn-connect');
  var statusEl = document.querySelector('.connection-status');
  var btnBurn = document.querySelector('.btn-burn');
  function syncDeviceConnectedClass() {
    var connected = statusEl && statusEl.getAttribute('data-status') === 'connected';
    document.body.classList.toggle('device-connected', !!connected);
  }
  if (btnConnect && statusEl && btnBurn) {
    syncDeviceConnectedClass();
    btnConnect.addEventListener('click', function () {
      var isConnected = statusEl.getAttribute('data-status') === 'connected';
      statusEl.setAttribute('data-status', isConnected ? 'disconnected' : 'connected');
      statusEl.querySelector('.connection-status-text').textContent = isConnected ? '未连接' : '已连接';
      btnConnect.textContent = isConnected ? '连接设备' : '断开';
      btnBurn.disabled = isConnected;
      syncDeviceConnectedClass();
    });
  }

  // 画布与资源库高度调节：拖拽时直接按资源库高度变化，比例更好调
  var resizer = document.getElementById('resizer');
  var twinWrap = document.querySelector('.twin-canvas-wrap');
  var library = document.querySelector('.resource-library');
  var leftPanel = document.querySelector('.left-panel');
  if (resizer && twinWrap && library && leftPanel) {
    var startY, startLibraryH;
    resizer.addEventListener('mousedown', function (e) {
      e.preventDefault();
      startY = e.clientY;
      startLibraryH = library.getBoundingClientRect().height;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
      document.addEventListener('mousemove', onResizeRow);
      document.addEventListener('mouseup', stopResizeRow);
    });
    function onResizeRow(e) {
      var dy = e.clientY - startY;
      var panelH = leftPanel.getBoundingClientRect().height;
      var resizerH = 6; /* 与 .resizer 的 height 一致 */
      var minCanvas = 180;
      var minLib = 120;
      var newLibH = startLibraryH - dy; /* 向下拖：资源库变小、画布变大；向上拖：资源库变大、画布变小 */
      newLibH = Math.max(minLib, Math.min(panelH - resizerH - minCanvas, newLibH));
      library.style.flex = '0 0 ' + newLibH + 'px';
    }
    function stopResizeRow() {
      document.removeEventListener('mousemove', onResizeRow);
      document.removeEventListener('mouseup', stopResizeRow);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  }

  // 仿真画布与编程区宽度调节：左右拖动竖向分隔条可缩放工作区比例
  var resizerVertical = document.getElementById('resizerVertical');
  var mainArea = document.querySelector('.main-area');
  if (resizerVertical && leftPanel && mainArea) {
    var startX, startLeftW;
    resizerVertical.addEventListener('mousedown', function (e) {
      e.preventDefault();
      startX = e.clientX;
      startLeftW = leftPanel.getBoundingClientRect().width;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', onResizeCol);
      document.addEventListener('mouseup', stopResizeCol);
    });
    function onResizeCol(e) {
      var dx = e.clientX - startX;
      var mainW = mainArea.getBoundingClientRect().width;
      var minLeft = 280;
      var minRight = 320;
      var newLeftW = startLeftW + dx;
      newLeftW = Math.max(minLeft, Math.min(mainW - minRight - 14, newLeftW));
      leftPanel.style.width = newLeftW + 'px';
    }
    function stopResizeCol() {
      document.removeEventListener('mousemove', onResizeCol);
      document.removeEventListener('mouseup', stopResizeCol);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  }

  // 编程区与控制台高度调节：上下拖动横向分隔条可调节比例，形式与画布/编程区竖向分隔条一致
  var resizerConsole = document.getElementById('resizerConsole');
  var consoleE = document.getElementById('consoleE');
  if (resizerConsole && consoleE) {
    var startY, startConsoleH;
    resizerConsole.addEventListener('mousedown', function (e) {
      e.preventDefault();
      startY = e.clientY;
      startConsoleH = consoleE.getBoundingClientRect().height;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
      document.addEventListener('mousemove', onResizeConsole);
      document.addEventListener('mouseup', stopResizeConsole);
    });
    function onResizeConsole(e) {
      var dy = e.clientY - startY;
      var minH = 80;
      var maxH = Math.min(400, window.innerHeight * 0.5);
      var newH = startConsoleH - dy;
      newH = Math.max(minH, Math.min(maxH, newH));
      consoleE.style.height = newH + 'px';
    }
    function stopResizeConsole() {
      document.removeEventListener('mousemove', onResizeConsole);
      document.removeEventListener('mouseup', stopResizeConsole);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  }

  // 模块库自定义滚动条：无三角、拖动时拇指不消失
  var libraryContent = document.querySelector('.library-content');
  var libraryScrollbar = document.querySelector('.library-scrollbar');
  var libraryThumb = document.querySelector('.library-scrollbar-thumb');
  if (libraryContent && libraryScrollbar && libraryThumb) {
    var scrollbarDragging = false;
    function updateLibraryScrollbar() {
      if (scrollbarDragging) return;
      var sh = libraryContent.scrollHeight;
      var ch = libraryContent.clientHeight;
      if (sh <= ch) {
        libraryScrollbar.style.display = 'none';
        return;
      }
      libraryScrollbar.style.display = 'block';
      var trackH = libraryScrollbar.getBoundingClientRect().height;
      var thumbH = Math.max(24, (ch / sh) * trackH);
      var maxTop = trackH - thumbH;
      var scrollTop = libraryContent.scrollTop;
      var top = (scrollTop / (sh - ch)) * maxTop;
      libraryThumb.style.height = thumbH + 'px';
      libraryThumb.style.top = top + 'px';
    }
    libraryContent.addEventListener('scroll', updateLibraryScrollbar);
    var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateLibraryScrollbar) : null;
    if (ro) ro.observe(libraryContent);
    window.addEventListener('resize', updateLibraryScrollbar);
    updateLibraryScrollbar();

    (function () {
      var dragStartOffsetY;
      libraryThumb.addEventListener('mousedown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var thumbRect = libraryThumb.getBoundingClientRect();
        dragStartOffsetY = e.clientY - thumbRect.top;
        scrollbarDragging = true;
        libraryThumb.classList.add('dragging');
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
        document.addEventListener('mousemove', onThumbMove, true);
        document.addEventListener('mouseup', onThumbUp, true);
      });
      function onThumbMove(e) {
        e.preventDefault();
        e.stopPropagation();
        var trackRect = libraryScrollbar.getBoundingClientRect();
        var mouseYInTrack = e.clientY - trackRect.top;
        var thumbTop = mouseYInTrack - dragStartOffsetY;
        var trackH = trackRect.height;
        var thumbH = libraryThumb.getBoundingClientRect().height;
        var maxTop = Math.max(0, trackH - thumbH);
        thumbTop = Math.max(0, Math.min(maxTop, thumbTop));
        libraryThumb.style.top = thumbTop + 'px';
        var sh = libraryContent.scrollHeight;
        var ch = libraryContent.clientHeight;
        var maxScroll = Math.max(0, sh - ch);
        if (maxTop > 0) {
          libraryContent.scrollTop = (thumbTop / maxTop) * maxScroll;
        }
      }
      function onThumbUp() {
        scrollbarDragging = false;
        libraryThumb.classList.remove('dragging');
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', onThumbMove, true);
        document.removeEventListener('mouseup', onThumbUp, true);
        updateLibraryScrollbar();
      }
    })();

    libraryScrollbar.addEventListener('click', function (e) {
      if (e.target === libraryThumb) return;
      var rect = libraryScrollbar.getBoundingClientRect();
      var y = e.clientY - rect.top;
      var trackH = rect.height;
      var thumbH = libraryThumb.getBoundingClientRect().height;
      var maxTop = trackH - thumbH;
      if (maxTop <= 0) return;
      var sh = libraryContent.scrollHeight;
      var ch = libraryContent.clientHeight;
      var ratio = (sh - ch) / maxTop;
      var top = Math.max(0, Math.min(maxTop, y - thumbH / 2));
      libraryContent.scrollTop = top * ratio;
    });
  }

  // ---------- 仿真画布：缩放、自定义滚动条（与模块库一致）、模块节点、编程区联动 ----------
  var canvas = document.getElementById('twinCanvas');
  var canvasScrollContent = document.getElementById('canvasScrollContent');
  var canvasZoomContainer = document.getElementById('canvasZoomContainer');
  var canvasZoomWrap = document.getElementById('canvasZoomWrap');
  var canvasScrollbarV = document.getElementById('canvasScrollbarV');
  var canvasThumbV = document.getElementById('canvasThumbV');
  var canvasScrollbarH = document.getElementById('canvasScrollbarH');
  var canvasThumbH = document.getElementById('canvasThumbH');
  if (!canvas || !canvasScrollContent || !canvasZoomContainer || !canvasZoomWrap) return;

  // 画布逻辑尺寸（用于计算缩放后滚动区域）：以可滚动视口为准
  var canvasLogicalW = 800;
  var canvasLogicalH = 600;
  function measureCanvas() {
    var w = canvasScrollContent.clientWidth;
    var h = canvasScrollContent.clientHeight;
    if (w > 0 && h > 0) {
      canvasLogicalW = w;
      canvasLogicalH = h;
      applyZoom();
    }
    updateCanvasScrollbars();
  }
  function applyZoom() {
    canvasZoomContainer.style.width = (canvasLogicalW * canvasZoom) + 'px';
    canvasZoomContainer.style.height = (canvasLogicalH * canvasZoom) + 'px';
    canvasZoomWrap.style.width = canvasLogicalW + 'px';
    canvasZoomWrap.style.height = canvasLogicalH + 'px';
    canvasZoomWrap.style.transform = 'scale(' + canvasZoom + ')';
  }
  var canvasZoom = 1;
  function setCanvasZoom(z) {
    canvasZoom = Math.max(0.5, Math.min(2, z));
    applyZoom();
    var valueEl = document.getElementById('canvasZoomValue');
    if (valueEl) valueEl.textContent = Math.round(canvasZoom * 100) + '%';
    updateCanvasScrollbars();
  }
  measureCanvas();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(measureCanvas).observe(canvasScrollContent);
    new ResizeObserver(measureCanvas).observe(canvas);
  }
  window.addEventListener('resize', measureCanvas);
  requestAnimationFrame(function () { measureCanvas(); });
  setTimeout(measureCanvas, 100);
  var zoomOutBtn = document.getElementById('canvasZoomOut');
  var zoomInBtn = document.getElementById('canvasZoomIn');
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', function () { setCanvasZoom(canvasZoom - 0.25); });
  if (zoomInBtn) zoomInBtn.addEventListener('click', function () { setCanvasZoom(canvasZoom + 0.25); });
  canvasScrollContent.addEventListener('wheel', function (e) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setCanvasZoom(canvasZoom + (e.deltaY > 0 ? -0.15 : 0.15));
  }, { passive: false });

  // 自定义滚动条（与模块库一致：无三角、按下时拇指不消失）
  var canvasScrollVDragging = false;
  var canvasScrollHDragging = false;
  function updateCanvasScrollbars() {
    if (canvasScrollVDragging || canvasScrollHDragging) return;
    var sw = canvasScrollContent.scrollWidth;
    var sh = canvasScrollContent.scrollHeight;
    var cw = canvasScrollContent.clientWidth;
    var ch = canvasScrollContent.clientHeight;
    canvas.classList.toggle('no-overflow-x', sw <= cw);
    canvas.classList.toggle('no-overflow-y', sh <= ch);
    if (canvasScrollbarV && canvasThumbV) {
      canvasScrollbarV.style.display = 'block';
      var trackH = canvasScrollbarV.getBoundingClientRect().height;
      var thumbH = sh > ch ? Math.max(24, (ch / sh) * trackH) : trackH;
      var maxTop = Math.max(0, trackH - thumbH);
      var scrollTop = canvasScrollContent.scrollTop;
      var maxScrollV = Math.max(0, sh - ch);
      canvasThumbV.style.height = thumbH + 'px';
      canvasThumbV.style.top = (maxScrollV > 0 && maxTop > 0 ? (scrollTop / maxScrollV) * maxTop : 0) + 'px';
    }
    if (canvasScrollbarH && canvasThumbH) {
      canvasScrollbarH.style.display = 'block';
      var trackW = canvasScrollbarH.getBoundingClientRect().width;
      var thumbW = sw > cw ? Math.max(24, (cw / sw) * trackW) : trackW;
      var maxLeft = Math.max(0, trackW - thumbW);
      var scrollLeft = canvasScrollContent.scrollLeft;
      var maxScrollH = Math.max(0, sw - cw);
      canvasThumbH.style.width = thumbW + 'px';
      canvasThumbH.style.left = (maxScrollH > 0 && maxLeft > 0 ? (scrollLeft / maxScrollH) * maxLeft : 0) + 'px';
    }
  }
  canvasScrollContent.addEventListener('scroll', updateCanvasScrollbars);
  window.addEventListener('resize', updateCanvasScrollbars);

  if (canvasThumbV) {
    var dragStartOffsetY;
    canvasThumbV.addEventListener('mousedown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var tr = canvasThumbV.getBoundingClientRect();
      dragStartOffsetY = e.clientY - tr.top;
      canvasScrollVDragging = true;
      canvasThumbV.classList.add('dragging');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      document.addEventListener('mousemove', onCanvasThumbVMove, true);
      document.addEventListener('mouseup', onCanvasThumbVUp, true);
    });
    function onCanvasThumbVMove(e) {
      e.preventDefault();
      var trackRect = canvasScrollbarV.getBoundingClientRect();
      var mouseY = e.clientY - trackRect.top;
      var thumbTop = mouseY - dragStartOffsetY;
      var trackH = trackRect.height;
      var thumbH = canvasThumbV.getBoundingClientRect().height;
      var maxTop = Math.max(0, trackH - thumbH);
      thumbTop = Math.max(0, Math.min(maxTop, thumbTop));
      canvasThumbV.style.top = thumbTop + 'px';
      var sh = canvasScrollContent.scrollHeight;
      var ch = canvasScrollContent.clientHeight;
      var maxScroll = Math.max(0, sh - ch);
      if (maxTop > 0) canvasScrollContent.scrollTop = (thumbTop / maxTop) * maxScroll;
    }
    function onCanvasThumbVUp() {
      canvasScrollVDragging = false;
      canvasThumbV.classList.remove('dragging');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onCanvasThumbVMove, true);
      document.removeEventListener('mouseup', onCanvasThumbVUp, true);
      updateCanvasScrollbars();
    }
  }
  if (canvasScrollbarV && canvasThumbV) {
    canvasScrollbarV.addEventListener('click', function (e) {
      if (e.target === canvasThumbV) return;
      var rect = canvasScrollbarV.getBoundingClientRect();
      var y = e.clientY - rect.top;
      var trackH = rect.height;
      var thumbH = canvasThumbV.getBoundingClientRect().height;
      var maxTop = trackH - thumbH;
      if (maxTop <= 0) return;
      var sh = canvasScrollContent.scrollHeight;
      var ch = canvasScrollContent.clientHeight;
      var top = Math.max(0, Math.min(maxTop, y - thumbH / 2));
      canvasScrollContent.scrollTop = (top / maxTop) * Math.max(0, sh - ch);
    });
  }

  if (canvasThumbH) {
    var dragStartOffsetX;
    canvasThumbH.addEventListener('mousedown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var tr = canvasThumbH.getBoundingClientRect();
      dragStartOffsetX = e.clientX - tr.left;
      canvasScrollHDragging = true;
      canvasThumbH.classList.add('dragging');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      document.addEventListener('mousemove', onCanvasThumbHMove, true);
      document.addEventListener('mouseup', onCanvasThumbHUp, true);
    });
    function onCanvasThumbHMove(e) {
      e.preventDefault();
      var trackRect = canvasScrollbarH.getBoundingClientRect();
      var mouseX = e.clientX - trackRect.left;
      var thumbLeft = mouseX - dragStartOffsetX;
      var trackW = trackRect.width;
      var thumbW = canvasThumbH.getBoundingClientRect().width;
      var maxLeft = Math.max(0, trackW - thumbW);
      thumbLeft = Math.max(0, Math.min(maxLeft, thumbLeft));
      canvasThumbH.style.left = thumbLeft + 'px';
      var sw = canvasScrollContent.scrollWidth;
      var cw = canvasScrollContent.clientWidth;
      var maxScroll = Math.max(0, sw - cw);
      if (maxLeft > 0) canvasScrollContent.scrollLeft = (thumbLeft / maxLeft) * maxScroll;
    }
    function onCanvasThumbHUp() {
      canvasScrollHDragging = false;
      canvasThumbH.classList.remove('dragging');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onCanvasThumbHMove, true);
      document.removeEventListener('mouseup', onCanvasThumbHUp, true);
      updateCanvasScrollbars();
    }
  }
  if (canvasScrollbarH && canvasThumbH) {
    canvasScrollbarH.addEventListener('click', function (e) {
      if (e.target === canvasThumbH) return;
      var rect = canvasScrollbarH.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var trackW = rect.width;
      var thumbW = canvasThumbH.getBoundingClientRect().width;
      var maxLeft = trackW - thumbW;
      if (maxLeft <= 0) return;
      var sw = canvasScrollContent.scrollWidth;
      var cw = canvasScrollContent.clientWidth;
      var left = Math.max(0, Math.min(maxLeft, x - thumbW / 2));
      canvasScrollContent.scrollLeft = (left / maxLeft) * Math.max(0, sw - cw);
    });
  }

  // 鼠标中键拖动画布（平移）
  var panning = false;
  var panStartX, panStartY, panStartScrollLeft, panStartScrollTop;
  canvasScrollContent.addEventListener('mousedown', function (e) {
    if (e.button !== 1) return;
    e.preventDefault();
    panning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    panStartScrollLeft = canvasScrollContent.scrollLeft;
    panStartScrollTop = canvasScrollContent.scrollTop;
    canvasScrollContent.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onCanvasPan);
    document.addEventListener('mouseup', stopCanvasPan);
  });
  function onCanvasPan(e) {
    if (!panning) return;
    e.preventDefault();
    var dx = e.clientX - panStartX;
    var dy = e.clientY - panStartY;
    canvasScrollContent.scrollLeft = panStartScrollLeft - dx;
    canvasScrollContent.scrollTop = panStartScrollTop - dy;
  }
  function stopCanvasPan() {
    panning = false;
    canvasScrollContent.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onCanvasPan);
    document.removeEventListener('mouseup', stopCanvasPan);
  }

  // 模块图标 SVG（与模块库一致，简化版）
  var moduleIcons = {
    power: '<svg viewBox="0 0 24 24" fill="currentColor"><g transform="translate(12,12) scale(1.15) translate(-12,-12)"><rect x="9" y="4" width="6" height="2.5" rx="0.6"/><rect x="7" y="6.5" width="10" height="12" rx="1.2"/></g></svg>',
    mainctl: '<svg viewBox="0 0 24 24" fill="currentColor"><g transform="translate(12,12) scale(1.1) translate(-12,-12)"><rect x="6" y="5" width="12" height="14" rx="1.2"/><rect x="4" y="7" width="1.5" height="2" rx="0.3"/><rect x="18.5" y="7" width="1.5" height="2" rx="0.3"/><rect x="9" y="8.5" width="6" height="7" rx="0.5"/></g></svg>',
    input: '<svg viewBox="0 0 24 24" fill="currentColor"><g transform="translate(12,12) scale(1.1) translate(-12,-12)"><circle cx="12" cy="9" r="5"/><rect x="8" y="15" width="8" height="3.5" rx="1"/></g></svg>',
    output: '<svg viewBox="0 0 24 24" fill="currentColor"><g transform="translate(12,12) scale(1.22) translate(-12,-12)"><path d="M12 5c-2.8 0-5 2.2-5 5 0 1.6.8 3 2 3.9L8.2 18h7.6L15 13.9c1.2-.9 2-2.3 2-3.9 0-2.8-2.2-5-5-5zm0 2c1.7 0 3 1.3 3 3 0 .9-.5 1.7-1.2 2.2l-.5 3.1h-2.6l-.5-3.1c-.7-.5-1.2-1.3-1.2-2.2 0-1.7 1.3-3 3-3z"/><rect x="10.5" y="18" width="3" height="2" rx="0.5"/></g></svg>'
  };
  // 画布 LED 专用：与模块库一致的 LED 标识 SVG（右下角小图标用）
  var ledIconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><g transform="translate(12,12) scale(1.22) translate(-12,-12)"><path d="M12 5c-2.8 0-5 2.2-5 5 0 1.6.8 3 2 3.9L8.2 18h7.6L15 13.9c1.2-.9 2-2.3 2-3.9 0-2.8-2.2-5-5-5zm0 2c1.7 0 3 1.3 3 3 0 .9-.5 1.7-1.2 2.2l-.5 3.1h-2.6l-.5-3.1c-.7-.5-1.2-1.3-1.2-2.2 0-1.7 1.3-3 3-3z"/><rect x="10.5" y="18" width="3" height="2" rx="0.5"/><path d="M10 10.2L11.4 12l3.8-4.2 1 .9-4.8 5.2L9 11.4z"/></g></svg>';

  var nodeLabels = {
    'power:battery-21700': '单节电池盒 21700',
    'mainctl:mainctl-esp32': 'ESP32',
    'input:input-button': '按键',
    'output:output-led': 'LED 灯'
  };
  var instanceLetters = 'ABCDEFGH';

  function getNodeBadgeText(node) {
    var custom = node.getAttribute('data-custom-name');
    if (custom && custom.trim()) return custom.trim();
    var key = node.getAttribute('data-type') + ':' + node.getAttribute('data-id');
    var base = nodeLabels[key] || node.getAttribute('data-id') || '';
    var idx = parseInt(node.getAttribute('data-module-index'), 10);
    if (isNaN(idx) || idx < 0) return base;
    return base + instanceLetters[idx];
  }
  function updateNodeBadge(node) {
    var badge = node.querySelector('.node-name-badge');
    if (badge) badge.textContent = getNodeBadgeText(node);
  }
  function assignModuleIndices() {
    if (!canvasZoomWrap) return;
    var key = function (n) { return n.getAttribute('data-type') + ':' + n.getAttribute('data-id'); };
    var byKey = {};
    canvasZoomWrap.querySelectorAll('.canvas-node').forEach(function (n) {
      var k = key(n);
      if (!byKey[k]) byKey[k] = [];
      byKey[k].push(n);
    });
    Object.keys(byKey).forEach(function (k) {
      byKey[k].forEach(function (n, i) {
        n.setAttribute('data-module-index', String(i));
        updateNodeBadge(n);
      });
    });
  }

  /* ── 磁铁吸附音效（Web Audio API 合成，无需外部文件） ── */
  var _audioCtx = null;
  function getAudioCtx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
  }

  /* 预取 Apple 原版键盘点击音效的原始字节（Base64内嵌，兼容file://协议） */
  var _snapRawAB  = null;  // 原始 ArrayBuffer
  var _snapBuffer = null;  // 解码后的 AudioBuffer（首次播放后缓存）
  (function() {
    var b64 = 'UklGRq4BAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYoBAAAAAAAAAAAAAAAAAAAAAAAAAAD//AAI//EANf5u9p3sDd8v0YbP5dR22injJu0c+GgDpQ5lF9sfdyTTJ5onvCVAIHcZvBGOCIn/SPZs7oHoC+Nf4L7gQuHY5U/qYfCf95X+xAWvC+oRDhTRFwgXoxaqFEIQ2QytB7YCUvzb97PzJu+B7P7rvuvZ7UXv3/N499X8pwGaBmAKow4lEKgSDhI+ET8PJQwbCFQEFf+m+1T3ZPQT8Z/wI++28FfyAPSH97/7a/9PAywGvgnMDCYNpQ49DeUMpgqbB+8EygFt/hD62/gk9fj0gPPT8/H02vZ0+KD7Ov4MAO0DqAYNCAEJXwoQChsJfQhFBo0EdwIt/8/9jPuF+eD4rPf/9934Pvko+nP8Cf3X/60BdAMSBGQFYAXzBhwF4AVCBFUDLAHhAI//RP4X/SP8bvwF++P8Cfxy/Qz9zP6f/3EAPADxAXwB3gISAhoB+AG4AWEBAACeAET//P/I/6r/pv+5/9oAAAAAAAAAAAAAAAAAAAAA';
    var bin = atob(b64);
    var ab = new ArrayBuffer(bin.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
    _snapRawAB = ab;
  })();

  function playSnapSound() {
    if (!window.__snapSoundEnabled) return;
    try {
      var ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      function _play(buf) {
        var src  = ctx.createBufferSource();
        var gain = ctx.createGain();
        src.buffer = buf;
        src.connect(gain); gain.connect(ctx.destination);
        gain.gain.value = 1.3;
        src.start();
      }

      if (_snapBuffer) {
        _play(_snapBuffer);
      } else if (_snapRawAB) {
        /* 首次播放时解码并缓存 */
        ctx.decodeAudioData(_snapRawAB.slice(0), function(buf) {
          _snapBuffer = buf;
          _play(buf);
        }, function() {
          _snapRawAB = null; /* 解码失败，禁用文件音效 */
        });
      } else {
        /* 降级：合成近似音效 */
        var t    = ctx.currentTime;
        var comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -6; comp.knee.value = 2;
        comp.ratio.value = 4; comp.attack.value = 0.001; comp.release.value = 0.05;
        comp.connect(ctx.destination);
        var osc = ctx.createOscillator();
        var g   = ctx.createGain();
        osc.connect(g); g.connect(comp);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1080, t);
        osc.frequency.exponentialRampToValueAtTime(920, t + 0.02);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.5, t + 0.003);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
        osc.start(t); osc.stop(t + 0.06);
      }
    } catch (err) { /* 静默忽略音频不可用的情况 */ }
  }

  // 向控制台「输出」追加一行
  function appendConsoleLine(text) {
    var pane = document.querySelector('.console-body .console-pane.active pre');
    if (pane) {
      var line = document.createTextNode('\n' + text);
      pane.appendChild(line);
    }
  }

  // 在画布上创建模块节点
  function createCanvasNode(type, id, label, x, y) {
    var key = type + ':' + id;
    var name = nodeLabels[key] || label || id;
    var node = document.createElement('div');
    node.className = 'canvas-node draggable';
    node.setAttribute('data-type', type);
    node.setAttribute('data-id', id || type);
    node.style.left = (x || 20) + 'px';
    node.style.top = (y || 20) + 'px';

    // LED 灯：圆角方 + 中间白色圆形灯罩 + 右下角小图标，整体风格与模块库一致
    if (type === 'output' && id === 'output-led') {
      node.classList.add('output-led');
      node.innerHTML =
        '<span class="node-name-badge" aria-hidden="true"></span>' +
        '<span class="node-led-recess" aria-hidden="true"></span>' +
        '<span class="node-led-icon" aria-hidden="true">' + ledIconSvg + '</span>' +
        '<div class="node-actions">' +
        '<button type="button" class="node-copy" aria-label="复制">⎘</button>' +
        '<button type="button" class="node-remove" aria-label="删除">×</button>' +
        '</div>';
    } else if (type === 'input' && id === 'input-button') {
      node.classList.add('input-button');
      node.innerHTML =
        '<span class="node-name-badge" aria-hidden="true"></span>' +
        '<span class="node-button-cap" aria-hidden="true"></span>' +
        '<span class="node-corner-icon" aria-hidden="true">' + moduleIcons.input + '</span>' +
        '<div class="node-actions">' +
        '<button type="button" class="node-copy" aria-label="复制">⎘</button>' +
        '<button type="button" class="node-remove" aria-label="删除">×</button>' +
        '</div>';
    } else if (type === 'mainctl' && id === 'mainctl-esp32') {
      node.classList.add('mainctl-esp32');
      node.innerHTML =
        '<span class="node-name-badge" aria-hidden="true"></span>' +
        '<span class="node-corner-icon" aria-hidden="true">' + moduleIcons.mainctl + '</span>' +
        '<div class="node-actions">' +
        '<button type="button" class="node-copy" aria-label="复制">⎘</button>' +
        '<button type="button" class="node-remove" aria-label="删除">×</button>' +
        '</div>';
    } else {
      var iconSvg = moduleIcons[type] || moduleIcons.output;
      node.innerHTML =
        '<span class="node-name-badge" aria-hidden="true"></span>' +
        '<span class="node-icon">' + iconSvg + '</span>' +
        '<span class="node-label">' + (name || type) + '</span>' +
        '<div class="node-actions">' +
        '<button type="button" class="node-copy" aria-label="复制">⎘</button>' +
        '<button type="button" class="node-remove" aria-label="删除">×</button>' +
        '</div>';
    }

    // 删除按钮
    node.querySelector('.node-remove').addEventListener('click', function (e) {
      e.stopPropagation();
      removeNode(node, name);
    });
    // 复制按钮
    node.querySelector('.node-copy').addEventListener('click', function (e) {
      e.stopPropagation();
      duplicateNode(node);
    });

    // 可拖动
    (function setupDrag() {
      var startX, startY, startLeft, startTop;
      node.addEventListener('mousedown', function (e) {
        if (e.target.closest('.node-remove')) return;
        // 按键模块：仅当点选白色圆时不拖动（用于按键）；点选红色外壳时可拖动
        if (node.getAttribute('data-id') === 'input-button' && node.getAttribute('data-type') === 'input' && e.target.closest('.node-button-cap')) {
          return;
        }
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseFloat(node.style.left) || 0;
        startTop = parseFloat(node.style.top) || 0;
        node.classList.add('dragging');
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
      function onMove(e) {
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        node.style.left = Math.max(0, startLeft + dx) + 'px';
        node.style.top = Math.max(0, startTop + dy) + 'px';
      }
      function onUp() {
        node.classList.remove('dragging');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
    })();

    return node;
  }

  // 按键模块：仅点选中间白色圆时按下/松开，模拟真实操作；松开时（圆形上或圆形外）都复原
  function setupButtonNode(node) {
    var cap = node.querySelector('.node-button-cap');
    var hitTarget = cap || node;
    hitTarget.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || e.target.closest('.node-remove')) return;
      e.preventDefault();
      e.stopPropagation();
      node.classList.add('pressed');
      appendConsoleLine('[仿真] 按键按下');
      updateLedFromButtons();
      function onBtnUp(e) {
        if (e.button !== 0) return;
        if (node.classList.contains('pressed')) {
          node.classList.remove('pressed');
          appendConsoleLine('[仿真] 按键松开');
          updateLedFromButtons();
        }
        document.removeEventListener('mouseup', onBtnUp);
        hitTarget.removeEventListener('mouseup', onBtnUp);
      }
      document.addEventListener('mouseup', onBtnUp);
      hitTarget.addEventListener('mouseup', onBtnUp);
    });
    hitTarget.addEventListener('mouseleave', function () {
      if (node.classList.contains('pressed')) {
        node.classList.remove('pressed');
        updateLedFromButtons();
      }
    });
  }

  // 将 rgb(...) / hsl(...) 颜色字符串解析为 rgba 带透明度版本
  function colorWithAlpha(css, alpha) {
    // 先将背景色绘制到 canvas 取到 rgb 值
    var tmp = document.createElement('canvas');
    tmp.width = tmp.height = 1;
    var ctx = tmp.getContext('2d');
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    var d = ctx.getImageData(0, 0, 1, 1).data;
    return 'rgba(' + d[0] + ',' + d[1] + ',' + d[2] + ',' + alpha + ')';
  }

  /* ── LED 辅助函数：中心实心灯光色 + 周围光晕 ── */
  function applyLedColor(led, color) {
    var c9 = colorWithAlpha(color, 0.9);
    var c6 = colorWithAlpha(color, 0.6);
    var c4 = colorWithAlpha(color, 0.4);
    var c25 = colorWithAlpha(color, 0.25);
    led.style.setProperty('--led-bg', color);
    led.style.setProperty('--led-shadow',
      '0 0 16px ' + c9 + ', 0 0 36px ' + c6 + ', 0 0 56px ' + c4 + ', 0 0 80px ' + c25 + ', inset 0 0 20px rgba(255,255,255,0.35), 0 1px 2px rgba(0,0,0,0.06)');
    led.classList.add('on');
  }
  function turnOffLed(led) {
    led.classList.remove('on');
    led.style.removeProperty('--led-bg');
    led.style.removeProperty('--led-shadow');
  }
  function getBlockNumber(block) {
    /* 优先读取嵌套运算块的实时结果 */
    var resultEl = block.querySelector('.block-field-nested .block-field-math-result');
    if (resultEl) {
      var nv = parseFloat(resultEl.textContent);
      return isNaN(nv) ? 0 : nv;
    }
    var inp = block.querySelector('.block-field-number');
    var v = inp ? parseFloat(inp.value) : 0;
    return (isNaN(v) || v < 0) ? 0 : v;
  }

  /* ── 异步顺序执行序列 ──
     每次按键按下启动一个新序列（seqId 递增），旧序列自动取消 */
  var _seqId = 0;
  function cancelSequence() { _seqId++; }

  function runBlockSequence(blocks) {
    var allLeds = Array.from(canvasZoomWrap.querySelectorAll('.canvas-node.output-led'));
    var seqId = ++_seqId;

    function cancelled() { return _seqId !== seqId; }

    /* 通用块序列执行器：blockList 可以是栈中的块或嘴部内的块
       startIdx：从哪个索引开始（外层调用传 1 跳过事件块，内层递归传 0）
       done：序列完成后的回调（可为 null） */
    function runBlocks(blockList, startIdx, done) {
      function step(i) {
        if (cancelled()) return;
        if (i >= blockList.length) { if (done) done(); return; }

        var block = blockList[i];
        var blockId = block.getAttribute('data-block-id');
        var moduleSpan = block.querySelector('.block-module-name');
        var instance = moduleSpan ? parseInt(moduleSpan.getAttribute('data-block-instance'), 10) : parseInt(block.getAttribute('data-block-instance') || '0', 10);
        if (isNaN(instance)) instance = 0;
        var targetLed = allLeds[instance] || allLeds[0];

        /* ── 执行块 ── */
        if (blockId === 'execute_led_show') {
          var swatch = block.querySelector('.block-field-colour');
          var color = (swatch && swatch.style.background) ? swatch.style.background : 'rgb(255,255,255)';
          if (targetLed) applyLedColor(targetLed, color);
          step(i + 1);

        } else if (blockId === 'execute_led_show_duration') {
          var swatch2 = block.querySelector('.block-field-colour');
          var color2 = (swatch2 && swatch2.style.background) ? swatch2.style.background : 'rgb(255,255,255)';
          var secs = getBlockNumber(block);
          if (targetLed) applyLedColor(targetLed, color2);
          appendConsoleLine('[仿真] LED 亮起，持续 ' + secs + ' 秒');
          setTimeout(function() {
            if (cancelled()) return;
            if (targetLed) turnOffLed(targetLed);
            appendConsoleLine('[仿真] LED 熄灭（持续结束）');
            step(i + 1);
          }, secs * 1000);

        } else if (blockId === 'execute_led_off') {
          if (targetLed) turnOffLed(targetLed);
          step(i + 1);

        } else if (blockId === 'execute_delay') {
          var delaySecs = getBlockNumber(block);
          appendConsoleLine('[仿真] 延迟 ' + delaySecs + ' 秒…');
          setTimeout(function() {
            if (cancelled()) return;
            appendConsoleLine('[仿真] 延迟结束');
            step(i + 1);
          }, delaySecs * 1000);

        /* ── 控制块 ── */
        } else if (blockId === 'control_repeat_n') {
          var n = Math.max(0, Math.round(getBlockNumber(block)));
          var mouth = block.querySelector('.block-c-mouth');
          var inner = mouth ? getBlocksInMouth(mouth) : [];
          appendConsoleLine('[仿真] 重复 ' + n + ' 次');
          var count = 0;
          (function nextIter() {
            if (cancelled()) return;
            if (count >= n) { step(i + 1); return; }
            count++;
            runBlocks(inner, 0, nextIter);
          })();

        } else if (blockId === 'control_repeat_until') {
          /* 条件为占位符，暂时执行一次循环体后继续 */
          var mouth2 = block.querySelector('.block-c-mouth');
          var inner2 = mouth2 ? getBlocksInMouth(mouth2) : [];
          appendConsoleLine('[仿真] 重复直到（条件未接入，执行一次）');
          runBlocks(inner2, 0, function() { step(i + 1); });

        } else if (blockId === 'control_if_then') {
          /* 条件为占位符，默认执行那么分支 */
          var mouth3 = block.querySelector('.block-c-mouth');
          var inner3 = mouth3 ? getBlocksInMouth(mouth3) : [];
          appendConsoleLine('[仿真] 如果-那么（条件默认为真）');
          runBlocks(inner3, 0, function() { step(i + 1); });

        } else if (blockId === 'control_if_else') {
          /* 两个嘴部：第一个=那么，第二个=否则；条件默认为真 */
          var mouths = block.querySelectorAll('.block-c-mouth');
          var thenBlocks = mouths[0] ? getBlocksInMouth(mouths[0]) : [];
          appendConsoleLine('[仿真] 如果-否则（条件默认为真，执行那么分支）');
          runBlocks(thenBlocks, 0, function() { step(i + 1); });

        } else {
          step(i + 1); // 未识别块跳过
        }
      }
      step(startIdx);
    }

    runBlocks(blocks, 1, null); // 从第 1 项开始（跳过顶部事件块）
  }

  // 根据编程区积木逻辑驱动画布 LED
  function updateLedFromButtons() {
    var allLeds = Array.from(canvasZoomWrap.querySelectorAll('.canvas-node.output-led'));
    var allButtons = Array.from(canvasZoomWrap.querySelectorAll('.canvas-node.input-button'));
    var pressedIndices = {};
    allButtons.forEach(function (btn, idx) {
      if (btn.classList.contains('pressed')) pressedIndices[idx] = true;
    });
    var anyPressed = Object.keys(pressedIndices).length > 0;

    if (!anyPressed) {
      cancelSequence();
      allLeds.forEach(function(led) { turnOffLed(led); });
      return;
    }

    var stacks = getStacksInOrder();
    var hasLogic = false;
    stacks.forEach(function(stack) {
      var blocks = getBlocksInStack(stack);
      if (blocks.length < 2) return;
      var topBlock = blocks[0];
      if (topBlock.getAttribute('data-block-id') !== 'event_button_press') return;
      var eventModuleSpan = topBlock.querySelector('.block-module-name');
      var eventInstance = eventModuleSpan ? parseInt(eventModuleSpan.getAttribute('data-block-instance'), 10) : 0;
      if (isNaN(eventInstance)) eventInstance = 0;
      if (!pressedIndices[eventInstance]) return;
      hasLogic = true;
      runBlockSequence(blocks);
    });

    if (!hasLogic) {
      allLeds.forEach(function(led) { led.classList.add('on'); });
    }
  }

  function updateCanvasHasNodes() {
    var hasNodes = canvasZoomWrap.querySelectorAll('.canvas-node').length > 0;
    canvas.classList.toggle('has-nodes', hasNodes);
  }

  function removeNode(node, name) {
    if (!name) name = getNodeBadgeText(node) || (node.querySelector('.node-label') && node.querySelector('.node-label').textContent) || '模块';
    node.remove();
    assignModuleIndices();
    updateCanvasHasNodes();
    updateProgrammingHints();
    appendConsoleLine('[仿真] 已移除模块：' + name);
  }

  // 复制节点：在偏移位置创建同类型新节点
  function duplicateNode(sourceNode) {
    var type = sourceNode.getAttribute('data-type');
    var id = sourceNode.getAttribute('data-id');
    var label = (sourceNode.querySelector('.node-label') && sourceNode.querySelector('.node-label').textContent) || id;
    var left = (parseFloat(sourceNode.style.left) || 0) + 24;
    var top = (parseFloat(sourceNode.style.top) || 0) + 24;
    var node = createCanvasNode(type, id, label, left, top);
    if (type === 'input' && id === 'input-button') {
      node.classList.add('input-button');
      setupButtonNode(node);
    }
    if (type === 'output' && id === 'output-led') {
      node.classList.add('output-led');
    }
    canvasZoomWrap.appendChild(node);
    assignModuleIndices();
    updateCanvasHasNodes();
    updateProgrammingHints();
    appendConsoleLine('[仿真] 已复制模块：' + getNodeBadgeText(node));
  }

  // 右键菜单：删除、复制、属性、重命名
  var contextMenu = null;
  var propsOverlay = null;
  function getNodeDisplayName(node) {
    return getNodeBadgeText(node) || (node.querySelector('.node-label') && node.querySelector('.node-label').textContent) || node.getAttribute('data-id') || '模块';
  }
  function showContextMenu(x, y, node, name) {
    if (contextMenu) contextMenu.remove();
    contextMenu = document.createElement('div');
    contextMenu.className = 'canvas-context-menu';
    contextMenu.innerHTML =
      '<button type="button" data-action="copy">复制</button>' +
      '<button type="button" data-action="delete">删除</button>' +
      '<button type="button" data-action="rename">重命名</button>' +
      '<button type="button" data-action="props">属性</button>';
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    document.body.appendChild(contextMenu);
    contextMenu.querySelector('[data-action="copy"]').addEventListener('click', function () {
      duplicateNode(node);
      contextMenu.remove();
      contextMenu = null;
    });
    contextMenu.querySelector('[data-action="delete"]').addEventListener('click', function () {
      removeNode(node, name);
      contextMenu.remove();
      contextMenu = null;
    });
    contextMenu.querySelector('[data-action="props"]').addEventListener('click', function () {
      var type = node.getAttribute('data-type');
      var id = node.getAttribute('data-id');
      var left = parseFloat(node.style.left) || 0;
      var top = parseFloat(node.style.top) || 0;
      if (propsOverlay) propsOverlay.remove();
      propsOverlay = document.createElement('div');
      propsOverlay.className = 'canvas-props-overlay';
      propsOverlay.innerHTML =
        '<div class="canvas-props-panel">' +
        '<div class="canvas-props-title">属性</div>' +
        '<dl class="canvas-props-list">' +
        '<dt>名称</dt><dd>' + (name || getNodeDisplayName(node)) + '</dd>' +
        '<dt>类型</dt><dd>' + (type || '—') + '</dd>' +
        '<dt>ID</dt><dd>' + (id || '—') + '</dd>' +
        '<dt>位置</dt><dd>' + Math.round(left) + ', ' + Math.round(top) + '</dd>' +
        '</dl>' +
        '<button type="button" class="canvas-props-close">关闭</button>' +
        '</div>';
      document.body.appendChild(propsOverlay);
      propsOverlay.querySelector('.canvas-props-close').addEventListener('click', function () {
        propsOverlay.remove();
        propsOverlay = null;
      });
      propsOverlay.addEventListener('click', function (e) {
        if (e.target === propsOverlay) {
          propsOverlay.remove();
          propsOverlay = null;
        }
      });
      contextMenu.remove();
      contextMenu = null;
    });
    contextMenu.querySelector('[data-action="rename"]').addEventListener('click', function () {
      var currentName = getNodeBadgeText(node);
      if (propsOverlay) propsOverlay.remove();
      propsOverlay = document.createElement('div');
      propsOverlay.className = 'canvas-props-overlay';
      propsOverlay.innerHTML =
        '<div class="canvas-props-panel canvas-rename-panel">' +
        '<div class="canvas-props-title">重命名</div>' +
        '<input type="text" class="canvas-rename-input" value="' + (currentName || '').replace(/"/g, '&quot;') + '" placeholder="显示名称" maxlength="20" />' +
        '<div class="canvas-props-actions">' +
        '<button type="button" class="canvas-props-close canvas-rename-cancel">取消</button>' +
        '<button type="button" class="canvas-props-close canvas-rename-ok">确定</button>' +
        '</div>' +
        '</div>';
      document.body.appendChild(propsOverlay);
      var inputEl = propsOverlay.querySelector('.canvas-rename-input');
      inputEl.focus();
      inputEl.select();
      function closeRename() {
        if (propsOverlay && propsOverlay.parentNode) propsOverlay.remove();
        propsOverlay = null;
        contextMenu.remove();
        contextMenu = null;
        updateProgrammingHints();
      }
      propsOverlay.querySelector('.canvas-rename-ok').addEventListener('click', function () {
        var val = (inputEl.value || '').trim();
        node.setAttribute('data-custom-name', val);
        updateNodeBadge(node);
        closeRename();
      });
      propsOverlay.querySelector('.canvas-rename-cancel').addEventListener('click', closeRename);
      propsOverlay.addEventListener('click', function (e) {
        if (e.target === propsOverlay) closeRename();
      });
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') propsOverlay.querySelector('.canvas-rename-ok').click();
        if (e.key === 'Escape') propsOverlay.querySelector('.canvas-rename-cancel').click();
      });
    });
    function closeMenu() {
      if (contextMenu) {
        contextMenu.remove();
        contextMenu = null;
      }
      document.removeEventListener('click', closeMenu);
    }
    setTimeout(function () { document.addEventListener('click', closeMenu); }, 0);
  }
  canvasZoomWrap.addEventListener('contextmenu', function (e) {
    var node = e.target.closest('.canvas-node');
    if (!node) return;
    e.preventDefault();
    var name = getNodeDisplayName(node);
    showContextMenu(e.clientX, e.clientY, node, name);
  });

  // 根据画布模块更新编程区提示（积木 / Workflow / Python）；instances 含 index 与 displayName（角标/重命名）
  function getCanvasModuleSummary() {
    var nodes = canvasZoomWrap.querySelectorAll('.canvas-node');
    var input = [], output = [], power = [], mainctl = [];
    nodes.forEach(function (n) {
      var type = n.getAttribute('data-type');
      var id = n.getAttribute('data-id');
      var key = type + ':' + id;
      var label = nodeLabels[key] || (n.querySelector('.node-label') && n.querySelector('.node-label').textContent) || id;
      var displayName = getNodeBadgeText(n);
      var index = parseInt(n.getAttribute('data-module-index'), 10);
      if (isNaN(index)) index = 0;
      var entry = { id: id, label: label, index: index, displayName: displayName };
      if (type === 'input') input.push(entry);
      else if (type === 'output') output.push(entry);
      else if (type === 'power') power.push(entry);
      else if (type === 'mainctl') mainctl.push(entry);
    });
    function groupByKey(arr, keyFn) {
      var byKey = {};
      arr.forEach(function (e) {
        var k = keyFn(e);
        if (!byKey[k]) byKey[k] = [];
        byKey[k].push(e);
      });
      return byKey;
    }
    function toInstances(arr) {
      var byKey = groupByKey(arr, function (e) { return e.id; });
      return Object.keys(byKey).map(function (id) {
        var list = byKey[id].sort(function (a, b) { return a.index - b.index; });
        var label = (list[0] && list[0].label) || id;
        return { id: id, label: label, count: list.length, instances: list.map(function (e) { return { index: e.index, displayName: e.displayName }; }) };
      });
    }
    return {
      input: toInstances(input),
      output: toInstances(output),
      power: power,
      mainctl: mainctl
    };
  }
  function updateProgrammingHints() {
    var s = getCanvasModuleSummary();
    var parts = [];
    if (s.input.length) parts.push('输入：' + s.input.map(function (e) { return e.label + (e.count > 1 ? '×' + e.count : ''); }).join('、'));
    if (s.output.length) parts.push('输出：' + s.output.map(function (e) { return e.label + (e.count > 1 ? '×' + e.count : ''); }).join('、'));
    if (s.power.length) parts.push('电源：' + s.power.map(function (e) { return e.label; }).join('、'));
    if (s.mainctl.length) parts.push('主控：' + s.mainctl.map(function (e) { return e.label; }).join('、'));
    var hint = parts.length === 0 ? '' : '画布中有 <strong>' + parts.join('</strong>；<strong>') + '</strong>。';
    var blocksHint = hint ? hint + ' 可拖入「当按键按下」「设置 LED 开/关」等积木进行编程。' : '';
    var workflowHint = hint ? hint + ' 可在流程图中使用对应事件与输出节点。' : '';
    var pythonHint = hint ? hint + ' 在 Python 中可引用如 <code>button</code>、<code>led</code> 等对象。' : '';
    var elBlocks = document.getElementById('canvasHintBlocks');
    var elWorkflow = document.getElementById('canvasHintWorkflow');
    var elPython = document.getElementById('canvasHintPython');
    if (elBlocks) elBlocks.innerHTML = blocksHint;
    if (elWorkflow) elWorkflow.innerHTML = workflowHint;
    if (elPython) elPython.innerHTML = pythonHint;
    updateBlocksPalette();
    updateWorkspaceBlockModuleLabels();
  }

  function updateWorkspaceBlockModuleLabels() {
    var s = getCanvasModuleSummary();
    if (!blocksWorkspace) return;
    blocksWorkspace.querySelectorAll('.block-module-name').forEach(function (span) {
      var type = span.getAttribute('data-module-type');
      var id = span.getAttribute('data-module-id');
      var instance = parseInt(span.getAttribute('data-block-instance'), 10);
      if (isNaN(instance)) instance = 0;
      var list = type === 'input' ? s.input : type === 'output' ? s.output : [];
      var entry = list.filter(function (e) { return e.id === id; })[0];
      var inst = entry && entry.instances && entry.instances[instance];
      if (inst && inst.displayName != null) span.textContent = inst.displayName;
    });
  }

  var moduleNameDropdown = null;
  var moduleNameDropdownTrigger = null; /* 当前打开下拉时对应的 span */

  function showModuleNameDropdown(span) {
    var type = span.getAttribute('data-module-type');
    var id = span.getAttribute('data-module-id');
    var s = getCanvasModuleSummary();
    var list = type === 'input' ? s.input : type === 'output' ? s.output : [];
    var entry = list.filter(function (e) { return e.id === id; })[0];
    if (!entry || !entry.instances || entry.instances.length === 0) return;
    if (moduleNameDropdown) moduleNameDropdown.remove();
    moduleNameDropdownTrigger = span;
    moduleNameDropdown = document.createElement('div');
    moduleNameDropdown.className = 'block-math-mode-dropdown';
    moduleNameDropdown.style.position = 'fixed';
    moduleNameDropdown.style.display = 'none';
    document.body.appendChild(moduleNameDropdown);

    var curInstance = parseInt(span.getAttribute('data-block-instance'), 10) || 0;
    entry.instances.forEach(function (inst, idx) {
      var item = document.createElement('div');
      item.className = 'block-math-mode-item' + (idx === curInstance ? ' active' : '');
      item.textContent = inst.displayName;
      item.setAttribute('data-index', String(idx));
      item.addEventListener('mousedown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var i = parseInt(item.getAttribute('data-index'), 10);
        span.setAttribute('data-block-instance', String(i));
        span.textContent = entry.instances[i].displayName;
        closeModuleNameDropdown();
      });
      moduleNameDropdown.appendChild(item);
    });

    function closeModuleNameDropdown() {
      if (moduleNameDropdown) {
        moduleNameDropdown.style.display = 'none';
        moduleNameDropdown.remove();
        moduleNameDropdown = null;
      }
      moduleNameDropdownTrigger = null;
      document.removeEventListener('mousedown', onDocMousedown);
    }

    function onDocMousedown(e) {
      if (!moduleNameDropdown) return;
      if (moduleNameDropdown.contains(e.target)) return;
      if (e.target === span || (span.contains && span.contains(e.target))) return;
      closeModuleNameDropdown();
    }

    var rect = span.getBoundingClientRect();
    moduleNameDropdown.style.left = rect.left + 'px';
    moduleNameDropdown.style.top = (rect.bottom + 4) + 'px';
    moduleNameDropdown.style.display = 'block';
    /* 若下方超出视口则改为在触发器上方显示 */
    var dropdownHeight = moduleNameDropdown.getBoundingClientRect().height;
    if (rect.bottom + 4 + dropdownHeight > window.innerHeight && rect.top - dropdownHeight - 4 >= 0) {
      moduleNameDropdown.style.top = (rect.top - dropdownHeight - 4) + 'px';
    }
    document.addEventListener('mousedown', onDocMousedown);
  }
  /* 在 document 的 capture 阶段处理，确保优先于块拖拽，点击模块名称即弹出下拉 */
  document.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    var el = e.target && e.target.nodeType === 3 ? e.target.parentNode : e.target;
    if (!el || !el.closest) return;
    var span = el.closest('.block-module-name');
    if (!span) return;
    var ws = document.getElementById('blocksWorkspace');
    if (!ws || !ws.contains(span)) return;
    e.preventDefault();
    e.stopPropagation();
    showModuleNameDropdown(span);
  }, true);

  // 积木分类名（事件、执行、控制、运算）
  var blockCategoryNames = { event: '事件', execute: '执行', control: '控制', operators: '运算' };

  // 根据画布模块生成可用的 blocks 列表：每种块只出现一次，块内用下拉选具体模块实例（名称后多一个选项）
  function getBlocksForCanvas(s) {
    var event = [], execute = [], control = [], operators = [];
    var buttonEntry = s.input.filter(function (e) { return e.id === 'input-button'; })[0];
    var ledEntry = s.output.filter(function (e) { return e.id === 'output-led'; })[0];
    var buttonTotal = buttonEntry && buttonEntry.instances && buttonEntry.instances.length > 0;
    var ledTotal = ledEntry && ledEntry.instances && ledEntry.instances.length > 0;

    if (buttonTotal && buttonEntry.instances.length > 0) {
      var firstButtonName = buttonEntry.instances[0].displayName != null ? buttonEntry.instances[0].displayName : '按键A';
      event.push({ id: 'event_button_press', kind: 'event', label: '当按下', moduleLabel: firstButtonName, labelAfter: '时', moduleType: 'input', moduleId: 'input-button', instance: 0 });
    }

    execute.push({ id: 'execute_delay', kind: 'execute', label: '延迟', field: 'number', suffix: '秒' });
    if (ledTotal && ledEntry.instances.length > 0) {
      var firstLedName = ledEntry.instances[0].displayName != null ? ledEntry.instances[0].displayName : (ledEntry.instances.length > 1 ? 'LED灯A' : 'LED灯');
      execute.push({ id: 'execute_led_show', kind: 'execute', label: '', moduleLabel: firstLedName, labelAfter: ' 显示', moduleType: 'output', moduleId: 'output-led', field: 'colour', instance: 0 });
      execute.push({ id: 'execute_led_show_duration', kind: 'execute', label: '', moduleLabel: firstLedName, labelAfter: ' 显示', field: 'colour', suffix: '持续', field2: 'number', suffix2: '秒', moduleType: 'output', moduleId: 'output-led', instance: 0 });
      execute.push({ id: 'execute_led_off', kind: 'execute', label: '', moduleLabel: firstLedName, labelAfter: ' 熄灭', moduleType: 'output', moduleId: 'output-led', instance: 0 });
    }

    control.push({ id: 'control_if_then', kind: 'control', label: '如果', field: 'condition', suffix: '那么' });
    control.push({ id: 'control_if_else', kind: 'control', label: '如果', field: 'condition', suffix: '那么', suffix2: '否则' });
    control.push({ id: 'control_repeat_n', kind: 'control', label: '重复', field: 'number', suffix: '次' });
    control.push({ id: 'control_repeat_until', kind: 'control', label: '重复直到', field: 'condition' });

    operators.push({ id: 'operator_math', kind: 'operators', label: '', field: 'math' });

    return { event: event, execute: execute, control: control, operators: operators };
  }

  // Blockly 块形态：事件=帽子块(hat)、执行=堆叠块(stack)、控制=C型块(c)、运算=数据块(value)
  var blockKindToShape = { event: 'hat', execute: 'stack', control: 'c', operators: 'value' };

  // 根据画布模块更新编程区左侧 blocks 面板（事件/执行/控制/运算）
  function updateBlocksPalette() {
    var container = document.getElementById('blocksPaletteList');
    if (!container) return;
    var s = getCanvasModuleSummary();
    var hasAny = s.power.length > 0 || s.mainctl.length > 0 || s.input.length > 0 || s.output.length > 0;
    container.innerHTML = '';
    if (!hasAny) return;

    var blocks = getBlocksForCanvas(s);
    var categories = ['event', 'execute', 'control', 'operators'];
    categories.forEach(function (cat) {
      var list = blocks[cat];
      if (!list || list.length === 0) return;
      var wrap = document.createElement('div');
      wrap.className = 'blocks-category ' + cat;
      var title = document.createElement('div');
      title.className = 'blocks-category-title';
      title.textContent = blockCategoryNames[cat];
      wrap.appendChild(title);
      list.forEach(function (b) {
        var shape = blockKindToShape[b.kind] || 'stack';
        var chip = document.createElement('div');
        chip.className = 'block-chip ' + b.kind + ' block-shape-' + shape;
        chip.setAttribute('data-block-id', b.id || '');
        chip.setAttribute('data-block-kind', b.kind);
        chip.setAttribute('data-block-shape', shape);
        if (b.instance !== undefined) chip.setAttribute('data-block-instance', b.instance);
        chip.draggable = true;

        if (shape === 'c') {
          /* C-形逻辑块：直接构建内部顶臂/壁/嘴/底臂结构 */
          buildCBlockContent(b, chip);
        } else {
          if (b.label) chip.appendChild(document.createTextNode(b.label));
          if (b.moduleLabel != null) {
            var moduleSpan = document.createElement('span');
            moduleSpan.className = 'block-module-name block-math-mode-trigger';
            moduleSpan.textContent = b.moduleLabel;
            moduleSpan.setAttribute('data-block-instance', String(b.instance != null ? b.instance : 0));
            if (b.moduleType) moduleSpan.setAttribute('data-module-type', b.moduleType);
            if (b.moduleId) moduleSpan.setAttribute('data-module-id', b.moduleId);
            chip.appendChild(moduleSpan);
          }
          if (b.labelAfter) chip.appendChild(document.createTextNode(b.labelAfter));
          if (b.field) {
            if (b.field === 'math') {
              chip.appendChild(createMathField());
            } else if (b.field === 'colour') {
              chip.appendChild(createColourField());
            } else if (b.field === 'number') {
              var pInp = document.createElement('input');
              pInp.type = 'number';
              pInp.className = 'block-field-number';
              pInp.value = '0';
              resizeNumberInput(pInp);
              pInp.addEventListener('input', function() { resizeNumberInput(pInp); });
              pInp.addEventListener('mousedown', function(e) { e.stopPropagation(); });
              pInp.addEventListener('click', function(e) { e.stopPropagation(); });
              chip.appendChild(pInp);
            } else {
              var span = document.createElement('span');
              span.className = 'block-field-inline';
              span.textContent = b.field === 'condition' ? '条件' : '';
              chip.appendChild(span);
            }
          }
          if (b.suffix) chip.appendChild(document.createTextNode(' ' + b.suffix));
          if (b.field2 === 'number') {
            chip.appendChild(document.createTextNode(' '));
            var pInp2 = document.createElement('input');
            pInp2.type = 'number';
            pInp2.className = 'block-field-number';
            pInp2.value = '0';
            resizeNumberInput(pInp2);
            pInp2.addEventListener('input', function() { resizeNumberInput(pInp2); });
            pInp2.addEventListener('mousedown', function(e) { e.stopPropagation(); });
            pInp2.addEventListener('click', function(e) { e.stopPropagation(); });
            chip.appendChild(pInp2);
          } else if (b.field2) {
            chip.appendChild(document.createTextNode(' '));
            var span2 = document.createElement('span');
            span2.className = 'block-field-inline';
            span2.textContent = '条件';
            chip.appendChild(span2);
          }
          if (b.suffix2) chip.appendChild(document.createTextNode(' ' + b.suffix2));
        }

        chip.addEventListener('dragstart', function (e) {
          e.dataTransfer.setData('application/x-toylab-block', JSON.stringify({
            id: b.id, kind: b.kind, shape: shape, label: b.label,
            moduleLabel: b.moduleLabel, labelAfter: b.labelAfter, moduleType: b.moduleType, moduleId: b.moduleId,
            instance: b.instance, field: b.field, suffix: b.suffix, field2: b.field2, suffix2: b.suffix2
          }));
          e.dataTransfer.effectAllowed = 'copy';
        });

        wrap.appendChild(chip);
      });
      container.appendChild(wrap);
    });
  }

  // 编程工作区：多组块（每组一列），吸附在一起表示逻辑关系；拖顶部整组动，拖下方断开
  var blocksWorkspace = document.getElementById('blocksWorkspace');
  var blocksWorkspacePlaceholder = document.getElementById('blocksWorkspacePlaceholder');
  var blockStackIdCounter = 0;
  function updateWorkspacePlaceholderVisibility() {
    if (!blocksWorkspacePlaceholder || !blocksWorkspace) return;
    var hasBlocks = blocksWorkspace.querySelectorAll('.workspace-block').length > 0;
    blocksWorkspacePlaceholder.style.display = hasBlocks ? 'none' : 'block';
  }
  function getStacksInOrder() {
    if (!blocksWorkspace) return [];
    return Array.prototype.filter.call(blocksWorkspace.children, function (el) {
      return el.classList && el.classList.contains('block-stack');
    });
  }
  function getBlocksInStack(stack) {
    if (!stack) return [];
    return Array.prototype.filter.call(stack.children, function (el) {
      return el.classList && el.classList.contains('workspace-block');
    });
  }
  function getWorkspaceCoords(clientX, clientY) {
    if (!blocksWorkspace) return { x: 0, y: 0 };
    var r = blocksWorkspace.getBoundingClientRect();
    var scrollLeft = blocksWorkspace.scrollLeft || 0;
    var scrollTop = blocksWorkspace.scrollTop || 0;
    return {
      x: Math.max(0, clientX - r.left + scrollLeft),
      y: Math.max(0, clientY - r.top + scrollTop)
    };
  }
  function ensureStack() {
    var stacks = getStacksInOrder();
    if (stacks.length > 0) return stacks[0];
    var stack = document.createElement('div');
    stack.className = 'block-stack';
    stack.id = 'block-stack-' + (++blockStackIdCounter);
    blocksWorkspace.insertBefore(stack, blocksWorkspacePlaceholder);
    return stack;
  }
  function insertBlockIntoStack(block, stack, index) {
    var blocks = getBlocksInStack(stack);
    var isEventOnTop = blocks[0] && blocks[0].classList.contains('block-shape-hat');
    if (isEventOnTop && index < 1) index = 1;
    if (index >= blocks.length) stack.appendChild(block);
    else stack.insertBefore(block, blocks[index]);
    updateWorkspacePlaceholderVisibility();
  }
  function isEventBlock(block) {
    return block && block.classList && block.classList.contains('block-shape-hat');
  }
  function getStackWithEventOnTop(stack) {
    var blocks = getBlocksInStack(stack);
    return blocks.length > 0 && isEventBlock(blocks[0]) ? stack : null;
  }
  /* 查找可在其下方吸附的栈：顶部为事件块、或任意执行/控制块栈均可；运算块栈（value）不可作目标 */
  function findEventStackToSnapBelow(clientX, clientY, excludeStack) {
    var stacks = getStacksInOrder();
    var thresholdY = 56;
    var thresholdX = 80;
    for (var i = 0; i < stacks.length; i++) {
      var s = stacks[i];
      if (excludeStack && s === excludeStack) continue;
      var blocks = getBlocksInStack(s);
      if (blocks.length === 0) continue;
      /* 运算块（value）不能作为下方吸附目标 */
      if (blocks[0].classList.contains('block-shape-value')) continue;
      var r = s.getBoundingClientRect();
      var inY = clientY >= r.bottom - 8 && clientY <= r.bottom + thresholdY;
      var inX = clientX >= r.left - thresholdX && clientX <= r.right + thresholdX;
      if (inY && inX) return s;
    }
    return null;
  }
  /* 查找距离 (x,y) 最近的数字输入框（排除拖拽中的 stack 内部） */
  function findNearbyNumberField(x, y, excludeStack) {
    var THRESHOLD = 36;
    var best = null, bestDist = Infinity;
    var inputs = blocksWorkspace.querySelectorAll('.block-field-number');
    inputs.forEach(function(inp) {
      if (excludeStack && excludeStack.contains(inp)) return;
      var r = inp.getBoundingClientRect();
      var cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
      var dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      if (dist < THRESHOLD && dist < bestDist) { bestDist = dist; best = inp; }
    });
    return best;
  }

  /* 将运算 stack 嵌入目标数字输入框，完整显示运算块内容 */
  function snapMathBlockIntoField(stack, targetInput) {
    var opBlock = stack.querySelector('.workspace-block.block-shape-value');
    if (!opBlock) return false;
    var mathWrapper = opBlock.querySelector('.block-field-math');
    if (!mathWrapper) return false;

    var initNum  = mathWrapper.dataset.mathNum  || '0';
    var initOpId = mathWrapper.dataset.mathOpId || MATH_OPS[0].id;

    /* 清理旧下拉层 */
    opBlock.dispatchEvent(new CustomEvent('remove-math-dropdown', { bubbles: true }));

    /* 锁定父块高度，嵌入后不撑高 */
    var parentBlock = targetInput.closest('.workspace-block');
    if (parentBlock) parentBlock.style.height = parentBlock.offsetHeight + 'px';

    /* 创建带初始状态的新 math 字段 */
    var newMathField = createMathField(initNum, initOpId);

    /* 包裹为嵌套容器 */
    var nested = document.createElement('span');
    nested.className = 'block-field-nested';
    nested.appendChild(newMathField);

    targetInput.parentNode.replaceChild(nested, targetInput);

    if (stack.parentNode) stack.parentNode.removeChild(stack);
    updateWorkspacePlaceholderVisibility();
    playSnapSound();
    appendConsoleLine('[积木] 运算块已嵌入');
    return true;
  }

  /* ── C-形逻辑块辅助函数 ── */

  /* 创建 C-块顶臂内容（标签 + 字段），供面板/工作区共用 */
  function buildCBlockTopContent(b, topEl) {
    var label = (b.label != null) ? b.label : (b.id || '');
    if (label) topEl.appendChild(document.createTextNode(label));
    if (b.field === 'number') {
      var inp = document.createElement('input');
      inp.type = 'number'; inp.className = 'block-field-number'; inp.value = '0';
      resizeNumberInput(inp);
      inp.addEventListener('input', function() { resizeNumberInput(inp); });
      inp.addEventListener('mousedown', function(ev) { ev.stopPropagation(); });
      inp.addEventListener('click',     function(ev) { ev.stopPropagation(); });
      topEl.appendChild(inp);
    } else if (b.field === 'condition') {
      var span = document.createElement('span');
      span.className = 'block-field-inline';
      span.textContent = '条件';
      topEl.appendChild(span);
    }
    if (b.suffix) topEl.appendChild(document.createTextNode(' ' + b.suffix));
  }

  /* 创建空的 C-块嘴部区域（area = 壁 + 嘴部） */
  function buildCMouthArea() {
    var area = document.createElement('div');
    area.className = 'block-c-area';
    var wall = document.createElement('div');
    wall.className = 'block-c-wall';
    area.appendChild(wall);
    var mouth = document.createElement('div');
    mouth.className = 'block-c-mouth';
    area.appendChild(mouth);
    return area;
  }

  /* 向面板 chip / 工作区 block 填充 C-块内部结构 */
  function buildCBlockContent(b, el) {
    var top = document.createElement('div');
    top.className = 'block-c-top';
    buildCBlockTopContent(b, top);
    el.appendChild(top);

    el.appendChild(buildCMouthArea());

    /* 如果-否则：额外的 else 标签 + 嘴部 */
    if (b.id === 'control_if_else') {
      var elseLabel = document.createElement('div');
      elseLabel.className = 'block-c-else-label';
      elseLabel.textContent = '否则';
      el.appendChild(elseLabel);
      el.appendChild(buildCMouthArea());
    }

    var bottom = document.createElement('div');
    bottom.className = 'block-c-bottom';
    el.appendChild(bottom);
  }

  /* 获取 C-块嘴部内的直接 workspace-block 子元素 */
  function getBlocksInMouth(mouth) {
    if (!mouth) return [];
    return Array.prototype.filter.call(mouth.children, function(el) {
      return el.classList && el.classList.contains('workspace-block');
    });
  }

  /* 查找距 (x,y) 最近且在阈值内的 .block-c-mouth（排除拖拽 stack 内部） */
  function findNearbyCMouth(x, y, excludeStack) {
    var THRESHOLD = 48;
    var best = null, bestDist = Infinity;
    var mouths = blocksWorkspace.querySelectorAll('.block-c-mouth');
    mouths.forEach(function(mouth) {
      if (excludeStack && excludeStack.contains(mouth)) return;
      var r = mouth.getBoundingClientRect();
      var dx = Math.max(0, r.left - x, x - r.right);
      var dy = Math.max(0, r.top - y, y - r.bottom);
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= THRESHOLD && dist < bestDist) { bestDist = dist; best = mouth; }
    });
    return best;
  }

  /* 将拖拽 stack 内的块全部移入 C-块嘴部 */
  function snapStackIntoCMouth(stack, mouth) {
    var blocks = getBlocksInStack(stack).slice();
    if (blocks.length === 0) return false;
    if (isEventBlock(blocks[0])) return false;
    blocks.forEach(function(b) { if (b.parentNode) b.parentNode.removeChild(b); mouth.appendChild(b); });
    if (stack.parentNode) stack.parentNode.removeChild(stack);
    updateWorkspacePlaceholderVisibility();
    playSnapSound();
    appendConsoleLine('[积木] 已吸附到逻辑块内');
    return true;
  }

  function trySnapDraggedStackBelowEvent(draggedStack) {
    var blocksToMove = getBlocksInStack(draggedStack).slice();
    if (blocksToMove.length === 0) return false;
    if (isEventBlock(blocksToMove[0])) return false;
    var r = draggedStack.getBoundingClientRect();
    var midX = (r.left + r.right) / 2;
    var topY = r.top;
    var target = findEventStackToSnapBelow(midX, topY, draggedStack);
    if (!target) return false;
    for (var i = 0; i < blocksToMove.length; i++) {
      var b = blocksToMove[i];
      if (b.parentNode) b.parentNode.removeChild(b);
      insertBlockIntoStack(b, target, getBlocksInStack(target).length);
    }
    if (draggedStack.parentNode) draggedStack.parentNode.removeChild(draggedStack);
    updateWorkspacePlaceholderVisibility();
    playSnapSound();
    appendConsoleLine('[积木] 已吸附');
    return true;
  }
  function createWorkspaceBlock(payload) {
    var shape = payload.shape || 'stack';
    var block = document.createElement('div');
    block.className = 'workspace-block block-shape-' + shape + ' ' + (payload.kind || '');
    block.setAttribute('data-block-id', payload.id || '');
    block.setAttribute('data-block-shape', shape);
    block.setAttribute('aria-label', (payload.label || payload.id || '') + '，可拖动移动，右键菜单删除或复制');

    /* C-形逻辑块：直接构建内部结构并返回 */
    if (shape === 'c') {
      buildCBlockContent(payload, block);
      block._payload = payload;
      return block;
    }

    var content = document.createElement('span');
    content.className = 'block-content';
    var label = (payload.label != null) ? payload.label : (payload.id || '');
    if (label) content.appendChild(document.createTextNode(label));
    if (payload.moduleLabel != null) {
      var moduleSpan = document.createElement('span');
      moduleSpan.className = 'block-module-name block-math-mode-trigger';
      moduleSpan.textContent = payload.moduleLabel;
      moduleSpan.setAttribute('data-block-instance', String(payload.instance != null ? payload.instance : 0));
      if (payload.moduleType) moduleSpan.setAttribute('data-module-type', payload.moduleType);
      if (payload.moduleId) moduleSpan.setAttribute('data-module-id', payload.moduleId);
      content.appendChild(moduleSpan);
    }
    if (payload.labelAfter) content.appendChild(document.createTextNode(payload.labelAfter));
    if (payload.field) {
      if (payload.field === 'math') {
        content.appendChild(createMathField());
      } else if (payload.field === 'colour') {
        content.appendChild(createColourField());
      } else if (payload.field === 'number') {
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.className = 'block-field-number';
        inp.value = '0';
        resizeNumberInput(inp);
        inp.addEventListener('input', function() { resizeNumberInput(inp); });
        inp.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        inp.addEventListener('click', function(e) { e.stopPropagation(); });
        content.appendChild(inp);
      } else {
        var span = document.createElement('span');
        span.className = 'block-field-inline';
        span.textContent = payload.field === 'condition' ? '条件' : '';
        content.appendChild(span);
      }
    }
    if (payload.suffix) content.appendChild(document.createTextNode(' ' + payload.suffix));
    if (payload.field2 === 'number') {
      content.appendChild(document.createTextNode(' '));
      var inp2 = document.createElement('input');
      inp2.type = 'number';
      inp2.className = 'block-field-number';
      inp2.value = '0';
      resizeNumberInput(inp2);
      inp2.addEventListener('input', function() { resizeNumberInput(inp2); });
      inp2.addEventListener('mousedown', function(e) { e.stopPropagation(); });
      inp2.addEventListener('click', function(e) { e.stopPropagation(); });
      content.appendChild(inp2);
    }
    if (payload.suffix2) content.appendChild(document.createTextNode(' ' + payload.suffix2));
    block.appendChild(content);

    block._payload = payload;
    return block;
  }

  function hasBlockDragType(dt) {
    if (!dt || !dt.types) return false;
    var t = dt.types;
    return (t.indexOf && t.indexOf('application/x-toylab-block') !== -1) ||
           (Array.prototype.indexOf && Array.prototype.indexOf.call(t, 'application/x-toylab-block') !== -1);
  }
  function handleWorkspaceDrop(e) {
    if (!blocksWorkspace) return;
    var inside = blocksWorkspace.contains(e.target);
    if (!inside && (e.target === document.body || e.target === document.documentElement)) {
      var r = blocksWorkspace.getBoundingClientRect();
      inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    }
    if (!inside) return;
    if (!e.dataTransfer.types || (e.dataTransfer.types.indexOf && e.dataTransfer.types.indexOf('application/x-toylab-block') === -1)) return;
    e.preventDefault();
    e.stopPropagation();
    blocksWorkspace.classList.remove('drag-over');
    var raw = e.dataTransfer.getData('application/x-toylab-block');
    if (!raw) return;
    try {
      var payload = JSON.parse(raw);
      var block = createWorkspaceBlock(payload);
      var label = (payload.label != null) ? payload.label : (payload.id || '');
      var snapTarget = findEventStackToSnapBelow(e.clientX, e.clientY, null);
      if (snapTarget) {
        insertBlockIntoStack(block, snapTarget, getBlocksInStack(snapTarget).length);
        playSnapSound();
        appendConsoleLine('[积木] 已添加块：' + label + '（吸附到栈末尾）');
      } else {
        var coords = getWorkspaceCoords(e.clientX, e.clientY);
        var stack = document.createElement('div');
        stack.className = 'block-stack';
        stack.id = 'block-stack-' + (++blockStackIdCounter);
        stack.style.left = coords.x + 'px';
        stack.style.top = coords.y + 'px';
        stack.appendChild(block);
        blocksWorkspace.insertBefore(stack, blocksWorkspacePlaceholder);
        updateWorkspacePlaceholderVisibility();
        appendConsoleLine('[积木] 已添加块：' + label);
      }
    } catch (err) { /* ignore */ }
  }
  if (blocksWorkspace) {
    document.addEventListener('dragover', function (e) {
      var overWorkspace = blocksWorkspace.contains(e.target);
      if (!overWorkspace && (e.target === document.body || e.target === document.documentElement)) {
        var r = blocksWorkspace.getBoundingClientRect();
        overWorkspace = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      }
      if (!overWorkspace) return;
      if (!hasBlockDragType(e.dataTransfer)) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
      blocksWorkspace.classList.add('drag-over');
    });
    document.addEventListener('drop', handleWorkspaceDrop, true);
    blocksWorkspace.addEventListener('dragleave', function (e) {
      if (!blocksWorkspace.contains(e.relatedTarget)) blocksWorkspace.classList.remove('drag-over');
    });

    /* ── 嵌套运算块拖出（capture 先于块拖拽处理器） ── */
    blocksWorkspace.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      /* 点击 math 字段内的交互控件（input、mode-trigger）、颜色控件或模块名称不触发拖出 */
      if (e.target.closest('.block-field-number') ||
          e.target.closest('.block-math-mode-trigger') ||
          e.target.closest('.block-math-mode-dropdown') ||
          e.target.closest('.block-field-colour') ||
          e.target.closest('.block-module-name') ||
          e.target.closest('.colour-picker-popup')) return;
      var nested = e.target.closest && e.target.closest('.block-field-nested');
      if (!nested || !blocksWorkspace.contains(nested)) return;
      e.preventDefault();
      e.stopPropagation();

      var mathWrapper = nested.querySelector('.block-field-math');
      var initNum  = (mathWrapper && mathWrapper.dataset.mathNum)  || '0';
      var initOpId = (mathWrapper && mathWrapper.dataset.mathOpId) || MATH_OPS[0].id;

      /* 清理下拉层 */
      if (mathWrapper) mathWrapper.dispatchEvent(new CustomEvent('remove-math-dropdown', { bubbles: true }));

      var parentBlock = nested.closest('.workspace-block');

      /* 恢复普通数字输入框 */
      var inp = document.createElement('input');
      inp.type = 'number'; inp.className = 'block-field-number'; inp.value = '0';
      resizeNumberInput(inp);
      inp.addEventListener('mousedown', function(ev) { ev.stopPropagation(); });
      inp.addEventListener('click',     function(ev) { ev.stopPropagation(); });
      inp.addEventListener('input',     function() { resizeNumberInput(inp); });
      nested.parentNode.replaceChild(inp, nested);
      if (parentBlock) parentBlock.style.height = '';

      /* 创建运算 stack 并定位于鼠标处 */
      var wsRect = blocksWorkspace.getBoundingClientRect();
      var sL = blocksWorkspace.scrollLeft || 0, sT = blocksWorkspace.scrollTop || 0;
      var newBlock = document.createElement('div');
      newBlock.className = 'workspace-block block-shape-value operators';
      newBlock.setAttribute('data-block-id', 'operator_math');
      newBlock.setAttribute('data-block-shape', 'value');
      var cnt = document.createElement('span');
      cnt.className = 'block-content';
      cnt.appendChild(createMathField(initNum, initOpId));
      newBlock.appendChild(cnt);
      var newStack = document.createElement('div');
      newStack.className = 'block-stack';
      newStack.id = 'block-stack-' + (++blockStackIdCounter);
      newStack.appendChild(newBlock);
      newStack.style.left = (e.clientX - wsRect.left + sL - 40) + 'px';
      newStack.style.top  = (e.clientY - wsRect.top  + sT - 16) + 'px';
      blocksWorkspace.insertBefore(newStack, blocksWorkspacePlaceholder);
      updateWorkspacePlaceholderVisibility();
      appendConsoleLine('[积木] 运算块已拖出');

      /* 立即接管拖拽 */
      var sx = e.clientX, sy = e.clientY;
      var sl = parseFloat(newStack.style.left), st = parseFloat(newStack.style.top);
      newStack.classList.add('dragging');
      var hlEl = null;
      function onMOut(ev) {
        newStack.style.left = Math.max(0, sl + ev.clientX - sx) + 'px';
        newStack.style.top  = Math.max(0, st + ev.clientY - sy) + 'px';
        if (hlEl) { hlEl.classList.remove('snap-target'); hlEl = null; }
        var near = findNearbyNumberField(ev.clientX, ev.clientY, newStack);
        if (near) { near.classList.add('snap-target'); hlEl = near; }
      }
      function onMUp() {
        newStack.classList.remove('dragging');
        document.removeEventListener('mousemove', onMOut);
        document.removeEventListener('mouseup', onMUp);
        if (hlEl) {
          var t = hlEl; hlEl.classList.remove('snap-target'); hlEl = null;
          snapMathBlockIntoField(newStack, t);
        }
      }
      document.addEventListener('mousemove', onMOut);
      document.addEventListener('mouseup', onMUp);
    }, true); /* capture=true, 嵌套运算块拖出 */

    /* ── C-块嘴部内积木块拖出（capture 阶段，先于外层拖拽处理器） ── */
    blocksWorkspace.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      /* 跳过交互控件（数字输入、运算块、颜色选择器、模块名称下拉） */
      if (e.target.closest('.block-field-number') ||
          e.target.closest('.block-math-mode-trigger') ||
          e.target.closest('.block-math-mode-dropdown') ||
          e.target.closest('.block-field-nested') ||
          e.target.closest('.block-field-colour') ||
          e.target.closest('.block-module-name') ||
          e.target.closest('.colour-picker-popup')) return;

      /* 找到被点击的 workspace-block，检查它是否是 block-c-mouth 的直接子块 */
      var innerBlock = e.target.closest && e.target.closest('.workspace-block');
      if (!innerBlock) return;
      var mouth = innerBlock.parentNode;
      if (!mouth || !mouth.classList.contains('block-c-mouth')) return;
      if (!blocksWorkspace.contains(mouth)) return;

      e.preventDefault();
      e.stopPropagation();

      /* 提取从被点击块开始的所有后续块 */
      var mouthBlocks = getBlocksInMouth(mouth);
      var idx = mouthBlocks.indexOf(innerBlock);
      if (idx === -1) return;
      var toExtract = mouthBlocks.slice(idx);

      var wsRect = blocksWorkspace.getBoundingClientRect();
      var sL = blocksWorkspace.scrollLeft || 0, sT = blocksWorkspace.scrollTop || 0;
      var newStack = document.createElement('div');
      newStack.className = 'block-stack';
      newStack.id = 'block-stack-' + (++blockStackIdCounter);
      newStack.style.left = (e.clientX - wsRect.left + sL - 20) + 'px';
      newStack.style.top  = (e.clientY - wsRect.top  + sT - 16) + 'px';
      toExtract.forEach(function(b) { mouth.removeChild(b); newStack.appendChild(b); });

      /* 嘴部已无块（无需占位符，保持空白） */

      blocksWorkspace.insertBefore(newStack, blocksWorkspacePlaceholder);
      updateWorkspacePlaceholderVisibility();
      appendConsoleLine('[积木] 已从逻辑块中拖出');

      /* 接管拖拽 */
      var sx = e.clientX, sy = e.clientY;
      var sl = parseFloat(newStack.style.left), st = parseFloat(newStack.style.top);
      newStack.classList.add('dragging');
      var mSnapHL = null;

      function clearMHL() {
        if (mSnapHL) { mSnapHL.classList.remove('snap-target'); mSnapHL = null; }
      }
      function onMv(ev) {
        newStack.style.left = Math.max(0, sl + ev.clientX - sx) + 'px';
        newStack.style.top  = Math.max(0, st + ev.clientY - sy) + 'px';
        clearMHL();
        var nm = findNearbyCMouth(ev.clientX, ev.clientY, newStack);
        if (nm) { nm.parentNode.classList.add('snap-target'); mSnapHL = nm.parentNode; }
      }
      function onUp(ev) {
        newStack.classList.remove('dragging');
        document.removeEventListener('mousemove', onMv);
        document.removeEventListener('mouseup', onUp);
        if (mSnapHL) {
          var tArea = mSnapHL; clearMHL();
          var tMouth = tArea.querySelector('.block-c-mouth');
          if (tMouth && snapStackIntoCMouth(newStack, tMouth)) return;
        }
        if (!trySnapDraggedStackBelowEvent(newStack)) appendConsoleLine('[积木] 已移动块');
      }
      document.addEventListener('mousemove', onMv);
      document.addEventListener('mouseup', onUp);
    }, true); /* capture=true, C-嘴拖出 */

    blocksWorkspace.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      /* 点击模块名称时不拖拽块，留给 click 弹出下拉 */
      if (e.target.closest && e.target.closest('.block-module-name')) return;
      var block = e.target.closest && e.target.closest('.workspace-block');
      if (!block || !blocksWorkspace.contains(block)) return;
      var stack = block.closest && block.closest('.block-stack');
      if (!stack) return;
      e.preventDefault();
      var rect = blocksWorkspace.getBoundingClientRect();
      var scrollLeft = blocksWorkspace.scrollLeft || 0;
      var scrollTop = blocksWorkspace.scrollTop || 0;
      var blocks = getBlocksInStack(stack);
      var idx = blocks.indexOf(block);
      if (idx === -1) return;

      var stackToDrag = stack;
      if (idx > 0) {
        var chunkStartRect = blocks[idx].getBoundingClientRect();
        var newStack = document.createElement('div');
        newStack.className = 'block-stack';
        newStack.id = 'block-stack-' + (++blockStackIdCounter);
        var tail = blocks.slice(idx);
        for (var i = 0; i < tail.length; i++) {
          tail[i].parentNode.removeChild(tail[i]);
          newStack.appendChild(tail[i]);
        }
        newStack.style.left = Math.max(0, chunkStartRect.left - rect.left + scrollLeft) + 'px';
        newStack.style.top = Math.max(0, chunkStartRect.top - rect.top + scrollTop) + 'px';
        blocksWorkspace.insertBefore(newStack, blocksWorkspacePlaceholder);
        updateWorkspacePlaceholderVisibility();
        stackToDrag = newStack;
        appendConsoleLine('[积木] 已断开上方逻辑关系');
      } else {
        if (stack.style.left === '' || stack.style.top === '') {
          var sr = stack.getBoundingClientRect();
          stack.style.left = (sr.left - rect.left + scrollLeft) + 'px';
          stack.style.top = (sr.top - rect.top + scrollTop) + 'px';
        }
      }

      var startX = e.clientX;
      var startY = e.clientY;
      var startLeft = parseFloat(stackToDrag.style.left) || 0;
      var startTop = parseFloat(stackToDrag.style.top) || 0;
      stackToDrag.classList.add('dragging');
      /* 判断拖拽的是运算块（value）还是普通堆叠块 */
      var topBlockInDrag = getBlocksInStack(stackToDrag)[0];
      var isValueBlock = !!(topBlockInDrag && topBlockInDrag.classList.contains('block-shape-value'));
      var snapHighlightEl = null;

      function clearSnapHighlight() {
        if (snapHighlightEl) {
          snapHighlightEl.classList.remove('snap-target');
          snapHighlightEl = null;
        }
      }

      function onMove(ev) {
        var dx = ev.clientX - startX;
        var dy = ev.clientY - startY;
        stackToDrag.style.left = Math.max(0, startLeft + dx) + 'px';
        stackToDrag.style.top = Math.max(0, startTop + dy) + 'px';

        clearSnapHighlight();
        if (isValueBlock) {
          var near = findNearbyNumberField(ev.clientX, ev.clientY, stackToDrag);
          if (near) { near.classList.add('snap-target'); snapHighlightEl = near; }
        } else {
          /* 优先检测附近 C-块嘴部 */
          var nearMouth = findNearbyCMouth(ev.clientX, ev.clientY, stackToDrag);
          if (nearMouth) {
            var cArea = nearMouth.parentNode;
            cArea.classList.add('snap-target');
            snapHighlightEl = cArea;
          } else {
            /* 其次检测可吸附的栈底（事件块栈或执行块栈） */
            var nearStack = findEventStackToSnapBelow(ev.clientX, ev.clientY, stackToDrag);
            if (nearStack) { nearStack.classList.add('snap-target'); snapHighlightEl = nearStack; }
          }
        }
      }

      function onUp(ev) {
        stackToDrag.classList.remove('dragging');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);

        if (isValueBlock && snapHighlightEl) {
          var target = snapHighlightEl;
          clearSnapHighlight();
          if (snapMathBlockIntoField(stackToDrag, target)) return;
        } else if (!isValueBlock && snapHighlightEl) {
          var targetArea = snapHighlightEl;
          clearSnapHighlight();
          var targetMouth = targetArea.querySelector('.block-c-mouth');
          if (targetMouth && snapStackIntoCMouth(stackToDrag, targetMouth)) return;
        }
        clearSnapHighlight();
        if (!trySnapDraggedStackBelowEvent(stackToDrag)) appendConsoleLine('[积木] 已移动块');
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  var blockContextMenu = null;
  function showBlockContextMenu(clientX, clientY, block) {
    if (blockContextMenu) blockContextMenu.remove();
    blockContextMenu = document.createElement('div');
    blockContextMenu.className = 'canvas-context-menu';
    blockContextMenu.innerHTML =
      '<button type="button" data-action="copy">复制</button>' +
      '<button type="button" data-action="delete">删除</button>';
    blockContextMenu.style.left = clientX + 'px';
    blockContextMenu.style.top = clientY + 'px';
    document.body.appendChild(blockContextMenu);
    blockContextMenu.querySelector('[data-action="copy"]').addEventListener('click', function () {
      var payload = block._payload;
      if (!payload) return;
      var stack = block.closest && block.closest('.block-stack');
      var blocks = stack ? getBlocksInStack(stack) : [];
      var idx = blocks.indexOf(block);
      var newBlock = createWorkspaceBlock(payload);
      if (stack && idx >= 0) insertBlockIntoStack(newBlock, stack, idx + 1);
      else ensureStack().appendChild(newBlock);
      appendConsoleLine('[积木] 已复制块：' + (payload.label || payload.id || ''));
      blockContextMenu.remove();
      blockContextMenu = null;
    });
    blockContextMenu.querySelector('[data-action="delete"]').addEventListener('click', function () {
      var label = (block._payload && (block._payload.label || block._payload.id)) || '';
      var stack = block.closest && block.closest('.block-stack');
      if (block.parentNode) block.parentNode.removeChild(block);
      if (stack && getBlocksInStack(stack).length === 0 && stack.parentNode) stack.parentNode.removeChild(stack);
      updateWorkspacePlaceholderVisibility();
      appendConsoleLine('[积木] 已删除块' + (label ? '：' + label : ''));
      blockContextMenu.remove();
      blockContextMenu = null;
    });
    function closeMenu() {
      if (blockContextMenu) {
        blockContextMenu.remove();
        blockContextMenu = null;
      }
      document.removeEventListener('click', closeMenu);
    }
    setTimeout(function () { document.addEventListener('click', closeMenu); }, 0);
  }
  if (blocksWorkspace) {
    blocksWorkspace.addEventListener('contextmenu', function (e) {
      var block = e.target.closest('.workspace-block');
      if (!block) return;
      e.preventDefault();
      showBlockContextMenu(e.clientX, e.clientY, block);
    });
  }

  // 拖放：从模块库拖到画布
  document.querySelectorAll('.module-item[draggable="true"]').forEach(function (item) {
    item.addEventListener('dragstart', function (e) {
      e.dataTransfer.setData('text/plain', item.getAttribute('data-type') + '|' + (item.getAttribute('data-id') || '') + '|' + item.textContent.trim());
      e.dataTransfer.effectAllowed = 'copy';
    });
  });

  canvas.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    canvasScrollContent.classList.add('drag-over');
  });
  canvas.addEventListener('dragleave', function () {
    canvasScrollContent.classList.remove('drag-over');
  });
  canvas.addEventListener('drop', function (e) {
    e.preventDefault();
    canvasScrollContent.classList.remove('drag-over');
    var raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    var parts = raw.split('|');
    var type = parts[0] || 'output';
    var id = parts[1] || (type === 'power' ? 'battery-21700' : type === 'mainctl' ? 'mainctl-esp32' : type === 'input' ? 'input-button' : 'output-led');
    var label = parts[2] || id;

    var rect = canvasScrollContent.getBoundingClientRect();
    var x = (e.clientX - rect.left + canvasScrollContent.scrollLeft) / canvasZoom - 36;
    var y = (e.clientY - rect.top + canvasScrollContent.scrollTop) / canvasZoom - 22;
    x = Math.max(8, x);
    y = Math.max(8, y);

    var node = createCanvasNode(type, id, label, x, y);
    if (type === 'input' && id === 'input-button') {
      node.classList.add('input-button');
      setupButtonNode(node);
    }
    if (type === 'output' && id === 'output-led') {
      node.classList.add('output-led');
    }
    canvasZoomWrap.appendChild(node);
    assignModuleIndices();
    updateCanvasHasNodes();
    updateProgrammingHints();
    appendConsoleLine('[仿真] 已添加模块：' + getNodeBadgeText(node));
  });
});

/* ===== ��������ҳ���� ===== */
(function () {
  var overlay = document.getElementById('caseDetailOverlay');
  var closeBtn = document.getElementById('caseDetailClose');
  var cdTitle    = document.getElementById('cdTitle');
  var cdDesigner = document.getElementById('cdDesigner');
  var cdAvatar   = document.getElementById('cdAvatar');
  var cdPrice    = document.getElementById('cdPrice');

  function openDetail(card) {
    var titleEl    = card.querySelector('.inspo-card-title');
    var designerEl = card.querySelector('.inspo-card-designer');
    var avatarEl   = card.querySelector('.inspo-avatar');
    var priceEl    = card.querySelector('.inspo-card-price');

    if (cdTitle && titleEl)       cdTitle.textContent    = titleEl.textContent.trim();
    if (cdDesigner && designerEl) cdDesigner.textContent = designerEl.textContent.trim();
    if (cdAvatar && avatarEl)     {
      cdAvatar.textContent = avatarEl.textContent.trim();
      cdAvatar.style.background = avatarEl.style.background || '#7c3aed';
    }
    if (cdPrice && priceEl)       cdPrice.textContent    = priceEl.textContent.trim();

    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeDetail() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // �����Ƭ���壨���ղذ�ť��������
  document.querySelectorAll('#inspoGrid .inspo-card').forEach(function (card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function (e) {
      if (e.target.closest('.inspo-fav-btn')) return;
      openDetail(card);
    });
  });

  // �رհ�ť
  if (closeBtn) closeBtn.addEventListener('click', closeDetail);

  // ������ֹر�
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeDetail();
  });

  // ESC ���ر�
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDetail();
  });
})();

/* ===== �������� & BOM ��ѡ ===== */
(function () {
  var sharePopup     = document.getElementById('cdSharePopup');
  var sharePopupClose = document.getElementById('cdSharePopupClose');
  var shareBtn       = document.querySelector('.cd-action-btn[title="����"]');
  var cdShareName    = document.getElementById('cdShareName');
  var cdTitleEl      = document.getElementById('cdTitle');

  function openShare() {
    if (cdShareName && cdTitleEl) cdShareName.textContent = cdTitleEl.textContent;
    sharePopup && sharePopup.classList.add('is-open');
  }
  function closeShare() {
    sharePopup && sharePopup.classList.remove('is-open');
  }

  if (shareBtn) shareBtn.addEventListener('click', openShare);
  if (sharePopupClose) sharePopupClose.addEventListener('click', closeShare);
  if (sharePopup) sharePopup.addEventListener('click', function(e) {
    if (e.target === sharePopup) closeShare();
  });

  // ��ѡ�� �� ���л���Ч��
  document.addEventListener('change', function (e) {
    if (!e.target.classList.contains('cd-checkbox')) return;
    var row = e.target.closest('tr');
    if (!row) return;
    row.classList.toggle('is-checked', e.target.checked);
  });
})();

/* ===== �豸�˽����鵯�� ===== */
(function () {
  var laserBtn   = document.getElementById('laserDetailBtn');
  var laserPopup = document.getElementById('laserDevicePopup');
  var laserClose = document.getElementById('laserDeviceClose');

  function openLaser()  { laserPopup && laserPopup.classList.add('is-open'); }
  function closeLaser() { laserPopup && laserPopup.classList.remove('is-open'); }

  if (laserBtn)   laserBtn.addEventListener('click', openLaser);
  if (laserClose) laserClose.addEventListener('click', closeLaser);
  if (laserPopup) laserPopup.addEventListener('click', function(e) {
    if (e.target === laserPopup) closeLaser();
  });
})();

/* �� Hero ���ڶ����˽����鰴ť */
(function () {
  var btn2 = document.getElementById('laserDetailBtn2');
  var popup = document.getElementById('laserDevicePopup');
  if (btn2 && popup) {
    btn2.addEventListener('click', function () {
      popup.classList.add('is-open');
    });
  }
})();

/* ===== ���Ϻϼ�ʵʱ���� ===== */
(function () {
  var totalEl = document.getElementById('cdTotalAmount');

  function calcTotal() {
    var total = 0;
    // ��������������
    document.querySelectorAll('.cd-checklist-table--sm tbody tr').forEach(function (row) {
      var cb      = row.querySelector('.cd-checkbox');
      var buyQty  = row.querySelector('.cd-qty-buy');
      var price   = parseFloat(row.dataset.price) || 0;
      if (cb && cb.checked && buyQty) {
        var qty = Math.max(0, parseInt(buyQty.value) || 0);
        total += qty * price;
      }
    });
    if (totalEl) totalEl.textContent = '�� ' + total.toFixed(0);
  }

  // ���������仯 �� �Զ����¹�������
  document.addEventListener('input', function (e) {
    if (e.target.classList.contains('cd-qty-owned')) {
      var row      = e.target.closest('tr');
      if (!row) return;
      var required = parseInt(row.dataset.required) || 0;
      var owned    = Math.max(0, parseInt(e.target.value) || 0);
      var buyInput = row.querySelector('.cd-qty-buy');
      if (buyInput) {
        var newBuy = Math.max(0, required - owned);
        buyInput.value = newBuy;
        // ��������Ϊ0ʱ�Զ�ȡ����ѡ
        var cb = row.querySelector('.cd-checkbox');
        if (cb) cb.checked = newBuy > 0;
      }
      calcTotal();
    }
    // ���������ֶ��޸�Ҳ����
    if (e.target.classList.contains('cd-qty-buy')) calcTotal();
  });

  // ��ѡ��仯 �� ����
  document.addEventListener('change', function (e) {
    if (e.target.classList.contains('cd-checkbox')) {
      // ��ѡ���� .cd-checklist-table--sm ��ʱ����ϼ�
      if (e.target.closest('.cd-checklist-table--sm')) calcTotal();
    }
  });

  // ��ʼ����
  calcTotal();
})();

/* ===== �кϼ�ʵʱˢ�£��滻֮ǰ�� calcTotal�� ===== */
(function () {
  function updateRow(row) {
    var cb       = row.querySelector('.cd-checkbox');
    var buyInput = row.querySelector('.cd-qty-buy');
    var rowTotal = row.querySelector('.cd-row-total');
    var price    = parseFloat(row.dataset.price) || 0;
    if (!buyInput || !rowTotal) return;
    var qty = Math.max(0, parseInt(buyInput.value) || 0);
    var checked = cb ? cb.checked : true;
    rowTotal.textContent = (checked && qty > 0) ? '�� ' + (qty * price) : '��';
    row.classList.toggle('is-unchecked', !checked);
  }

  function calcTotal() {
    var total = 0;
    document.querySelectorAll('.cd-bom-fixed tbody tr').forEach(function (row) {
      var cb      = row.querySelector('.cd-checkbox');
      var buyQty  = row.querySelector('.cd-qty-buy');
      var price   = parseFloat(row.dataset.price) || 0;
      if (cb && cb.checked && buyQty) {
        total += Math.max(0, parseInt(buyQty.value) || 0) * price;
      }
    });
    var el = document.getElementById('cdTotalAmount');
    if (el) el.textContent = '�� ' + total.toFixed(0);
  }

  function refreshAll() {
    document.querySelectorAll('.cd-bom-fixed tbody tr').forEach(updateRow);
    calcTotal();
  }

  // �������� �� �Զ��㹺������
  document.addEventListener('input', function (e) {
    var row = e.target.closest('tr');
    if (!row) return;
    if (e.target.classList.contains('cd-qty-owned')) {
      var required = parseInt(row.dataset.required) || 0;
      var owned    = Math.max(0, parseInt(e.target.value) || 0);
      var buyInput = row.querySelector('.cd-qty-buy');
      if (buyInput) {
        buyInput.value = Math.max(0, required - owned);
        var cb = row.querySelector('.cd-checkbox');
        if (cb) cb.checked = parseInt(buyInput.value) > 0;
      }
    }
    if (e.target.classList.contains('cd-qty-buy') || e.target.classList.contains('cd-qty-owned')) {
      refreshAll();
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.classList.contains('cd-checkbox') && e.target.closest('.cd-bom-fixed')) {
      refreshAll();
    }
  });

  // ��ʼ��
  refreshAll();
})();

/* ���ҷ���ͳһ��Ϊ $ */
(function () {
  // ���� refreshAll �еĻ�����ʾ
  var origRefresh = window.__bomRefresh;

  function dollarRowTotal(row) {
    var cb       = row.querySelector('.cd-checkbox');
    var buyInput = row.querySelector('.cd-qty-buy');
    var rowTotal = row.querySelector('.cd-row-total');
    var price    = parseFloat(row.dataset.price) || 0;
    if (!buyInput || !rowTotal) return;
    var qty     = Math.max(0, parseInt(buyInput.value) || 0);
    var checked = cb ? cb.checked : true;
    rowTotal.textContent = (checked && qty > 0) ? '$ ' + (qty * price) : '��';
    row.classList.toggle('is-unchecked', !checked);
  }

  function dollarTotal() {
    var total = 0;
    document.querySelectorAll('.cd-bom-fixed tbody tr').forEach(function (row) {
      var cb     = row.querySelector('.cd-checkbox');
      var buyQty = row.querySelector('.cd-qty-buy');
      var price  = parseFloat(row.dataset.price) || 0;
      if (cb && cb.checked && buyQty) {
        total += Math.max(0, parseInt(buyQty.value) || 0) * price;
      }
    });
    var el = document.getElementById('cdTotalAmount');
    if (el) el.textContent = '$ ' + total.toFixed(0);
  }

  function refreshAll() {
    document.querySelectorAll('.cd-bom-fixed tbody tr').forEach(dollarRowTotal);
    dollarTotal();
  }

  document.addEventListener('input', function (e) {
    var row = e.target.closest('tr');
    if (!row) return;
    if (e.target.classList.contains('cd-qty-owned')) {
      var required = parseInt(row.dataset.required) || 0;
      var owned    = Math.max(0, parseInt(e.target.value) || 0);
      var buyInput = row.querySelector('.cd-qty-buy');
      if (buyInput) {
        buyInput.value = Math.max(0, required - owned);
        var cb = row.querySelector('.cd-checkbox');
        if (cb) cb.checked = parseInt(buyInput.value) > 0;
      }
    }
    if (e.target.classList.contains('cd-qty-buy') || e.target.classList.contains('cd-qty-owned')) {
      refreshAll();
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.classList.contains('cd-checkbox') && e.target.closest('.cd-bom-fixed')) {
      refreshAll();
    }
  });

  refreshAll();
})();

// ===== ���ϻ��ܱ� <-> Ӣ��BOM ˫��ͬ�� =====
(function () {
  function syncFromHero(key, ownedVal, buyVal) {
    var bsRow = document.querySelector('#bomSummaryTable tr[data-key="' + key + '"]');
    if (!bsRow) return;
    var bsOwned = bsRow.querySelector('.bs-owned');
    var bsBuy   = bsRow.querySelector('.bs-buy');
    if (bsOwned && bsOwned.value !== String(ownedVal)) bsOwned.value = ownedVal;
    if (bsBuy   && bsBuy.value   !== String(buyVal))   bsBuy.value   = buyVal;
  }

  function syncFromSummary(key, ownedVal, buyVal) {
    var heroRow = document.querySelector('.cd-checklist-table tr[data-key="' + key + '"]');
    if (!heroRow) return;
    var heroOwned = heroRow.querySelector('.cd-qty-owned');
    var heroBuy   = heroRow.querySelector('.cd-qty-buy');
    if (heroOwned && heroOwned.value !== String(ownedVal)) {
      heroOwned.value = ownedVal;
      heroOwned.dispatchEvent(new Event('input', {bubbles: true}));
    }
    if (heroBuy && heroBuy.value !== String(buyVal)) {
      heroBuy.value = buyVal;
      heroBuy.dispatchEvent(new Event('input', {bubbles: true}));
    }
  }

  // ����Ӣ��BOM�仯 �� ͬ�������ܱ�
  document.addEventListener('input', function(e) {
    var row = e.target.closest('tr[data-key]');
    if (!row) return;
    var table = e.target.closest('.cd-checklist-table');
    if (!table) return;
    var key = row.dataset.key;
    var owned = row.querySelector('.cd-qty-owned');
    var buy   = row.querySelector('.cd-qty-buy');
    if (owned && buy) syncFromHero(key, owned.value, buy.value);
  });

  // �������ܱ��仯 �� ͬ����Ӣ��BOM
  document.addEventListener('input', function(e) {
    var row = e.target.closest('#bomSummaryTable tr[data-key]');
    if (!row) return;
    var key = row.dataset.key;
    var req   = parseInt(row.querySelector('.bs-required').textContent) || 0;
    var owned = parseInt(row.querySelector('.bs-owned').value) || 0;
    var buy   = parseInt(row.querySelector('.bs-buy').value)   || 0;
    // ͬ������ʱ�Զ����㹺������
    if (e.target.classList.contains('bs-owned')) {
      buy = Math.max(0, req - owned);
      row.querySelector('.bs-buy').value = buy;
    }
    syncFromSummary(key, owned, buy);
  });
})();
