var tipping = {};

tipping.re = /0x[abcdefABCDEF0123456789]{40}/i;

tipping.init = function() {

  var messageSubjects = document.querySelectorAll("span.labelSubject");

  for(var i = 0; i < messageSubjects.length; i++) {
    tipping.processSubject(messageSubjects[i]);
  }

};

tipping.processSubject = function(messageSubject) {
  var text = messageSubject.textContent;
  var match = text.match(tipping.re);
  if (match) {
    var walletAdr = match[0];
    messageSubject.textContent = text.replace(tipping.re, "");
    var element = document.createElement("a");
    element.textContent = "₭";
    element.setAttribute("address", walletAdr);
    element.setAttribute("class", "tipping");
    element.setAttribute("href", "#" + walletAdr);
    element.setAttribute("title", walletAdr);
    messageSubject.appendChild(element);
  }
};


tipping.init();
