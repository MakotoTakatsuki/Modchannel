var captchaUtils = {};

captchaUtils.init = function() {

  var reloadButtons = document.getElementsByClassName('reloadCaptchaButton');

  for (var i = 0; i < reloadButtons.length; i++) {
    reloadButtons[i].style.display = 'inline-block';
  }

  captchaUtils.updateFunction();

  captchaUtils.initClink();

  captchaUtils.initReloadCaptcha();

  captchaUtils.initToggleReport();

};

captchaUtils.captchaTimers = document.getElementsByClassName('captchaTimer');

captchaUtils.reloadCaptcha = function() {

  document.cookie = 'captchaid=; path=/;';

  var captchaImages = document.getElementsByClassName('captchaImage');

  for (var i = 0; i < captchaImages.length; i++) {
    captchaImages[i].src = '/captcha.js?d=' + new Date().toString();
  }

  var captchaFields = document.getElementsByClassName('captchaField');

  for (var i = 0; i < captchaFields.length; i++) {
    captchaFields[i].value = '';
  }

};

captchaUtils.initCaptcha = function() {

  var captchaImageReport = document.getElementById('captchaImageReport');

  if (!captchaImageReport)
    return;

  captchaImageReport.src = '/captcha.js';

}

captchaUtils.initToggleReport = function() {

  var togglereport = document.getElementById('togglereport');

  if (!togglereport)
    return;

  togglereport.onclick = captchaUtils.initCaptcha;

}

captchaUtils.initReloadCaptcha = function() {

  var captchaImages = document.getElementsByClassName('captchaImage');

  for (var i = 0; i < captchaImages.length; i++) {
    captchaImages[i].onclick = captchaUtils.reloadCaptcha;
  }

}

captchaUtils.initClink = function() {

  var cLink = document.getElementById('cLink');

  if (!cLink)
    return;

  cLink.onclick = function() {
    return undefined;
  };

  cLink.removeAttribute('href');
  cLink.removeAttribute('target');

}

captchaUtils.updateFunction = function updateElements() {

  var cookies = api.getCookies();

  if (!cookies.captchaexpiration) {
    setTimeout(captchaUtils.updateFunction, 1000);
    return;
  }

  var captchaExpiration = new Date(cookies.captchaexpiration);

  var delta = captchaExpiration.getTime() - new Date().getTime();

  var time = '';

  if (delta > 1000) {
    time = Math.floor(delta / 1000);

    captchaUtils.reloading = false;

  } else {

    time = 'Reloading';

    if (!captchaUtils.reloading) {

      captchaUtils.reloading = true;

      captchaUtils.reloadCaptcha();

    }
  }

  for (var i = 0; i < captchaUtils.captchaTimers.length; i++) {
    captchaUtils.captchaTimers[i].innerHTML = time;
  }

  setTimeout(captchaUtils.updateFunction, 1000);

};

captchaUtils.init();

function testReload() {

  captchaUtils.reloadCaptcha();

};
