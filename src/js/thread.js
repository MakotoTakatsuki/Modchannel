var thread = {};

thread.init = function() {

  // For disabling post button while sending request (BUTTONDISABLE)
  thread.replyButton = document.getElementById('formButton');

  // Dollchan temporary workaround:
  thread.refreshTimer = true;

  thread.opCell = document.getElementsByClassName('opCell')[0];
  thread.postCells = document.getElementsByClassName('postCell');

  thread.refreshIndex = 0;
  thread.lastUpdatedPosts = {};
  thread.newData = {};

  thread.scrollFlag = false;

  thread.wsStatus = document.getElementById('labelWsStatus');
  thread.wsTry = 0;

  api.mod = !!document.getElementById('divMod');

  thread.qrButton = document.getElementById('qrButton');

  var qrMode = settings.get('qrMode');

  thread.qrButton.innerText = lang.quickReply + ' ' + (qrMode ? lang.on : lang.off).toUpperCase();

  thread.refreshButton = document.getElementById('refreshButton');

  thread.checkboxChangeRefresh = document.getElementById('checkboxChangeRefresh');

  if (!settings.get('autoRefreshMode')) {
    thread.checkboxChangeRefresh.checked = false;
  }

  thread.checkboxChangeLock = document.getElementById('checkboxChangeLock');

  api.hiddenCaptcha = !document.getElementById('captchaDiv');

  window.onscroll = function() {

    if (!thread.unreadPosts) {
      return;
    }

    var rect = thread.lastPost.getBoundingClientRect();

    if (rect.bottom < window.innerHeight) {
      thread.unreadPosts = 0;
      thread.hasUnreadYous = false;

      document.title = thread.originalTitle;
    }

  };

  thread.qrButton.onclick = function() {

    var qrMode = settings.get('qrMode');

    settings.set('qrMode', !qrMode);

    if (qrMode) {
      qr.removeQr();
    } else {
      qr.showQr();
      var quickReply = document.getElementById('quick-reply');
      quickReply.style.top = '50px';
      quickReply.style.right = '25px';
    }

    thread.qrButton.innerText = lang.quickReply + ' ' + (qrMode ? lang.off : lang.on).toUpperCase();

    var qrSetting = document.getElementById('checkbox-qrMode');
    if (qrSetting) {
      qrSetting.checked = !qrMode;
    }

    return undefined;
  };

  thread.refreshButton.onclick = function() {
    thread.refreshPosts(true);
    return undefined;
  };

  thread.checkboxChangeRefresh.onchange = thread.changeRefresh;
  thread.checkboxChangeLock.onchange = thread.changeLock;

  api.boardUri = document.getElementById('boardIdentifier').value;
  thread.divPosts = document.getElementsByClassName('divPosts')[0];

  thread.initThread();

  document.getElementsByClassName('divRefresh')[0].style.display = 'inline-block';

  thread.messageLimit = document.getElementById('labelMessageLength').innerHTML;
  thread.refreshLabel = document.getElementById('labelRefresh');

  thread.refreshButton = document.getElementById('refreshButton');

  if (document.getElementById('divArchive')) {
    api.convertButton('archiveFormButon', thread.archiveThread, 'archiveField');
  }

  if (document.getElementById('divMerge')) {
    api.convertButton('mergeFormButton', thread.mergeThread, 'mergeField');
  }

  if (document.getElementById('controlThreadIdentifier')) {

    api.convertButton('settingsFormButon', thread.saveThreadSettings,
        'threadSettingsField');

    if (document.getElementById('ipDeletionForm')) {
      api.convertButton('deleteFromIpFormButton', thread.deleteFromIp,
          'ipDeletionField');
    }

    if (document.getElementById('formTransfer')) {
      api.convertButton('transferFormButton', thread.transfer, 'transferField');
    }

    api.convertButton('inputBan', posting.banPosts, 'banField');
    api.convertButton('inputIpDelete', posting.deleteFromIpOnBoard);
    api.convertButton('inputThreadIpDelete', posting.deleteFromIpOnThread);
    api.convertButton('inputSpoil', posting.spoilFiles);

  }

  //thread.replyButton = document.getElementById('formButton');
  thread.replyButton.disabled = false; //not necessary?

  api.convertButton(thread.replyButton, thread.postReply);

  var replies = document.getElementsByClassName('postCell');

  if (replies && replies.length) {
    thread.lastReplyId = replies[replies.length - 1].id;
  }

  api.localRequest('/' + api.boardUri + '/res/' + api.threadId + '.json',
    function(error, data) {

      if (error) {
        return thread.changeRefresh();
      }

      try {
        data = JSON.parse(data);
      } catch (error) {
        return thread.changeRefresh();
      }

      thread.wssPort = data.wssPort;
      thread.wsPort = data.wsPort;
      thread.changeRefresh();
    }
  );

  var postingQuotes = document.getElementsByClassName('linkQuote');

  for (var i = 0; i < postingQuotes.length; i++) {
    thread.processPostingQuote(postingQuotes[i]);
  }

  window.onkeydown = function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.keyCode == 13 || e.keyCode == 10)) {
      thread.postReply();
    }
  };

  // thread.fixModLinks();

};

