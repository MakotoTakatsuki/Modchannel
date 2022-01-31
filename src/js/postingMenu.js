var postingMenu = {};

postingMenu.init = function() {

  postingMenu.quickBanLabels = [
    lang.quickBanEmpty,
    lang.quickBanPurge,
    "Deutsch"
  ];
  postingMenu.banLabels = [
    lang.ipBypassBan,
    lang.rangeBanOctets.replace('__octets__', '1/2'),
    lang.rangeBanOctets.replace('__octets__', '3/4'),
    lang.asnBan,
    lang.ipBypassWarning
  ];
  postingMenu.deletionOptions = [
    lang.doNotDelete,
    lang.deletePost,
    lang.deletePostAndMedia,
    lang.deleteByIpBypass
  ];
  postingMenu.threadSettingsList = [ {
    label : lang.toggleLock,
    field : 'locked',
    parameter : 'lock'
  }, {
    label : lang.togglePin,
    field : 'pinned',
    parameter : 'pin'
  }, {
    label : lang.toggleCyclic,
    field : 'cyclic',
    parameter : 'cyclic'
  }, {
    label : lang.toggleAutosage,
    field : 'autoSage',
    parameter : 'autoSage'
  } ];

  document.body.addEventListener('click', function clicked(event) {

    if (postingMenu.shownPostingMenu) {
      postingMenu.shownPostingMenu.remove();
      delete postingMenu.shownPostingMenu;
      if(event.rangeParent !== null && event.rangeParent.className == "extraMenuButton") {
        event.stopPropagation();
      }
    }

  }, true);

  if (location.hostname.split('.')[0] === 'mod' || location.hostname === 'localhost' || location.hostname.includes('4keks')) {

    api.formApiRequest('account', {}, function gotLoginData(status, data) {

      if (status !== 'ok') {
        return;
      }

      postingMenu.loggedIn = true;

      postingMenu.globalRole = data.globalRole;
      postingMenu.noBanCaptcha = data.noCaptchaBan;

      postingMenu.moddedBoards = [];

      for (var i = 0; i < data.ownedBoards.length; i++) {
        postingMenu.moddedBoards.push(data.ownedBoards[i]);
      }

      for (i = 0; i < data.volunteeredBoards.length; i++) {
        postingMenu.moddedBoards.push(data.volunteeredBoards[i]);
      }

    }, {}, true);

  }

  var links = document.getElementsByClassName('linkSelf');

  for (var i = 0; i < links.length; i++) {
    postingMenu.setExtraMenu(links[i]);
  }

};

postingMenu.showReport = function(board, thread, post, callback) {

  var outerPanel = captchaModal.getCaptchaModal(lang.report2, api.noReportCaptcha);

  var categoriesCombobox = document.getElementById('reportComboboxCategory');

  var reasonField = document.createElement('input');
  reasonField.type = 'text';
  reasonField.placeholder = lang.optional;

  var globalSpan = document.createElement('span');
  var globalCheckbox = document.createElement('input');
  globalCheckbox.id = "globalCheckbox";
  globalCheckbox.type = 'checkbox';
  var globalLabel = document.createElement('label');
  var globalRulesLink = document.createElement('a');
  globalRulesLink.innerText = lang.globalRules;
  globalRulesLink.setAttribute('target', '_blank');
  globalRulesLink.href = '/.static/pages/globalRules.html';
  globalLabel.innerHTML = lang.violatesGlobalRules.replace('__globalRules__', globalRulesLink.outerHTML);
  globalLabel.setAttribute('for', globalCheckbox.id);
  globalSpan.appendChild(globalCheckbox);
  globalSpan.appendChild(globalLabel);

  if (categoriesCombobox) {

    var newCategoriesCombobox = categoriesCombobox.cloneNode(true);
    newCategoriesCombobox.id = null;

    categories.adjustGlobalCheckbox(globalCheckbox, newCategoriesCombobox.value);

    newCategoriesCombobox.onchange = function(e) {
      categories.adjustGlobalCheckbox(globalCheckbox, newCategoriesCombobox.value);
    };

  }

  var okButton = outerPanel.getElementsByClassName('modalOkButton')[0];

  okButton.onclick = function() {

    var params = {
      reasonReport : reasonField.value.trim(),
      globalReport : globalCheckbox.checked,
      action : 'report'
    };

    if (!api.noReportCaptcha) {

      var typedCaptcha = outerPanel.getElementsByClassName('modalAnswer')[0].value
        .trim();

      if (/\W/.test(typedCaptcha)) {
        alert(lang.invalidCaptcha);
        return;
      }

      params.captchaReport = typedCaptcha;

    }

    if (categoriesCombobox) {
      params.categoryReport = newCategoriesCombobox.options[newCategoriesCombobox.selectedIndex].value;
    }

    var key = board + '-' + thread;

    if (post) {
      key += '-' + post;
    }

    params[key] = true;

    api.formApiRequest('contentActions', params, function requestComplete(
        status, data) {

      if (status === 'ok') {
        outerPanel.remove();
        alert(lang.reportSuccess);
        callback();
      } else {
        alert(status + ': ' + JSON.stringify(data));
      }

    });

  };

  if (categoriesCombobox) {
    captchaModal.addModalRow('Category', newCategoriesCombobox);
  }
  captchaModal.addModalRow(lang.comment, reasonField, okButton.onclick);
  captchaModal.addModalRow(lang.global, globalSpan, okButton.onclick);

};

