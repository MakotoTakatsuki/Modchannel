var bypass = {};

bypass.init = function() {
  api.convertButton('bypassFormButton', bypass.blockBypass, 'bypassField');
};

bypass.blockBypass = function() {

  var typedCaptcha = document.getElementById('fieldCaptcha').value.trim();

  if (/\W/.test(typedCaptcha)) {
    alert('Invalid captcha.');
    return;
  }

  api.formApiRequest('renewBypass', {
    captcha : typedCaptcha
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      var paragraph = document.getElementsByTagName('p')[0];

      var span = document.createElement('span');
      span.innerHTML = 'You have a valid block bypass.';
      span.id = 'indicatorValidBypass';
      paragraph.appendChild(span);

      document.getElementById('fieldCaptcha').value = '';
    } else if (status === 'hashcash') {
      window.location.replace('/addon.js/hashcash?action=get');
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

bypass.init();
