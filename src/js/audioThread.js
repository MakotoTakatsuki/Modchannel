audioThread = {}


audioThread.audioFiles = ["mp3", "flac", "ogg", "opus"]

audioThread.audioPlayerLoaded = false;

audioThread.currentTrackNo = 0;
audioThread.playList = [];
audioThread.sourcePosts = {};

//audioThread.settingNavPlayerEnabled = true;
//audioThread.settingBottomPlayerEnabled = false;
audioThread.settingNavPlayerEnabled = settings.get('audioThreadNavPlayer');
audioThread.settingBottomPlayerEnabled = !settings.get('audioThreadNavPlayer');
audioThread.settingAutoPlayNext = settings.get('audioThreadAutoPlay');

audioThread.navPlayerActive = false;


audioThread.init = function() {

  audioThread.audioPlayer = document.createElement("audio");
  document.body.appendChild(audioThread.audioPlayer);

  //audioThread.hasAudio = audioThread.hasAudios();

  if (audioThread.settingBottomPlayerEnabled) {

    audioThread.playerDiv = document.createElement("div");
    audioThread.playerDiv.setAttribute('class', "playerBox");

    /* audioThread.autoPlayBoxLabel = document.createElement("label");
    audioThread.autoPlayBoxLabel.textContent = "Auto";
    audioThread.autoPlayBoxLabel.setAttribute('class', "brackets");

    audioThread.playerDiv.appendChild(audioThread.autoPlayBoxLabel);

    audioThread.autoPlayBox = document.createElement("input");
    audioThread.autoPlayBox.setAttribute('type','checkbox');
    audioThread.autoPlayBox.setAttribute('checked', true);
    audioThread.autoPlayBox.setAttribute('id', "autoPlayAudioThreadCB");
    audioThread.autoPlayBoxLabel.prepend(audioThread.autoPlayBox);  */

    audioThread.playButton = document.createElement("input");
    audioThread.playButton.setAttribute('type','button');
    audioThread.playButton.setAttribute('value', "▶ / ⏸︎");
    audioThread.playerDiv.appendChild(audioThread.playButton);

    audioThread.prevButton = document.createElement("input");
    audioThread.prevButton.setAttribute('type','button');
    audioThread.prevButton.setAttribute('value', "⏮︎");
    audioThread.playerDiv.appendChild(audioThread.prevButton);

    audioThread.nextButton = document.createElement("input");
    audioThread.nextButton.setAttribute('type','button');
    audioThread.nextButton.setAttribute('value', "⏭︎");
    audioThread.playerDiv.appendChild(audioThread.nextButton);

    audioThread.volRange = document.createElement("input");
    audioThread.volRange.setAttribute('class','volControl');
    audioThread.volRange.setAttribute('type','range');
    audioThread.volRange.setAttribute('value', "100");
    audioThread.volRange.setAttribute('min', "0");
    audioThread.volRange.setAttribute('max', "100");
    audioThread.playerDiv.appendChild(audioThread.volRange);

    audioThread.audioFilenameField = document.createElement("a");
    audioThread.audioFilenameField.setAttribute('class','audioFilenameField');
    audioThread.audioFilenameField.textContent = "";
    audioThread.playerDiv.appendChild(audioThread.audioFilenameField);

    document.getElementById("postModerationFields").appendChild(audioThread.playerDiv);

  }


  if (audioThread.settingNavPlayerEnabled) {

    audioThread.playerDivNav = document.createElement("div");
    audioThread.playerDivNav.setAttribute('class', "playerBoxNav");

    audioThread.playButtonNav = document.createElement("img");
    audioThread.playButtonNav.setAttribute('src','/.static/images/icon-playpause-small.png');
    audioThread.playButtonNav.setAttribute('class', "embedButton playerButton");
    audioThread.playButtonNav.setAttribute('title', "Pause / play");
    audioThread.playerDivNav.appendChild(audioThread.playButtonNav);

    audioThread.prevButtonNav = document.createElement("img");
    audioThread.prevButtonNav.setAttribute('src','/.static/images/icon-prev.png');
    audioThread.prevButtonNav.setAttribute('class', "embedButton playerButton");
    audioThread.prevButtonNav.setAttribute('title', "Play previous");
    audioThread.playerDivNav.appendChild(audioThread.prevButtonNav);

    audioThread.nextButtonNav = document.createElement("img");
    audioThread.nextButtonNav.setAttribute('src','/.static/images/icon-next.png');
    audioThread.nextButtonNav.setAttribute('class', "embedButton playerButton");
    audioThread.nextButtonNav.setAttribute('title', "Play next");
    audioThread.playerDivNav.appendChild(audioThread.nextButtonNav);

    audioThread.closeButtonNav = document.createElement("img");
    audioThread.closeButtonNav.setAttribute('src','/.static/images/icon-eye.png');
    audioThread.closeButtonNav.setAttribute('class', "embedButton playerButton");
    audioThread.closeButtonNav.setAttribute('title', "Toggle stick navigation bar to top");
    audioThread.playerDivNav.appendChild(audioThread.closeButtonNav);

    audioThread.volRangeNav = document.createElement("input");
    audioThread.volRangeNav.setAttribute('class','volControlNav');
    audioThread.volRangeNav.setAttribute('type','range');
    audioThread.volRangeNav.setAttribute('value', "100");
    audioThread.volRangeNav.setAttribute('min', "0");
    audioThread.volRangeNav.setAttribute('max', "100");
    audioThread.playerDivNav.appendChild(audioThread.volRangeNav);

    audioThread.audioFilenameFieldNav = document.createElement("a");
    audioThread.audioFilenameFieldNav.setAttribute('class','audioFilenameFieldNav');
    audioThread.audioFilenameFieldNav.textContent = "";
    audioThread.playerDivNav.appendChild(audioThread.audioFilenameFieldNav);

    document.getElementById("navLinkSpan").appendChild(audioThread.playerDivNav);

  }

  audioThread.initPlayer = function() {
    if (audioThread.settingNavPlayerEnabled) {
      audioThread.toggleNavPlayer();
    }
    audioThread.audioPlayer.src = audioThread.playList[0];
    audioThread.currentTrackNo = 0;
    audioThread.audioPlayerLoaded = true;

  };

  audioThread.audioPlayer.addEventListener('ended', function () {
    var element = document.querySelectorAll('[data-trackno="' + audioThread.currentTrackNo + '"]');
    element[0].classList.remove("playing");

    if (audioThread.settingAutoPlayNext) {
      audioThread.nextTitle();
    } else {
       if (audioThread.settingBottomPlayerEnabled) {
         audioThread.audioFilenameField.textContent = "";
       }
       if (audioThread.settingNavPlayerEnabled) {
        audioThread.audioFilenameFieldNav.textContent = "";
       }
    }

  });

  audioThread.audioPlayer.addEventListener('play', function () {
      var allPlaying = document.querySelectorAll('.playButton.playing');
      for (i = 0; i < allPlaying.length; i++) {
        allPlaying[i].classList.remove("playing");
      }

      var element = document.querySelectorAll('[data-trackno="' + audioThread.currentTrackNo + '"]');
      element[0].classList.add("playing");


      if (audioThread.settingBottomPlayerEnabled) {
        audioThread.audioFilenameField.textContent = audioThread.playList[audioThread.currentTrackNo].split('/').pop().replaceAll("%20", " ");
        audioThread.audioFilenameField.href = "#"  + audioThread.sourcePosts[audioThread.currentTrackNo];
      }

      if (audioThread.settingNavPlayerEnabled) {
        audioThread.audioFilenameFieldNav.textContent = audioThread.playList[audioThread.currentTrackNo].split('/').pop().replaceAll("%20", " ");
        audioThread.audioFilenameFieldNav.title = audioThread.playList[audioThread.currentTrackNo].split('/').pop().replaceAll("%20", " ");
        audioThread.audioFilenameFieldNav.href = "#"  + audioThread.sourcePosts[audioThread.currentTrackNo];

        audioThread.navPlayerActive = false;
        audioThread.toggleNavPlayer();

      }

  });

  audioThread.audioPlayer.addEventListener('pause', function () {

      var element = document.querySelectorAll('[data-trackno="' + audioThread.currentTrackNo + '"]');
      if (element.length > 0) {
          element[0].classList.remove("playing");
      }

  });

  if (audioThread.settingNavPlayerEnabled) {

    audioThread.playButtonNav.addEventListener("click", function() {
      audioThread.playTitle();
    });

    audioThread.prevButtonNav.addEventListener("click", function() {
      audioThread.prevTitle();
    });

    audioThread.nextButtonNav.addEventListener("click", function() {
     audioThread.nextTitle();
    });

    audioThread.closeButtonNav.addEventListener("click", function() {
     audioThread.toggleNavPlayer();
    });

    audioThread.volRangeNav.oninput = function() {
     audioThread.audioPlayer.volume = this.value / 100;
    };

  }

  if (audioThread.settingBottomPlayerEnabled) {
    audioThread.playButton.addEventListener("click", function() {
      audioThread.playTitle();
    });

    audioThread.prevButton.addEventListener("click", function() {
      audioThread.prevTitle();
    });

    audioThread.nextButton.addEventListener("click", function() {
      audioThread.nextTitle();
    });

    audioThread.volRange.oninput = function() {
      audioThread.audioPlayer.volume = this.value / 100;
    }
  }

  audioThread.updateAllPosts();

};