postingMenu.deleteSinglePost = function(boardUri, threadId, post, fromIp,
    unlinkFiles, wipeMedia, innerPart, forcedPassword, onThread, trash) {

  var key = boardUri + '/' + threadId

  if (post) {
    key += '/' + post;
  }

  var storedData = JSON.parse(localStorage.postingPasswords || '{}');

  var deletionFieldPassword = false;

  if (document.getElementById('deletionFieldPassword')) {
    deletionFieldPassword = document.getElementById('deletionFieldPassword').value.trim()
  }

  var password = forcedPassword || storedData[key]
      || localStorage.deletionPassword
      || deletionFieldPassword
      || Math.random().toString(36).substring(2, 10);

  var selectedAction;

  if (trash) {
    selectedAction = 'trash';
  } else if (fromIp) {
    selectedAction = onThread ? 'thread-ip-deletion' : 'ip-deletion';
  } else {
    selectedAction = 'delete';
  }

  var params = {
    confirmation : true,
    password : password,
    deleteUploads : unlinkFiles,
    deleteMedia : wipeMedia,
    action : selectedAction
  };

  var key = boardUri + '-' + threadId;

  if (post) {
    key += '-' + post;
  }

  params[key] = true;

  var deletionCb = function requestComplete(status, data) {

    if (status !== 'ok') {
      alert(status + ': ' + JSON.stringify(data));
      return;
    }

    var data = data || {};

    var removed = data.removedThreads || data.removedPosts;

    if (unlinkFiles && removed) {

      innerPart.parentNode.classList.remove('multipleUploads');

      var uploadCells = innerPart.getElementsByClassName('uploadCell');

      for (var i = 0; i < uploadCells.length; i++) {

        dynDel.markUploadCellAsDeleted(uploadCells[i], true);

      }

    } else if (fromIp) {

      dynDel.markCellPostAsDeleted(innerPart.parentNode, true);

      if (confirm(lang.postingsDeleted)) {
        if (api.isBoard || !api.boardUri) {
          location.reload(true);
        } else {
          window.location.pathname = '/' + boardUri + '/';
        }
      }

    } else if (api.threadId && data.removedThreads) {
      window.location.pathname = '/' + boardUri + '/';
    } else if (removed) {

      var uploadCells = innerPart.getElementsByClassName('uploadCell');

      dynDel.markCellPostAsDeleted(innerPart.parentNode, true);

    } else if (!removed) {

      var newPass = prompt(lang.couldNotDeleteTryAnotherPassword);

      if (newPass) {
        postingMenu.deleteSinglePost(boardUri, threadId, post, fromIp,
          unlinkFiles, wipeMedia, innerPart, newPass, onThread, trash);
      }

    }

  };

  api.formApiRequest('contentActions', params, deletionCb);

};

