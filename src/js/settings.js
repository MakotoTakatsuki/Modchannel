var settings = {};

settings.modes = {
  'relativeTime': {
    text: lang.relativeTimes,
    default: false
  },
  'convertLocalTimes': {
    text: lang.localTimes,
    default: true
  },
  'qrMode': {
    text: lang.quickReply,
    default: false
  },
  'previewOnHover': {
    text: lang.previewOnHover,
    default: false
  },
  'previewOnHoverSound': {
    text: lang.previewOnHoverSound,
    default: false
  },
  'scrollDownMode': {
    text: lang.scrollDownAfterPost,
    default: true
  },
  'sfwMode': {
    text: lang.sfwMode,
    default: false
  },
  'unixFilenames': {
    text: lang.unixTimestampFilenames,
    default: false
  },
  'scrollPostFormMode': {
    text: lang.scrollToPostformAfterQuote,
    default: true
  },
  'autoRefreshMode': {
    text: lang.autoReload,
    default: true
  },
  'showYous': {
    text: lang.showYous,
    default: false
  },
  'postCounter': {
    text: lang.postCounter,
    default: false
  },
  'fixedTopNav': {
    text: lang.fixedTopNav,
    default: false
  },
  'autoMarkAsDeleted': {
    text: lang.autoMarkAsDeleted,
    default: true
  },
  'checkFileIdentifier': {
    text: lang.checkFileIdentifier,
    default: true
  },
  'directDownload': {
    text: lang.directDownload,
    default: true
  },
  'compressClipboardImages': {
    text: lang.compressClipboardImages,
    default: false
  },
  'autoPlayAnimations': {
    text: lang.autoplayAnimations,
    default: false
  },
  'editInOekaki': {
    text: lang.editInOekaki,
    default: false
  },
  'audioThread': {
    text: lang.audioThread,
    default: false
  },
  'audioThreadAutoPlay': {
    text: lang.audioThreadAutoPlay,
    default: true
  },
  'audioThreadNavPlayer': {
    text: lang.audioThreadNav,
    default: false
  },
  'ensureBypass': {
    text: lang.alwaysUseBypass,
    default: false
  },
  'mediaHiding': {
    text: lang.mediaHiding,
    default: false
  },
  'showFallingSnow': {
    text: lang.winter,
    default: false
  },
  'noWs': {
    text: lang.noWs,
    default: false
  },
  'noFlash': {
    text: lang.noFlash,
    default: false
  },
  'doNotAutoplayFlash': {
    text: lang.doNotAutoplayFlash,
    default: false
  }
};

settings.init = function() {

  var today = new Date();

  // date begins at 1 & month at 0
  if (today.getDate() == 20 && today.getMonth() == 3) {
    settings.modes['showFallingSnow'].default = true;
    settings.modes['fallingSnowHitlerEdition'].default = true;
  }

};

settings.get = function(key) {

  if (localStorage[key] !== undefined) {

    return JSON.parse(localStorage[key]);

  } else {

    return settings.modes[key].default;

  }

};

settings.set = function(key, value) {

  localStorage.setItem(key, value);

};

settings.init();
