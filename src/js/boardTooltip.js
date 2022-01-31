var boardTootip = {};

boardTootip.init = function() {

  var threadClasses = document.querySelectorAll("div.postingDiv, div.postCell");

  for(var i = 0; i < threadClasses.length; i++) {
    linkSelf = threadClasses[i].getElementsByClassName("linkSelf")[0];
    href = linkSelf.getAttribute("href");
    hrefs = href.split("#");
    thread_id = hrefs[0].match(/\d/g).join("");
    post_id = hrefs[1].match(/\d/g).join("");
    if (post_id == thread_id) {
      threadClasses[i].getElementsByClassName("innerPost")[0].style.background = "#EEEEEE";
      threadClasses[i].getElementsByClassName("innerPost")[0].style.border = "solid 1px black";
    }
  }

}

boardTootip.init();
