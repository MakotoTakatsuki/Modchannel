fallingSnow = {};

fallingSnow.init = function() {

  if (!settings.get('showFallingSnow')) {

    return fallingSnow.removeAll();

  }

  fallingSnow.enableChristmas();

  if (settings.get('fallingSnowHitlerEdition')) {

    fallingSnow.enableSwastikas();

  }

  if (api.mobile || navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : true) {

    fallingSnow.removeByHalf();

  }

  fallingSnow.plusUltra(settings.get('fallingSnowPlus'), settings.get('fallingSnowPlusUltra'));


};

fallingSnow.enableChristmas = function() {

  var snowfall = document.getElementById('snowfall');

  snowfall.className = 'christmas';

};


fallingSnow.enableSwastikas = function() {

  var snowfall = document.getElementById('snowfall');

  snowfall.className += ' swastikaMode';

};

fallingSnow.plusUltra = function(plus, ultra) {

  if (!plus) {
    return;
  }

  var snowfall = document.getElementById('snowfall');
  var snowflakes = document.getElementsByClassName('snowflake');
  var numToAdd = snowflakes.length * (ultra ? 3 : 1);

  for (var i = 0; i < numToAdd; i++) {

    var snowflake = document.createElement('div');
    snowflake.className = 'snowflake';

    snowfall.appendChild(snowflake);

  }

};

fallingSnow.removeAll = function() {

  var snowfall = document.getElementById('snowfall');

  snowfall.parentNode.removeChild(snowfall);

};

fallingSnow.removeByHalf = function() {

  var snowfall = document.getElementById('snowfall');
  var snowflakes = document.getElementsByClassName('snowflake');
  const numToRemove = Math.round(snowflakes.length / 2);

  for (var i = numToRemove - 1; i >= 0; i--) {

    snowfall.removeChild(snowflakes[i])

  }

};

fallingSnow.init();
