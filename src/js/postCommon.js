var postCommon = {};

postCommon.MIMETYPES = {
  a : 'application/octet-stream',
  ai : 'application/postscript',
  aif : 'audio/x-aiff',
  aifc : 'audio/x-aiff',
  aiff : 'audio/x-aiff',
  au : 'audio/basic',
  avi : 'video/x-msvideo',
  bat : 'text/plain',
  bin : 'application/octet-stream',
  bmp : 'image/x-ms-bmp',
  c : 'text/plain',
  cdf : 'application/x-cdf',
  csh : 'application/x-csh',
  css : 'text/css',
  dll : 'application/octet-stream',
  doc : 'application/msword',
  dot : 'application/msword',
  dvi : 'application/x-dvi',
  eml : 'message/rfc822',
  eps : 'application/postscript',
  etx : 'text/x-setext',
  exe : 'application/octet-stream',
  flac : 'audio/flac',
  gif : 'image/gif',
  gtar : 'application/x-gtar',
  gz : 'application/gzip',
  h : 'text/plain',
  hdf : 'application/x-hdf',
  htm : 'text/html',
  html : 'text/html',
  jpe : 'image/jpeg',
  jpeg : 'image/jpeg',
  jpg : 'image/jpeg',
  js : 'application/x-javascript',
  ksh : 'text/plain',
  latex : 'application/x-latex',
  m1v : 'video/mpeg',
  m4a: 'audio/x-m4a',
  m4v : 'video/x-m4v',
  man : 'application/x-troff-man',
  me : 'application/x-troff-me',
  mht : 'message/rfc822',
  mhtml : 'message/rfc822',
  mif : 'application/x-mif',
  mov : 'video/quicktime',
  movie : 'video/x-sgi-movie',
  mp2 : 'audio/mpeg',
  mp3 : 'audio/mpeg',
  mp4 : 'video/mp4',
  mpa : 'video/mpeg',
  mpe : 'video/mpeg',
  mpeg : 'video/mpeg',
  mpg : 'video/mpeg',
  ms : 'application/x-troff-ms',
  nc : 'application/x-netcdf',
  nws : 'message/rfc822',
  o : 'application/octet-stream',
  obj : 'application/octet-stream',
  oda : 'application/oda',
  ogg : 'audio/ogg',
  ogv : 'video/ogg',
  pbm : 'image/x-portable-bitmap',
  pdf : 'application/pdf',
  pfx : 'application/x-pkcs12',
  pgm : 'image/x-portable-graymap',
  png : 'image/png',
  pnm : 'image/x-portable-anymap',
  pot : 'application/vnd.ms-powerpoint',
  ppa : 'application/vnd.ms-powerpoint',
  ppm : 'image/x-portable-pixmap',
  pps : 'application/vnd.ms-powerpoint',
  ppt : 'application/vnd.ms-powerpoint',
  pptx : 'application/vnd.ms-powerpoint',
  ps : 'application/postscript',
  pwz : 'application/vnd.ms-powerpoint',
  py : 'text/x-python',
  pyc : 'application/x-python-code',
  pyo : 'application/x-python-code',
  qt : 'video/quicktime',
  ra : 'audio/x-pn-realaudio',
  ram : 'application/x-pn-realaudio',
  ras : 'image/x-cmu-raster',
  rdf : 'application/xml',
  rgb : 'image/x-rgb',
  roff : 'application/x-troff',
  rtx : 'text/richtext',
  sgm : 'text/x-sgml',
  sgml : 'text/x-sgml',
  sh : 'application/x-sh',
  shar : 'application/x-shar',
  snd : 'audio/basic',
  so : 'application/octet-stream',
  src : 'application/x-wais-source',
  svg : 'image/svg+xml',
  swf : 'application/x-shockwave-flash',
  t : 'application/x-troff',
  tar : 'application/x-tar',
  tcl : 'application/x-tcl',
  tex : 'application/x-tex',
  texi : 'application/x-texinfo',
  texinfo : 'application/x-texinfo',
  tif : 'image/tiff',
  tiff : 'image/tiff',
  tr : 'application/x-troff',
  tsv : 'text/tab-separated-values',
  txt : 'text/plain',
  ustar : 'application/x-ustar',
  vcf : 'text/x-vcard',
  wav : 'audio/x-wav',
  webm : 'video/webm',
  wiz : 'application/msword',
  wsdl : 'application/xml',
  xbm : 'image/x-xbitmap',
  xlb : 'application/vnd.ms-excel',
  xls : 'application/vnd.ms-excel',
  xlsx : 'application/vnd.ms-excel',
  xml : 'text/xml',
  xpdl : 'application/xml',
  xpm : 'image/x-xpixmap',
  xsl : 'application/xml',
  xwd : 'image/x-xwindowdump',
  zip : 'application/zip',
  webp : 'image/webp',
  '7z': 'application/x-7z-compressed',
  opus : 'audio/ogg',
  epub : 'application/epub+zip'
};

