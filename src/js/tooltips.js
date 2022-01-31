var tooltips = {};

tooltips.init = function() {

  tooltips.bottomMargin = 25;
  tooltips.loadingPreviews = {};
  tooltips.loadedContent = {};
  tooltips.quoteReference = {};
  tooltips.knownPosts = {};
  tooltips.knownData = {};

  var posts = document.getElementsByClassName('postCell');

  for (var i = 0; i < posts.length; i++) {
    tooltips.addToKnownPostsForBackLinks(posts[i])
  }

  var threads = document.getElementsByClassName('opCell');

  for (i = 0; i < threads.length; i++) {
    tooltips.addToKnownPostsForBackLinks(threads[i])
  }

  tooltips.cacheExistingHTML('innerOP');
  tooltips.cacheExistingHTML('innerPost');

  var quotes = document.querySelectorAll('.quoteLink,.highlightlink');
  var userPosts = tooltips.getUserPosts();

  for (i = 0; i < quotes.length; i++) {
    tooltips.processQuote(quotes[i]);
    if (settings.get('showYous')) {
      tooltips.addYouToQuote(quotes[i], userPosts);
    }
  }

};

tooltips.getUserPosts = function() {
  var ids = [];
  try {
    var posts = Object.keys(JSON.parse(localStorage["postingPasswords"]));

    for (i = 0; i < posts.length; i++) {
      ids.push(">>" + posts[i].split('/')[2]);
    }
  } catch(err) {}
  return ids;
};

tooltips.addYouToQuote = function(quote, userPosts) {
  if(userPosts.indexOf(quote.text) !== -1) {
    var span = document.createElement("span");
    span.className = 'post-you';
    span.innerHTML = ' ' + lang.postYou;
    quote.parentNode.insertBefore(span, quote.nextSibling);
  }
};

tooltips.cacheExistingHTML = function(className) {

  var innerContent = document.getElementsByClassName(className);

  for (var i = 0; i < innerContent.length; i++) {

    var inner = innerContent[i];

    var temp = document.createElement('div');
    temp.className = 'innerPost';
    temp.innerHTML = inner.innerHTML;

    var deletionCheckBox = temp.getElementsByClassName('deletionCheckBox')[0];

    if (deletionCheckBox) {
      deletionCheckBox.remove();
    }

    var extraMenuButton = temp.getElementsByClassName('extraMenuButton')[0];

    if (extraMenuButton) {
      extraMenuButton.remove();
    }

    var quoteLink = temp.getElementsByClassName('linkSelf')[0];
    tooltips.loadedContent[quoteLink.href] = temp.outerHTML;
  }

};

tooltips.addToKnownPostsForBackLinks = function(posting) {

  var postBoard = posting.dataset.boarduri;

  var list = tooltips.knownPosts[postBoard] || {};
  tooltips.knownPosts[postBoard] = list;

  list[posting.id] = {
    added : [],
    container : posting.getElementsByClassName('panelBacklinks')[0]
  };

};

