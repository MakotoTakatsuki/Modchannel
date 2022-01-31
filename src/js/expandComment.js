var expandComment = {};

expandComment.init = function() {

  expandComment.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (expandComment.isSafari) {
    return;
  }

  expandComment.applyAll(null, true);

  window.onresize = function() {
    expandComment.applyAll(false);
  }

};

expandComment.applyAll = function(init) {

  if (expandComment.isSafari) {
    return;
  }

  var expandCheckBoxList = document.getElementsByClassName('expandCheckBox');

  for (var i = 0; i < expandCheckBoxList.length; i++) {
    expandComment.apply(expandCheckBoxList[i], expandCheckBoxList[i].parentNode, init);
  }

}

expandComment.apply = function(expandCheckBox, inner, init) {

  if (expandComment.isSafari) {
    return;
  }

  var isInsideThread = document.getElementById('mainPanel');
  var isOP = inner.classList.contains('innerOP');

  if (isOP && isInsideThread || (expandCheckBox.checked && !init)) {
    return;
  }

  var contentOverflow = inner.getElementsByClassName('contentOverflow')[0];
  var expandLabel = inner.getElementsByClassName('expandLabel')[0];
  var collapseLabel = inner.getElementsByClassName('collapseLabel')[0];
  var bottomGradient = inner.getElementsByClassName('bottomGradient')[0];

  if (contentOverflow.scrollHeight > contentOverflow.clientHeight) {

    contentOverflow.scrollTop = 0;

    if (expandCheckBox.checked) {
      bottomGradient.classList.add('hidden');
      collapseLabel.classList.remove('hidden');
    } else {
      expandLabel.classList.remove('hidden');
      bottomGradient.classList.remove('hidden');
    }

    var commentExpand = inner.getElementsByClassName('commentExpand')[0];

    var el = document.getElementById('lineHeightDef');
    var lineHeight = parseFloat(window.getComputedStyle(el, null).getPropertyValue('font-size'));
    var lines =  Math.ceil((contentOverflow.scrollHeight - contentOverflow.clientHeight) / lineHeight);

    commentExpand.innerText = lines > 1 ? lang.commentExpand.replace('__lines__', lines) : lang.commentExpandSingular;

    contentOverflow.classList.add('yOverflowHidden');

    expandCheckBox.onchange = expandComment.toggleState;

  } else {

    expandCheckBox.checked = false;
    expandLabel.classList.add('hidden');
    collapseLabel.classList.add('hidden');
    bottomGradient.classList.add('hidden');

    expandCheckBox.onchange = null;

  }

};

expandComment.toggleState = function() {

  var inner = this.parentNode;
  var isOP = inner.classList.contains('innerOP');
  var contentOverflow = inner.getElementsByClassName('contentOverflow')[0];
  var expandLabel = inner.getElementsByClassName('expandLabel')[0];
  var collapseLabel = inner.getElementsByClassName('collapseLabel')[0];
  var expandCheckBox = inner.getElementsByClassName('expandCheckBox')[0];

  if (this.checked) { // expand

    expandLabel.classList.add('hidden');

    collapseLabel.classList.remove('hidden');

  } else { // collapse

    if (!isOP) {
      var expandedCells = contentOverflow.getElementsByClassName('expandedCell');
      for (var i = 0; i < expandedCells.length; i++) {
        expandedCells[i].getElementsByClassName('imgLink')[0].click();
      }
      var hideLinks = inner.getElementsByClassName('hideLink');
      for (var i = 0; i < hideLinks.length; i++) {
        hideLinks[i].click();
      }
    }

    expandLabel.classList.remove('hidden');
    collapseLabel.classList.add('hidden');

    if (contentOverflow.getBoundingClientRect().top < 0) {
      inner.parentNode.scrollIntoView();
    }

    expandComment.apply(expandCheckBox, inner);

  }

};

expandComment.init();
