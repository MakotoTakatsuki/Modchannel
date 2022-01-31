var stats = {};

document.getElementById('divLatestImages').innerHTML = '';


stats.startUpPost = true;
stats.startUpImage = true;

stats.lastNewPost = "";
stats.lastNewImage = "";

stats.lastPostNotFound = false;
stats.lastImageNotFound = false;


stats.init = function() {

  stats.refreshURL = "/index.json"

  var divLatestImages = document.getElementById('divLatestImages');
  var divLatestPosts = document.getElementById('divLatestPosts');
  var latestImagesHeading = document.getElementById('latestImagesHeading');
  var latestPostsHeading = document.getElementById('latestPostsHeading');
  stats.latestImagesReady = true;
  stats.latestPostsReady = true;

  divLatestImages.onmouseenter = function() {
    stats.latestImagesReady = false;
    latestImagesHeading.innerText = lang.latestImages + ' 🔒';
  };

  divLatestImages.onmouseleave = function() {
    stats.latestImagesReady = true;
    latestImagesHeading.innerText = lang.latestImages;
  };

  divLatestPosts.onmouseenter = function() {
    stats.latestPostsReady = false;
    latestPostsHeading.innerText = lang.latestPosts + ' 🔒';
  };

  divLatestPosts.onmouseleave = function() {
    stats.latestPostsReady = true;
    latestPostsHeading.innerText = lang.latestPosts;
  };

  stats.refresh();

};

stats.refreshCallback = function(error, receivedData) {

  if (error) {
    setTimeout(stats.refresh, 10000);
    return;
  }

  receivedData = JSON.parse(receivedData);

  var labelTotalPosts = document.getElementById('labelTotalPosts');
  var labelTotalPPH = document.getElementById('labelTotalPPH');
  var labelTotalFiles = document.getElementById('labelTotalFiles');
  var labelTotalSize = document.getElementById('labelTotalSize');
  var divLatestImages = document.getElementById('divLatestImages');
  var divLatestPosts = document.getElementById('divLatestPosts');

  if (labelTotalPosts)
    labelTotalPosts.innerText = receivedData.totalPosts;

  if (labelTotalPPH)
    labelTotalPPH.innerText = receivedData.totalPPH;

  if (labelTotalFiles)
    labelTotalFiles.innerText = receivedData.totalFiles;

  if (labelTotalSize)
    labelTotalSize.innerText = receivedData.totalSize;

  var latestImages = receivedData.latestImages;

  if (latestImages && stats.latestImagesReady) {

    if (stats.startUpImage) {
      divLatestImages.innerHTML = '';
    }

    var markerImage = false;

    for (var i = latestImages.length-1; i >= 0 ; i--) {
      if (stats.startUpImage) {
        var img = document.createElement('img');
        img.src = latestImages[i].thumb;
        img.loading = 'lazy';
        var link = document.createElement('a');
        var postPart = latestImages[i].postId ? '#' + latestImages[i].postId : '';
        link.href = '/' + latestImages[i].boardUri + '/res/' + latestImages[i].threadId + '.html' + postPart;
        link.appendChild(img);
        link.id = latestImages[i].thumb.replace("/.media/", "")

        divLatestImages.appendChild(link);
        if (stats.lastImageNotFound) {
          link.style.animation = "fade-in 3s"
          if (i == 0) {
            stats.lastImageNotFound = false;
          }
        }
      }

      if (stats.lastNewImage == latestImages[i].thumb.replace("/.media/", "")) {
        markerImage = true;
        for (var j = i+1; j < latestImages.length ; j++) {
          var img = document.createElement('img');
          img.src = latestImages[j].thumb;
          img.loading = 'lazy';
          var link = document.createElement('a');
          var postPart = latestImages[j].postId ? '#' + latestImages[j].postId : '';
          link.href = '/' + latestImages[j].boardUri + '/res/' + latestImages[j].threadId + '.html' + postPart;
          link.appendChild(img);
          link.id = latestImages[j].thumb.replace("/.media/", "")

          divLatestImages.prepend(link);
          divLatestImages.removeChild(divLatestImages.lastChild);
          link.style.animation = "fade-in 3s"
        }
        break;
      }

      if (!stats.startUpImage && i == 0 && !markerImage) {
        stats.lastImageNotFound = true;
      }
    }
  }

  var latestPosts = receivedData.latestPosts;
  if (latestPosts && stats.latestPostsReady) {

    if (stats.startUpPost) {
      divLatestPosts.innerHTML = '';
    } else { latestPosts.reverse() }

    var markerPost = false;

    for (var i = 0; i < latestPosts.length; i++) {

      if (stats.startUpPost || markerPost) {
        var latestPostCell = document.createElement('div');
        latestPostCell.className = 'latestPostCell';
        var linkPost = document.createElement('a');
        linkPost.className = 'linkPost title';
        var postPart = latestPosts[i].postId ? '#' + latestPosts[i].postId : '';
        linkPost.href = '/' + latestPosts[i].boardUri + '/res/' + latestPosts[i].threadId + '.html' + postPart;
        linkPost.innerText = '>>>/' + latestPosts[i].boardUri + '/' + (latestPosts[i].postId ? latestPosts[i].postId : latestPosts[i].threadId);
        var imgFlag = document.createElement('img');
        if (latestPosts[i].flag) {
          imgFlag.className = 'imgFlag';
          imgFlag.src = latestPosts[i].flag;
          if (latestPosts[i].flagName) {
            imgFlag.title = latestPosts[i].flagName;
          }
          if (latestPosts[i].flagCode) {
            imgFlag.alt = latestPosts[i].flagCode;
          }
        }
        var br = document.createElement('br');
        var labelPreview = document.createElement('span');
        labelPreview.className = 'labelPreview';
        labelPreview.innerHTML = latestPosts[i].previewText;
        latestPostCell.appendChild(linkPost);
        if (latestPosts[i].flag) {
          latestPostCell.appendChild(imgFlag);
        }
        latestPostCell.appendChild(br);
        latestPostCell.appendChild(labelPreview);
        latestPostCell.id = latestPosts[i].boardUri + "/" + (latestPosts[i].postId || latestPosts[i].threadId);

        if (stats.startUpPost) {
          divLatestPosts.appendChild(latestPostCell);
          if (stats.lastPostNotFound) {
            latestPostCell.style.animation = "fade-in 3s"
            if (i == latestPosts.length-1) {
              stats.lastPostNotFound = false;
            }
          }
        } else {
          divLatestPosts.prepend(latestPostCell);
          divLatestPosts.removeChild(divLatestPosts.lastChild);
          latestPostCell.style.animation = "fade-in 3s"
        }
      }

      if (stats.lastNewPost == latestPosts[i].boardUri + "/" + (latestPosts[i].postId || latestPosts[i].threadId)) {
        markerPost = true;
      }

      if (!stats.startUpPost && i == latestPosts.length-1 && !markerPost) {
        stats.lastPostNotFound = true;
      }

    }

  }

  stats.lastNewPost = divLatestPosts.firstChild.id;
  stats.lastNewImage = divLatestImages.firstChild.id;

  if (stats.startUpPost || stats.startUpImage) {
    stats.startUpPost = false;
    stats.startUpImage = false;
  }

  if (stats.lastPostNotFound) {
    stats.startUpPost = true;
  }

  if (stats.lastImageNotFound) {
    stats.startUpImage = true;
  }


  setTimeout(stats.refresh, 6000);

};

stats.refresh = function() {
  if (!document.hidden) {
    api.localRequest(stats.refreshURL, stats.refreshCallback);
  } else {
    setTimeout(stats.refresh, 1000);
  }
};

stats.init();
