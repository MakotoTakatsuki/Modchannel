var posting = {};

posting.init = function() {

  posting.idsRelation = {};
  api.noReportCaptcha = !document.getElementById('divReportCaptcha');
  posting.highLightedIds = [];

  posting.postCellTemplate = ''
  + '<div class="innerPost">'
  + '  <div class="postInfo title">'
  + '    <span class="labelBoard"></span>'
  + '    <input type="checkbox" class="deletionCheckBox">'
  + '    <img class="imgFlag">'
  + '    <span class="labelSubject"></span>'
  + '    <a class="linkName"></a>'
  + '    <span class="modLinks">'
  + '      <a class="linkHistory brackets">H</a>'
  + '      <a class="linkFileHistory brackets">FH</a>'
  + '      <a class="linkOffenseRecord brackets">OR</a>'
  + '    </span>'
  + '    <span class="labelRole"></span>'
  + '    <span class="labelCreated"></span>'
  + '    <span class="spanId">'
  + '      <span class="labelId"></span>'
  + '    </span>'
  + '    <a class="linkSelf">{{ lang.no }}</a>'
  + '    <a class="linkQuote"></a>'
  + '    <span class="extraMenuButton">'
  + '      <img class="iconReport" src="/.static/images/icon-report.png" title="Post Menu" alt="">'
  + '    </span>'
  + '    <img class="hideButton" title="{{ lang.hidePost }}" src="/.static/images/button-close.gif">'
  + '    <span class="sage"></span>'
  + '    <a class="linkEdit brackets">{{ lang.edit }}</a>'
  + '    <span class="panelBacklinks"></span>'
  + '  </div>'
  + '  <table class="modInfo">'
  + '    <tbody>'
  + '      <tr class="panelBypassId">'
  + '        <th>Bypass</th>'
  + '        <td class="labelBypassId"></td>'
  + '      </tr>'
  + '      <tr class="panelIp">'
  + '        <th>IP</th>'
  + '        <td>'
  + '          <span class="labelIp"></span><span class="panelRange">'
  + '            <span title="Broad range(1/2 octets)">BR</span>: <span class="labelBroadRange"> </span>'
  + '            <span title="Narrow range(3/4 octets)">NR</span>: <span class="labelNarrowRange"> </span>'
  + '          </span>'
  + '        </td>'
  + '      </tr>'
  + '      <tr class="panelRealIp">'
  + '        <th>Real IP</th>'
  + '        <td class="labelRealIp"></td>'
  + '      </tr>'
  + '      <tr class="panelASN">'
  + '        <th>ASN</th>'
  + '        <td class="labelASN"></td>'
  + '      </tr>'
  + '    </tbody>'
  + '  </table>'
  + '  <input class="expandCheckBox hidden" type="checkbox" autocomplete="on">'
  + '  <div class="bottomGradient hidden"></div>'
  + '  <label class="expandLabel brackets hidden">'
  + '    <a class="commentExpand">{{ lang.commentExpand }}</a>'
  + '  </label>'
  + '  <label class="collapseLabel brackets hidden">'
  + '    <a class="commentCollapse">{{ lang.commentCollapse }}</a>'
  + '  </label>'
  + '  <div class="contentOverflow">'
  + '    <div class="panelUploads"></div>'
  + '    <div class="divMessage"></div>'
  + '  </div>'
  + '    <div class="divBanMessage"></div>'
  + '    <div class="labelLastEdit"></div>'
  + '</div>';
  posting.postCellTemplate = posting.postCellTemplate.replace("{{ lang.no }}", lang.no);
  posting.postCellTemplate = posting.postCellTemplate.replace("{{ lang.edit }}", lang.edit);
  posting.postCellTemplate = posting.postCellTemplate.replace("{{ lang.commentExpand }}", lang.commentExpand);
  posting.postCellTemplate = posting.postCellTemplate.replace("{{ lang.commentCollapse }}", lang.commentCollapse);

  posting.uploadCell = ''
    + '<div class="uploadDetails">'
    + '  <a class="originalNameLink"></a><br>'
    + '  <a class="nameLink" target="_blank">{{ lang.openFile }}</a>'
    + '  <span class="sizeLabel"></span>,'
    + '  <span class="dimensionLabel"></span>'
    + '  <a class="editInOekaki" style="display:none">Edit</a>'
    + '  <a class="unlinkLink brackets">U</a>'
    + '  <a class="unlinkAndDeleteLink brackets">D</a>'
    + '  <div style="display:none" class="divHash">'
    + '  <span>SHA256: <span class="labelHash"></span></span>'
    + '  </div>'
    + '</div>'
    + '<a class="imgLink" target="_blank"></a>';

  posting.sizeOrders = [ 'B', 'KB', 'MB', 'GB', 'TB' ];

  posting.reverseHTMLReplaceTable = {};

  for ( var key in api.htmlReplaceTable) {
    posting.reverseHTMLReplaceTable[api.htmlReplaceTable[key]] = key;
  }

  if (document.getElementById('deleteFormButton')) {
    api.convertButton('trashFormButton', posting.trashPosts);
    api.convertButton('reportFormButton', posting.reportPosts, 'reportField');
    api.convertButton('deleteFormButton', posting.deletePosts, 'deletionField');
  }

  if (settings.get('unixFilenames')) {
    posting.updateAllUnixFilenames();
  }

  if (settings.get('convertLocalTimes')) {
    posting.updateAllLocalTimes();
  }

  if (settings.get('relativeTime')) {
    posting.updateAllRelativeTimes();
    setInterval(posting.updateAllRelativeTimes, 1000 * 60 * 1);
  }

  if (settings.get('autoPlayAnimations')) {
    posting.updateAllAnimatedThumbs();
  }

  if (settings.get('editInOekaki')) {
    posting.updateAllEditLinks();
  }

  if (window.location.pathname == "/mod.js" || /^\/\w+\/last\//.test(window.location.pathname)) {
    posting.updateAllModLinks();
  }


  if (typeof (thread) !== 'undefined') {
    return;
  }

  var ids = document.getElementsByClassName('labelId');

  for (i = 0; i < ids.length; i++) {
    posting.processIdLabel(ids[i]);
  }

};