postingMenu.applySingleBan = function(statusHideCheckbox, typedMessage, deletionOption,
    typedReason, typedCaptcha, banType, typedDuration, global, nonBypassable,
    boardUri, thread, post, innerPart, outerPanel) {


  localStorage.setItem('autoDeletionOption', deletionOption);

  var params = {
    action : deletionOption === 1 ? 'ban-delete' : 'ban',
    nonBypassable : nonBypassable,
    reasonBan : typedReason,
    captchaBan : typedCaptcha,
    banType : banType,
    duration : typedDuration,
    banMessage : typedMessage,
    hideBan : statusHideCheckbox,
    globalBan : global
  };

  var key = boardUri + '-' + thread;

  if (post) {
    key += '-' + post;
  }

  params[key] = true;

  api.formApiRequest('contentActions', params, function requestComplete(status,
      data) {

    if (status === 'ok') {

      if (!statusHideCheckbox) {

        var banMessageDiv = innerPart.getElementsByClassName('divBanMessage')[0];

        if (!banMessageDiv) {
          banMessageDiv = document.createElement('div');
          banMessageDiv.className = 'divBanMessage';
          innerPart.appendChild(banMessageDiv);
        }

        banMessageDiv.innerHTML = typedMessage
            || '(' + lang.userWasBannedForThisPost + ')';

      }

      outerPanel.remove();

      if (deletionOption > 1) {
        postingMenu.deleteSinglePost(boardUri, thread, post,
          deletionOption === 3, false, deletionOption === 2, innerPart);
      } else if (deletionOption) {
        innerPart.parentNode.remove();
      }

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

postingMenu.banSinglePost = function(innerPart, boardUri, thread, post, global) {

  var useCaptcha = !(postingMenu.globalRole < 4 || postingMenu.noBanCaptcha);

  var outerPanel = captchaModal.getCaptchaModal(global ? 'Global ban' : 'Ban',
    !useCaptcha);

  var okButton = outerPanel.getElementsByClassName('modalOkButton')[0];

  var reasonField = document.createElement('input');
  reasonField.type = 'text';

  var durationField = document.createElement('input');
  durationField.type = 'text';
  durationField.value = '12h';

  var messageField = document.createElement('input');
  messageField.type = 'text';
  messageField.value = '(' + lang.userWasBannedForThisPost + ')';

  var hideCheckbox = document.createElement('input');
  hideCheckbox.type = 'checkbox';

  var typeCombo = document.createElement('select');

  for (var i = 0; i < postingMenu.banLabels.length; i++) {

    var option = document.createElement('option');
    option.innerHTML = postingMenu.banLabels[i];
    typeCombo.appendChild(option);

  }

  var deletionCombo = document.createElement('select');

  for (var i = 0; i < postingMenu.deletionOptions.length; i++) {

    var option = document.createElement('option');
    option.innerHTML = postingMenu.deletionOptions[i];
    deletionCombo.appendChild(option);

  }


  //deletionCombo.selectedIndex = +localStorage.autoDeletionOption;
  deletionCombo.selectedIndex = 0;

  var captchaField;
  if (useCaptcha) {
    captchaField = outerPanel.getElementsByClassName('modalAnswer')[0];
  }


  var nonBypassableCheckbox = document.createElement('input');
  nonBypassableCheckbox.type = 'checkbox';
  nonBypassableCheckbox.checked = true;

  var quickBanCombo = document.createElement('select');

  for (var i = 0; i < postingMenu.quickBanLabels.length; i++) {

    var option = document.createElement('option');
    option.innerHTML = postingMenu.quickBanLabels[i];
    quickBanCombo.appendChild(option);

  }

  quickBanCombo.onchange = function() {
    if (quickBanCombo.value === lang.quickBanPurge) {
      durationField.value = "30d";
      deletionCombo.selectedIndex = 3; // delete by ip (board)
    } else if (quickBanCombo.value ===  "Deutsch") {
      messageField.value = "(PFOSTIERER WURDE INS GAS HINEINGETAN.)";
    } else {
      durationField.value = "12h";
      deletionCombo.selectedIndex = 0; // delete by ip (board)
    }
  };

  okButton.onclick = function() {

    if (deletionCombo.value !== lang.deleteByIpBypass || quickBanCombo.value === lang.quickBanPurge
      || confirm(lang.confirmIpBypassDeletionBoard)) {

      postingMenu.applySingleBan(hideCheckbox.checked, messageField.value.trim(),
        deletionCombo.selectedIndex, reasonField.value.trim(), useCaptcha
            && captchaField.value.trim(), typeCombo.selectedIndex,
        durationField.value.trim(), global, nonBypassableCheckbox.checked,
        boardUri, thread, post, innerPart, outerPanel);
    }

  };

  captchaModal.addModalRow(lang.quickBan, quickBanCombo);
  captchaModal.addModalRow(lang.reason, reasonField, okButton.onclick);
  captchaModal.addModalRow(lang.duration, durationField, okButton.onclick);
  captchaModal.addModalRow(lang.hideMessage, hideCheckbox);
  captchaModal.addModalRow(lang.message, messageField, okButton.onclick);
  captchaModal.addModalRow(lang.type, typeCombo);
  captchaModal.addModalRow(lang.deletionAction, deletionCombo);
  captchaModal.addModalRow(lang.nonBypassable, nonBypassableCheckbox);

};

postingMenu.spoilSinglePost = function(innerPart, boardUri, thread, post) {

  var params = {
    action : 'spoil'
  };

  var key = boardUri + '-' + thread;

  if (post) {
    key += '-' + post;
  }

  params[key] = true;

  api.formApiRequest('contentActions', params, function requestComplete(status,
      data) {

    // style exception, too simple
    api.localRequest('/' + boardUri + '/res/' + thread + '.json', function(
        error, data) {

      if (error) {
        return;
      }

      var thumbs = innerPart.getElementsByClassName('imgLink');

      for (var i = 0; i < thumbs.length; i++) {
        var thumb = thumbs[i].childNodes[0].src = '/spoiler.png';
      }

    });
    // style exception, too simple

  });

};

postingMenu.mergeThread = function(board, thread) {

  var destination = prompt(lang.mergeWithWhichThread, lang.threadId);

  if (!destination) {
    return;
  }

  destination = destination.trim();

  api.formApiRequest('mergeThread', {
    boardUri : board,
    threadSource : thread,
    threadDestination : destination
  }, function transferred(status, data) {

    if (status === 'ok') {
      window.location.pathname = '/' + board + '/res/' + destination + '.html';
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

postingMenu.transferThread = function(boardUri, thread) {

  var destination = prompt(lang.transferToWhichBoard,
      lang.boardUriWithoutSlashes);

  if (!destination) {
    return;
  }

  destination = destination.trim();

  api.formApiRequest('transferThread', {
    boardUri : boardUri,
    threadId : thread,
    boardUriDestination : destination
  }, function transferred(status, data) {

    if (status === 'ok') {

      if (window.location.pathname == "/openReports.js" || /^\/\w+\/\d*/.test(window.location.pathname) || /\?boardUri=(\w+)$/.test(window.location.search))
      {
        var confirmationText = lang.threadMoved;
        confirmationText = confirmationText.replace('__boardUri__', boardUri);
        confirmationText = confirmationText.replace('__threadId__', thread);
        confirmationText = confirmationText.replace('__boardUri2__', destination);
        confirmationText = confirmationText.replace('__threadId2__', data);

        var refreshPage = confirm(confirmationText);

        if (refreshPage) {
          window.location.pathname = '/' + destination + '/res/' + data + '.html';
        } else {
          location.reload();
        }
      }


    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

postingMenu.updateEditedPosting = function(board, thread, post, innerPart, data) {

  innerPart.getElementsByClassName('divMessage')[0].innerHTML = data.markdown;

  var subjectLabel = innerPart.getElementsByClassName('labelSubject')[0];

  if (!subjectLabel && data.subject) {

    var pivot = innerPart.getElementsByClassName('linkName')[0];

    subjectLabel = document.createElement('span');
    subjectLabel.className = 'labelSubject';
    pivot.parentNode.insertBefore(subjectLabel, pivot);

    pivot.parentNode.insertBefore(document.createTextNode(' '), pivot);

  } else if (subjectLabel && !data.subject) {
    subjectLabel.remove();
  }

  if (data.subject) {
    subjectLabel.innerHTML = data.subject;
  }

};

postingMenu.getNewEditData = function(board, thread, post, innerPart) {

  api.localRequest('/' + board + '/res/' + thread + '.json', function(error,
      data) {

    if (error) {
      return;
    }

    data = JSON.parse(data);

    if (post) {

      for (var i = 0; i < data.posts.length; i++) {
        if (data.posts[i].postId === +post) {
          data = data.posts[i];
          break;
        }
      }

    }

    postingMenu.updateEditedPosting(board, thread, post, innerPart, data);

  });

};

postingMenu.editPost = function(board, thread, post, innerPart) {

  var parameters = {
    boardUri : board,
    threadId : thread
  };

  if (post) {
    parameters.postId = post;
  }

  api.formApiRequest('edit', {}, function gotData(status, data) {

    if (status !== 'ok') {
      alert(status);
      return;
    }

    var outerPanel = captchaModal.getCaptchaModal(lang.edit, true);

    var okButton = outerPanel.getElementsByClassName('modalOkButton')[0];

    var subjectField = document.createElement('input');
    subjectField.type = 'text';
    subjectField.value = data.subject || '';

    var messageArea = document.createElement('textarea');
    messageArea.setAttribute('rows', '5');
    messageArea.setAttribute('cols', '35');
    messageArea.setAttribute('placeholder', lang.message);
    messageArea.defaultValue = data.message || '';

    okButton.onclick = function() {

      var typedSubject = subjectField.value.trim();
      var typedMessage = messageArea.value.trim();

      if (typedSubject.length > 128) {
        alert(lang.subjectTooLong.replace('__limit__', 128));
      } else if (!typedMessage.length) {
        alert(lang.messageMandatory);
      } else {

        var parameters = {
          boardUri : board,
          message : typedMessage,
          subject : typedSubject
        };

        if (post) {
          parameters.postId = post;
        } else {
          parameters.threadId = thread;
        }

        // style exception, too simple
        api.formApiRequest('saveEdit', parameters, function requestComplete(
            status, data) {

          if (status === 'ok') {
            outerPanel.remove();
            postingMenu.getNewEditData(board, thread, post, innerPart);
          } else {
            alert(status + ': ' + JSON.stringify(data));
          }
        });
        // style exception, too simple

      }

    };

    captchaModal.addModalRow(lang.subject, subjectField, okButton.onclick);
    captchaModal.addModalRow(lang.message, messageArea);

  }, false, parameters);

};

postingMenu.toggleThreadSetting = function(boardUri, thread, settingIndex,
    innerPart) {

  api.localRequest('/' + boardUri + '/res/' + thread + '.json',
      function gotData(error, data) {

        if (error) {
          alert(error);
          return;
        }

        var data = JSON.parse(data);

        var parameters = {
          boardUri : boardUri,
          threadId : thread
        };

        for (var i = 0; i < postingMenu.threadSettingsList.length; i++) {

          var field = postingMenu.threadSettingsList[i];

          parameters[field.parameter] = settingIndex === i ? !data[field.field]
              : data[field.field];

        }

        api.formApiRequest('changeThreadSettings', parameters,
            function requestComplete(status, data) {

              if (status === 'ok') {
                api.resetIndicators({
                  locked : parameters.lock,
                  pinned : parameters.pin,
                  cyclic : parameters.cyclic,
                  autoSage : parameters.autoSage,
                  archived : innerPart
                      .getElementsByClassName('archiveIndicator').length
                }, innerPart);
              } else {
                alert(status + ': ' + JSON.stringify(data));
              }
            });

      });

};

postingMenu.addToggleSettingButton = function(extraMenu, board, thread, index,
    innerPart) {

  var toggleButton = document.createElement('div');
  toggleButton.innerHTML = postingMenu.threadSettingsList[index].label;
  toggleButton.onclick = function() {
    postingMenu.toggleThreadSetting(board, thread, index, innerPart);
  };

  extraMenu.appendChild(toggleButton);

};

postingMenu.sendArchiveRequest = function(board, thread, innerPart) {

  api.formApiRequest('archiveThread', {
    confirmation : true,
    boardUri : board,
    threadId : thread
  }, function(status, data) {

    if (status === 'ok') {

      if (!api.threadId) {
        innerPart.parentNode.remove();
        return;
      }

      var lock = innerPart.getElementsByClassName('lockIndicator').length;
      var pin = innerPart.getElementsByClassName('pinIndicator').length;
      var cyclic = innerPart.getElementsByClassName('cyclicIndicator').length;

      api.resetIndicators({
        locked : lock,
        pinned : pin,
        cyclic : cyclic,
        archived : true
      }, innerPart);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  });

};

postingMenu.setExtraMenuThread = function(extraMenu, board, thread, innerPart) {

  if (postingMenu.globalRole <= 2) {

    var transferButton = document.createElement('div');
    transferButton.innerHTML = lang.transferThread;
    transferButton.onclick = function() {
      postingMenu.transferThread(board, thread);
    };
    extraMenu.appendChild(transferButton);

  }

  for (var i = 0; i < postingMenu.threadSettingsList.length; i++) {
    postingMenu.addToggleSettingButton(extraMenu, board, thread, i, innerPart);
  }

  var mergeButton = document.createElement('div');
  mergeButton.innerHTML = lang.mergeThread;
  mergeButton.onclick = function() {
    postingMenu.mergeThread(board, thread);
  };
  extraMenu.appendChild(mergeButton);

  if (innerPart.getElementsByClassName('archiveIndicator').length) {
    return;
  }

  var archiveButton = document.createElement('div');
  archiveButton.innerHTML = lang.archive;
  archiveButton.onclick = function() {

    if (confirm(lang.confirmArchive)) {
      postingMenu.sendArchiveRequest(board, thread, innerPart);
    }

  };
  extraMenu.appendChild(archiveButton);

};

postingMenu.setModFileOptions = function(extraMenu, innerPart, board, thread,
    post) {

  var spoilButton = document.createElement('div');
  spoilButton.innerHTML = lang.spoilFiles;
  spoilButton.onclick = function() {
    postingMenu.spoilSinglePost(innerPart, board, thread, post);
  };
  extraMenu.appendChild(spoilButton);

  if (postingMenu.globalRole > 3) {
    return;
  }

  var deleteMediaButton = document.createElement('div');
  deleteMediaButton.innerHTML = lang.deletePostAndMedia;
  extraMenu.appendChild(deleteMediaButton);
  deleteMediaButton.onclick = function() {
    postingMenu.deleteSinglePost(board, thread, post, false, false, true,
        innerPart);
  };

};

postingMenu.setExtraMenuMod = function(innerPart, extraMenu, board, thread,
    post, hasFiles) {

  if (hasFiles) {
    postingMenu.setModFileOptions(extraMenu, innerPart, board, thread, post);
  }

  var deleteByIpButton = document.createElement('div');
  deleteByIpButton.innerHTML = lang.deleteByIpBypass;
  deleteByIpButton.onclick = function() {

    if (confirm(lang.confirmIpBypassDeletionBoard)) {
      postingMenu.deleteSinglePost(board, thread, post, true, null, null,
          innerPart);
    }

  };
  extraMenu.appendChild(deleteByIpButton);

  var deleteByIpOnThreadButton = document.createElement('div');
  deleteByIpOnThreadButton.innerHTML = lang.deleteByIpBypassOnThread;
  deleteByIpOnThreadButton.onclick = function() {

    if (confirm(lang.confirmIpBypassDeletionThread)) {
      postingMenu.deleteSinglePost(board, thread, post, true, null, null,
        innerPart, null, true);
    }

  };
  extraMenu.appendChild(deleteByIpOnThreadButton);

  var banButton = document.createElement('div');
  banButton.innerHTML = lang.ban;
  banButton.onclick = function() {
    postingMenu.banSinglePost(innerPart, board, thread, post);
  };
  extraMenu.appendChild(banButton);

  if (postingMenu.globalRole <= 2) {

    var globalBanButton = document.createElement('div');
    globalBanButton.innerHTML = lang.globalBan;
    globalBanButton.onclick = function() {
      postingMenu.banSinglePost(innerPart, board, thread, post, true);
    };
    extraMenu.appendChild(globalBanButton);

  }

  var editButton = document.createElement('div');
  editButton.innerHTML = lang.edit;
  editButton.onclick = function() {
    postingMenu.editPost(board, thread, post, innerPart);
  };
  extraMenu.appendChild(editButton);

  var post2 = !post ? thread : post;

  var historyLink = document.createElement('a');
  var historyButton = document.createElement('div');
  historyButton.innerHTML = lang.history;
  historyLink.href = '/latestPostings.js?boardUri=' + board + (post2 === thread ? '&threadId=' : '&postId=') + post2;
  historyLink.appendChild(historyButton);
  extraMenu.appendChild(historyLink);

  var moderateLink = document.createElement('a');
  var moderateButton = document.createElement('div');
  moderateButton.innerHTML = lang.moderate;
  moderateLink.href = '/mod.js?boardUri=' + board + '&threadId=' + thread + '#' + post2;
  moderateLink.appendChild(moderateButton);
  extraMenu.appendChild(moderateLink);

  if (!post) {
    postingMenu.setExtraMenuThread(extraMenu, board, thread, innerPart);
  }

};

postingMenu.buildMenu = function(linkSelf, extraMenu) {

  var innerPart = linkSelf.parentNode.parentNode;
  var isHidden = innerPart.classList.contains('userHide');

  var href = linkSelf.href;

  var board, thread;

  if (href.indexOf('mod.js') < 0) {

    var parts = href.split('/');

    board = parts[3];

    var finalParts = parts[5].split('.');

    thread = finalParts[0];

  } else {

    var urlParams = new URLSearchParams(href.split('?')[1]);

    board = urlParams.get('boardUri');
    thread = urlParams.get('threadId').split('#')[0];

  }

  var post = href.split('#')[1];

  if (post === thread) {

    post = undefined;

  }

  if (typeof(hiding) !== 'undefined') {

    if (typeof(post) !== 'undefined') {

      var divMessage = linkSelf.parentNode.parentNode .getElementsByClassName('divMessage')[0];

      var hidePostButton = document.createElement('div');
      hidePostButton.className = 'hidePostButton';
      hidePostButton.innerHTML = isHidden ? lang.unhidePost : lang.hidePost;
      hidePostButton.onclick = function() {
        hiding.hidePost(linkSelf, board, thread, post || thread, !isHidden);
      };

    }

    var hideAfterReportFunction = post !== undefined ? function() {
      hiding.hidePost(linkSelf, board, thread, post || thread, true);
    } : function() {
      hiding.hideThread(linkSelf, board, thread);
    };

    var reportButton = document.createElement('div');
    reportButton.innerHTML = lang.report;
    reportButton.onclick = function() {
      postingMenu.showReport(board, thread, post, hideAfterReportFunction);
    };

    extraMenu.appendChild(reportButton);

    if (typeof(post) !== 'undefined') {
      extraMenu.appendChild(hidePostButton);
    }

  }

  var deleteButton = document.createElement('div');
  deleteButton.innerText = !post ? lang.deleteThread : lang.deletePost;
  extraMenu.appendChild(deleteButton);
  deleteButton.onclick = function() {
    postingMenu.deleteSinglePost(board, thread, post, null, null, null,
        innerPart);
  };

  var trashButton = document.createElement('div');
  trashButton.innerText = !post ? lang.trashThread : lang.trashPost;
  extraMenu.appendChild(trashButton);
  trashButton.onclick = function() {
    postingMenu.deleteSinglePost(board, thread, post, null, null, null,
        innerPart, null, null, true);
  };

  var hasFiles = linkSelf.parentNode.parentNode
      .getElementsByClassName('panelUploads')[0];

  hasFiles = hasFiles && hasFiles.children.length > 0;

  if (hasFiles) {

    var unlinkButton = document.createElement('div');
    unlinkButton.innerText = lang.unlinkFiles;
    extraMenu.appendChild(unlinkButton);
    unlinkButton.onclick = function() {
      postingMenu.deleteSinglePost(board, thread, post, false, true, null,
          innerPart);
    };

  }

  if (postingMenu.loggedIn
      && (postingMenu.globalRole < 4 || postingMenu.moddedBoards.indexOf(board) >= 0)) {
    postingMenu.setExtraMenuMod(innerPart, extraMenu, board, thread, post,
        hasFiles);
  }

};

postingMenu.setExtraMenu = function(linkSelf) {

  var parentNode = linkSelf.parentNode;
  var extraMenuButton = parentNode.getElementsByClassName('extraMenuButton');

  if (!extraMenuButton.length) {
    return;
  }

  extraMenuButton[0].onclick = function() {

    var extraMenu = document.createElement('div');
    extraMenu.className = 'floatingMenu extraMenu';

    extraMenuButton[0].appendChild(extraMenu);

    postingMenu.shownPostingMenu = extraMenu;

    postingMenu.buildMenu(linkSelf, extraMenu);

  };

};

postingMenu.init();
