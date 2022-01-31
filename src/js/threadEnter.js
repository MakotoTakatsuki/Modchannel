var threadEnter = {};

threadEnter.init = function() {

  var hash = window.location.hash.substring(1);

  if (hash.indexOf('q') === 0 && hash.length > 1) {

    hash = hash.substring(1);

    var post = document.getElementById(hash);

    if (post) {

      if (settings.get('qrMode')) {
        post.scrollIntoView();
        qr.showQr();
      }

      thread.parseLinkAndWrite(post.getElementsByClassName('linkQuote')[0]);

    }

  }

}

threadEnter.init();
