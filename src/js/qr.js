var qr = {};

qr.init = function() {

  qr.setQr();

};

qr.removeQr = function() {
  qrPanel.style.display = 'none';
};

qr.showQr = function() {

  if (settings.get('qrMode')) {

    if (!qr.isAtTop()) {
      qrPanel.style.display = 'block';
    }

    document.getElementById('qrbody').value = document
      .getElementById('fieldMessage').value;

    document.getElementById('qrbody').focus();
  } else {

    if (settings.get('scrollPostFormMode')) {
      document.getElementById('fieldMessage').focus();
    }

  }
};

qr.registerSync = function(source, destination, field, event) {

  var sourceElement = document.getElementById(source);
  var destinationElement = document.getElementById(destination);

  destinationElement[field] = sourceElement[field];

  sourceElement.addEventListener(event, function() {
    if (destinationElement) {
      destinationElement[field] = sourceElement[field];
    }
  });

  destinationElement.addEventListener(event, function() {
    sourceElement[field] = destinationElement[field];
  });

};

qr.setQr = function() {

  var flags = document.getElementById('flagsDiv') ? true : false;

  var QRshowname = document.getElementById('fieldName') ? true : false;

  var textBoard = !document.getElementById('divUpload');

  var qrhtml = '';

  if (localStorage.getItem("dragTop") === null || localStorage.getItem("dragLeft") === null) {
    qrhtml += '<div id="quick-reply" style="right: 25px; top: 50px;">';
  } else {
    qrhtml += '<div id="quick-reply" style="left: '+ localStorage.dragLeft +'px; top: ' + localStorage.dragTop + 'px;">';
  }

  qrhtml += '<div id="post-form-inner">';
  qrhtml += '<table class="post-table"><tbody>';

  qrhtml += '<tr><th>'
  qrhtml += '<span class="handle">';
  qrhtml += '<a id="qrclose" class="close-btn"></a>';
  qrhtml += '{{ lang.quickReply }}</span>';
  qrhtml += '</th></tr>'

  qrhtml = qrhtml.replace("{{ lang.quickReply }}", lang.quickReply);

  if (QRshowname) {
    qrhtml += '<tr><td colspan="2"><input id="qrname" type="text"';
    qrhtml += ' maxlength="35" autocomplete="off" placeholder="Name"></td> </tr>';
  }

  qrhtml += '<tr><td colspan="2">';
  qrhtml += '<input id="qrsubject" type="text" maxlength="100" autocomplete="off" placeholder="{{ lang.subject }} ">';
  qrhtml += '<input id="qrsage" type="checkbox" title="Säge">'
  qrhtml += '<button accesskey="s" id="qrbutton" type="button"">{{ lang.reply }}</button>'
  qrhtml += '</td>';
  qrhtml = qrhtml.replace("{{ lang.subject }}", lang.subject);

  qrhtml += '</tr>';

  qrhtml += '<tr><td colspan="10"><textarea id="qrbody" rows="10" placeholder="{{ lang.comment }}">';
  qrhtml += '</textarea></td></tr> ';
  qrhtml = qrhtml.replace("{{ lang.comment }}", lang.comment);

  qrhtml += '<tr style="display:none;"><td colspan="2">';
  qrhtml += '<input id="qrpassword" type="password" placeholder="{{ lang.password }}"></td></tr>';
  qrhtml = qrhtml.replace("{{ lang.password }}", lang.password);

  var noFlagDiv = document.getElementById('noFlagDiv');

  if (noFlagDiv) {
    qrhtml += '<tr><td colspan="2"><input type="checkbox" ';
    qrhtml += 'id="qrcheckboxNoFlag" class="postingCheckbox">';
    qrhtml += '<label for="qrcheckboxNoFlag" class="spoilerCheckbox">';
    qrhtml += '{{ lang.noLocation2 }}</label></td></tr>';
    qrhtml = qrhtml.replace("{{ lang.noLocation2 }}", lang.noLocation2);
  }

  if (!api.hiddenCaptcha) {

    var parts = document.getElementsByClassName('captchaImage')[0].src
      .split('/');

    var lastPart = '/' + parts[parts.length - 1];

    qrhtml += '<tr><td colspan="2"><img src="' + lastPart;
    qrhtml += '"id="captchaImageQR" class="captchaImage" alt="captcha"></td></tr>';

    qrhtml += '<tr><td><input type="text" class="captchaField" ';
    qrhtml += 'id="QRfieldCaptcha" placeholder="{{ lang.answer }}"></td>';
    qrhtml = qrhtml.replace("{{ lang.answer }}", lang.answer);
    qrhtml += '</tr>';
  }

  qrhtml += '<tr style="display:none;"><td colspan="2"><input type="checkbox" ';
  qrhtml += 'id="qralwaysUseBypassCheckBox" class="postingCheckbox">';
  qrhtml += '<label for="qralwaysUseBypassCheckBox" class="spoilerCheckbox">';
  qrhtml += 'Make sure I have a block bypass</label></td></tr>';

  if (flags) {
    qrhtml += '<tr><td colspan="2"><div id="qrFlagsDiv"></div></td></tr>';
  }

  if (!textBoard) {
    qrhtml += ' <tr><td colspan="2"><div class="dropzone" id="dropzoneQr">';
    qrhtml += '{{ lang.dragFilesToUploadOrBrClickHereToSelectThem }}</div>';
    qrhtml += '<div id="selectedDivQr"></div></td> </tr>';
    qrhtml = qrhtml.replace("{{ lang.dragFilesToUploadOrBrClickHereToSelectThem }}", lang.dragFilesToUploadOrBrClickHereToSelectThem);
    qrhtml = qrhtml.replace("{{ lang.spoiler }}", lang.spoiler);
  }

  qrhtml = qrhtml.replace("{{ lang.reply }}", lang.reply);

  qrhtml += '</tbody> </table></div></div>';

  qrPanel = document.createElement('div');
  qrPanel.innerHTML = qrhtml;
  qrPanel = qrPanel.children[0];

  draggable.setDraggable(qrPanel, qrPanel.getElementsByClassName('handle')[0]);

  document.body.appendChild(qrPanel);

  document.getElementById('qrclose').onclick = qr.removeQr;
  document.getElementById('qrbutton').onclick = thread.postReply;

  qr.registerSync('checkboxSage', 'qrsage', 'checked', 'change');
  qr.registerSync('fieldSubject', 'qrsubject', 'value', 'input');
  qr.registerSync('fieldMessage', 'qrbody', 'value', 'input');
  qr.registerSync('fieldPostingPassword', 'qrpassword', 'value', 'input');
  qr.registerSync('alwaysUseBypassCheckBox', 'qralwaysUseBypassCheckBox',
      'checked', 'change');

  if (noFlagDiv) {
    qr.registerSync('checkboxNoFlag', 'qrcheckboxNoFlag', 'checked', 'change');
  }

  if (!textBoard) {
    postCommon.setDragAndDrop(true);

    for (var i = 0; i < selectedDiv.childNodes.length; i++) {
      var originalCell = selectedDiv.childNodes[i];
      var clonedCell = originalCell.cloneNode(true);

      clonedCell.getElementsByClassName('removeButton')[0].onclick = originalCell
          .getElementsByClassName('removeButton')[0].onclick;

      selectedDivQr.appendChild(clonedCell);
    }
  }

  if (flags) {

    document.getElementById('qrFlagsDiv').innerHTML = document
        .getElementById('flagsDiv').innerHTML.replace('flagCombobox',
        'qrFlagCombobox');

    qrFlagCombo = document.getElementById('qrFlagCombobox');

    postCommon.setFlagPreviews(qrFlagCombo)

    qr.registerSync('flagCombobox', 'qrFlagCombobox', 'value', 'change');

  }

  if (QRshowname) {
    qr.registerSync('fieldName', 'qrname', 'value', 'input');
  }

  if (!api.hiddenCaptcha) {
    qr.registerSync('fieldCaptcha', 'QRfieldCaptcha', 'value', 'input');
    var captchaImageQR = document.getElementById('captchaImageQR');
    if (captchaImageQR) {
      captchaImageQR.onclick = captchaUtils.reloadCaptcha;
    }
  }

};

