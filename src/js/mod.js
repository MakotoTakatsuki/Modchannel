var modtool = {};

modtool.init = function() {

  var hostname = window.location.hostname;

  if ((location.hostname.split('.')[0] === 'mod' || hostname === 'localhost') && document.cookie.includes('hash')) {
    modtool.setModtool();
  }

};

modtool.setModtool = function() {

  var navOptionsSpanThread = document.getElementById("navOptionsSpanThread");
  if (navOptionsSpanThread !== null) {
    modtool.add_moderate_thread_button(navOptionsSpanThread);
    modtool.add_dynamic_buttons(navOptionsSpanThread);
    modtool.add_status_indicator(navOptionsSpanThread);
    modtool.update_dynamic_buttons();
    setInterval(modtool.update_dynamic_buttons, 60000);
  }

  var navOptionsSpanCatalog = document.getElementById("navOptionsSpanCatalog");
  if (navOptionsSpanCatalog !== null) {
    modtool.add_dynamic_buttons(navOptionsSpanCatalog);
    modtool.add_status_indicator(navOptionsSpanCatalog);
    modtool.update_dynamic_buttons();
    setInterval(modtool.update_dynamic_buttons, 60000);
  }

  var navOptionsSpan = document.getElementById("navOptionsSpan");
  if (navOptionsSpan !== null) {
    modtool.add_dynamic_buttons(navOptionsSpan);
    modtool.add_status_indicator(navOptionsSpan);
    modtool.update_dynamic_buttons();
    setInterval(modtool.update_dynamic_buttons, 60000);
  }

};

modtool.getCookie = function(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
};

