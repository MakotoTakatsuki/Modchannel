var thumbs = {};

thumbs.ruffle = window.RufflePlayer ? window.RufflePlayer.newest() : {};

thumbs.init = function() {

  thumbs.genericThumb = '/genericThumb.png';
  thumbs.genericAudioThumb = '/audioGenericThumb.png';
  thumbs.genericFlashThumb = '/.static/images/flashThumb.gif';
  thumbs.genericZipThumb = '/.static/images/zipThumb.gif';

  thumbs.playableTypes = [ 'video/webm', 'audio/mpeg', 'video/mp4',
      'video/ogg', 'video/x-m4v', 'audio/ogg', 'audio/webm', 'audio/flac' ];

  thumbs.flashType = 'application/x-shockwave-flash';

  if (!settings.get('noFlash') && Object.keys(thumbs.ruffle).length > 0) {
    thumbs.playableTypes.push(thumbs.flashType);
  }

  thumbs.videoTypes = [ 'video/webm', 'video/mp4', 'video/x-m4v', 'video/ogg' ];

  var imageLinks = document.getElementsByClassName('imgLink');

  var temporaryImageLinks = [];

  for (var i = 0; i < imageLinks.length; i++) {
    temporaryImageLinks.push(imageLinks[i]);
  }

  for (i = 0; i < temporaryImageLinks.length; i++) {
    thumbs.processImageLink(temporaryImageLinks[i]);
  }
};

thumbs.changeMultipleUploads = function(panelUploads, add, insideInnerOP) {
  if (typeof board === 'undefined' && typeof overboard === 'undefined') {
    return;
  }
  if (!insideInnerOP) {
    return;
  }
  var numCells = panelUploads.getElementsByClassName('uploadCell').length;
  var numExpanded = panelUploads.getElementsByClassName('imgExpanded').length
    + panelUploads.getElementsByClassName('expandedVideo').length;
  if (numCells < 3) {
    if (add) {
      panelUploads.classList.add('multipleUploads');
    } else if (numExpanded <= 1) {
      panelUploads.classList.remove('multipleUploads');
    }
  }
};

thumbs.expandImage = function(mouseEvent, link, mime) {

  if (mouseEvent.which === 2 || mouseEvent.ctrlKey) {
    return true;
  }

  link.parentNode.classList.toggle('expandedCell');

  var inner = link.parentNode.parentNode.parentNode;
  if (inner.classList.contains('contentOverflow')) {
    inner = inner.parentNode;
  }

  var thumb = link.getElementsByTagName('img')[0];

  var panelUploads = inner.getElementsByClassName('panelUploads')[0];
  var insideInnerOP = panelUploads.parentNode.className == 'innerOP';

  if (thumb.style.display === 'none' || thumb.style.opacity !== '') {
    thumbs.changeMultipleUploads(panelUploads, false, insideInnerOP);
    link.getElementsByClassName('imgExpanded')[0].outerHTML = '';
    thumb.style.display = '';
    thumb.style.opacity = '';

    if (thumb.getBoundingClientRect().top < 0) {
      thumb.parentNode.parentNode.scrollIntoView();
    }

    expandComment.applyAll(false);
    return false;
  }

  thumbs.changeMultipleUploads(panelUploads, true, insideInnerOP);

  var expanded = link.getElementsByClassName('imgExpanded')[0];

  if (expanded) {
    thumb.style.display = 'none';
    expanded.outerHTML = '';
    return false;
  } else {
    var expandedSrc = link.href;

    if (thumb.src === expandedSrc && mime !== 'image/svg+xml') {
      return false;
    }

    expanded = document.createElement('img');
    expanded.setAttribute('src', expandedSrc);
    expanded.className = 'imgExpanded';
    expanded.style.display = 'none';

    var expandCheckBox = inner.getElementsByClassName('expandCheckBox')[0];
    if (!expandCheckBox.checked) {
      expandCheckBox.click();
    }

    function imgLoad() {
      if (thumb.style.opacity !== '') {
        thumb.style.display = 'none';
        expanded.style.display = '';
      }
      expandComment.applyAll(false);
    }

    thumb.style.opacity = '0.4';

    if (expanded.complete) {
      imgLoad();
    } else {
      expanded.addEventListener('load', imgLoad);
    }

    link.appendChild(expanded);
    expandComment.applyAll(false);

  }

  return false;

};

