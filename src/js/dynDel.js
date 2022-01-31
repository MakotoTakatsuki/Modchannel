dynDel = {};

dynDel.deleteMissingFiles = function(postCell, filesCached, filesNew) {

  var uploadCells = postCell.getElementsByClassName('uploadCell');

  for (var i = 0, j = 0; i < filesCached.length; i++) {
    if (!filesNew[j] || filesCached[i].path !== filesNew[j].path) {
      dynDel.markUploadCellAsDeleted(uploadCells[i]);
    } else {
      j += 1;
    }
  }

};

dynDel.markUploadCellAsDeleted = function(uploadCell, manual) {

  if (uploadCell.classList.contains('deleted')) {
    return;
  }

  if (!manual) {
    uploadCell.className = 'uploadCell deleted';
  }

  var links = uploadCell.getElementsByTagName('a');
  var image = uploadCell.getElementsByTagName('img')[0];

  image.src = '';

  for (var i = 0; i < links.length; i++) {
    if (links[i].href && !links[i].classList.contains('brackets')) {
      links[i].href = '/404.html';
    }
  }

};

dynDel.markCellPostAsDeleted = function(postCell, manual) {

  if (postCell.children[0].tagName === 'DIV') {
    postCell.children[0].classList.add('deleted');
  } else {
    postCell.classList.add('deleted');
  }

  if (manual) {
    return;
  }

  postCell.classList.add('deleted');

  var uploadCells = postCell.getElementsByClassName('uploadCell');

  for (var i = 0; i < uploadCells.length; i++) {
    dynDel.markUploadCellAsDeleted(uploadCells[i], manual);
  }

};
