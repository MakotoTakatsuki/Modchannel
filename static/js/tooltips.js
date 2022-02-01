var tooltips = {};

tooltips.init = function() {

  tooltips.currentTooltip = null;
  tooltips.bottomMargin = 25;
  tooltips.loadingPreviews = {};
  tooltips.postCache = {};
  tooltips.knownPosts = {};
  tooltips.externalThreadCache = {};

  tooltips.bottomBacklinks = JSON.parse(localStorage.bottomBacklinks || "false");
  tooltips.inlineReplies = JSON.parse(localStorage.inlineReplies || "false");
  // tooltips.quoteReference = {}; Deprecated?
};

tooltips.addReplyUnderline = function(tooltip, board, quoteId) {
  if (board !== api.boardUri)
    return;

  var backlinks = Array.from(tooltip.getElementsByClassName("panelBacklinks"))
  .map((panel) => Array.from(panel.children)).flat();

  backlinks.concat(Array.from(tooltip.getElementsByClassName('quoteLink')))
  .forEach((a) => {
    if (a.innerText.indexOf(quoteId) === -1)
      return;
    a.classList.add('replyUnderline');
  })
}

tooltips.quoteAlreadyAdded = function(quoteUrl, innerPost) {
  var previews = innerPost.getElementsByClassName("replyPreview")[0];
  var message = innerPost.getElementsByClassName("divMessage")[0];

  return Array.from(message.children).concat(Array.from(previews.children))
  .reduce((acc, preview) => {
    var linkSelf = preview.getElementsByClassName("linkSelf")[0];
    return acc || (linkSelf && linkSelf.href === quoteUrl)
  }, false)
}

tooltips.addToKnownPostsForBackLinks = function(posting) {

  var postBoard = posting.parentNode.dataset.boarduri;
  var postId = posting.parentNode.id;

  var list = tooltips.knownPosts[postBoard] || {};
  tooltips.knownPosts[postBoard] = list;

  var backlinks = posting.getElementsByClassName("panelBacklinks")[0];

  var backlinkDupe = backlinks.cloneNode(true);
  var altBacklinks = document.createElement("DIV");
  altBacklinks.className = "altBacklinks";
  altBacklinks.append(backlinkDupe);
  posting.append(altBacklinks);

  if (tooltips.bottomBacklinks) {
    backlinks.style.display = "none";
    backlinkDupe.style.display = "block";
  }

  var replyPreview = document.createElement("DIV");
  replyPreview.className = "replyPreview";
  posting.append(replyPreview);

  list[postId] = {
    added : [],
    container : backlinks,
    altContainer : backlinkDupe,
  };

};

tooltips.processQuote = function(quote, isBacklink, noAddBacklink) {

  var quoteTarget = api.parsePostLink(quote.href);
  var innerPost = quote;

  while (!(innerPost.classList.contains('innerPost') ||
  innerPost.classList.contains('innerOP'))) {
	innerPost = innerPost.parentNode;
  }

  var sourceId = api.parsePostLink(innerPost.getElementsByClassName('linkSelf')[0].href).post;

  if (!isBacklink) {
	if (!noAddBacklink) {
      tooltips.addBackLink(quote, quoteTarget, innerPost.parentNode);
	  if (api.boardUri == quoteTarget.board) {
	    if (api.threadId == quoteTarget.post)
	      quote.innerHTML += ' (OP)';
	    else if (api.threadId && api.threadId != quoteTarget.thread && !quoteTarget.op)
	      quote.append(" (" + quoteTarget.thread + ')');
      }
    }
  }

  tooltips.addHoverEvents(quote, innerPost, quoteTarget, sourceId);

  tooltips.addInlineClick(quote, innerPost, isBacklink, quoteTarget, sourceId);
};