postCommon.init = function() {

  if (!document.getElementById('fieldPostingPassword')) {
    return;
  }

  var charLimitLabel = document.getElementById('labelMessageLength');

  document.getElementById('fieldMessage').addEventListener('input',
      postCommon.updateCurrentChar);

  postCommon.currentCharLabel = document.createElement('span');

  charLimitLabel.parentNode.insertBefore(postCommon.currentCharLabel,
      charLimitLabel);

  charLimitLabel.parentNode.insertBefore(document.createTextNode('/'),
      charLimitLabel);

  postCommon.updateCurrentChar();

  postCommon.selectedCell = '<div class="removeButton">✖</div>'
      + '<span class="nameLabel"></span>'
      + '<div><label class="checkboxLabel">'
      + '<input type="checkbox" class="spoilerCheckBox">'
      + '<img class="spoilerImg" src="/spoiler.png">'
      + '</label></div>';

  postCommon.selectedFiles = [];

  if (document.getElementById('divUpload')) {
    postCommon.setDragAndDrop();
  }

  var savedPassword = localStorage.deletionPassword;

  if (savedPassword) {
    document.getElementById('fieldPostingPassword').value = savedPassword;

    if (document.getElementById('deletionFieldPassword')) {
      document.getElementById('deletionFieldPassword').value = savedPassword;
    }

  }

  var nameField = document.getElementById('fieldName');

  if (nameField) {
    nameField.value = localStorage.name || '';
  }

  var bypassCheckBox = document.getElementById('alwaysUseBypassCheckBox');
  bypassCheckBox.checked = false;

  // Temporary disabled
  /* if (document.cookie.indexOf("ipToken=") >= 0) {
    bypassCheckBox.checked = false;
  } else if (settings.get('ensureBypass')) {
    bypassCheckBox.checked = true;
  } else {
    bypassCheckBox.checked = false;
  } */

  var flagCombo = document.getElementById('flagCombobox');

  if (flagCombo && localStorage.savedFlags) {

    var flagInfo = JSON.parse(localStorage.savedFlags);

    if (flagInfo[api.boardUri]) {

      for (var i = 0; i < flagCombo.options.length; i++) {

        if (flagCombo.options[i].value === flagInfo[api.boardUri]) {
          flagCombo.selectedIndex = i;

          postCommon.showFlagPreview(flagCombo);

          break;
        }

      }

    }

  }

  if (flagCombo) {
    postCommon.setFlagPreviews(flagCombo);
  }

  /*
  var formMore = document.getElementById('formMore');
  formMore.classList.toggle('hidden');

  var toggled = false;

  var extra = document.getElementById('extra');
  extra.classList.toggle('hidden');

  formMore.children[0].onclick = function() {

    extra.classList.toggle('hidden');
    formMore.children[0].innerHTML = toggled ? 'More' : 'Less';

    toggled = !toggled;

    localStorage.setItem('showExtra', toggled);

  };

  if (localStorage.showExtra && JSON.parse(localStorage.showExtra)) {
    formMore.children[0].onclick();
  }
  */

};

postCommon.updateCurrentChar = function() {
  postCommon.currentCharLabel.innerHTML = document
      .getElementById('fieldMessage').value.trim().length;
};

postCommon.updateCurrentChar = function() {
  postCommon.currentCharLabel.innerHTML = document
      .getElementById('fieldMessage').value.trim().length;
};

