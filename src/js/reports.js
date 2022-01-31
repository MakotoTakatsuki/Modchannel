var reports = {};


reports.init = function () {

  reports.allAlreadyIgnored = false;
  api.convertButton('closeReportsFormButton', reports.closeReports, 'closeReportsField');
  reports.addIgnoreButton();
  reports.addIgnoreAllButton();
  reports.hideIgnoredReports();
  reports.addCloseButtons();
};

reports.addCloseButtons = function() {

  var reportCells = document.getElementsByClassName('reportCell');

  for (var i = 0; i < reportCells.length; i++) {

    var closeLink = document.createElement('a');
    closeLink.innerText = 'Close';
    closeLink.className = 'closeLink brackets';

    closeLink.onclick = function(e) {

      var reportDiv = document.getElementById('reportDiv');
      var reportCell = e.target.parentNode.parentNode;
      var closureCheckbox = reportCell.getElementsByClassName('closureCheckbox')[0];
      var params = {};
      params[closureCheckbox.name] = true;

      api.formApiRequest('closeReports', params, function requestComplete(status,
        data) {

        if (status === 'ok') {

          reportDiv.removeChild(reportCell);

        } else {
          alert(status + ': ' + JSON.stringify(data));
        }
      });

    };

    reportCells[i].getElementsByClassName('selectionDiv')[0].appendChild(closeLink);

  }

};

reports.closeReports = function() {

  var reportDiv = document.getElementById('reportDiv');

  var cells = [];

  var params = {
    duration : document.getElementById('fieldBanDuration').value,
    banReason : document.getElementById('fieldBanReason').value,
    banTarget : document.getElementById('banTargetCombo').selectedIndex,
    deleteContent : document.getElementById('deleteContentCheckbox').checked,
    closeAllFromReporter : document
        .getElementById('closeAllFromReporterCheckbox').checked
  };

  for (var i = 0; i < reportDiv.childNodes.length; i++) {

    var checkbox = reportDiv.childNodes[i]
        .getElementsByClassName('closureCheckbox')[0];

    if (checkbox.checked) {
      cells.push(reportDiv.childNodes[i]);
      params[checkbox.name] = true;
    }

  }

  api.formApiRequest('closeReports', params, function requestComplete(status,
      data) {

    if (status === 'ok') {

      for (i = 0; i < cells.length; i++) {
        reportDiv.removeChild(cells[i]);
      }

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};


reports.addIgnoreButton = function() {

  var closeButton = document.getElementById("closeReportsFormButton");

  var hidingButton = document.createElement('input');
  hidingButton.id = "ignoreButton";
  hidingButton.type = "button";
  hidingButton.value = "Ignore";
  hidingButton.addEventListener('click', reports.ignoreReports);

  closeButton.parentElement.append(hidingButton);

}


reports.ignoreReports = function() {

  var reportDiv = document.getElementById('reportDiv');

  var cells = [];

  for (var i = 0; i < reportDiv.childNodes.length; i++) {

    var checkbox = reportDiv.childNodes[i]
        .getElementsByClassName('closureCheckbox')[0];

    if (checkbox.checked) {

      var boardUri = reportDiv.childNodes[i]
          .getElementsByClassName('labelBoard')[0].innerText.replaceAll("/", "");

      var threadpostId = reportDiv.childNodes[i]
          .getElementsByClassName('linkQuote')[0].innerText;

      reports.addToIgnore(boardUri, threadpostId);
    }

  }

  reports.hideIgnoredReports();

};


reports.addIgnoreAllButton = function() {

  var ignoreButton = document.getElementById("ignoreButton");

  var hidingButton = document.createElement('input');
  hidingButton.type = "button";
  hidingButton.id = "ignoreAllButton";
  hidingButton.value = "Ignore All";
  hidingButton.addEventListener('click', reports.ignoreAllReports);

  ignoreButton.parentNode.insertBefore(hidingButton, ignoreButton.nextSibling);

}


reports.ignoreAllReports = function() {

  if (!reports.allAlreadyIgnored) {

    var reportDiv = document.getElementById('reportDiv');

    var cells = [];

    for (var i = 0; i < reportDiv.childNodes.length; i++) {

      var boardUri = reportDiv.childNodes[i]
          .getElementsByClassName('labelBoard')[0].innerText.replaceAll("/", "");

      var threadpostId = reportDiv.childNodes[i]
          .getElementsByClassName('linkQuote')[0].innerText;

      reports.addToIgnore(boardUri, threadpostId);

    }

    reports.hideIgnoredReports();

    reports.allAlreadyIgnored = true;

    document.getElementById("ignoreAllButton").value = "Show all";

  } else {
    reports.clearIgnore()
  }

};


reports.addToIgnore = function(boardUri, threadpostId) {

  var ignoredReports = localStorage.ignoredReports;

  var hidingData = ignoredReports ? JSON.parse(ignoredReports) : [];

  var element = boardUri + "-" + threadpostId;

  hidingData.push(element);

  localStorage.ignoredReports = JSON.stringify(hidingData);

}


reports.clearIgnore = function() {

  var hidingData = [];

  localStorage.ignoredReports = JSON.stringify(hidingData);

  location.reload(true)

}


reports.hideIgnoredReports = function() {

  var ignoredReports = localStorage.ignoredReports;

  var hidingData = ignoredReports ? JSON.parse(ignoredReports) : [];

  var reportDiv = document.getElementById('reportDiv');

  var counterRemovedReports = 0;

  for (var i = 0; i < hidingData.length; i++) {

    reportData = hidingData[i].split("-");

    var selector = "input.deletionCheckBox[name^='" + reportData[0] + "'][name$='" + reportData[1] + "']";

    var currentReportCells = reportDiv.querySelectorAll(selector);

    for (var j = 0; j < currentReportCells.length; j++) {
      if (currentReportCells[j].parentElement.parentElement.parentElement.parentElement.style.display != "none") {
        currentReportCells[j].parentElement.parentElement.parentElement.parentElement.getElementsByClassName("closureCheckbox")[0].checked = false;
        currentReportCells[j].parentElement.parentElement.parentElement.parentElement.style.display = "none";
        counterRemovedReports += 1;
      }
    }

  }

  if (counterRemovedReports != 0 && document.getElementsByClassName('reportCell').length == counterRemovedReports)
  {
    reports.allAlreadyIgnored = true;
    document.getElementById("ignoreAllButton").value = "Show all";
  }

}


reports.ignoreLinkInit = function() {

  var selectionDivs = document.getElementsByClassName("selectionDiv");

  for (var j = 0; j < selectionDivs.length; j++) {

    var ignoreLink = document.createElement('a');
    var linkText = document.createTextNode("Ignore");
    ignoreLink.appendChild(linkText);
    ignoreLink.className = "link brackets";
    ignoreLink.href = "#";
    ignoreLink.addEventListener('click', reports.ignoreReport);

    var whitespaceText = document.createTextNode(" ");
    selectionDivs[j].appendChild(whitespaceText);
    selectionDivs[j].appendChild(ignoreLink);

  }
}


reports.ignoreReport = function(e) {
  var reportCell = e.srcElement.parentElement.parentElement;

  var boardUri = reportCell
      .getElementsByClassName('labelBoard')[0].innerText.replaceAll("/", "");

  var threadpostId = reportCell
      .getElementsByClassName('linkQuote')[0].innerText;

  reportCell.style.display = "none";

  reports.addToIgnore(boardUri, threadpostId);

}


reports.init();
reports.ignoreLinkInit();