tooltips.addBackLink = function(quoteUrl, quote) {

  var matches;
  var board;
  var thread;
  var post;

  if (window.location.pathname == "/mod.js") {
    matches = quoteUrl.match(/\/mod\.js\?boardUri=(\w+)&threadId=(\d+)\#(\d+)/);
    if (!matches) {
      matches = quoteUrl.match(/\/(\w+)\/res\/(\d+)\.html\#(\d+)/);
    }
    board = matches[1];
    thread = matches[2];
    post = matches[3];
  } else if (/^\/\w+\/last\//.test(window.location.pathname)){
    matches = quoteUrl.match(/\/(\w+)\/last\/(\d+)\.html\#(\d+)/);
    if (!matches) {
      matches = quoteUrl.match(/\/(\w+)\/res\/(\d+)\.html\#(\d+)/);
    }
    board = matches[1];
    thread = matches[2];
    post = matches[3];
  } else {
    matches = quoteUrl.match(/\/(\w+)\/res\/(\d+)\.html\#(\d+)/);
    board = matches[1];
    thread = matches[2];
    post = matches[3];
  }

  var knownBoard = tooltips.knownPosts[board];

  if (knownBoard) {

    var knownBackLink = knownBoard[post];

    if (knownBackLink) {

      var containerPost = quote.parentNode.parentNode;

      while (!containerPost.classList.contains('postCell')
          && !containerPost.classList.contains('opCell')) {
        containerPost = containerPost.parentNode;
      }

      var sourceBoard = containerPost.dataset.boarduri;
      var sourcePost = containerPost.id;

      var sourceId = sourceBoard + '_' + sourcePost;

      if (knownBackLink.added.indexOf(sourceId) > -1) {
        return;
      } else {
        knownBackLink.added.push(sourceId);
      }

      var innerHTML = '>>';

      if (sourceBoard != board) {
        innerHTML += '/' + containerPost.dataset.boarduri + '/';
      }

      innerHTML += sourcePost;

      var backLink = document.createElement('a');
      backLink.innerHTML = innerHTML;

      var backLinkUrl;

      if (window.location.pathname == "/mod.js") {
        backLinkUrl = '/mod.js?boardUri=' + sourceBoard + '&threadId=' + thread + '#' + sourcePost;
      } else if (/^\/\w+\/last\//.test(window.location.pathname)){
        backLinkUrl = '/' + sourceBoard + '/last/' + thread + '.html#' + sourcePost;
      } else {
        backLinkUrl = '/' + sourceBoard + '/res/' + thread + '.html#' + sourcePost;
      }

      backLink.href = backLinkUrl;

      knownBackLink.container.appendChild(backLink);

      tooltips.processQuote(backLink, true, quoteUrl);

    }

  }

};

tooltips.checkHeight = function(tooltip) {

  var windowHeight = document.documentElement.clientHeight + window.scrollY;

  if (tooltip.offsetHeight + tooltip.offsetTop + tooltips.bottomMargin > windowHeight) {
    tooltip.style.top = (windowHeight - tooltip.offsetHeight - tooltips.bottomMargin)
        + 'px';
  }

}

tooltips.markQuotes = function (tooltip, backLinkQuoteUrl) {

  var previewTooltips = tooltip.getElementsByClassName('quoteLink');

  if (previewTooltips.length > 1) {

    for (var i = 0; i < previewTooltips.length; i++) {

      if (previewTooltips[i].href === backLinkQuoteUrl) {
        previewTooltips[i].style = 'text-decoration-style: dashed;';
      }

    }
  }

}

tooltips.processQuote = function(quote, backLink, backLinkQuoteUrl) {

  var tooltip;

  var quoteUrl = quote.href;

  if (!backLink) {
    tooltips.addBackLink(quoteUrl, quote);
  }

  quote.onmouseenter = function(e) {

    tooltip = document.createElement('div');
    tooltip.className = 'quoteTooltip boardThreadList';

    document.body.appendChild(tooltip);

    var rect = quote.getBoundingClientRect();

    tooltip.style.display = 'inline';

    /* begin stealing from 8chan.se */

    if (rect.left > window.innerWidth/2) {
      var right = window.innerWidth - rect.left - window.scrollX;
      tooltip.style.right = right + 'px';
    } else {
      var left = rect.right + 10 + window.scrollX;
      tooltip.style.left = left + 'px';
    }
    tooltip.style.top = (rect.top + window.scrollY) + 'px';

    /* end stealing from 8chan.se */

    if (tooltips.loadedContent[quoteUrl]) {
      quote.style.cursor = '';
      tooltip.innerHTML = tooltips.loadedContent[quoteUrl];

      var isOP = tooltip.getElementsByClassName('opHead').length > 0;

      if (isOP) {
        tooltip.className += 'tooltipFix';
      }


      if (backLinkQuoteUrl) {
        tooltips.markQuotes(tooltip, backLinkQuoteUrl);
      }

      tooltips.checkHeight(tooltip);

    } else {
      quote.style.cursor = 'wait';
    }

    if (!tooltips.loadedContent[quoteUrl]
        && !tooltips.loadingPreviews[quoteUrl]) {
      tooltips.loadQuote(tooltip, quoteUrl, quote);
    }

    if (!api.isBoard) {
      var matches = quote.href.match(/\#(\d+)/);

      quote.onclick = function() {
        thread.markPost(matches[1]);
      };
    }

  };

  quote.onmouseout = function() {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  };

};

tooltips.generateHTMLFromData = function(postingData, tooltip, quoteUrl, quote) {

  if (!postingData) {
    quote.style.cursor = 'not-allowed';
    return;
  }

  var tempDiv = posting.addPost(postingData, postingData.boardUri,
      postingData.threadId, true).getElementsByClassName('innerPost')[0];

  tempDiv.getElementsByClassName('deletionCheckBox')[0].remove();

  tempDiv.getElementsByClassName('extraMenuButton')[0].remove();

  quote.style.cursor = '';

  tooltip.innerHTML = tempDiv.outerHTML;

  tooltips.checkHeight(tooltip);

  tooltips.loadedContent[quoteUrl] = tempDiv.outerHTML;

};

tooltips.cacheData = function(threadData) {

  for (var i = 0; i < threadData.posts.length; i++) {
    var postData = threadData.posts[i];
    tooltips.knownData[threadData.boardUri + '/' + postData.postId] = postData;
  }

  tooltips.knownData[threadData.boardUri + '/' + threadData.threadId] = threadData;

};

tooltips.loadQuote = function(tooltip, quoteUrl, quote) {

  var board;
  var thread;
  var post;

  if (window.location.pathname == "/mod.js") {
    matches = quoteUrl.match(/\/mod\.js\?boardUri=(\w+)&threadId=(\d+)\#(\d+)/);
    if (!matches) {
      matches = quoteUrl.match(/\/(\w+)\/res\/(\d+)\.html\#(\d+)/);
    }
    board = matches[1];
    thread = +matches[2];
    post = +matches[3];
  } else if (/^\/\w+\/last\//.test(window.location.pathname)){
    matches = quoteUrl.match(/\/(\w+)\/last\/(\d+)\.html\#(\d+)/);
    if (!matches) {
      matches = quoteUrl.match(/\/(\w+)\/res\/(\d+)\.html\#(\d+)/);
    }
    board = matches[1];
    thread = +matches[2];
    post = +matches[3];
  } else {
    matches = quoteUrl.match(/\/(\w+)\/res\/(\d+)\.html\#(\d+)/);
    board = matches[1];
    thread = +matches[2];
    post = +matches[3];
  }

  var postingData = tooltips.knownData[board + '/' + post];

  if (postingData) {
    tooltips.generateHTMLFromData(postingData, tooltip, quoteUrl, quote);
    return;
  }

  var threadUrl = '/' + board + '/res/' + thread + '.json';

  tooltips.loadingPreviews[quoteUrl] = true;

  api.localRequest(threadUrl, function receivedData(error, data) {

    delete tooltips.loadingPreviews[quoteUrl];

    if (error) {
      quote.style.cursor = 'not-allowed';
      return;
    }

    tooltips.cacheData(JSON.parse(data));

    tooltips.generateHTMLFromData(tooltips.knownData[board + '/' + post], tooltip, quoteUrl, quote);

  });

};

tooltips.init();
