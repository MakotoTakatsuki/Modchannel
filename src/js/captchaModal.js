var captchaModal = {};

captchaModal.addModalRow = function(label, element, action) {

  var tableBody = document.getElementsByClassName('modalTableBody')[0];

  var tableRow = document.createElement('tr');
  tableBody.appendChild(tableRow);

  var labelElement = document.createElement('th');
  labelElement.innerHTML = label;

  tableRow.appendChild(labelElement);

  var fieldHolder = document.createElement('td');

  fieldHolder.appendChild(element);

  tableRow.appendChild(fieldHolder);

  if (action) {

    element.addEventListener('keydown', function(event) {

      if (event.key === 'Enter') {

        action();

        event.preventDefault();
      }

    });

  }

};

captchaModal.getCaptchaModal = function(header, noCaptcha) {

  var outerPanel = document.createElement('div');
  outerPanel.className = 'modalPanel';
  document.body.appendChild(outerPanel);

  var innerPanel = document.createElement('div');
  innerPanel.className = 'modalInnerPanel';
  outerPanel.appendChild(innerPanel);

  var decorationPanel = document.createElement('div');
  decorationPanel.className = 'modalDecorationPanel';
  innerPanel.appendChild(decorationPanel);

  var topLabel = document.createElement('span');
  topLabel.className = 'modalHeader';
  topLabel.innerHTML = header;
  decorationPanel.appendChild(topLabel);

  var innerDecorationPanel = document.createElement('div');
  innerDecorationPanel.className = 'modalInnerDecorationPanel';
  decorationPanel.appendChild(innerDecorationPanel);

  if (!noCaptcha) {
    document.cookie = 'captchaid=; patch/;';

    var captchaImageContainer = document.createElement('div');
    captchaImageContainer.className = 'captchaImageContainer';

    var captchaImage = document.createElement('img');
    captchaImage.src = '/captcha.js?d=' + new Date().toString();
    captchaImage.className = 'captchaImage';
    captchaImage.title = lang.clickToReload;
    captchaImageContainer.appendChild(captchaImage);

    var captchaControls = document.createElement('span');
    captchaControls.className = 'modalCaptchaControls';
    captchaImageContainer.appendChild(captchaControls);

    captchaImage.addEventListener('click', function() {
      captchaUtils.reloadCaptcha()
    });

    var reloadTimer = document.createElement('span');
    reloadTimer.className = 'captchaTimer';
    captchaControls.appendChild(reloadTimer);

    innerDecorationPanel.appendChild(captchaImageContainer);
  }

  var captchaTable = document.createElement('table');
  captchaTable.className = 'modalCaptchaTable';
  var tableBody = document.createElement('tbody');
  tableBody.className = 'modalTableBody';
  captchaTable.appendChild(tableBody);
  innerDecorationPanel.appendChild(captchaTable);

  var okButton = document.createElement('input');
  okButton.type = 'button';
  okButton.className = 'modalOkButton';
  okButton.value = lang.okButton;

  if (!noCaptcha) {

    var captchaField = document.createElement('input');
    captchaField.type = 'text';
    captchaField.className = 'modalAnswer captchaField';

    captchaModal.addModalRow(lang.answer, captchaField, function() {
      okButton.onclick();
    });

  }

  var responseButtonsPanel = document.createElement('span');
  decorationPanel.appendChild(responseButtonsPanel);

  innerDecorationPanel.appendChild(okButton);

  var cancelButton = document.createElement('input');
  cancelButton.className = 'cancelButton';
  cancelButton.type = 'button';
  cancelButton.value = lang.cancelButton;
  cancelButton.onclick = function() {
    outerPanel.remove();
    // BUTTONDISABLE
    if (typeof thread !== "undefined" && typeof thread.replyButton !== "undefined") {
      thread.replyButton.disabled = false;
      qr.setQRReplyEnabled(true);
    }

  };
  innerDecorationPanel.appendChild(cancelButton);

  return outerPanel;

};