posting.setLocalTime = function(time) {

  time.innerHTML = api.formatDateToDisplay(new Date(time.innerHTML + ' UTC'),
      true);

};

posting.applyBans = function(captcha) {

  var typedReason = document.getElementById('reportFieldReason').value.trim();
  var typedDuration = document.getElementById('fieldDuration').value.trim();
  var typedMessage = document.getElementById('fieldbanMessage').value.trim();
  var banType = document.getElementById('comboBoxBanTypes').selectedIndex;

  var params = {
    action : 'ban',
    reasonBan : typedReason,
    captchaBan : captcha,
    banType : banType,
    duration : typedDuration,
    banMessage : typedMessage,
    nonBypassable : document.getElementById('checkBoxNonBypassable').checked,
    globalBan : document.getElementById('checkboxGlobalBan').checked
  };

  posting.newGetSelectedContent(params);

  api.formApiRequest('contentActions', params, function requestComplete(status,
      data) {

    if (status === 'ok') {
      alert('Bans applied');
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  });
};

posting.banPosts = function() {

  if (!document.getElementsByClassName('divBanCaptcha').length) {
    return posting.applyBans();
  }

  var typedCaptcha = document.getElementById('fieldCaptchaBan').value.trim();

  if (typedCaptcha && /\W/.test(typedCaptcha)) {
    alert('Invalid captcha.');
    return;
  }

  if (!typedCaptcha) {
    posting.applyBans(typedCaptcha);
  } else {
    var parsedCookies = api.getCookies();

    api.formApiRequest('solveCaptcha', {
      captchaId : parsedCookies.captchaid,
      answer : typedCaptcha
    }, function solvedCaptcha(status, data) {

      if (status !== 'ok') {
        alert(status);
        return;
      }

      posting.applyBans(parsedCookies.captchaid);
    });
  }

};

posting.deleteFromIpOnThread = function() {
  posting.deleteFromIpOnBoard(null, true);
};

posting.deleteFromIpOnBoard = function(event, onThread) {

  var checkBoxes = document.getElementsByClassName('deletionCheckBox');

  for (var i = 0; i < checkBoxes.length; i++) {
    var checkBox = checkBoxes[i];

    if (checkBox.checked) {
      var splitName = checkBox.name.split('-')[0];
      break;
    }

  }

  if (!splitName) {
    return;
  }

  var redirect = '/' + splitName + '/';

  var confirmationBox = document
      .getElementById('ipDeletionConfirmationCheckbox');

  var param = {
    action : onThread ? 'thread-ip-deletion' : 'ip-deletion',
    confirmation : confirmationBox.checked
  };

  posting.newGetSelectedContent(param);

  api.formApiRequest('contentActions', param, function requestComplete(status,
      data) {

    if (status === 'ok') {
      window.location.pathname = redirect;
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

posting.processIdLabel = function(label) {

  var id = label.innerHTML;

  var array = posting.idsRelation[id] || [];
  posting.idsRelation[id] = array;

  var cell = label.parentNode.parentNode.parentNode;

  array.push(cell);

  label.onmouseover = function() {
    label.innerHTML = id + ' (' + array.length + ')';
  }

  label.onmouseout = function() {
    label.innerHTML = id;
  }

  label.onclick = function() {

    var index = posting.highLightedIds.indexOf(id);

    if (index > -1) {
      posting.highLightedIds.splice(index, 1);
    } else {
      posting.highLightedIds.push(id);
    }

    for (var i = 0; i < array.length; i++) {
      var cellToChange = array[i];

      if (cellToChange.className === 'innerOP') {
        continue;
      }

      cellToChange.className = index > -1 ? 'innerPost' : 'markedPost';
    }

  };

};


posting.updateAllUnixFilenames = function() {

  var postCollection = document.querySelectorAll("div.panelUploads");

  for (var i = 0; i < postCollection.length; i++) {
    posting.addUnixFilenames(postCollection[i]);
  }

};

posting.addUnixFilenames = function(postFromCollection) {

  timetext = postFromCollection.parentElement.parentElement.querySelectorAll("span.labelCreated")[0].textContent.replace(/-/g,"/");
  someDate = new Date(timetext);
  timetext = someDate.getTime();
  fake_precision = timetext % 999
  timetext = timetext + fake_precision;

  img_imgLink = postFromCollection.querySelectorAll("a.imgLink:not(.unixLink)");

  for(var j = 0; j < img_imgLink.length; j++) {
    org_text = img_imgLink[j].href;
    var extension;

    if (img_imgLink[j].parentElement.nodeName == "SPAN") {
      extension = img_imgLink[j].parentElement.parentElement.querySelectorAll("a.originalNameLink")[0].title.split('.').pop();
    } else {
      extension = img_imgLink[j].parentElement.querySelectorAll("a.originalNameLink")[0].title.split('.').pop();
    }

    if (j == 0 && img_imgLink.length == 1) {
      img_imgLink[j].href = org_text + "/" + timetext + "." + extension;
    } else {
      img_imgLink[j].href = org_text + "/" + timetext + "-" + j + "." + extension;
    }

    img_imgLink[j].classList.add("unixLink");
  }

};

posting.updateAllLocalTimes = function() {

  var times = document.querySelectorAll("span.labelCreated");

  for (var i = 0; i < times.length; i++) {
    posting.addLocalTime(times[i]);
  }

};

posting.addLocalTime = function(time) {

  text = time.textContent.replace(/-/g,"/");
  //day = text.split(" ")[1]
  date_full = new Date(text+" +0000")

  month = ('0' + (date_full.getMonth() + 1)).slice(-2);
  day2 = ('0' + date_full.getDate()).slice(-2);
  year = date_full.getFullYear();
  new_date = year + '-' + month + '-' + day2;

  /* var weekday = new Array(7);
  weekday[0] =  "Sun";
  weekday[1] = "Mon";
  weekday[2] = "Tue";
  weekday[3] = "Wed";
  weekday[4] = "Thu";
  weekday[5] = "Fri";
  weekday[6] = "Sat"; */

  //new_day = "(" + weekday[date_full.getDay()] + ")";


  time_new = date_full.toLocaleTimeString("de-DE")

  //time.textContent = new_date + " " + new_day + " " + time_new;
  time.textContent = new_date + " " + time_new;

};

posting.updateAllRelativeTimes = function() {

  var times = document.getElementsByClassName('labelCreated');

  for (var i = 0; i < times.length; i++) {
    posting.addRelativeTime(times[i]);
  }

};

posting.addRelativeTime = function(time) {

  var timeReplaced = time.innerHTML.replace(/-/g, "/");

  var timeObject = new Date(timeReplaced);

  if (time.nextSibling.nextSibling.className !== 'relativeTime') {

    var newRelativeLabel = document.createElement('span');

    newRelativeLabel.className = 'relativeTime';

    time.parentNode.insertBefore(newRelativeLabel, time.nextSibling);
    time.parentNode
        .insertBefore(document.createTextNode(' '), time.nextSibling);

  }

  var now = new Date();

  var content;

  var delta = now - timeObject;

  var second = 1000;
  var minute = second * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var month = day * 30.5;
  var year = day * 365.25;

  if (delta > year) {
    content = lang.yAgo.replace('__value__', Math.round(delta / year));
  } else if (delta > month) {
    content = lang.monAgo.replace('__value__', Math.round(delta / month));
  } else if (delta > day) {
    content = lang.dAgo.replace('__value__', Math.round(delta / day));
  } else if (delta > hour) {
    content = lang.hAgo.replace('__value__', Math.round(delta / hour));
  } else if (delta > minute) {
    content = lang.mAgo.replace('__value__', Math.round(delta / minute));
  } else {
    content = lang.justNow;
  }

  time.nextSibling.nextSibling.innerHTML = ' - ' + content;

};

posting.spoilFiles = function() {

  var posts = {
    action : 'spoil'
  };

  posting.newGetSelectedContent(posts);

  api.formApiRequest('contentActions', posts, function requestComplete(status,
      data) {

    if (status === 'ok') {

      alert('Files spoiled');

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

posting.newGetSelectedContent = function(object) {

  var checkBoxes = document.getElementsByClassName('deletionCheckBox');

  for (var i = 0; i < checkBoxes.length; i++) {
    var checkBox = checkBoxes[i];

    if (checkBox.checked) {
      object[checkBox.name] = true;
    }
  }

};

posting.hideSelectedContentAndUncheck = function() {

  var checkBoxes = document.getElementsByClassName('deletionCheckBox');

  for (var i = 0; i < checkBoxes.length; i++) {
    var checkBox = checkBoxes[i];

    if (checkBox.checked) {
      var linkSelf = checkBox.parentNode.getElementsByClassName('linkSelf')[0];
      var groups = checkBox.name.match(/\w+/g);
      var board = groups[0];
      var thread = groups[1];
      if (groups.length == 2) {
        hiding.hideThread(linkSelf, board, thread);
      } else {
        var post = groups[2];
        hiding.hidePost(linkSelf, board, thread, post || thread, true);
      }
      checkBox.checked = false;
    }
  }

};

posting.reportPosts = function() {

  var fieldCaptchaReport = document.getElementById('fieldCaptchaReport');
  var typedReason = document.getElementById('reportFieldReason').value.trim();

  if (!api.noReportCaptcha) {
    var typedCaptcha = document.getElementById('fieldCaptchaReport').value.trim();
    if (/\W/.test(typedCaptcha)) {
      alert('Invalid captcha.');
      return;
    }
  }

  var reportCategories = document.getElementById('reportComboboxCategory');

  if (reportCategories) {
    var category = reportCategories.options[reportCategories.selectedIndex].value;
  }

  var params = {
    action : 'report',
    categoryReport : category,
    reasonReport : typedReason,
    captchaReport : typedCaptcha,
    globalReport: document.getElementById('checkboxGlobalReport').checked,
  };

  posting.newGetSelectedContent(params);

  api.formApiRequest('contentActions', params, function reported(status, data) {

    if (status === 'ok') {

      alert('Content reported');

      posting.hideSelectedContentAndUncheck();

      captchaUtils.reloadCaptcha();

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  });

};

posting.trashPosts = function() {
  posting.deletePosts(null, true);
};

posting.deletePosts = function(event, trash) {

  var typedPassword = document.getElementById('deletionFieldPassword').value
      .trim();

  if (typedPassword.length > 8) {
      typedPassword = typedPassword.substring(0, 8);
  }

  var params = {
    password : typedPassword,
    deleteMedia : document.getElementById('checkboxMediaDeletion').checked,
    deleteUploads : document.getElementById('checkboxOnlyFiles').checked,
    action : trash ? 'trash' : 'delete'
  };

  posting.newGetSelectedContent(params);

  api.formApiRequest('contentActions', params, function requestComplete(status,
      data) {

    if (status === 'ok') {

      alert(data.removedThreads + ' threads and ' + data.removedPosts
          + ' posts were successfully deleted.');

      if (typeof latestPostings !== 'undefined') {

        var checkBoxes = document.getElementsByClassName('deletionCheckBox');

        for (var i = checkBoxes.length - 1; i >= 0; i--) {
          var checkBox = checkBoxes[i];

          if (checkBox.checked) {
            checkBox.parentNode.parentNode.parentNode.remove();
          }

        }

      } else if (window.location.toString().indexOf('trashBin.js' >= 0)) {
        location.reload(true);
      } else if (!api.isBoard && !data.removedThreads && data.removedPosts) {
        thread.refreshPosts(true, true);
      } else if (data.removedThreads || data.removedPosts) {
        window.location.pathname = '/';
      }

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

posting.formatFileSize = function(size) {

  var orderIndex = 0;

  while (orderIndex < posting.sizeOrders.length - 1 && size > 1024) {

    orderIndex++;
    size /= 1024;

  }

  return size.toFixed(2) + ' ' + posting.sizeOrders[orderIndex];

};

posting.setLastEditedLabel = function(post, cell) {

  var editedLabel = cell.getElementsByClassName('labelLastEdit')[0];

  if (post.lastEditTime) {

    var formatedDate = api.formatDateToDisplay(new Date(post.lastEditTime));

    var login = post.lastEditLogin;

    if (login) {
      editedLabel.innerHTML = lang.guiEditInfoMod.replace('__login__', login);
    } else {
      editedLabel.innerHTML = lang.guiEditInfo;
    }

    editedLabel.innerHTML = editedLabel.innerHTML.replace('__date__', formatedDate);

  } else {
    editedLabel.remove();
  }

};

posting.truncateFilename = function(filename, maxWidth, dots) {
  if (filename.length > maxWidth) {
    var truncateAtEnd = true;
    var parts = filename.split('.');
    var numParts = parts.length;
    var extension = parts.pop();
    if (numParts >= 2) {
      filename = filename.substring(
        0,
        maxWidth - dots.length - extension.length - 1
      ) + dots + '.' + extension;
      truncateAtEnd = filename.length > maxWidth;
    }
    if (truncateAtEnd) {
      filename = filename.substring(
        0,
        maxWidth - dots.length
      ) + dots;
    }
  }
  return filename;
};

posting.setUploadLinks = function(cell, file, noExtras) {

  var thumbLink = cell.getElementsByClassName('imgLink')[0];
  thumbLink.href = file.path;

  thumbLink.setAttribute('data-filemime', file.mime);

  if (file.mime.indexOf('image/') > -1 && !noExtras
      && (typeof gallery !== 'undefined') && !api.mobile) {
    gallery.addGalleryFile(file.path);
  }

  var img = document.createElement('img');
  img.src = file.thumb;
  var dimensions = thumbs.getDimensions(file.width, file.height, file.thumb);
  img.width = dimensions[0];
  img.height = dimensions[1];
  img.title = file.originalName;

  if (settings.get('previewOnHover')) {
    thumbLink.onmouseenter = preview.show;
    thumbLink.onmouseleave = preview.remove;
  }

  thumbLink.appendChild(img);

  var nameLink = cell.getElementsByClassName('nameLink')[0];
  nameLink.href = file.path;

  var originalLink = cell.getElementsByClassName('originalNameLink')[0];
  originalLink.innerHTML = posting.truncateFilename(file.originalName, 25, '[...]');
  //originalLink.href = file.path + "/dl/" + encodeURIComponent(file.originalName);
  originalLink.href = file.path;
  originalLink.title = file.originalName;
  originalLink.setAttribute('download', file.originalName);

};

posting.getUploadCellBase = function() {

  var cell = document.createElement('figure');
  cell.innerHTML = posting.uploadCell;
  cell.className = 'uploadCell';

  return cell;

}

posting.setUploadCell = function(node, files, noExtras, boardUri, post) {

  if (!files) {
    return;
  }

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    var cell = posting.getUploadCellBase();

    posting.setUploadLinks(cell, file, noExtras);

    var sizeString = posting.formatFileSize(file.size);
    cell.getElementsByClassName('sizeLabel')[0].innerHTML = sizeString;

    var dimensionLabel = cell.getElementsByClassName('dimensionLabel')[0];

    if (file.width) {
      dimensionLabel.innerHTML = file.width + 'x' + file.height;
    } else {
      dimensionLabel.remove();
    }

    if (file.sha256) {
      cell.getElementsByClassName('unlinkLink brackets')[0].href = 'unlinkSingle.js?boardUri=' + boardUri + '&postId=' + post.postId + '&index=' + i;
      cell.getElementsByClassName('unlinkAndDeleteLink brackets')[0].href = 'unlinkSingle.js?boardUri=' + boardUri + '&postId=' + post.postId + '&index=' + i + '&delete=1';
    } else {
      cell.getElementsByClassName('unlinkLink brackets')[0].remove();
      cell.getElementsByClassName('unlinkAndDeleteLink brackets')[0].remove();
    }

    node.appendChild(cell);
  }

};

posting.setPostHideableElements = function(postCell, post, noExtras, boardUri) {

  var subjectLabel = postCell.getElementsByClassName('labelSubject')[0];

  if (post.subject) {
    subjectLabel.innerHTML = post.subject;
  } else {
    subjectLabel.remove();
  }

  if (post.id) {
    var labelId = postCell.getElementsByClassName('labelId')[0];
    labelId.setAttribute('style', 'background-color: #' + post.id);
    labelId.innerHTML = post.id;

    if (!noExtras) {
      posting.processIdLabel(labelId);
    }

  } else {
    var spanId = postCell.getElementsByClassName('spanId')[0];
    spanId.remove();
  }

  var banMessageLabel = postCell.getElementsByClassName('divBanMessage')[0];

  if (!post.banMessage) {
    banMessageLabel.parentNode.removeChild(banMessageLabel);
  } else {
    banMessageLabel.innerHTML = post.banMessage;
  }

  posting.setLastEditedLabel(post, postCell);

  var imgFlag = postCell.getElementsByClassName('imgFlag')[0];

  if (post.flag) {

    if (post.signedRole) {
      post.flag = '/.static/flags/kohl.png';
      post.flagName = '010011010110111101100100';
    }

    imgFlag.src = post.flag;
    imgFlag.title = post.flagName.replace(/&(l|g)t;/g, function replace(match) {
      return posting.reverseHTMLReplaceTable[match];
    });

    if (post.flagCode) {
      var flagCode = post.flagCode.replace('-', '');
      imgFlag.className += ' flag-' + flagCode;
      imgFlag.alt = flagCode;
      if (typeof medals !== 'undefined') {
        medals.addTooltip(imgFlag);
      }
    }
  } else {
    imgFlag.remove();
  }

  if (!post.asn) {
    postCell.getElementsByClassName('panelASN')[0].remove();
  } else {
    postCell.getElementsByClassName('labelASN')[0].innerHTML = post.asn;
  }

  if (!post.bypassId) {
    postCell.getElementsByClassName('panelBypassId')[0].remove();
  } else {
    postCell.getElementsByClassName('labelBypassId')[0].innerHTML = post.bypassId;
  }

  if (!post.broadRange) {
    postCell.getElementsByClassName('panelRange')[0].remove();
  } else {
    postCell.getElementsByClassName('labelBroadRange')[0].innerHTML = post.broadRange;
    postCell.getElementsByClassName('labelNarrowRange')[0].innerHTML = post.narrowRange;
  }

  /*
  if (!post.realBroadRange) {
    postCell.getElementsByClassName('panelRealRange')[0].remove();
  } else {
    postCell.getElementsByClassName('labelRealBroadRange')[0].innerHTML = post.realBroadRange;
    postCell.getElementsByClassName('labelRealNarrowRange')[0].innerHTML = post.realNarrowRange;
  }
  */

  if (post.realIpIsTor) {
    postCell.getElementsByClassName('labelRealIp')[0].innerText = 'Tor';
  } else if (post.realIp) {
    postCell.getElementsByClassName('labelRealIp')[0].innerText = post.realIp;
  } else {
    postCell.getElementsByClassName('panelRealIp')[0].remove();
  }

  if (!post.ip) {
    postCell.getElementsByClassName('panelIp')[0].remove();
  } else {
    postCell.getElementsByClassName('labelIp')[0].innerHTML = post.ip;
  }

  if (!post.ip && !post.bypassId) {
    postCell.getElementsByClassName('modLinks')[0].remove();
  }

};

posting.setPostLinks = function(postCell, post, boardUri, link, threadId,
    linkQuote, deletionCheckbox, preview) {

  var postingId = post.postId || threadId;

  var linkStart = (preview ? '/' + boardUri + '/res/' + threadId + '.html' : '')
      + '#';

  linkQuote.href = linkStart;
  link.href = linkStart;

  link.href += postingId;
  linkQuote.href += 'q' + postingId;

  var linkEdit = postCell.getElementsByClassName('linkEdit')[0];
  var linkHistory = postCell.getElementsByClassName('linkHistory')[0];
  var linkFileHistory = postCell.getElementsByClassName('linkFileHistory')[0];

  var complement = (post.postId ? 'postId' : 'threadId') + '=' + postingId;

  if (api.mod) {
    linkEdit.href = '/edit.js?boardUri=' + boardUri + '&';
    linkEdit.href += complement;
  } else if (linkEdit) {
    linkEdit.remove();
  }

  if (api.mod && (post.ip || post.bypassId)) {
    linkFileHistory.href = '/mediaManagement.js?boardUri=' + boardUri + '&';
    linkFileHistory.href += complement;

    linkHistory.href = '/latestPostings.js?boardUri=' + boardUri + '&';
    linkHistory.href += complement;
  } else if (linkHistory) {
    linkHistory.remove();
    linkFileHistory.remove();
  }

  var checkboxName = boardUri + '-' + threadId;

  if (post.postId) {
    checkboxName += '-' + post.postId;
  }

  deletionCheckbox.setAttribute('name', checkboxName);

};

posting.setRoleSignature = function(postingCell, posting) {

  var labelRole = postingCell.getElementsByClassName('labelRole')[0];

  if (posting.signedRole) {
    labelRole.innerHTML = posting.signedRole;
  } else {
    labelRole.parentNode.removeChild(labelRole);
  }

};

posting.setPostComplexElements = function(postCell, post, boardUri, threadId,
    noExtras, preview) {

  posting.setRoleSignature(postCell, post);

  var link = postCell.getElementsByClassName('linkSelf')[0];

  var linkQuote = postCell.getElementsByClassName('linkQuote')[0];
  linkQuote.innerHTML = post.postId || threadId;

  var deletionCheckbox = postCell.getElementsByClassName('deletionCheckBox')[0];

  posting.setPostLinks(postCell, post, boardUri, link, threadId, linkQuote,
      deletionCheckbox, preview);

  var panelUploads = postCell.getElementsByClassName('panelUploads')[0];

  if (!post.files || !post.files.length) {
    panelUploads.remove();
  } else {

    if (post.files.length > 1) {
      panelUploads.className += ' multipleUploads';
    }

    posting.setUploadCell(panelUploads, post.files, noExtras, boardUri, post);
  }

};

posting.setPostInnerElements = function(boardUri, threadId, post, postCell,
    noExtras, preview) {

  var linkName = postCell.getElementsByClassName('linkName')[0];
  var sage = postCell.getElementsByClassName('sage')[0];

  linkName.innerHTML = post.name;

  if (post.email == 'sage') {
    sage.innerHTML = 'SÄGE!';
  }

  linkName.className += ' noEmailName';

  var labelCreated = postCell.getElementsByClassName('labelCreated')[0];

  labelCreated.innerHTML = api.formatDateToDisplay(new Date(post.creation));

  if (posting.localTimes) {
    posting.setLocalTime(labelCreated);
  }

  postCell.getElementsByClassName('divMessage')[0].innerHTML = post.markdown;

  posting.setPostHideableElements(postCell, post, noExtras, boardUri);

  posting.setPostComplexElements(postCell, post, boardUri, threadId, noExtras,
      preview);

  if (settings.get('unixFilenames')) {
    if (postCell.querySelectorAll("div.panelUploads").length > 0) {
      posting.addUnixFilenames(postCell.querySelectorAll("div.panelUploads")[0]);
    }
  }

  posting.addLocalTime(labelCreated);

  if (settings.get('relativeTime')) {
    posting.addRelativeTime(labelCreated);
  }

  var messageLinks = postCell.getElementsByClassName('divMessage')[0]
      .getElementsByTagName('a');

  /*
  for (var i = 0; i < messageLinks.length; i++) {
    embed.processLinkForEmbed(messageLinks[i]);
  }
  */

  var links = postCell.getElementsByClassName('imgLink');

  var temporaryImageLinks = [];

  for (i = 0; i < links.length; i++) {
    temporaryImageLinks.push(links[i]);
  }

  for (i = 0; i < temporaryImageLinks.length; i++) {
    thumbs.processImageLink(temporaryImageLinks[i]);
  }

  var shownFiles = postCell.getElementsByClassName('uploadCell');

  if (settings.get('mediaHiding')) {

    for (var i = 0; i < shownFiles.length; i++) {
      mediaHiding.processFileForHiding(shownFiles[i]);
    }

    var hiddenMedia = mediaHiding.getHiddenMedia();

    for (i = 0; i < hiddenMedia.length; i++) {
      mediaHiding.updateHiddenFiles(hiddenMedia[i], true);
    }

  }

  postCell.setAttribute('data-boarduri', boardUri);

  if (settings.get('showYous')) {
    var quotes = postCell.querySelectorAll('.quoteLink,.highlightlink');
    var userPosts = tooltips.getUserPosts();

    for (i = 0; i < quotes.length; i++) {
      tooltips.addYouToQuote(quotes[i], userPosts);
    }
  }

  if (noExtras) {
    return;
  }

  tooltips.addToKnownPostsForBackLinks(postCell);

  // var quotes = postCell.getElementsByClassName('quoteLink');
  var quotes = postCell.querySelectorAll('.quoteLink,.highlightlink');

  for (i = 0; i < quotes.length; i++) {
    tooltips.processQuote(quotes[i]);
  }

  var linkSelf = postCell.getElementsByClassName('linkSelf')[0];
  hiding.setHideMenu(linkSelf);
  postingMenu.setExtraMenu(linkSelf)

  if (api.threadId) {
    thread.processPostingQuote(postCell.getElementsByClassName('linkQuote')[0]);
  }

  var expandId = boardUri + '-' + threadId + '-' + post.postId;

  postCell.getElementsByClassName('expandCheckBox')[0].setAttribute('id', expandId);
  postCell.getElementsByClassName('expandLabel')[0].setAttribute('for', expandId);
  postCell.getElementsByClassName('collapseLabel')[0].setAttribute('for', expandId);

};

posting.addPost = function(post, boardUri, threadId, noExtra, preview) {

  var postCell = document.createElement('div');
  postCell.innerHTML = posting.postCellTemplate;

  postCell.id = post.postId;
  postCell.setAttribute('class', 'postCell');

  postCell.setAttribute('data-boarduri', boardUri);

  if (preview) {
    var labelBoard = '/' + boardUri + '/';
    postCell.getElementsByClassName('labelBoard')[0].innerHTML = labelBoard;
  }

  posting.setPostInnerElements(boardUri, threadId, post, postCell, noExtra,
      preview);

  posting.fixModLinks(postCell);

  if (settings.get('autoPlayAnimations')) {
    uploadCells = postCell.querySelectorAll(".uploadCell");
    for(var i = 0; i < uploadCells.length; i++) {
      posting.addAnimatedThumbs(uploadCells[i]);
    }
  }

  if (settings.get('editInOekaki')) {
    uploadCells = postCell.querySelectorAll(".uploadCell");
    for(var i = 0; i < uploadCells.length; i++) {
      posting.addEditLinks(uploadCells[i]);
    }
  }

  if (settings.get('audioThread')) {
    originalNameLinks = postCell.querySelectorAll(".originalNameLink");
    for(var i = 0; i < originalNameLinks.length; i++) {
      audioThread.addAudioPlayer(originalNameLinks[i]);
    }
  }

  // tipping.js
  if (typeof tipping !== 'undefined') {
    messageSubjects = postCell.querySelectorAll("span.labelSubject");
    for(var i = 0; i < messageSubjects.length; i++) {
      tipping.processSubject(messageSubjects[i]);
    }
  }


  return postCell;

};

posting.fixModLinks = function(postCell) {

  var currentThread;
  var currentBoard;

  if (window.location.pathname != "/mod.js" && !/^\/\w+\/last\//.test(window.location.pathname)) {
    return;
  }

  if (window.location.pathname == "/mod.js") {
    var boardmatch = window.location.search.match(/\?boardUri=(\w+)/);
    var returnLinks = document.getElementsByClassName("returnLinks");
    for (i = 0; i < returnLinks.length; i++) {
      returnLinks[i].href = "/mod.js?boardUri=" + boardmatch[1];
    }
    var catalogLinks = document.getElementsByClassName("catalogLinks");
    for (i = 0; i < catalogLinks.length; i++) {
      catalogLinks[i].href = "/" + boardmatch[1] + "/catalog.html";
    }
  }

  var regexMultiMatchBoardPage = /\/(\w+)\/res\/(\d+)\.html#(\d+)$/;

  var quoteLinks = postCell.querySelectorAll(".quoteLink");

  for (i = 0; i < quoteLinks.length; i++) {
    console.log(quoteLinks[i].href);
    if (regexMultiMatchBoardPage.test(quoteLinks[i].href)) {
      var match = regexMultiMatchBoardPage.exec(quoteLinks[i].href);


      if (window.location.pathname == "/mod.js") {

        quoteLinks[i].href = "/mod.js?boardUri=" + match[1] + "&threadId=" + match[2] + "#" + match[3];

      } else if (/^\/\w+\/last\//.test(window.location.pathname)) {

        if (document.getElementById(match[3]) == null) {
          quoteLinks[i].href = "/" + match[1] + "/res/" + match[2] + ".html#" + match[3];
        } else {
          quoteLinks[i].href = "#" + match[3];
        }
      }
    }
  }
}

posting.updateAllModLinks = function() {
  var postCells = document.getElementsByClassName('postCell');
  for (var i = 0; i < postCells.length; i++) {
    posting.fixModLinks(postCells[i]);
  }
};

posting.addAnimatedThumbs = function(uploadCell) {
  var item = uploadCell;
  originalNameLink = item.getElementsByClassName("originalNameLink")[0];
  if (originalNameLink.href.substr(-4) == ".gif" || originalNameLink.href.substr(-4) == ".png" || originalNameLink.href.substr(-5) == ".webp") {
    size_in_kb = parseInt(item.getElementsByClassName("sizeLabel")[0].textContent.split(" ")[0]);
    width_px = parseInt(item.getElementsByClassName("dimensionLabel")[0].textContent.split("x")[0]);
    height_px = parseInt(item.getElementsByClassName("dimensionLabel")[0].textContent.split("x")[1]);
    if (size_in_kb < 500 && width_px <= 200 && height_px <= 200) {
      image = item.getElementsByTagName("img")[0];
      image.src = image.parentElement.href;
    }
  }
}

posting.addEditLinks = function(uploadCell) {
  var item = uploadCell;
  const imgLink = item.getElementsByClassName("imgLink")[0];
  if (imgLink.dataset.filemime && imgLink.dataset.filemime.split('/').shift() === 'image') {
    const editLink = item.getElementsByClassName("editInOekaki")[0];
    if (editLink) {
      editLink.style.display = '';
      editLink.href = imgLink.href
      editLink.onclick = function(event) {
        event.preventDefault();
        showOekaki(event);
      }
    }
  }
}

posting.updateAllAnimatedThumbs = function() {
  uploadCells = document.querySelectorAll(".uploadCell");
  for(var i = 0; i < uploadCells.length; i++) {
    posting.addAnimatedThumbs(uploadCells[i]);
  }
}

posting.updateAllEditLinks = function() {
  uploadCells = document.querySelectorAll(".uploadCell");
  for(var i = 0; i < uploadCells.length; i++) {
    posting.addEditLinks(uploadCells[i]);
  }
}

posting.init();
