var catalog = {};

catalog.init = function() {

  catalog.catalogDiv = document.getElementById('divThreads');

  catalog.indicatorsRelation = {
    pinned : 'pinIndicator',
    locked : 'lockIndicator',
    cyclic : 'cyclicIndicator',
    autoSage : 'bumpLockIndicator'
  };

  catalog.refreshCheckBox = document
      .getElementById('autoCatalogRefreshCheckBox');
  catalog.refreshLabel = document.getElementById('catalogRefreshLabel');
  catalog.originalAutoRefreshText = catalog.refreshLabel.innerHTML;
  catalog.searchField = document.getElementById('catalogSearchField');
  catalog.orderBySelection = document.getElementById('catalogOrderBySelection');
  catalog.orderChanged = false;
  catalog.orderBySelection.onchange = function() {
    catalog.orderChanged = true;
    catalog.search(()=>{});
  };

  var catalogCellTemplate = '<div class="catalogHeader">';
  catalogCellTemplate += '  <img class="imgFlag">';
  catalogCellTemplate += '  <a class="labelSubject"></a>';
  catalogCellTemplate += '</div>';
  catalogCellTemplate += '<div class="thumbGrid">';
  catalogCellTemplate += ' <div class="thumbGridTop"></div>';
  catalogCellTemplate += ' <div class="thumbGridBottom"></div>';
  catalogCellTemplate += '</div>';
  catalogCellTemplate += '<div class="threadStats">';
  catalogCellTemplate += '  {{ lang.catalogRepliesLetter }}: <span class="labelReplies"></span> /';
  catalogCellTemplate += '  {{ lang.catalogFilesLetter }}: <span class="labelImages"></span> /';
  catalogCellTemplate += '  {{ lang.catalogPagesLetter }}: <span class="labelPage"></span>';
  catalogCellTemplate += '  <img class="lockIndicator" title="Locked" src="/.static/images/locked.gif" alt="locked">';
  catalogCellTemplate += '  <img class="pinIndicator" title="Sticky" src="/.static/images/sticky.gif" alt="sticky">';
  catalogCellTemplate += '  <img class="cyclicIndicator" title="Cyclical Thread" src="/.static/images/cyclic.png" alt="cyclic">';
  catalogCellTemplate += '  <span class="bumpLockIndicator" title="Bumplocked">AS!</span>';
  catalogCellTemplate += '</div>';
  catalogCellTemplate += '<div class="divMessage"></div>';

  catalogCellTemplate = catalogCellTemplate.replace('{{ lang.catalogRepliesLetter }}', lang.catalogRepliesLetter);
  catalogCellTemplate = catalogCellTemplate.replace('{{ lang.catalogFilesLetter }}', lang.catalogFilesLetter);
  catalogCellTemplate = catalogCellTemplate.replace('{{ lang.catalogPagesLetter }}', lang.catalogPagesLetter);

  catalog.catalogCellTemplate = catalogCellTemplate;

  var storedHidingData = localStorage.hidingData;

  if (storedHidingData) {
    storedHidingData = JSON.parse(storedHidingData);
  } else {
    storedHidingData = {};
  }

  catalog.storedHidingData = storedHidingData;

  catalog.initCatalog();

  catalog.initRefresh();

};

catalog.startTimer = function(time) {

  if (time > 600) {
    time = 600;
  }

  catalog.currentRefresh = time;
  catalog.lastRefresh = time;
  catalog.refreshLabel.innerHTML = catalog.originalAutoRefreshText + ' '
      + catalog.currentRefresh;
  catalog.refreshTimer = setInterval(function checkTimer() {
    catalog.currentRefresh--;

    if (!catalog.currentRefresh) {
      catalog.refreshButton.disabled = true;
      clearInterval(catalog.refreshTimer);
      catalog.refreshCatalog(false, function() {
        catalog.refreshButton.disabled = false;
      });
      catalog.refreshLabel.innerHTML = catalog.originalAutoRefreshText;
    } else {
      catalog.refreshLabel.innerHTML = catalog.originalAutoRefreshText + ' '
          + catalog.currentRefresh;
    }

  }, 1000);
};

catalog.changeCatalogRefresh = function() {

  catalog.autoRefresh = catalog.refreshCheckBox.checked;

  if (!catalog.autoRefresh) {
    catalog.refreshLabel.innerHTML = catalog.originalAutoRefreshText;
    clearInterval(catalog.refreshTimer);
  } else {
    catalog.startTimer(5);
  }

};

catalog.getHiddenMedia = function() {

  var hiddenMedia = localStorage.hiddenMedia;

  if (hiddenMedia) {
    hiddenMedia = JSON.parse(hiddenMedia);
  } else {
    hiddenMedia = [];
  }

  return hiddenMedia;

};

