//api.isBoard = true;

function insertBefore(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode);
}

var threadClasses = document.querySelectorAll("div.postCell");

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
  
    
  var boarduri = threadClasses[i].getAttribute("data-boarduri");
  var p = document.createElement('a');
  p.setAttribute('href', '/'+boarduri);
  var pTxt1 = document.createTextNode("/"+boarduri+"/");
  p.appendChild(pTxt1);
  p.style.float = "left"
  firstChild = threadClasses[i].children[0]
  insertBefore(p, firstChild);
}
