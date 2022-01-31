var loginObj = {};
// I wish I could go back in time and kill whoever implemented the exposed
// element bullshit on IE before he was born

loginObj.init = function() {

/*
  if (document.getElementById('divCreation')) {
    api.convertButton('registerFormButton', loginObj.registerAccount,
        'registerField');
  }

  api.convertButton('recoverFormButton', loginObj.recoverAccount,
      'recoverField');
*/
  api.convertButton('loginFormButton', loginObj.loginUser, 'loginField');

  var savePasswordCheckbox = document.getElementById("savePasswordCheckbox");

  savePasswordCheckbox.addEventListener( 'change', function() {
      if(this.checked) {
          loginObj.toggleLoginButton(true);
      } else {
          loginObj.toggleLoginButton(false);
      }
  });

};

loginObj.recoverAccount = function() {

  var typedLogin = document.getElementById('recoverFieldLogin').value.trim();
  var typedCaptcha = document.getElementById('fieldCaptchaRecover').value
      .trim();

  if (/\W/.test(typedCaptcha)) {
    alert('Invalid captcha.');

  } else if (typedLogin.length) {

    api.formApiRequest('requestAccountRecovery', {
      login : typedLogin,
      captcha : typedCaptcha
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        alert('Password request created. Check your e-mail.');

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

};

loginObj.loginUser = function() {

  var typedLogin = document.getElementById('loginFieldLogin').value.trim();
  var typedPassword = document.getElementById('loginFieldPassword').value;

  if (!typedLogin.length || !typedPassword.length) {
    alert('Both login and password are mandatory.');
  } else {

    var redirect = "";
    if (typeof api.getCookies().loginredirect === 'undefined') {
      redirect = api.getCookies().loginredirect || '/account.js';
    } else {
      redirect= api.getCookies().loginredirect.replace("%3F", "?") || '/account.js';
    }

    api.formApiRequest('login', {
      login : typedLogin,
      password : typedPassword,
      remember : document.getElementById('checkboxRemember').checked
    }, function requestComplete(status, data) {

      if (status === 'ok') {
        window.location.href = redirect;
      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });
  }

};

loginObj.registerAccount = function() {

  var typedLogin = document.getElementById('registerFieldLogin').value.trim();
  var typedEmail = document.getElementById('registerFieldEmail').value.trim();
  var typedPassword = document.getElementById('registerFieldPassword').value;
  var typedCaptcha = document.getElementById('fieldCaptcha').value.trim();

  if (!typedLogin.length || !typedPassword.length) {
    alert('Both login and password are mandatory.');
  } else if (typedLogin.length > 16) {
    alert('Login too long, keep it under 16 characters.');
  } else if (typedEmail.length > 64) {
    alert('E-mail too long, keep it under 64 characters.');
  } else if (/\W/.test(typedCaptcha)) {
    alert('Invalid captcha.');
    return;
  } else if (/\W/.test(typedLogin)) {
    alert('Invalid login.');
  } else {

    api.formApiRequest('registerAccount', {
      login : typedLogin,
      captcha : typedCaptcha,
      password : typedPassword,
      email : typedEmail
    }, function requestComplete(status, data) {

      if (status === 'ok') {
        window.location.pathname = '/account.js';
      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

};

loginObj.toggleLoginButton = function (checked) {

  var loginButton = document.getElementById('loginFormButton');

  if (checked) {
    // remove
    loginButton.type = 'submit';
    loginButton.onclick = null;
    loginButton.outerHTML = loginButton.outerHTML;

    var inputs = document.getElementsByClassName('loginField');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i] =  inputs[i].cloneNode(true);
    }

  } else {
    api.convertButton('loginFormButton', loginObj.loginUser, 'loginField');
  }

}

loginObj.init();
