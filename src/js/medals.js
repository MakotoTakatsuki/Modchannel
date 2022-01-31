var medals = {};

medals.init = function() {
  medals.relation = {
    'tx': 'us',
    'by': 'de',
    'pr': 'br',
    'sc': 'br',
    'rs': 'br',
    'qc': 'ca',
    'ru': 'bfr',
    'mow': 'bfr',
    'me': 'bfr',
    'ct': 'es',
    '43': 'ua',
    'sct': 'gb',
    'onion': 'proxy'
  };
  medals.data = {};
  medals.flags = document.getElementsByClassName('imgFlag')
  if (medals.flags.length > 0) {
    medals.build(true);
  }
};

medals.build = function(firstRun) {
  api.localRequest(location.hostname === 'localhost' ? '/.static/medals.json' : '/medals.json',
    function gotMedals(error, data) {
      if (!error) {
        medals.data = JSON.parse(data);
        for (var i = 0; i < medals.flags.length; i++) {
          medals.addTooltip(medals.flags[i], medals.data);
        }
        if (firstRun) {
          setInterval(medals.build, 15 * 60 * 1000 + 500); // every ~15min
        }
      }
    });
};

medals.addTooltip = function(flag) {
  var flagCode = flag.alt;
  var built = flag.parentNode.className === 'medals';
  if (flagCode in medals.relation) {
    flagCode = medals.relation[flagCode];
  }
  if (flagCode === 'mod') return;
  var medalsTooltip = built ? flag.parentNode.getElementsByClassName('medals')[0] : document.createElement('span');
  if (!built) {
    medalsTooltip.className = 'medals';
    flag.parentNode.insertBefore(medalsTooltip, flag);
    medalsTooltip.appendChild(flag);
  }
  var text = built ? flag.parentNode.getElementsByClassName('text')[0] : document.createElement('span');
  text.innerText = medals.data[flagCode] ? medals.getText(medals.data[flagCode]) : 'loser';
  if (!built) {
    text.className = 'text';
    medalsTooltip.appendChild(text);
  };
};

medals.getText = function(country) {
  var text = '';
  if (country.rank) text += ' #' + country.rank;
  if (country.gold) text += ' 🥇' + country.gold;
  if (country.silver) text += ' 🥈' + country.silver;
  if (country.bronze) text += ' 🥉' + country.bronze;
  return text;
};

medals.init();