thread.initThread = function() {

  if (thread.retryTimer) {
    clearInterval(thread.retryTimer);
    delete thread.retryTimer;
  }
  thread.expectedPosts = [];
  thread.lastReplyId = 0;
  thread.originalTitle = document.title;
  posting.highLightedIds = [];
  posting.idsRelation = {};

  var ids = document.getElementsByClassName('labelId');

  for (i = 0; i < ids.length; i++) {
    posting.processIdLabel(ids[i]);
  }

  thread.unreadPosts = 0;
  thread.hasUnreadYous = false;
  api.threadId = +document.getElementsByClassName('opCell')[0].id;
  thread.refreshURL = '/' + api.boardUri + '/res/' + api.threadId + '.json';
  thread.refreshParameters = {
    boardUri : api.boardUri,
    threadId : api.threadId
  };

};

thread.initCells = function() {

  thread.lastUpdatedPosts[
    thread.getIdentFromCell(thread.opCell)
  ] = thread.refreshIndex;

  for (var i = 0; i < thread.postCells.length; i++) {
    thread.lastUpdatedPosts[
      thread.getIdentFromCell(thread.postCells[i])
    ] = thread.refreshIndex;
  }

};

thread.getIdentFromCell = function(cell) {

  var checkBoxName = cell.getElementsByClassName('deletionCheckBox')[0].name;
  var idents = checkBoxName.split('-');
  return idents[0] + '/' + idents[idents.length - 1];

};

thread.cacheNewData = function(threadData) {

  for (var i = 0; i < threadData.posts.length; i++) {
    var postData = threadData.posts[i];
    thread.newData[threadData.boardUri + '/' + postData.postId] = postData;
  }

  thread.newData[threadData.boardUri + '/' + threadData.threadId] = threadData;

};

thread.transfer = function() {

  var informedBoard = document.getElementById("fieldDestinationBoard").value
      .trim();

  var originThread = document.getElementById("transferThreadIdentifier").value;
  var originBoard = document.getElementById("transferBoardIdentifier").value;

  api.formApiRequest('transferThread', {
    boardUri : api.boardUri,
    threadId : api.threadId,
    boardUriDestination : informedBoard
  },
      function setLock(status, data) {

        if (status === 'ok') {
          window.location.pathname = '/' + informedBoard + '/res/' + data
              + '.html';
        } else {
          alert(status + ': ' + JSON.stringify(data));
        }
      });

};

thread.markPost = function(id) {

  if (isNaN(id)) {
    return;
  }

  if (thread.markedPosting && thread.markedPosting.className === 'markedPost') {
    thread.markedPosting.className = 'innerPost';
  }

  var container = document.getElementById(id);

  if (!container || container.className !== 'postCell') {
    return;
  }

  thread.markedPosting = container.getElementsByClassName('innerPost')[0];

  if (thread.markedPosting) {
    thread.markedPosting.className = 'markedPost';
  }

};

thread.insertInForm = function(text) {

  var txtarea = document.getElementById('fieldMessage');

  var scrollPos = txtarea.scrollTop;

  if (!settings.get('qrMode') || qr.isAtTop() || qrPanel.hidden) {
    var caretPos = txtarea.selectionStart;
    var front = (txtarea.value).substring(0, caretPos);
    var back = (txtarea.value).substring(txtarea.selectionEnd, txtarea.value.length);
  } else {
    var qrtxtarea = document.getElementById('qrbody');
    var caretPos = qrtxtarea.selectionStart;
    var front = (qrtxtarea.value).substring(0, caretPos);
    var back = (qrtxtarea.value).substring(qrtxtarea.selectionEnd, qrtxtarea.value.length);
  }

  txtarea.value = front + text + back;
  caretPos = caretPos + text.length;

  qr.showQr();

  if (!settings.get('qrMode') || qr.isAtTop() || qrPanel.hidden) {
    txtarea.scrollTop = scrollPos;
    txtarea.selectionStart = caretPos;
    txtarea.selectionEnd = caretPos;
  } else {
    qrtxtarea.selectionStart = caretPos;
    qrtxtarea.selectionEnd = caretPos;
  }

}