audioThread.updateAllPosts = function() {

  originalNameLinks = document.getElementsByClassName("originalNameLink");

  for (i = 0; i < originalNameLinks.length; i++) {
    audioThread.addAudioPlayer(originalNameLinks[i]);
  }

}

audioThread.playTitle = function() {

  if (audioThread.playList.length > 0) {

    if (!audioThread.audioPlayerLoaded) {
      audioThread.initPlayer();
    }

    if (audioThread.audioPlayer.paused) {
      audioThread.audioPlayer.play();
    } else {
      audioThread.audioPlayer.pause();
    }

  }

}

audioThread.prevTitle = function() {

  audioThread.audioPlayer.pause();
  if (0 <= audioThread.currentTrackNo - 1) {
    audioThread.currentTrackNo = audioThread.currentTrackNo - 1
    audioThread.audioPlayer.src = audioThread.playList[audioThread.currentTrackNo];
    audioThread.audioPlayer.play();
  } else {
    audioThread.audioPlayer.src = audioThread.playList[audioThread.currentTrackNo];
    audioThread.playTitle();
  }

}

audioThread.nextTitle = function() {

  audioThread.audioPlayer.pause();
  if (audioThread.playList.length > audioThread.currentTrackNo + 1) {
    audioThread.currentTrackNo = audioThread.currentTrackNo + 1
    audioThread.audioPlayer.src = audioThread.playList[audioThread.currentTrackNo];
    audioThread.audioPlayer.play();
  }

}