tooltips.addBackLink = function(quote, quoteTarget, containerPost) {

  var knownBoard = tooltips.knownPosts[quoteTarget.board];

  if (!knownBoard)
    return;

  var knownBackLink = knownBoard[quoteTarget.post];

  if (!knownBackLink)
    return;

  var sourceBoard = containerPost.dataset.boarduri;
  var sourcePost = containerPost.id;

  var sourceId = sourceBoard + '_' + sourcePost;

  if (knownBackLink.added.indexOf(sourceId) > -1) {
    return;
  } else {
    knownBackLink.added.push(sourceId);
  }

  var innerHTML = '&gt;&gt;';

  if (sourceBoard != quoteTarget.board) {
    innerHTML += '/' + containerPost.dataset.boarduri + '/';
  }

  innerHTML += sourcePost;

  var backLink = document.createElement('a');
  backLink.innerHTML = innerHTML;

  backLink.href = '/' + sourceBoard + '/res/' + quoteTarget.thread + '.html#'
      + sourcePost;

  knownBackLink.container.appendChild(backLink);
  knownBackLink.container.appendChild(document.createTextNode(' '));

  tooltips.processQuote(backLink, true);

  var dupe = backLink.cloneNode(true);
  knownBackLink.altContainer.appendChild(dupe);
  knownBackLink.altContainer.appendChild(document.createTextNode(' '));

  tooltips.processQuote(dupe, true);

};

tooltips.addHoverEvents = function(quote, innerPost, quoteTarget, sourceId) {

  var unmarkOnmouseout;

  var createTooltip = function(e) {
    if (typeof TouchEvent !== "undefined" && e instanceof TouchEvent) {
      if (!tooltips.currentTooltip)
        e.preventDefault();
      e.stopPropagation();
    }
    
    //loading or inline quote already added
    if (tooltips.loadingPreviews[quoteTarget.quoteUrl] ||
    tooltips.quoteAlreadyAdded(quoteTarget.quoteUrl, innerPost))
      return;

    var target = tooltips.postCache[quoteTarget.quoteUrl];

    //try to just mark the post
    if (target && document.getElementById(quoteTarget.post)) {
      var targetRect = target.getBoundingClientRect();
      
      const tol = 16; //maximum number of pixels that can be hidden
      var fromBottom = targetRect.y + targetRect.height - window.innerHeight;
      
      if (targetRect.y > -tol && fromBottom < tol) {
        if (!target.classList.contains('markedPost')) {
          unmarkOnmouseout = target;
          target.classList.add('markedPost');
          tooltips.addReplyUnderline(target, quoteTarget.board, sourceId);
        }
        return;
      }
    }
    
    var tooltip = document.createElement('div');
    tooltip.className = 'quoteTooltip';
    document.body.appendChild(tooltip);

    var rect = quote.getBoundingClientRect();
	if (rect.left > window.innerWidth/2) {
	  var right = window.innerWidth - rect.left - window.scrollX;
      tooltip.style.right = right + 'px';
	} else {
	  var left = rect.right + 10 + window.scrollX;
      tooltip.style.left = left + 'px';
    }
    tooltip.style.top = (rect.top + window.scrollY) + 'px';
    tooltip.style.display = 'inline';

    //add the cached node or begin query
    tooltips.loadTooltip(tooltip, quoteTarget.quoteUrl, sourceId);

	tooltips.currentTooltip = tooltip;
  };

  quote.addEventListener("mouseenter", createTooltip);
  quote.addEventListener("touchend", createTooltip);

  var destroyTooltip = function() {
    if (tooltips.currentTooltip) {
      tooltips.currentTooltip.remove();
      tooltips.currentTooltip = null;
    }
	if (unmarkOnmouseout) {
	  //unmark and remove reply underlines
	  unmarkOnmouseout.classList.remove('markedPost');
	  Array.from(unmarkOnmouseout.getElementsByClassName('replyUnderline'))
	    .forEach((a) => a.classList.remove('replyUnderline'))
	  unmarkOnmouseout = null;
	}
  };

  quote.addEventListener("mouseout", destroyTooltip);
  document.addEventListener("touchend", destroyTooltip);
}