catalog.refreshCatalog = function(manual, cb) {

  if (catalog.autoRefresh) {
    clearInterval(catalog.refreshTimer);
  }

  var currentData = JSON.stringify(catalog.catalogThreads);

  catalog.getCatalogData(function refreshed(error) {

    if (error) {
      return cb();
    }

    var changed = currentData != JSON.stringify(catalog.catalogThreads);

    if (catalog.autoRefresh) {
      catalog.startTimer(manual || changed ? 5 : catalog.lastRefresh * 2);
    }

    catalog.search(cb);

  });

};

catalog.initCatalog = function() {

  catalog.changeCatalogRefresh();

  api.boardUri = window.location.toString().match(/\/(\w+)\/catalog.html/)[1];

  document.getElementById('divTools').className = '';

  catalog.searchField.addEventListener('input', function() {

    if (catalog.searchTimer) {
      clearTimeout(catalog.searchTimer);
    }

    catalog.searchTimer = setTimeout(function() {
      delete catalog.searchTime;
      catalog.search(()=>{});
    }, 1000);

  });

  var postingForm = document.getElementById('newPostFieldset');

  if (postingForm) {

    var toggleLink = document.getElementById('togglePosting');
    toggleLink.style.display = 'inline-block';
    postingForm.style.display = 'none';

    toggleLink.onclick = function() {
      toggleLink.style.display = 'none';
      postingForm.style.display = 'inline-block';
    };
  }

  var links = document.getElementsByClassName('labelSubject');

  for (var i = links.length - 1; i >= 0; i--) {

    var link = links[i];

    var child = link.childNodes[0];

    var matches = link.href.match(/(\w+)\/res\/(\d+)/);

    var board = matches[1];
    var thread = matches[2];

    var boardData = catalog.storedHidingData[board];

    if (boardData && boardData.threads.indexOf(thread) > -1) {
      var cell = link.parentNode.parentNode;

      cell.parentNode.removeChild(cell);
    } else {
      if (child.tagName === 'IMG') {
        catalog.checkForFileHiding(child);
      }
      catalog.setShiftHide(links[i], board, thread);
    }

  }

  catalog.getCatalogData();

};

catalog.initRefresh = function() {

  catalog.refreshButton = document.getElementById('catalogRefreshButton');
  var autoCatalogRefreshCheckBox = document.getElementById('autoCatalogRefreshCheckBox');

  catalog.refreshButton.onclick = function() {

    catalog.refreshButton.disabled = true;

    catalog.refreshCatalog(true, function() {
      catalog.refreshButton.disabled = false;
    });

  };

  autoCatalogRefreshCheckBox.onchange = catalog.changeCatalogRefresh;

}


catalog.checkForFileHiding = function(child) {

  var srcParts = child.src.split('/');

  var hiddenMedia = catalog.getHiddenMedia();

  var finalPart = srcParts[srcParts.length - 1].substr(2);

  for (var j = 0; j < hiddenMedia.length; j++) {

    if (hiddenMedia[j].indexOf(finalPart) > -1) {
      child.parentNode.innerHTML = lang.open;
      break;
    }

  }
};

catalog.setCellThumbGrid = function(thumbGridTop, thumbGridBottom, thread, href) {

  if (!thread.files) {
    return;
  }

  for (var i = 0; i < thread.files.length; i++) {

    var thumbLink = document.createElement('a');
    var thumbImage = document.createElement('img');

    thumbLink.className = 'linkThumb';

    var divisor = i > 0 ? 3 : 1;

    thumbImage.src = thread.files[i].thumb;
    var dimensions = thumbs.getDimensions(
      thread.files[i].width,
      thread.files[i].height,
      thread.files[i].thumb,
      divisor
    );
    thumbImage.width = dimensions[0];
    thumbImage.height = dimensions[1];
    thumbLink.appendChild(thumbImage);
    catalog.checkForFileHiding(thumbImage);
    thumbLink.dataset.filemime = thread.files[i].mime;
    thumbLink.dataset.filepath = thread.files[i].path;
    thumbLink.href = href;

    if (settings.get('previewOnHover')) {
      thumbLink.onmouseenter = preview.show;
      thumbLink.onmouseleave = preview.remove;
    }

    if (i === 0) {
      thumbGridTop.appendChild(thumbLink);
    } else {
      thumbGridBottom.appendChild(thumbLink);
    }

  }

};

catalog.setCatalogCellIndicators = function(thread, cell) {

  for ( var key in catalog.indicatorsRelation) {
    if (!thread[key]) {
      cell.getElementsByClassName(catalog.indicatorsRelation[key])[0].remove();
    }
  }

};