audioThread.toggleNavPlayer = function() {

  if (audioThread.navPlayerActive) {
    document.getElementById('topNav').classList.remove("active");
    audioThread.navPlayerActive = false;
  } else {
    document.getElementById('topNav').classList.add("active");
    audioThread.navPlayerActive = true;
  }

}

audioThread.hasAudios = function() {

  originalNameLinks = document.getElementsByClassName("originalNameLink");

  for (i = 0; i < originalNameLinks.length; i++) {
    currentFile = originalNameLinks[i].href;
    if (audioThread.audioFiles.includes(currentFile.split('.').pop())) {
      return true;
    }
  }

  return false;

}

audioThread.addAudioPlayer = function(originalNameLink) {

   currentFile = originalNameLink.href;
   //console.log(currentFile);
   if (audioThread.audioFiles.includes(currentFile.split("/")[4].split('.').pop())) {
     var addLink = document.createElement("img");
     addLink.setAttribute('src','/.static/images/icon-listen-small.png');
     addLink.setAttribute('class', "embedButton playButton");
     addLink.dataset.trackno = audioThread.playList.length;
     addLink.addEventListener("click", function(event) {

        if (!audioThread.audioPlayer.paused && audioThread.currentTrackNo == event.srcElement.dataset.trackno) {
           audioThread.audioPlayer.pause();
        } else {
          audioThread.audioPlayer.pause();
          audioThread.currentTrackNo = Number(event.srcElement.dataset.trackno);
          audioThread.audioPlayer.src = audioThread.playList[audioThread.currentTrackNo];
          audioThread.audioPlayer.play();
          audioThread.audioPlayerLoaded = true;
        }
     });
     originalNameLink.parentNode.append(addLink)
     audioThread.sourcePosts[audioThread.playList.length] = Number(originalNameLink.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id);
     audioThread.playList.push(currentFile);
   }

}

if (settings.get('audioThread')) {
  audioThread.init();
}