postCommon.showFlagPreview = function(combo) {

  var index = combo.selectedIndex;

  var src;

  if (!index) {
    src = '';
  } else {
    src = '/' + api.boardUri + '/flags/' + combo.options[index].value;
  }

  var previews = document.getElementsByClassName('flagPreview');

  for (var i = 0; i < previews.length; i++) {
    previews[i].src = src;
  }

};

postCommon.setFlagPreviews = function(combo) {

  combo.addEventListener('change', function() {
    postCommon.showFlagPreview(combo);
  });

};

postCommon.savedSelectedFlag = function(selectedFlag) {

  var savedFlagData = localStorage.savedFlags ? JSON
      .parse(localStorage.savedFlags) : {};

  savedFlagData[api.boardUri] = selectedFlag;

  localStorage.setItem('savedFlags', JSON.stringify(savedFlagData));

};

postCommon.addDndCell = function(cell, removeButton) {

  if (postCommon.selectedDivQr) {
    var clonedCell = cell.cloneNode(true);
    clonedCell.getElementsByClassName('removeButton')[0].onclick = removeButton.onclick;
    postCommon.selectedDivQr.appendChild(clonedCell);

    var sourceSpoiler = cell.getElementsByClassName('spoilerCheckBox')[0];
    var destinationSpoiler = clonedCell
        .getElementsByClassName('spoilerCheckBox')[0];

    sourceSpoiler.addEventListener('change', function() {
      if (destinationSpoiler) {
        destinationSpoiler.checked = sourceSpoiler.checked;
      }
    });

    destinationSpoiler.addEventListener('change', function() {
      sourceSpoiler.checked = destinationSpoiler.checked;
    });

  }

  postCommon.selectedDiv.appendChild(cell);

};

postCommon.addSelectedFile = function(file, previewDataUrl) {

  previewDataUrl = previewDataUrl || null; // custom argument

  var cell = document.createElement('div');
  cell.className = 'selectedCell';

  cell.innerHTML = postCommon.selectedCell;

  var nameLabel = cell.getElementsByClassName('nameLabel')[0];
  nameLabel.innerHTML = file.name;

  var removeButton = cell.getElementsByClassName('removeButton')[0];

  removeButton.onclick = function() {
    var index = postCommon.selectedFiles.indexOf(file);

    if (postCommon.selectedDivQr) {

      for (var i = 0; i < postCommon.selectedDiv.childNodes.length; i++) {
        if (postCommon.selectedDiv.childNodes[i] === cell) {
          postCommon.selectedDivQr
              .removeChild(postCommon.selectedDivQr.childNodes[i]);
        }
      }

    }

    postCommon.selectedDiv.removeChild(cell);

    postCommon.selectedFiles.splice(postCommon.selectedFiles.indexOf(file), 1);
  };

  postCommon.selectedFiles.push(file);

  if (!file.type.indexOf('image/')) {

    var addPreviewDndCell = function(dataUrl) {
      var checkboxLabel = cell.getElementsByClassName('checkboxLabel')[0]
      var checkbox = cell.getElementsByClassName('spoilerCheckBox')[0]

      var dndThumb = document.createElement('img');
      dndThumb.src = dataUrl;
      dndThumb.className = 'dragAndDropThumb';
      checkboxLabel.appendChild(dndThumb);

      postCommon.addDndCell(cell, removeButton);
    }

    if (previewDataUrl) {
      addPreviewDndCell(previewDataUrl);
    } else {
      postCommon.fileToDataUrl(file, addPreviewDndCell);
    }

  } else {
    postCommon.addDndCell(cell, removeButton);
  }

};

postCommon.clearSelectedFiles = function() {

  if (!document.getElementById('divUpload')) {
    return;
  }

  postCommon.selectedFiles = [];

  while (postCommon.selectedDiv.firstChild) {
    postCommon.selectedDiv.removeChild(postCommon.selectedDiv.firstChild);
  }

  if (postCommon.selectedDivQr) {
    while (postCommon.selectedDivQr.firstChild) {
      postCommon.selectedDivQr.removeChild(postCommon.selectedDivQr.firstChild);
    }
  }

};

