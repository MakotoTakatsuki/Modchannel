var hashcash = {};

hashcash.workerSupport = function() {
  return window.Worker;
};

hashcash.webAssemblySupport = function() {
  return (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function");
};

hashcash.alertNoSupportFor = function(feature) {
  alert("Your browser doesn't support " + feature + "!");
};

hashcash.isBrowserCompatible = function() {
  if (!hashcash.workerSupport()) {
    hashcash.alertNoSupportFor("web workers");
    return false;
  } else if (!hashcash.webAssemblySupport()) {
    hashcash.alertNoSupportFor("web assembly");
    return false;
  }
  return true;
};

hashcash.getParameters = function(callback) {

  api.localRequest(hashcash.getPath, function gotHashcash(error, data) {

    if (error) {
      return callback(error);
    }

    var dataObject = JSON.parse(data);

    if (dataObject.status !== 'ok') {
      return callback(dataObject.status);
    }

    if (dataObject.data.solved === true) {
      return callback('solved');
    }

    callback(null, dataObject.data);

  });

};

hashcash.init = function() {

  hashcash.getPath = '/addon.js/hashcash?action=get&json=1';

  hashcash.getParameters((status, parameters) => {

    if (status) {
      if (status === 'solved') {
        return;
      } else {
        alert(status);
      }
    } else if (hashcash.isBrowserCompatible()) {
      hashcash.vars = parameters;
      hashcash.workerPath = '/.static/js/hashcash_worker.js';
      hashcash.solvePath = 'addon.js/hashcash?action=solve';
      hashcash.el = {};
      hashcash.workers = [];
      hashcash.workDone = [];
      hashcash.workerRanges = [];
      hashcash.maxWorkers = navigator.hardwareConcurrency || 4;
      hashcash.initConfiguration();
      hashcash.el.startButton.onclick = hashcash.beginWork;
    } else {
      var paragraphs = document.getElementsByTagName('p');
      paragraphs[1].style = 'color: red';
    }

    hashcash.addNoJsButton();

  });

};

hashcash.addNoJsButton = function() {
  var firstDiv = document.getElementById('firstDiv');
  var noJsButton = document.createElement('button');
  noJsButton.id ='noJsButton';
  noJsButton.type ='button';
  noJsButton.innerText = 'Click here to solve this without your browser';
  noJsButton.onclick = function() {
    document.getElementsByTagName('noscript')[0].outerHTML = document.getElementsByTagName('noscript')[0].innerHTML;
    if (document.getElementById('threadsHeadline')) {
      document.getElementById('threadsHeadline').style = 'display: none;';
      document.getElementById('threadsContainer').style = 'display: none;';
    }
    document.getElementById('noJsButton').style = 'display: none;';
  };
  firstDiv.appendChild(noJsButton);
};

hashcash.initConfiguration = function() {
  // Create elements
  var subpageWrapper = document.getElementById('subpageWrapper');
  var headline = document.createElement('h2');
  var container = document.createElement('div');
  var workerCount = document.createElement('input');
  var startButton = document.createElement('button');

  // Set element attributes
  headline.innerText = 'Threads';
  headline.id = 'threadsHeadline';
  container.id = 'threadsContainer';
  workerCount.min = 1;
  workerCount.type = 'number';
  workerCount.size = 3;
  workerCount.value = Math.ceil(hashcash.maxWorkers / 2);
  workerCount.max = hashcash.maxWorkers;
  workerCount.step = 1;
  startButton.id = 'startButton';
  startButton.innerText = "Start";

  // Append
  container.appendChild(workerCount);
  container.appendChild(startButton);
  subpageWrapper.appendChild(headline);
  subpageWrapper.appendChild(container);

  hashcash.el.workerCount = workerCount;
  hashcash.el.startButton = startButton;
  hashcash.el.configHeadline = headline;
};

hashcash.lockConfiguration = function() {
  document.getElementById('noJsButton').style = 'display: none;';
  hashcash.el.workerCount.disabled = true;
  hashcash.el.startButton.remove();
}

hashcash.getCustomWorkerCount = function() {
  var wc = Math.max(Math.min(hashcash.el.workerCount.value, hashcash.maxWorkers), 1);
  wc = Math.floor(wc);
  hashcash.el.workerCount.value = wc;
  return wc;
};

hashcash.isRunning = function() {
  return hashcash.running;
};

hashcash.activateUnloadConfirmation = function() {
  hashcash.running = true;
  window.onbeforeunload = function() {
    if (!hashcash.isRunning()) {
      return undefined;
    }
    return 'Your progress will be lost if you leave this page.';
  };
};

hashcash.checkExpiration = function() {

  hashcash.getParameters((status, parameters) => {

    if (status === 'No bypass') {
      hashcash.shutdown();
      hashcash.running = false;
      hashcash.el.progressHeadline.innerText = 'Expired :(';
      alert('Sorry, but the bypass expired because you took too long! You may want to clear your cookies and try again.');
    }

  });

};

hashcash.beginWork = function() {

  hashcash.lockConfiguration();

  if (hashcash.hasBegun) {
    return;
  }

  hashcash.hasBegun = true;
  hashcash.activateUnloadConfirmation();

  hashcash.workerCount = hashcash.getCustomWorkerCount();
  hashcash.perWorker = Math.floor(hashcash.vars.difficulty / hashcash.workerCount);

  hashcash.startDate = new Date();

  for (var i = 0; i < hashcash.workerCount; i++) {
    var from = hashcash.perWorker * i + (i > 0 ? 1 : 0);
    var to = i != hashcash.workerCount - 1 ? hashcash.perWorker * (i + 1) : hashcash.vars.difficulty - 1;
    console.log("Worker #" + i + ": " + from + " to " + to);
    hashcash.startWorker(i, from, to);
  }

  hashcash.initProgress();

  hashcash.lastValue = 0;
  hashcash.progressInterval = setInterval(hashcash.updateProgress, 250);
  hashcash.expirationInterval = setInterval(hashcash.checkExpiration, 60000);
};

hashcash.startWorker = function(pid, from, to) {
  hashcash.workerRanges.push({
    'from': from,
    'to': to
  });
  var worker = new Worker(hashcash.workerPath);
  worker.onmessage = hashcash.onMessageFunction(pid);
  hashcash.workers.push(worker);
  hashcash.workDone.push(0);
}

hashcash.workSum = function() {
  var sum = 0;
  for(var i = 0; i < hashcash.workDone.length; i++) {
    sum += hashcash.workDone[i];
  }
  return sum;
};

hashcash.initProgress = function() {
  // Create elements
  var subpageWrapper = document.getElementById('subpageWrapper');
  var headline = document.createElement('h2');
  var progress = document.createElement('progress');
  var container = document.createElement('div');

  // Set element attributes
  headline.innerText = 'Progress';
  progress.value = 0;
  progress.id = 'progressBar';
  progress.max = hashcash.vars.difficulty;

  // Append
  container.appendChild(progress)
  subpageWrapper.appendChild(headline)
  subpageWrapper.appendChild(container)

  hashcash.el.progressBar = progress;
  hashcash.el.progressHeadline = headline;
};

hashcash.updateProgress = function() {
  var sum = hashcash.workSum();
  var percentage = ((sum / hashcash.vars.difficulty) * 100);
  var percentageFixed = percentage.toFixed(2);
  hashcash.el.progressBar.value = sum;
  var progressText = 'Progress: ' + percentageFixed + '%';

  var timeElapsedSec = (new Date() - hashcash.startDate) / 1000;

  if (percentage > 0.1) {
    timeElapsedSec = (timeElapsedSec * (100 / percentage)) - timeElapsedSec;
    progressText += ' ~ ' + timeElapsedSec.toFixed(0) + 's';
  }

  hashcash.el.progressHeadline.innerText = progressText;
};

hashcash.terminateWorkers = function() {
  for (var i = 0; i < hashcash.workers.length; i++) {
    var text = "Terminating Worker #" + i;
    hashcash.workers[i].terminate();
  }
};

hashcash.shutdown = function() {
  hashcash.clearIntervals();
  hashcash.terminateWorkers();
}

hashcash.clearIntervals = function() {
  clearInterval(hashcash.expirationInterval);
  clearInterval(hashcash.timeInterval);
  clearInterval(hashcash.progressInterval);
}

hashcash.sendSolution = function(value, sendCount) {
  api.formApiRequest(hashcash.solvePath, {
    secret: value
  }, function requestComplete(status, data) {
    if (status === 'ok') {
      hashcash.running = false;
      location.reload();
    } else if (status === 'fail') {
      hashcash.el.progressHeadline.innerText = 'Solution found, but connection failed! Trying again... ' + (sendCount !== 0 ? '(' + sendCount + ')' : '');
      setTimeout(() => {
        hashcash.sendSolution(value, sendCount + 1);
      }, 10000);
    } else {
      alert(status);
    }
  }, true, null, true);
}

hashcash.onMessageFunction = function(pid) {
  return function fun(resp) {
    if (resp.data['event'] == 'progress') {
      hashcash.workDone[pid] = resp.data['value'];
    } else if (resp.data['event'] == 'finished') {
      hashcash.shutdown();
      hashcash.sendSolution(resp.data['value'], 0);
    } else if (resp.data['event'] == 'start') {
      hashcash.workers[pid].postMessage(
        [hashcash.vars.hash, hashcash.workerRanges[pid]['from'], hashcash.workerRanges[pid]['to']]
      );
    }
  }
};

hashcash.init();