thumbs.setPlayer = function(link, mime) {

  var path = link.href;
  var parent = link.parentNode;

  var isFlash = mime == thumbs.flashType;
  var isVideo = thumbs.videoTypes.indexOf(mime) > -1;

  var src = document.createElement('source');
  var player = isFlash ? thumbs.ruffle.createPlayer() : document.createElement(isVideo ? 'video' : 'audio');

  if (!isFlash) {
    src.setAttribute('src', link.href);
    src.setAttribute('type', mime);
    player.setAttribute('controls', true);
    // player.loop = !JSON.parse(localStorage.noAutoLoop || 'false');
  }

  player.style.display = 'none';
  if (isFlash && api.mobile) {
    player.style.width = 'auto';
  }

  var playerContainer = document.createElement('span');

  var panelUploads = parent.parentNode;
  var insideInnerOP = panelUploads.parentNode.className == 'innerOP';

  var hideLink = document.createElement('a');
  hideLink.innerHTML = '';
  hideLink.style.cursor = 'pointer';
  hideLink.style.display = 'none';
  hideLink.className = 'hideLink';
  hideLink.onclick = function() {
    if (isFlash && api.mobile) {
      parent.style.width = '';
    }
    newThumbLink.style.display = 'block';
    player.style.display = 'none';
    player.className = '';
    hideLink.style.display = 'none';
    player.pause();
    localStorage.setItem('volumeVideo', player.volume);
    thumbs.changeMultipleUploads(panelUploads, false, insideInnerOP);
  };

  var newThumbLink = document.createElement('a');
  newThumbLink.href = link.href;
  newThumbLink.className = 'imgLink';

  var newThumb = document.createElement('img');
  newThumbLink.appendChild(newThumb);
  newThumb.src = link.childNodes[0].src;

  newThumbLink.onclick = function(mouseEvent) {

    if (settings.get('previewOnHover')) {
      preview.remove();
    }

    if (mouseEvent.which === 2 || mouseEvent.ctrlKey) {
      return true;
    }

    var inner = this.parentNode.parentNode.parentNode.parentNode.parentNode;

    var expandCheckBox = inner.getElementsByClassName('expandCheckBox')[0];
    if (!expandCheckBox.checked) {
      expandCheckBox.click();
    }

    if (!player.childNodes.count && !isFlash) {
      player.appendChild(src);
    }

    newThumbLink.style.display = 'none';
    player.style.display = isFlash ? 'block' : 'inline';
    player.className = 'expandedVideo';
    player.volume = localStorage.volumeVideo || 1.0;
    hideLink.style.display = 'block';


    if (isFlash) {

      var isChrome = !!window.chrome;
      if (isChrome) {
        try {
          eval("console.log('eval test successful');");
        } catch (e) {
          var wantRedirect = confirm("Chrome does not allow to play Ruffle with the current content security policies. Do you want to be redirected to a version with less strict policies to play the file?");
          if (wantRedirect) {
            window.location.href = "https://nocsp." + window.location.hostname + window.location.pathname;
          }
        }
      }

      if (api.mobile) {
        parent.style.width = '100%';
      }

      if (!player.instance) {
        player.load({
          url: link.href,
          allowScriptAccess: false, // DO NOT CHANGE
          autoplay: settings.get('doNotAutoplayFlash') ? "off" : "auto"
        });
      } else if (!settings.get('doNotAutoplayFlash')) {
        player.play();
      }

    } else {

      player.play();

    }

    thumbs.changeMultipleUploads(panelUploads, true, insideInnerOP);

    return false;
  };
  newThumbLink.dataset.filemime = mime;
  if (settings.get('previewOnHover')) {
    newThumbLink.onmouseenter = preview.show;
    newThumbLink.onmouseleave = preview.remove;
  }
  newThumb.width = link.childNodes[0].width;
  newThumb.height = link.childNodes[0].height;
  newThumb.title = link.childNodes[0].title;

  playerContainer.appendChild(hideLink);
  playerContainer.appendChild(player);
  playerContainer.appendChild(newThumbLink);

  parent.replaceChild(playerContainer, link);

};

thumbs.processImageLink = function(link) {

  var mime = link.dataset.filemime;

  if (mime.indexOf('image/') > -1) {

    link.onclick = function(mouseEvent) {
      if (settings.get('previewOnHover')) {
        preview.remove();
      }
      return thumbs.expandImage(mouseEvent, link, mime);
    };
  } else if (thumbs.playableTypes.indexOf(mime) > -1) {
    thumbs.setPlayer(link, mime);
  }
};

thumbs.getDimensions = function(width, height, thumb, divisor=1) {
  var thumbSize = 200;

  if (width == null || height == null) {
    if (thumb == thumbs.genericAudioThumb
      || thumb == thumbs.genericFlashThumb
      || thumb == thumbs.genericZipThumb) {
      width = 60;
      height = 65;
      divisor = divisor == 3 ? 1 : divisor;
    } else if (thumb == thumbs.genericThumb) {
      width = 82;
      height = 116;
      divisor = divisor == 3 ? 2 : divisor;
    } else {
      width = 200;
      height = 200;
    }
  } else if (width > thumbSize || height > thumbSize) {
    var ratio = width / height;

    if (ratio > 1) {
      width = thumbSize;
      height = thumbSize / ratio;
    } else {
      width = thumbSize * ratio;
      height = thumbSize;
    }
  }

  return [Math.trunc(width/divisor), Math.trunc(height/divisor)];
};

thumbs.init();