postCommon.setDragAndDrop = function(qr) {

  var fileInput = document.getElementById('inputFiles');

  if (!qr) {
    fileInput.style.display = 'none';
    document.getElementById('dragAndDropDiv').style.display = 'block';

    /* BEGIN Workaround from endchan */

    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (iOS) {
      console.log('iOS detected, enabling workaround')
      var lastFileCount = 0
      setInterval(function() {
        // console.log('scanning for file selection', fileInput.files.length, 'files')
        if (fileInput.files.length > lastFileCount) {
          console.log('detected new file')
          for (var i = 0; i < fileInput.files.length; i++) {
            postCommon.addSelectedFile(fileInput.files[i]);
          }
        }
        lastFileCount = fileInput.files.length
      }, 1000)
    } else {

      fileInput.onchange = function() {

        for (var i = 0; i < fileInput.files.length; i++) {
          postCommon.addSelectedFile(fileInput.files[i]);
        }

        fileInput.type = "text";
        fileInput.type = "file";
      };
    }

    /* END Workaround from endchan */

  }

  var drop = document.getElementById(qr ? 'dropzoneQr' : 'dropzone');
  drop.onclick = function() {
    fileInput.click();
  };

  if (!qr) {
    postCommon.selectedDiv = document.getElementById('selectedDiv');
    document.addEventListener('paste', function handleFileSelect(evt) {
      //evt.stopPropagation();
      //evt.preventDefault();

      var clipboard = evt.clipboardData;
      if (!clipboard.items || !clipboard.items.length)
        return;

      for (var i=0; i<clipboard.items.length; i++) {
        var cbItem = clipboard.items[i];

        if (cbItem.kind !== 'file' || cbItem.type.indexOf('image/') !== 0)
          continue;

        var file = cbItem.getAsFile();
        var timestamp = Math.round(new Date()/1000);
        var fileName = lang.clipboardImage + '-' + timestamp;

        var addFile = function(file, type, format, previewDataUrl) {
          var fileObj = new File([file], fileName + '.' + format, {type: type});
          postCommon.addSelectedFile(fileObj, previewDataUrl);
        };

        if (settings.get('compressClipboardImages')) {
          postCommon.compressImage(file, addFile);
        } else {
          addFile(file, 'image/png', 'png');
        }
      }

    }, false);

  } else {
    postCommon.selectedDivQr = document.getElementById('selectedDivQr');
  }

  drop.addEventListener('dragover', function handleDragOver(event) {

    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';

  }, false);

  drop.addEventListener('drop', function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    for (var i = 0; i < evt.dataTransfer.files.length; i++) {
      postCommon.addSelectedFile(evt.dataTransfer.files[i])
    }

  }, false);

};

postCommon.getMime = function(pathName) {

  var pathParts = pathName.split('.');

  var mime;

  if (pathParts.length) {
    mime = postCommon.MIMETYPES[pathParts[pathParts.length - 1].toLowerCase()];
  }

  return mime || 'application/octet-stream';
};

postCommon.newCheckExistance = function(file, callback) {

  if (!settings.get('checkFileIdentifier')) {
    callback();
    return;
  }

  var reader = new FileReader();

  reader.onloadend = async function() {


    if (crypto.subtle) {

      var hashBuffer = await
      crypto.subtle.digest('SHA-256', reader.result);

      var hashArray = Array.from(new Uint8Array(hashBuffer));

      var hashHex = hashArray.map(function(b) {
        return b.toString(16).padStart(2, '0');
      }).join('');

    } else {

      var i8a = new Uint8Array(reader.result);
      var a = [];

      for (var i = 0; i < i8a.length; i += 4) {
        a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
      }

      var wordArray = CryptoJS.lib.WordArray.create(a, i8a.length);
      var hashHex = CryptoJS.SHA256(wordArray).toString();
    }

    api.formApiRequest('checkFileIdentifier', {}, function requested(status,
        data) {

      if (status !== 'ok') {
        console.log(data);
        callback();
      } else {
        callback(hashHex, file.type, data);
      }

    }, false, {
      identifier : hashHex
    });

  };

  reader.readAsArrayBuffer(file);

};