tooltips.addInlineClick = function(quote, innerPost, isBacklink, quoteTarget, sourceId) {

  quote.addEventListener("click", function(e) {
    if (!tooltips.inlineReplies)
      return;
    
    e.preventDefault();
    var replyPreview = Array.from(innerPost.children)
      .find((a) => a.className === "replyPreview");
    var divMessage = innerPost.getElementsByClassName("divMessage")[0];

    if (tooltips.loadingPreviews[quoteTarget.quoteUrl] ||
    tooltips.quoteAlreadyAdded(quoteTarget.quoteUrl, innerPost))
      return;
    
    var placeHolder = document.createElement("div");
    if (isBacklink) {
      //innerPost.append(placeHolder);
      replyPreview.append(placeHolder);
    } else {
      quote.insertAdjacentElement("afterEnd", placeHolder);
    }
    placeHolder.style.whiteSpace = "normal";
    placeHolder.className = "inlineQuote";
    tooltips.loadTooltip(placeHolder, quoteTarget.quoteUrl, true);
    
    var close = document.createElement("A");
    close.innerText = "X";
    close.onclick = function() {
      placeHolder.remove();
    }
    close.style.className = "closeInline";
    placeHolder.getElementsByClassName("postInfo")[0].prepend(close);
    
    Array.from(placeHolder.getElementsByClassName("quoteLink"))
      .forEach((a) => tooltips.processQuote(a, false, true));
    
    var alts = placeHolder.getElementsByClassName("altBacklinks")[0].firstChild
    Array.from(alts.children)
      .forEach((a) => tooltips.processQuote(a, true));
    
    destroyTooltip();
  })
}

tooltips.generateHTMLFromData = function(postingData, tooltip, quoteUrl) {

  if (!postingData) {
    tooltip.innerHTML = 'Not found'; //TODO delete and disable hover?
    return;
  }
  tooltip.innerHTML = '';

  var quoteTarget = api.parsePostLink(quoteUrl);

  var tempDiv = posting.addPost(postingData, quoteTarget.board,
      quoteTarget.thread, true).getElementsByClassName('innerPost')[0];

  var delCheck = tempDiv.getElementsByClassName('deletionCheckBox')[0]
  if (delCheck)
    delCheck.remove();

  tooltips.postCache[quoteUrl] = tempDiv;

  var clone = tempDiv.cloneNode(true);

  tooltip.append(clone);

};

tooltips.loadTooltip = function(tooltip, quoteUrl, replyId) {

  var matches = quoteUrl.match(/\/(\w+)\/res\/(\d+)\.html\#(\d+)/);

  var board = matches[1];
  var thread = +matches[2];
  var post = +matches[3];

  // try to find a quote that works

  if (tooltips.postCache[quoteUrl]) {
    var temp = tooltips.postCache[quoteUrl].cloneNode(true);
    temp.className = 'innerPost'; //for innerOPs
	Array.from(temp.getElementsByClassName("inlineQuote")).forEach((q) => q.remove())

    var deletionCheckBox = temp.getElementsByClassName('deletionCheckBox')[0];

    if (deletionCheckBox) {
      deletionCheckBox.remove();
    }
	tooltip.append(temp);

    tooltips.addReplyUnderline(tooltip, board, replyId);

	//TODO move to HTML/node caching
    var yous = localStorage.getItem(board + "-yous");
    if (yous !== null && JSON.parse(yous).find((a) => a == post) !== undefined) {
      posting.markPostAsYou(undefined, tooltip);
    }
	return
  }

  if (tooltips.postCache[quoteUrl]) {
    return
  }

  tooltip.innerHTML = 'Loading';

  // failed; find in cache

  var postingData = tooltips.externalThreadCache[board + '/' + post];

  tooltips.loadingPreviews[quoteUrl] = true;

  if (postingData) {
    tooltips.generateHTMLFromData(postingData, tooltip, quoteUrl);
    tooltips.loadingPreviews[quoteUrl] = false;
    return;
  }

  var threadUrl = '/' + board + '/res/' + thread + '.json';

  api.localRequest(threadUrl, function receivedData(error, data) {

    delete tooltips.loadingPreviews[quoteUrl];

    if (error) {
      tooltip.innerHTML = 'Not found';
      return;
    }

    var threadData = JSON.parse(data);
    tooltips.cacheData(threadData);

    tooltips.generateHTMLFromData(tooltips.externalThreadCache[board + '/' + post],
        tooltip, quoteUrl);

  });

};

tooltips.cacheData = function(threadData) {

  threadData.posts.forEach(function(postData) {
    tooltips.externalThreadCache[threadData.boardUri + '/' + postData.postId] = postData;
  })
  tooltips.externalThreadCache[threadData.boardUri + '/' + threadData.threadId] = threadData;

};

tooltips.init();