thread.parseLinkAndWrite = function(link) {

  var quote = link.href.match(/#q(\d+)/)[1]
  var insert_text = "";

  var selectedText = window.getSelection();
  if (selectedText != '') {
    var str = selectedText.toString();
    str = str.replace(/\n/g, '\n>');
    while(str.includes("\n>\n")) {
      str = str.replace(/\n>\n/g, '\n\n');
    }
    insert_text= '>>' + quote + '\n>' + str + '\n';
  } else {
    insert_text = '>>' + quote + '\n';
  }

  thread.insertInForm(insert_text);

};

thread.processPostingQuote = function(link) {

  link.onclick = function() {
    thread.parseLinkAndWrite(link);
  };

};

thread.mergeThread = function() {

  var informedThread = document.getElementById("fieldDestinationThread").value
      .trim();

  var destinationThread = document.getElementById("fieldDestinationThread").value;

  api.formApiRequest('mergeThread', {
    boardUri : api.boardUri,
    threadSource : api.threadId,
    threadDestination : destinationThread
  }, function setLock(status, data) {

    if (status === 'ok') {
      window.location.pathname = '/' + api.boardUri + '/res/'
          + destinationThread + '.html';
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

thread.archiveThread = function() {

  if (!document.getElementById('checkboxArchive').checked) {
    alert('You must confirm that you wish to archive this thread.');
    return;
  }

  api.formApiRequest('archiveThread', {
    confirmation : true,
    boardUri : api.boardUri,
    threadId : api.threadId
  }, function archived(status, data) {

    if (status === 'ok') {

      api.resetIndicators({
        locked : document.getElementsByClassName('lockIndicator').length,
        pinned : document.getElementsByClassName('pinIndicator').length,
        cyclic : document.getElementsByClassName('cyclicIndicator').length,
        archived : true
      });

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  });

};

thread.saveThreadSettings = function() {

  var pinned = document.getElementById('checkboxPin').checked;
  var locked = document.getElementById('checkboxLock').checked;
  var cyclic = document.getElementById('checkboxCyclic').checked;
  var autoSage = document.getElementById('checkboxAutoSage').checked;

  api.formApiRequest('changeThreadSettings', {
    boardUri : api.boardUri,
    threadId : api.threadId,
    pin : pinned,
    lock : locked,
    cyclic : cyclic,
    autoSage : autoSage
  }, function setLock(status, data) {

    if (status === 'ok') {

      api.resetIndicators({
        locked : locked,
        pinned : pinned,
        cyclic : cyclic,
        autoSage : autoSage,
        archived : document.getElementsByClassName('archiveIndicator').length
      });

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

thread.scrollDownToBottom = function(foundPosts) {

  if (thread.scrollFlag || (thread.autoLock && foundPosts)) {

    thread.scrollFlag = false;

    if (settings.get('scrollDownMode')) {
      window.scrollTo(0, document.body.scrollHeight);
    }

  }

}

thread.replyCallback = function(status, data) {

  if (status === 'ok') {

    thread.scrollFlag = true;

    postCommon.storeUsedPostingPassword(api.boardUri, api.threadId, data);

    document.getElementById('checkboxSage').checked = false;
    document.getElementById('fieldMessage').value = '';
    document.getElementById('fieldSubject').value = '';
    qr.clearQRAfterPosting();
    postCommon.clearSelectedFiles();

    if (!thread.autoRefresh || !thread.socket) {
      thread.refreshPosts(true, thread.scrollDown);
    }

    // BUTTONDISABLE
    thread.replyButton.disabled = false;
    qr.setQRReplyEnabled(true);

  } else {
    alert(status + ': ' + JSON.stringify(data));
    // BUTTONDISABLE
    thread.replyButton.disabled = false;
    qr.setQRReplyEnabled(true);
  }

};

thread.replyCallback.stop = function() {

  thread.replyButton.value = lang.post;

  qr.setQRReplyText(lang.reply);

  thread.replyButton.disabled = false;
  qr.setQRReplyEnabled(true);

};

thread.replyCallback.progress = function(info) {

  if (info.lengthComputable) {
    var newText = lang.uploading.replace('__percentage__', Math.floor((info.loaded / info.total) * 100));
    thread.replyButton.value = newText;

    qr.setQRReplyText(newText);
  }

};

thread.endThread = function(statusCode) {

  thread.wsStatusDeactivate();

  document.title = statusCode + ' - ' + thread.originalTitle;

  document.getElementById('formButton').disabled = true;
  document.getElementById('checkboxChangeLock').disabled = true;
  document.getElementById('checkboxChangeRefresh').disabled = true;
  document.getElementById('reportFormButton').disabled = true;
  document.getElementById('deleteFormButton').disabled = true;
  document.getElementsByClassName('deletionCheckBox').disabled = true;

  var qrbutton = document.getElementById('qrbutton');

  if (qrbutton) {
    qrbutton.disabled = true;
  }

  var deletionCheckBoxes = document.getElementsByClassName('deletionCheckBox');

  for (var i = 0; i < deletionCheckBoxes.length; i++) {
    deletionCheckBoxes[i].disabled = true;
  }

  var extraMenuButtons = document.getElementsByClassName('extraMenuButton');

  for (var i = 0; i < extraMenuButtons.length; i++) {
    extraMenuButtons[i].style = 'pointer-events: none;';
  }

  thread.setRefreshButtonState(false);
  thread.refreshingThread = false;

  if (settings.get('autoMarkAsDeleted')) {
    document.getElementsByClassName('opCell')[0].className = 'opCell thread404';
  }

};

thread.confirmThreadTransfer = function(newBoardUri, newThreadId) {
  var confirmationText = lang.threadMoved;
  confirmationText = confirmationText.replace('__boardUri__', thread.refreshParameters.boardUri);
  confirmationText = confirmationText.replace('__threadId__', thread.refreshParameters.threadId);
  confirmationText = confirmationText.replace('__boardUri2__', newBoardUri);
  confirmationText = confirmationText.replace('__threadId2__', newThreadId);

  var refreshPage = confirm(confirmationText);

  if (refreshPage) {
    location.reload();
  } else {
    thread.endThread('302');
  }
};

thread.restartTimerOnConditions = function(foundPosts) {

  if (thread.autoRefresh && !(!settings.get('noWs') && (thread.wsPort || thread.wssPort))) {
    thread.startTimer(thread.manualRefresh || foundPosts ? 5 : thread.lastRefresh * 2);
  }

};

thread.refreshCallback = function(error, receivedData) {

  thread.setRefreshButtonState(true);
  thread.setRefreshCounter(0, false);

  if ((api.mod && (error !== 'ok')) || (!api.mod && error)) {
    if (error == '404') {
      thread.endThread(error);
    } else if (error == 'Connection failed') {
      thread.restartTimerOnConditions(false);
      thread.refreshLabel.style = "color:red;";
    }
    return;
  }

  thread.refreshLabel.style = "";

  if (!api.mod) {
    receivedData = JSON.parse(receivedData);
  }

  if (thread.fullRefresh) {
    thread.lastReplyId = 0;
    thread.unreadPosts = 0;
    thread.hasUnreadYous = false;
    while (thread.divPosts.firstChild) {
      thread.divPosts.removeChild(thread.divPosts.firstChild);
    }

    document.title = thread.originalTitle;

  }

  var posts = receivedData.posts;

  var foundPosts = false;

  if (posts) {

    if (posts.length) {

      var lastReceivedPost = posts[posts.length - 1];

      foundPosts = lastReceivedPost.postId > thread.lastReplyId;

    }

    thread.cacheNewData(receivedData);

    if (receivedData.boardUri !== thread.refreshParameters.boardUri || receivedData.threadId !== thread.refreshParameters.threadId) {

      thread.confirmThreadTransfer(receivedData.boardUri, receivedData.threadId);

      return;

    }

    if (settings.get('autoMarkAsDeleted')) {

      thread.refreshIndex++;

      thread.lastUpdatedPosts[thread.refreshParameters.boardUri + '/' + thread.refreshParameters.threadId] = thread.refreshIndex;

      for (var i = 0; i < posts.length; i++) {
        thread.lastUpdatedPosts[thread.refreshParameters.boardUri + '/' + posts[i].postId] = thread.refreshIndex;
      }

      thread.modifyCells();

    }

    if (thread.wsTry < 3) {
      thread.wsPort = receivedData.wsPort;
      thread.wssPort = receivedData.wssPort;
    }

    tooltips.cacheData(receivedData);

    for (var i = 0; i < posts.length; i++) {

      var post = posts[i];

      if (post.postId > thread.lastReplyId) {
        thread.addUnreadPost(post);
      }

    }

    if (!thread.fullRefresh && thread.unreadPosts) {

      var yousPrefixLabel = thread.hasUnreadYous ? '\'' : '';
      var prefix = '(' + thread.unreadPosts + yousPrefixLabel + ') ';

      document.title = prefix + thread.originalTitle;
    }

    if (thread.expectedPosts.length && !thread.retryTimer) {

      thread.expectedPosts = [];

      thread.retryTimer = setTimeout(function() {

        delete thread.retryTimer;

        if (!thread.refreshingThread) {
          thread.refreshPosts();
        }

      }, 10000);
    }

  }

  thread.restartTimerOnConditions(foundPosts);

  thread.scrollDownToBottom(foundPosts);

};

thread.modifySingleCell = function(cell, ident) {

  if (thread.lastUpdatedPosts[ident] !== thread.refreshIndex) {
    dynDel.markCellPostAsDeleted(cell);
  } else {
    thread.updateCellChanges(cell, ident);
    thread.lastUpdatedPosts[ident] = thread.refreshIndex;
  }

}

thread.updateCellChanges = function(cell, ident) {

  var knownPost = tooltips.knownData[ident];
  var newPost = thread.newData[ident];

  if (knownPost) {

    if (knownPost.files.length > newPost.files.length) {
      dynDel.deleteMissingFiles(cell, knownPost.files, newPost.files);
    }

    var inner = knownPost.threadId ? cell.getElementsByClassName('innerOP')[0] : cell.getElementsByClassName('innerPost')[0];

    if (knownPost.banMessage !== newPost.banMessage) {
      var divBanMessage = inner.getElementsByClassName('divBanMessage')[0];
      if (!divBanMessage) {
        divBanMessage = document.createElement('div');
        divBanMessage.className = 'divBanMessage';
        inner.appendChild(divBanMessage);
      }
      divBanMessage.innerText = newPost.banMessage;
    }

    if (knownPost.lastEditTime !== newPost.lastEditTime) {
      var divMessage = inner.getElementsByClassName('divMessage')[0];
      divMessage.innerHTML = newPost.markdown;

      var editedLabel = inner.getElementsByClassName('labelLastEdit')[0];

      if (!editedLabel) {
        editedLabel = document.createElement('div');
        editedLabel.className = 'labelLastEdit';
        inner.appendChild(editedLabel);
      }

      posting.setLastEditedLabel(newPost, cell)
      var labelSubject = inner.getElementsByClassName('labelSubject')[0];
      if (!labelSubject) {
        var refElement = inner.getElementsByClassName('linkName')[0];
        labelSubject = document.createElement('span');
        labelSubject.className = 'labelSubject';
        inner.getElementsByClassName('title')[0].insertBefore(labelSubject, refElement);
        inner.getElementsByClassName('title')[0].insertBefore(document.createTextNode(' '), refElement);
      }
      labelSubject.innerText = newPost.subject;
    }

  }

}

thread.modifyCells = function() {

  var ident = thread.getIdentFromCell(thread.opCell);
  thread.updateCellChanges(thread.opCell, ident);

  for (var i = 0; i < thread.postCells.length; i++) {
    ident = thread.getIdentFromCell(thread.postCells[i]);
    if (thread.lastUpdatedPosts[ident] === thread.refreshIndex - 1) {
      thread.modifySingleCell(thread.postCells[i], ident);
    } else {
      thread.updateCellChanges(thread.postCells[i], ident);
    }
  }

};

thread.addUnreadPost = function(post) {

  post.deleted = false;

  var postCell = posting.addPost(post, api.boardUri, api.threadId);

  thread.divPosts.appendChild(postCell);

  var expandCheckBox = postCell.getElementsByClassName('expandCheckBox')[0];

  if (!expandComment.isSafari) {
    expandComment.apply(expandCheckBox, expandCheckBox.parentNode);
  }

  thread.lastPost = postCell;
  thread.lastReplyId = post.postId;
  thread.unreadPosts++;

  if (settings.get('showYous') && thread.hasPostCellYou(postCell)) {
    thread.hasUnreadYous = true;
  }

  if (thread.expectedPosts.indexOf(post.postId) >= 0) {
    thread.expectedPosts.splice(thread.expectedPosts
      .indexOf(post.postId), 1);
  }

};

thread.hasPostCellYou = function(postCell) {

  var quotes = postCell.querySelectorAll('.quoteLink,.highlightlink');
  var userPosts = tooltips.getUserPosts();

  for (i = 0; i < quotes.length; i++) {
    if(userPosts.indexOf(quotes[i].text) !== -1) {
      return true;
    }
  }

  return false;

};

thread.refreshCallback.stop = function() {

  thread.refreshingThread = false;

};

thread.setRefreshButtonState = function(enabled) {
  if (enabled) {
    thread.refreshButton.style = '';
  } else {
    thread.refreshButton.style = 'pointer-events: none; opacity: 0.3;';
  }
}

thread.setRefreshCounter = function(seconds, loading) {
  if (seconds < 1) {
    thread.refreshLabel.innerHTML = loading ? lang.updating: '';
    thread.refreshLabel.className = loading ? 'loading' : '';
  } else {
    thread.refreshLabel.innerHTML = seconds;
    thread.refreshLabel.className = '';
  }
}

thread.refreshPosts = function(manual, full) {

  thread.manualRefresh = manual;
  thread.fullRefresh = full;

  if (thread.refreshingThread || manual) {
    clearInterval(thread.refreshTimer);
  }

  thread.setRefreshButtonState(false);
  thread.setRefreshCounter(0, true);

  thread.refreshingThread = true;

  if (api.mod) {
    api.formApiRequest('mod', {}, thread.refreshCallback, true,
        thread.refreshParameters);
  } else {
    api.localRequest(thread.refreshURL, thread.refreshCallback);
  }

};

thread.sendReplyData = function(files, captchaId) {

  var forcedAnon = !document.getElementById('fieldName');
  var hiddenFlags = !document.getElementById('flagsDiv');

  if (!hiddenFlags) {
    var combo = document.getElementById('flagCombobox');

    var selectedFlag = combo.options[combo.selectedIndex].value;

    postCommon.savedSelectedFlag(selectedFlag);

  }

  if (!forcedAnon) {
    var typedName = document.getElementById('fieldName').value.trim();
    localStorage.setItem('name', typedName);
  }

  // var typedEmail = document.getElementById('fieldEmail').value.trim();
  var typedMessage = document.getElementById('fieldMessage').value.trim();
  var typedSubject = document.getElementById('fieldSubject').value.trim();
  var typedPassword = document.getElementById('fieldPostingPassword').value
      .trim();

  if (!typedMessage.length && !files.length) {
    alert(lang.messageOrFileMandatory);
    // BUTTONDISABLE
    thread.replyButton.disabled = false;
    qr.setQRReplyEnabled(true);
    return;
  } else if (!forcedAnon && typedName.length > 32) {
    alert(lang.nameTooLong.replace('__limit__', 32));
    // BUTTONDISABLE
    thread.replyButton.disabled = false;
    qr.setQRReplyEnabled(true);
    return;
  } else if (typedMessage.length > thread.messageLimit) {
    var diff = typedMessage.length - thread.messageLimit;
    var messageTooLong = lang.messageTooLong.replace('__limit__', parseInt(thread.messageLimit) + 1);
    messageTooLong = messageTooLong.replace('__chars__', diff === 1 ? lang.oneMale : diff);
    messageTooLong = messageTooLong.replace('__character__', diff === 1 ? lang.characterSingular : lang.characterPlural);
    alert(messageTooLong);
    // BUTTONDISABLE
    thread.replyButton.disabled = false;
    qr.setQRReplyEnabled(true);
    return;
    /*
  } else if (typedEmail.length > 64) {
    alert('E-mail is too long, keep it under 64 characters.');
    return;
    */
  } else if (typedSubject.length > 128) {
    alert(lang.subjectTooLong.replace('__limit__', 128));
    // BUTTONDISABLE
    thread.replyButton.disabled = false;
    qr.setQRReplyEnabled(true);
    return;
  } else if (typedPassword.length > 8) {
    typedPassword = typedPassword.substring(0, 8);
  }

  if (!typedPassword) {
    typedPassword = Math.random().toString(36).substring(2, 10);
  }

  localStorage.setItem('deletionPassword', typedPassword);

  var spoilerCheckBox = document.getElementById('checkboxSpoiler');

  var noFlagCheckBox = document.getElementById('checkboxNoFlag');

  var checkboxSage = document.getElementById('checkboxSage');

  thread.replyButton.value = lang.uploading.replace('__percentage__', 0);
  qr.setQRReplyText(thread.replyButton.value);
  //thread.replyButton.disabled = true; // Not necessary
  //qr.setQRReplyEnabled(false);

  api.formApiRequest('replyThread', {
    name : forcedAnon ? null : typedName,
    flag : hiddenFlags ? null : selectedFlag,
    captcha : captchaId,
    subject : typedSubject,
    noFlag : noFlagCheckBox ? noFlagCheckBox.checked : false,
    spoiler : spoilerCheckBox ? spoilerCheckBox.checked : false,
    sage: checkboxSage ? checkboxSage.checked : false,
    password : typedPassword,
    message : typedMessage,
    // email : typedEmail,
    files : files,
    boardUri : api.boardUri,
    threadId : api.threadId
  }, thread.replyCallback);

};

thread.processFilesToPost = function(captchaId) {

  postCommon.newGetFilesToUpload(function gotFiles(files) {

    // see if there's an oekaki file to add
    if (typeof($)!='undefined' && oekaki.expanded != false) {
       var dataURI = $('#wPaint').wPaint('image');
      files.unshift({
        name : 'oekaki.png',
        content: oekaki.dataURLtoBlob(dataURI),
        mime : 'image/png',
        spoiler : document.getElementById('checkboxSpoiler').checked
      });
      //$('#wPaint').wPaint('clear');
    }
    // end oekaki

    thread.sendReplyData(files, captchaId);
  });

};

thread.processReplyRequest = function() {

  if (api.hiddenCaptcha) {
    thread.processFilesToPost();
  } else {
    var typedCaptcha = document.getElementById('fieldCaptcha').value.trim();

    if (/\W/.test(typedCaptcha)) {
      alert(lang.invalidCaptcha);
      // BUTTONDISABLE
      thread.replyButton.disabled = false;
      qr.setQRReplyEnabled(true);
      return;
    }

    if (typedCaptcha.length == 112) {
      thread.processFilesToPost(typedCaptcha);
    } else {
      var parsedCookies = api.getCookies();

      api.formApiRequest('solveCaptcha', {

        captchaId : parsedCookies.captchaid,
        answer : typedCaptcha
      }, function solvedCaptcha(status, data) {

        if (status !== 'ok') {
          alert(status);
          // BUTTONDISABLE
          thread.replyButton.disabled = false;
          qr.setQRReplyEnabled(true);
          return;
        }

        thread.processFilesToPost(parsedCookies.captchaid);
      });
    }

  }

};

thread.postReply = function() {

  // BUTTONDISABLE
  thread.replyButton.disabled = true;
  qr.setQRReplyEnabled(false);

  api.formApiRequest('blockBypass', {},
      function checked(status, data) {

        if (status !== 'ok') {
          alert(data);
          // BUTTONDISABLE
          thread.replyButton.disabled = false;
          qr.setQRReplyEnabled(true);
          return;
        }

        var alwaysUseBypass = document
            .getElementById('alwaysUseBypassCheckBox').checked;

        if (!data.valid
            && (data.mode == 2 || (data.mode == 1 && alwaysUseBypass))) {

          postCommon.displayBlockBypassPrompt(function() {
            thread.processReplyRequest();
          });

        } else {
          thread.processReplyRequest();
        }

      });

};

thread.transition = function() {

  if (!thread.autoRefresh) {
    return;
  }

  if (thread.wssPort || thread.wsPort) {
    thread.stopWs();
    thread.startWs();
  } else {
    thread.currentRefresh = 5;
  }

};

thread.stopWs = function() {

  if (!thread.socket) {
    return;
  }

  thread.socket.close();
  delete thread.socket;

};

thread.wsStatusInit = function() {
  thread.wsStatus.title = 'WebSocket connecting...';
  thread.wsStatus.className = 'dot';
  thread.wsStatus.style = 'background-color: yellow;';
};

thread.wsStatusActivate = function() {
  thread.wsStatus.title = 'Websocket OK';
  thread.wsStatus.className = 'dot pulse';
  thread.wsStatus.style = 'background-color: green;'
};

thread.wsStatusDeactivate = function() {
  thread.wsStatus.title = 'Websocket closed';
  thread.wsStatus.classList.remove('pulse');
  thread.wsStatus.style = 'background-color: red;'
};

thread.startWs = function() {

  var isOnion = location.hostname.split('.').slice(-1)[0] === 'onion' || location.hostname.split('.').slice(-1)[0] === 'i2p';
  var isLocalhost = location.hostname === 'localhost';

  var protocol = !isOnion && !isLocalhost ? 'wss' : 'ws';
  var wsPort = thread.wssPort || thread.wsPort;

  if (isOnion && location.protocol == 'https:') {
    protocol = 'wss';
    wsPort = 8444;
  }

  thread.socket = new WebSocket(protocol + '://' + window.location.hostname
    + ':' + wsPort);

  thread.wsStatusInit();

  thread.socket.onopen = function(event) {
    thread.wsTry = 0;
    thread.socket.send(api.boardUri + '-' + api.threadId);
    thread.wsStatusActivate();
    setTimeout(function() {
      if (!thread.refreshingThread) {
        thread.refreshPosts();
      }
    }, 200);
  };

  thread.socket.onclose = function(event) {
    if (thread.wsTry++ >= 2) {
      delete thread.wsPort;
      delete thread.wssPort;
      thread.changeRefresh();
      thread.wsStatus.style = 'display: none;';
      return;
    }
    thread.wsStatusDeactivate();
    thread.stopWs();
    if (thread.autoRefresh) {
      setTimeout(thread.startWs, 5000)
    }
  }

 // thread.socket.onerror = function(error) {
 //   delete thread.wsPort;
 //   delete thread.wssPort;
 //   thread.changeRefresh();
 // };

  thread.socket.onmessage = function(message) {

    message = JSON.parse(message.data);

    switch (message.action) {
      case 'post': {

        thread.expectedPosts.push(message.target[0]);

        setTimeout(function() {
          if (!thread.refreshingThread) {
            thread.refreshPosts();
          }
        }, 200);

        break;
      }
      case 'edit': {
        setTimeout(function() {
          thread.refreshPosts(true);
        }, 200);
        break;
      }
      case 'delete': {

        for (var i = 0; i < message.target.length; i++) {

          var post = document.getElementById(message.target[i]);

          if (!post) {
            continue;
          }

          dynDel.markCellPostAsDeleted(post, false);

        }

        break;
      }
      case '404': {
        if (thread.socket.readyState === WebSocket.OPEN) {
          thread.socket.close();
        }
        thread.endThread('404');

        break;
      }
      case 'transfer': {
        if (thread.socket.readyState === WebSocket.OPEN) {
          thread.socket.close();
        }
        thread.confirmThreadTransfer(message.target.newBoardUri, message.target.newThreadId);

        break;
      }
    }

  };

};

thread.startTimer = function(time) {

  if (time > 600) {
    time = 600;
  }

  thread.currentRefresh = time;
  thread.lastRefresh = time;
  thread.refreshLabel.innerHTML = thread.currentRefresh;
  thread.refreshLabel.className = '';
  thread.refreshTimer = setInterval(function checkTimer() {

    thread.currentRefresh--;

    if (!thread.currentRefresh) {
      clearInterval(thread.refreshTimer);
      thread.refreshPosts();
      thread.refreshLabel.innerHTML = lang.updating;
      thread.refreshLabel.className = 'loading';
    } else {
      thread.setRefreshCounter(thread.currentRefresh, false);
    }

  }, 1000);
};

thread.changeRefresh = function() {

  thread.autoRefresh = document.getElementById('checkboxChangeRefresh').checked;

  if (!thread.autoRefresh) {
    thread.setRefreshCounter(0, false);

    thread.stopWs();

    clearInterval(thread.refreshTimer);
  } else {

    if (!JSON.parse(localStorage.noWs || 'false')
      && (thread.wsPort || thread.wssPort)) {
      thread.startWs();
    } else {
      thread.startTimer(5);
    }

  }

};

thread.changeLock = function() {

  thread.autoLock = document.getElementById('checkboxChangeLock').checked;

};

thread.deleteFromIp = function() {

  var typedIp = document.getElementById('ipField').value.trim();
  var typedBoards = document.getElementById('fieldBoards').value.trim();

  if (!typedIp.length) {
    alert('An ip is mandatory');
    return;
  }

  api.formApiRequest('deleteFromIp', {
    ip : typedIp,
    boards : typedBoards
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      document.getElementById('ipField').value = '';
      document.getElementById('fieldBoards').value = '';

      alert('Postings deleted.');

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

thread.fixModLinks = function() {
  if (window.location.pathname == "/mod.js") {
    var regexBoardMatch = /^\?boardUri=(\w+)(&|$)/;
    var regexMultiMatch = /(\d+)\.html#(\d+)$/;
    var regexMultiMatchQ = /(\d+)\.html#q(\d+)$/;
    var currentThread = window.location.search.match(/\d+/)[0];
    var quoteLinks = document.querySelectorAll(".quoteLink");
    for (i = 0; i < quoteLinks.length; i++) {
      var match = regexMultiMatch.exec(quoteLinks[i].href)
      if(match[1] == currentThread) {
        quoteLinks[i].href = "#" + match[2];
      }
    }

    var linkQuotes = document.querySelectorAll(".linkQuote");
    for (i = 0; i < linkQuotes.length; i++) {
      var match = regexMultiMatchQ.exec(linkQuotes[i].href)
      if(match[1] == currentThread) {
        linkQuotes[i].href = "#q" + match[2];
      }
    }

    var backLinks = document.getElementsByClassName("panelBacklinks");
    for (i = 0; i < backLinks.length; i++) {
      for (j = 0; j < backLinks[i].children.length; j++) {
        var match = regexMultiMatch.exec(backLinks[i].children[j].href)
        if (match[1] == currentThread) {
          backLinks[i].children[j].href = "#" + match[2];
        }
      }
    }
    var match = regexBoardMatch.exec(window.location.search)
    document.getElementById("postingForm").children[1].children[0].href = "/" + match[1] + "/";
  }
}

thread.init();
