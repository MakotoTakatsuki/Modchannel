var hiding = {};

hiding.init = function() {

  var links = document.getElementsByClassName('linkSelf');

  if (links.length === 0) {
    return;
  }

  hiding.updateHidingData();

  hiding.filtered = [];

  document.body.addEventListener('click', function clicked() {

    if (hiding.shownMenu) {
      hiding.shownMenu.remove();
      delete hiding.shownMenu;
    }

  }, true);

  for (var i = 0; i < links.length; i++) {
    hiding.setHideMenu(links[i]);
  }

};

hiding.updateHidingData = function() {

  var storedHidingData = localStorage.hidingData;

  if (!storedHidingData) {
    hiding.storedHidingData = {};
    return;
  }

  hiding.storedHidingData = JSON.parse(storedHidingData);

};

hiding.filterMatches = function(string, filter) {

  var toRet;

  if (!filter.regex) {
    toRet = string.indexOf(filter.filter) >= 0;
  } else {
    toRet = string.match(new RegExp(filter.filter)) ? true : false;
  }

  return toRet;

};

hiding.hideForFilter = function(linkSelf) {

  var toHide = linkSelf.parentNode.parentNode.parentNode;

  toHide.style.display = 'none';
  hiding.filtered.push(toHide);

  return true;

};

hiding.checkFilters = function() {

  for (var i = 0; i < hiding.filtered.length; i++) {
    hiding.filtered[i].style.display = 'block';
  }

  hiding.filtered = [];

  var links = document.getElementsByClassName('linkSelf');

  for (var i = 0; i < links.length; i++) {
    hiding.checkFilterHiding(links[i]);
  }

};

hiding.checkFilterHiding = function(linkSelf) {

  for (var i = 0; i < settingsMenu.loadedFilters.length; i++) {

    var filter = settingsMenu.loadedFilters[i];

    if (filter.type < 2) {
      var name = linkSelf.parentNode.getElementsByClassName('linkName')[0].innerHTML;

      if (name.indexOf('#') >= 0) {

        var trip = name.substring(name.lastIndexOf('#') + 1);

        name = name.substring(0, name.indexOf('#'));

      }

    }

    switch (filter.type) {

    case 0: {
      if (hiding.filterMatches(name, filter)) {
        return hiding.hideForFilter(linkSelf);
      }
      break;
    }

    case 1: {
      if (trip && hiding.filterMatches(trip, filter)) {
        return hiding.hideForFilter(linkSelf);
      }
      break;
    }

    case 2: {
      var subjectLabel = linkSelf.parentNode
          .getElementsByClassName('labelSubject')[0];

      if (subjectLabel && hiding.filterMatches(subjectLabel.innerHTML, filter)) {
        return hiding.hideForFilter(linkSelf);
      }
      break;
    }

    case 3: {
      if (hiding.filterMatches(linkSelf.parentNode.parentNode
          .getElementsByClassName('divMessage')[0].innerHTML, filter)) {
        return hiding.hideForFilter(linkSelf);
      }
      break;
    }

    }

  }

};

hiding.registerHiding = function(board, thread, post, unhiding) {

  var storedData = localStorage.hidingData;

  var hidingData = storedData ? JSON.parse(storedData) : {};

  var boardData = hidingData[board] || {
    threads : [],
    posts : []
  };

  var listToUse = post ? boardData.posts : boardData.threads;

  if (!unhiding) {
    if (listToUse.indexOf(post || thread) < 0) {
      listToUse.push(post || thread);
    }
  } else {
    listToUse.splice(listToUse.indexOf(post || thread), 1);
  }

  hidingData[board] = boardData;

  localStorage.hidingData = JSON.stringify(hidingData);

  hiding.storedHidingData = hidingData;

};

hiding.hidePost = function(linkSelf, board, thread, post, collapse) {

  hiding.toggleCollapse(linkSelf.parentNode.parentNode, collapse);

  hiding.registerHiding(board, thread, post, !collapse);

};


hiding.toggleCollapse = function(localRoot, collapse) {

  if (collapse) {

    localRoot.classList.add('userHide');

  } else {

    localRoot.classList.remove('userHide');

  }

};

hiding.hideThread = function(linkSelf, board, threadParam) {

  hiding.registerHiding(board, threadParam);

  if (typeof thread !== 'undefined') {
    return;
  }

  hiding.toggleHidden(linkSelf.parentNode.parentNode.parentNode, true);
  // var unhideThreadButton = document.createElement('span');
  var threadHidden = document.createElement('div');
  var expandButton = document.createElement('img');

  var spanText = document.createElement('span');
  var hr = document.createElement('hr');

  expandButton.src = '/.static/images/button-open.gif';
  expandButton.className = 'unhideButton';
  expandButton.title = lang.showThread;
  threadHidden.className= 'opCell threadHidden';

  spanText.innerHTML = lang.hiddenThread + ': <span style="font-weight: bold">' + threadParam + '</span>';
  spanText.className = 'hiddenThread';

  threadHidden.appendChild(hr);
  threadHidden.appendChild(expandButton);
  threadHidden.appendChild(spanText);

  linkSelf.parentNode.parentNode.parentNode.parentNode.insertBefore(
      threadHidden, linkSelf.parentNode.parentNode.parentNode);

  expandButton.onclick = function() {
    hiding.toggleHidden(linkSelf.parentNode.parentNode.parentNode, false);
    threadHidden.remove();
    hr.remove();
    hiding.registerHiding(board, threadParam, null, true);
  }

};

hiding.toggleHidden = function(element, hide) {

  var className = element.className;

  if (hide) {
    element.classList.add('hidden');
  } else {
    element.classList.remove('hidden');
  }

};

hiding.setHideMenu = function(linkSelf) {

  var parentNode = linkSelf.parentNode;
  var hideButton = parentNode.getElementsByClassName('hideButton');
  var linkHistory = parentNode.getElementsByClassName('linkHistory')[0];

  if (!hideButton.length)
    return;

  var href = linkSelf.href;

  var board, thread, post;

  if (!linkHistory) {

    if (window.location.pathname == "/mod.js") {

      matches = href.match(/\/mod\.js\?boardUri=(\w+)&threadId=(\d+)\#(\d+)/);

      if (!matches) {
        matches = href.match(/\/(\w+)\/res\/(\d+)\.html\#(\d+)/);
      }

      board = matches[1];
      thread = matches[2];
      post = matches[3];

    } else {

      var parts = href.split('/');

      board = parts[3];

      var finalParts = parts[5].split('.');

      thread = finalParts[0];

      post = finalParts[1].split('#')[1];

    }


  } else {

    var params = new URLSearchParams(href);

    board = params.get("boardUri")

    var lastpart = params.get("threadId")

    var hashSep = lastpart.split('#');

    thread = hashSep[0];

    post = hashSep[1];

  }

  if (post === thread) {
    post = undefined;
  }

  hideButton[0].onclick = function() {

    if (!post) {
      hiding.hideThread(linkSelf, board, thread);
    }

  };

  var boardData = hiding.storedHidingData[board];

  if (!boardData) {
    return;
  }

  if (boardData.posts.indexOf(post || thread) > -1) {
    hiding.hidePost(linkSelf, board, thread, post || thread, true);
  }

  if (!post && boardData.threads.indexOf(thread) > -1) {
    hiding.hideThread(linkSelf, board, thread);
  }

  hiding.checkFilterHiding(linkSelf);

};

hiding.init();