modtool.setCookie = function(name,value,expires) {
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

modtool.add_moderate_thread_button = function(navBar) {

  var url = window.location.href.split('/');
  var modPage = url[3].includes("mod.js");
  var boardUri = "";
  var threadId = "";

  if(modPage){
    var regexp = /mod\.js\?boardUri=(\w+)&threadId=(\d+)/;
    var matches = url[3].match(regexp);
    boardUri = matches[1];
    threadId = matches[2];
  } else {
    boardUri = url[3];
    threadId = url[5].replace(".html", "");
  }

  var modlinkContainer = document.createElement('a');
  var button_text = "Mod On";
  var newurl = "/mod.js?boardUri=" + boardUri + "&threadId=" + threadId;

  if (modPage) {
    button_text = "Mod Off";
    newurl = "/" + boardUri + "/res/" + threadId + ".html";
  }

  var modlink = document.createTextNode(button_text);
  modlinkContainer.setAttribute('href', newurl);
  modlinkContainer.setAttribute('class', "brackets");
  modlinkContainer.appendChild(modlink);
  navBar.prepend(modlinkContainer);

};

modtool.add_dynamic_buttons = function(navBar) {

  var reportlinkContainer = document.createElement('a');
  var reportlink = document.createTextNode("");
  reportlinkContainer.setAttribute('href', "/openReports.js");
  reportlinkContainer.setAttribute('class', "brackets");
  reportlinkContainer.setAttribute('id', "reportlink");
  reportlinkContainer.style.display = "none";
  reportlinkContainer.appendChild(reportlink);
  navBar.prepend(document.createTextNode(' '));
  navBar.prepend(reportlinkContainer);

  var appeallinkContainer = document.createElement('a');
  var appeallink = document.createTextNode("");
  appeallinkContainer.setAttribute('href', "/appealedBans.js");
  appeallinkContainer.setAttribute('class', "brackets");
  appeallinkContainer.setAttribute('id', "appeallink");
  appeallinkContainer.style.display = "none";
  appeallinkContainer.appendChild(appeallink);
  navBar.prepend(document.createTextNode(' '));
  navBar.prepend(appeallinkContainer);

  var messagelinkContainer = document.createElement('a');
  var messagelink = document.createTextNode("");
  messagelinkContainer.setAttribute('href', "/postbox.js");
  messagelinkContainer.setAttribute('class', "brackets");
  messagelinkContainer.setAttribute('id', "messagelink");
  messagelinkContainer.innerText = "PM";
  messagelinkContainer.style.display = "inline";
  messagelinkContainer.appendChild(messagelink);
  navBar.prepend(document.createTextNode(' '));
  navBar.prepend(messagelinkContainer);

};

modtool.add_status_indicator = function(navBar) {

  var statuslinkContainer = document.createElement('a');
  var statuslink = document.createTextNode("LOGGED OUT ;_;");
  statuslinkContainer.setAttribute('class', "brackets");
  statuslinkContainer.setAttribute('id', "statuslink");
  statuslinkContainer.style.display = "none";
  statuslinkContainer.appendChild(statuslink);
  navBar.prepend(document.createTextNode(' '));
  navBar.prepend(statuslinkContainer);
  statuslinkContainer.addEventListener('click', function() {
    setCookie("loginredirect", window.location.pathname, "" );
    window.location.pathname = "/login.html";
  }, false);

};

modtool.update_dynamic_buttons = function() {

  var xhr1 = new XMLHttpRequest();
  xhr1.open('GET', '/modapi.js?json=1', true);
  xhr1.responseType = 'json';
  xhr1.onload = function () {
    if (xhr1.readyState === xhr1.DONE) {
      if (xhr1.status === 200) {
        var statusLink = document.getElementById("statuslink");
        var appealLink = document.getElementById("appeallink");
        var messageLink = document.getElementById("messagelink");

        var response = xhr1.response;
        if (response.status == "ok") {
          statusLink.style.display = "none";
          var number_personal_appeals = response.data.openPersonalAppeals;
          var number_messages = response.data.newMessages;

          if (number_personal_appeals > 0){
            appealLink.innerText = "Appeals (" + number_personal_appeals + ")";
            appealLink.style.display = "inline";
          }else{
            appealLink.innerText = "Appeals";
            appealLink.style.display = "none";
          }

          if (number_messages > 0){
            var counterSpan = document.createElement("SPAN");
            counterSpan.style.color = "red";
            counterSpan.style.fontWeight = 700;
            counterSpan.innerText = "(" + number_messages + ")";
            messageLink.innerText = "PM ";
            messageLink.append(counterSpan);
            messageLink.style.display = "inline";
          } else {
            messageLink.innerText = "PM";
          }
          messageLink.title = "Logged in as " + modtool.getCookie("login");

        } else if (response.status == "error") {
          statusLink.style.display = "inline";
        }
      }
    }
  };
  xhr1.send(null);


  var xhr2 = new XMLHttpRequest();
  xhr2.open('GET', '/openReports.js?json=1', true);
  xhr2.responseType = 'json';
  xhr2.onload = function () {
    if (xhr2.readyState === xhr2.DONE) {
      if (xhr2.status === 200) {
        var reportLink = document.getElementById("reportlink");

        var response = xhr2.response;
        if (response.status == "ok") {
          var allReports = response.data.reports;
          var number_reports = allReports.length;


          for (var i = 0; i < allReports.length; i++) {
            var currentReport = allReports[i];
            var boardUri = currentReport.boardUri;
            var threadpostId = currentReport.postId || currentReport.threadId;

            var identifier = boardUri + "-" + threadpostId;

            var ignoredReports = localStorage.ignoredReports;
            var hidingData = ignoredReports ? JSON.parse(ignoredReports) : [];

            for (var j = 0; j < hidingData.length; j++) {
              var reportData = hidingData[j];

              if(identifier == reportData) {
                number_reports = number_reports - 1;
                break;
              }

            }
          }

          if (number_reports > 0){
            var counterSpan = document.createElement("SPAN");
            counterSpan.style.color = "red";
            counterSpan.style.fontWeight = 700;
            counterSpan.innerText = "(" + number_reports + ")";
            reportLink.innerText = "Reports ";
            reportLink.append(counterSpan);
            reportLink.style.display = "inline";
          } else {
            reportLink.innerText = "Reports";
            reportLink.style.display = "none";
          }
        }
      }
    }
  };
  xhr2.send(null);


};

modtool.init();