qr.hideIfAtTop = function() {

  if (qr.isAtTop() || qrPanel.hidden)
    qrPanel.style.display = 'none';
  else
    qrPanel.style.display = 'block';

  // Work with thread update...
  if (!thread.unreadPosts) {
    return;
  }

  var rect = thread.lastPost.getBoundingClientRect();

  if (rect.bottom < window.innerHeight) {
    thread.unreadPosts = 0;

    document.title = thread.originalTitle;
  }
}

qr.isAtTop = function() {

  var postingForm = document.getElementById('postingForm');

  if (!postingForm)
    return false;

  var rect = postingForm.getBoundingClientRect();

  if (rect.bottom < window.pageYOffset)
    return false;
  else
    return true;

}

qr.setQRReplyText = function(text) {

  var qrReplyButton = document.getElementById('qrbutton');

  if (qrReplyButton) {
    qrReplyButton.innerHTML = text;
  }

};

qr.clearQRAfterPosting = function() {

  var qrMessageField = document.getElementById('qrbody');

  if (!qrMessageField) {
    return;
  }

  document.getElementById('qrsubject').value = '';
  qrMessageField.value = '';
  document.getElementById('qrsage').checked = false;

};

qr.setQRReplyEnabled = function(enabled) {

  var qrReplyButton = document.getElementById('qrbutton');

  if (qrReplyButton) {
    qrReplyButton.disabled = !enabled;
  }

};

qr.init();