postCommon.newGetFilesToUpload = function(callback, index, files) {

  index = index || 0;
  files = files || [];

  if (!document.getElementById('divUpload')
      || index >= postCommon.selectedFiles.length) {
    callback(files);
    return;
  }

  var spoiled = postCommon.selectedDiv
      .getElementsByClassName('spoilerCheckBox')[index].checked;

  var file = postCommon.selectedFiles[index];

  postCommon.newCheckExistance(file, function checked(sha256, mime, found) {

    var toPush = {
      name : postCommon.selectedFiles[index].name,
      spoiler : spoiled,
      sha256 : sha256,
      mime : mime
    };

    if (!found) {
      toPush.content = file;
    }

    files.push(toPush);

    postCommon.newGetFilesToUpload(callback, ++index, files);

  });

};

postCommon.displayBlockBypassPrompt = function(callback) {

  var outerPanel = captchaModal
      .getCaptchaModal(lang.youNeedBlockBypass);

  var okButton = outerPanel.getElementsByClassName('modalOkButton')[0];

  okButton.onclick = function() {

    var typedCaptcha = outerPanel.getElementsByClassName('modalAnswer')[0].value
        .trim();

    if (/\W/.test(typedCaptcha)) {
      alert('Invalid captcha.');
      return;
    }

    api.formApiRequest('renewBypass', {
      captcha : typedCaptcha
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        if (callback) {
          callback();
        }

        outerPanel.remove();

      } else if (status === 'hashcash') {

        okButton.remove();
        document.getElementsByClassName('modalHeader')[0].innerHTML = 'Almost there! You still need to activate your Bypass!';
        document.getElementsByClassName('captchaImageContainer')[0].remove();
        document.getElementsByClassName('modalCaptchaTable')[0].remove();
        var cancelButton = document.getElementsByClassName('cancelButton')[0];
        cancelButton.value = lang.closeButton;

        var hashcashInfo = document.createElement('p');
        hashcashInfo.innerHTML = "<a target='_blank' href='/addon.js/hashcash/?action=get'>" + lang.hashcashInfo + "</a>";

        modalInnerDecorationPanel = document.getElementsByClassName('modalInnerDecorationPanel');
        modalInnerDecorationPanel[0].insertBefore(hashcashInfo, cancelButton);

        // BUTTONDISABLE
        thread.replyButton.disabled = false;
        qr.setQRReplyEnabled(true);

      } else if (status === 'finish') {

        if (callback) {
          callback();
        }

        outerPanel.remove();

      } else {

        alert(status + ': ' + JSON.stringify(data));

      }
    });

  };

};

postCommon.storeUsedPostingPassword = function(boardUri, threadId, postId) {

  var storedData = JSON.parse(localStorage.postingPasswords || '{}');

  var key = boardUri + '/' + threadId

  if (postId) {
    key += '/' + postId;
  }

  storedData[key] = localStorage.deletionPassword;

  localStorage.setItem('postingPasswords', JSON.stringify(storedData));

};

postCommon.compressImage = function(imageBlob, callback) {

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var img = new Image();

  var useWebp = postCommon.webpSupported();
  var targetQuality = 1; // imageBlob.size > 4 * 1024 * 1024 ? 0.95 : 1;
  var targetFileType = useWebp ? 'image/webp' : 'image/jpeg';
  var targetFormat = useWebp ? 'webp' : 'jpeg';

  postCommon.fileToDataUrl(imageBlob, function(dataUrl) {

    img.onload = function() {
      canvas.width = this.width;
      canvas.height = this.height;

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(function(blob) {
        callback(blob, targetFileType, targetFormat, dataUrl);
      }, targetFileType, targetQuality);
    };

    img.onerror = function() {
      callback(imageBlob, 'image/png', 'png', dataUrl);
    };

    img.src = dataUrl;

  });

};

postCommon.fileToDataUrl = function(file, callback) {

  var fileReader = new FileReader();

  fileReader.onloadend = function() {
    callback(fileReader.result);
  };

  fileReader.readAsDataURL(file);

}

postCommon.webpSupported = function() {

  // firefox has very poor realisation of webp
  var minSupportedChromium = 60;
  var ver = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

  return ver ? parseInt(ver[2]) > minSupportedChromium : false;

};

postCommon.init();