catalog.setCell = function(thread) {

  var cell = document.createElement('div');

  var href = '/' + api.boardUri + '/res/' + thread.threadId + '.html';

  cell.innerHTML = catalog.catalogCellTemplate;
  cell.className = 'catalogCell';

  catalog.setCellThumbGrid(
    cell.getElementsByClassName('thumbGridTop')[0],
    cell.getElementsByClassName('thumbGridBottom')[0],
    thread,
    href
  );

  var labelReplies = cell.getElementsByClassName('labelReplies')[0];
  labelReplies.innerHTML = thread.postCount || 0;

  var labelImages = cell.getElementsByClassName('labelImages')[0];
  labelImages.innerHTML = thread.fileCount || 0;
  cell.getElementsByClassName('labelPage')[0].innerHTML = thread.page;

  if (thread.subject) {
    cell.getElementsByClassName('labelSubject')[0].innerHTML = thread.subject;
  } else {
    cell.getElementsByClassName('labelSubject')[0].innerHTML = '#' + thread.threadId;
  }

  cell.getElementsByClassName('labelSubject')[0].href = href;

  if (thread.flag) {
    var imgFlag = cell.getElementsByClassName('imgFlag')[0];
    imgFlag.src = thread.flag;
    if (thread.flagName) {
      imgFlag.title = thread.flagName;
    }
    if (thread.flagCode) {
      var flagCode = thread.flagCode.replace('-', '');
      imgFlag.className += ' flag-' + flagCode;
      imgFlag.alt = flagCode;
      if (typeof medals !== 'undefined') {
        medals.addTooltip(imgFlag);
      }
    }
  }

  catalog.setCatalogCellIndicators(thread, cell);

  cell.getElementsByClassName('divMessage')[0].innerHTML = thread.markdown;

  catalog.setShiftHide(cell.getElementsByClassName('labelSubject')[0], api.boardUri, thread.threadId);

  return cell;

};

catalog.compareLastBump = function(a, b) {
  aDate = Date.parse(a.lastBump);
  bDate = Date.parse(b.lastBump);
  if (aDate < bDate){
    return 1;
  }
  if (aDate > bDate){
    return -1;
  }
  return 0;
}


catalog.compareCreationDate = function(a, b) {
  aDate = Date.parse(a.creation);
  bDate = Date.parse(b.creation);
  if (aDate < bDate){
    return 1;
  }
  if (aDate > bDate){
    return -1;
  }
  return 0;
}

catalog.comparePostCount = function(a, b) {
  if (a.postCount < b.postCount){
    return 1;
  }
  if (a.postCount > b.postCount){
    return -1;
  }
  return 0;
}

catalog.compareFileCount = function(a, b) {
  if (a.fileCount < b.fileCount){
    return 1;
  }
  if (a.fileCount > b.fileCount){
    return -1;
  }
  return 0;
}

catalog.search = function(cb) {

  if (!catalog.catalogThreads) {
    return cb();
  }

  var term = catalog.searchField.value.toLowerCase();

  while (catalog.catalogDiv.firstChild) {
    catalog.catalogDiv.removeChild(catalog.catalogDiv.firstChild);
  }

  var boardData = catalog.storedHidingData[api.boardUri];

  if (catalog.orderBySelection.value === 'postCount') {
    catalog.catalogThreads.sort(catalog.comparePostCount);
  } else if (catalog.orderBySelection.value === 'creationDate') {
    catalog.catalogThreads.sort(catalog.compareCreationDate);
  } else if (catalog.orderBySelection.value === 'fileCount') {
    catalog.catalogThreads.sort(catalog.compareFileCount);
  } else if (catalog.orderChanged && catalog.orderBySelection.value === 'bumpOrder') {
    catalog.catalogThreads.sort(catalog.compareLastBump);
  }

  for (var i = 0; i < catalog.catalogThreads.length; i++) {

    var thread = catalog.catalogThreads[i];

    if ((boardData && boardData.threads.indexOf(thread.threadId.toString()) > -1)
        || (term.length && thread.message.toLowerCase().indexOf(term) < 0 && (thread.subject || '')
            .toLowerCase().indexOf(term) < 0)) {
      continue;
    }

    catalog.catalogDiv.appendChild(catalog.setCell(thread));

  }

  cb();

};

catalog.getCatalogData = function(callback) {

  if (catalog.loadingData) {
    return;
  }

  catalog.loadingData = true;

  api.localRequest('/' + api.boardUri + '/catalog.json', function gotBoardData(
      error, data) {

    catalog.loadingData = false;

    if (error) {
      if (callback) {
        callback(error);
      } else {
        console.log(error);
      }
      return;
    }

    catalog.catalogThreads = JSON.parse(data);
    if (callback) {
      callback();
    }

  });

};

catalog.setShiftHide = function(labelSubject, board, thread) {

  var catalogCell = labelSubject.parentNode.parentNode;

  catalogCell.onmousedown = function(e) {
    if (e.shiftKey) {
      window.getSelection().removeAllRanges();
      return false;
    }
  };

  catalogCell.onclick = function(e) {
    if (e.shiftKey) {
      window.getSelection().removeAllRanges();
      if (!catalog.storedHidingData[board]) {
        catalog.storedHidingData[board] = {};
        catalog.storedHidingData[board].threads = [];
      }
      catalog.storedHidingData[board].threads.push(thread.toString());
      hiding.registerHiding(board, thread.toString());
      catalogCell.style = 'display: none;';
      return false;
    }
  };

};

catalog.init();
