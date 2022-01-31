api.isBoard = true;

var overboard = {};

overboard.init = function() {

  var threadClasses = document.querySelectorAll("div.opCell");
  for(var i = 0; i < threadClasses.length; i++) {
    var boarduri = threadClasses[i].getAttribute("data-boarduri");
    var p = document.createElement('a');
    p.setAttribute('href', '/'+boarduri);
    var pTxt1 = document.createTextNode("/"+boarduri+"/");
    p.appendChild(pTxt1);

    var hide_link = document.createElement('span');
    hide_link.setAttribute('href', '');
    hide_link.setAttribute("class", 'unimportantHide')
    hide_link.setAttribute("data-boarduri", boarduri);
    var pTxt2 = document.createTextNode(" (" + lang.hideThreadsOnOverboard + ")");

    hide_link.addEventListener("click", overboard.hideThreadsFromBoard);
    hide_link.appendChild(pTxt2);

    firstChild = threadClasses[i].children[1]
    overboard.insertBefore(p, firstChild);
    overboard.insertBefore(hide_link, firstChild);

  }

  overboard.hide_boards_from_localstorage();

};

overboard.insertBefore = function(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode);
};

overboard.hideThreadsFromBoard = function(event) {
  var board = event.originalTarget.getAttribute("data-boarduri")
  overboard.toggle_board(board)
};

overboard.hide_threads_from_board = function(board) {
  var hide_these_threads = document.querySelectorAll('div.opCell[data-boarduri="' + board + '"]');
  for(var i = 0; i < hide_these_threads.length; i++) {
    hide_these_threads[i].getElementsByClassName("divPosts")[0].style.display = "none"
    hide_these_threads[i].getElementsByClassName("innerOP")[0].style.display = "none"
    hide_these_threads[i].getElementsByClassName("unimportantHide")[0].textContent = " (" + lang.showThreadsOnOverboard + ")"
  }
};

overboard.show_threads_from_board = function(board) {
  var hide_these_threads = document.querySelectorAll('div.opCell[data-boarduri="' + board + '"]');
  for(var i = 0; i < hide_these_threads.length; i++) {
    hide_these_threads[i].getElementsByClassName("divPosts")[0].style.display = ""
    hide_these_threads[i].getElementsByClassName("innerOP")[0].style.display = ""
    hide_these_threads[i].getElementsByClassName("unimportantHide")[0].textContent = " (" + lang.hideThreadsOnOverboard + ")"
  }
  expandComment.applyAll(false);
};

overboard.toggle_board = function(board) {
  current_storage = localStorage.getItem("overboard_hidden_boards")
  parsed = JSON.parse(current_storage || "[]")
  if (parsed.indexOf(board) == -1 ) {
    parsed.push(board)
    localStorage.setItem("overboard_hidden_boards", JSON.stringify(parsed))
    overboard.hide_threads_from_board(board)
  } else {
    parsed.splice(parsed.indexOf(board), 1);
    localStorage.setItem("overboard_hidden_boards", JSON.stringify(parsed))
    overboard.show_threads_from_board(board)
  }
};

overboard.hide_boards_from_localstorage = function() {
  current_storage = localStorage.getItem("overboard_hidden_boards")
  parsed = JSON.parse(current_storage || "[]")
  for(var i = 0; i < parsed.length; i++) {
    overboard.hide_threads_from_board(parsed[i])
  }
};

overboard.init();
