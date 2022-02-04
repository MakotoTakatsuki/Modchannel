var theme = {};

theme.themes = [ {
      label : 'Board-specific CSS',
      id : 'custom'
  }, {
      label : 'Yotsuba',
      id : 'yotsuba'
  }, {
      label : 'Yotsuba B',
      id : 'yotsuba_b'
  }, {
      label : 'Yotsuba C',
      id : 'yotsuba_p'
  }, {
      label : 'Miku',
      id : 'miku'
  }, {
      label : 'Green',
      id : 'warosu'
  }, {
      label : 'Old',
      id : 'vivian'
  }, {
      label : 'Tomorrow',
      id : 'tomorrow'
  }, {
      label : 'Cyber',
      id : 'lain'
  }, {
      label : 'Royal',
      id : 'royal'
  }, {
      label : 'Purple',
      id : 'redchanit'
  }, {
/*
      label : 'Sonic 3 & Knuckles',
      id : 'sonic3'
  }, {
      label : 'Final Fantasy',
      id : 'finalfantasy'
  }, {
*/
      label : 'ModchanOS10',
      id : 'moeos'
  }, {
      label : 'Windows 95',
      id : 'win95'
  }, {
      label : 'Dark',
      id : 'penumbra'
  }, {
      label : 'モツドちやんねる',
      id : 'penumbra_clear'
  }
];

theme.themeLink = undefined;
theme.customCssHref = "";

theme.addThemeSelector = function() {

  var postingLink = document.getElementById('navMod');

  if (!postingLink) {
    return
  }

  var referenceNode = postingLink.previousSibling.previousSibling;
 
  postingLink.parentNode.insertBefore(document.createTextNode(' '),
      referenceNode);
 
  var divider = document.createElement('span');
  divider.innerHTML = '/';
  postingLink.parentNode.insertBefore(divider, referenceNode);
 
  postingLink.parentNode.insertBefore(document.createTextNode(' '),
      referenceNode);
 
  var themeSelector = document.createElement('select');
  themeSelector.id = 'themeSelector';
 
  /*
  var vanillaOption = document.createElement('option');
  vanillaOption.innerHTML = 'Default';
  themeSelector.appendChild(vanillaOption);
  */
 
  theme.themes.forEach((theme) => {
 
    var themeOption = document.createElement('option');
    themeOption.innerHTML = theme.label;
 
    if (theme.id === localStorage.selectedTheme) {
      themeOption.selected = true;
    }
 
    themeSelector.appendChild(themeOption);
 
  })
 
  themeSelector.onchange = function() {
 
    var selectedTheme = theme.themes[themeSelector.selectedIndex];
 
    if (selectedTheme.id === localStorage.selectedTheme) {
      return;
    }
 
    localStorage.selectedTheme = selectedTheme.id;
 
    theme.load();
 
  };
 
  postingLink.parentNode.insertBefore(themeSelector, referenceNode);
 
  postingLink.parentNode.insertBefore(document.createTextNode(' '),
      referenceNode);

};

theme.load = function(init) {

  var currentTheme = localStorage.selectedTheme;

  //loading a custom theme
  if (currentTheme === 'custom') {
    // document.body.className = 'theme_board'; //shouldn't be necessary anymore
    theme.themeLink.href = theme.customCssHref;
  //loading a non-custom theme
  } else {
    // document.body.className = 'theme_' + currentTheme;
    theme.themeLink.href = '/.static/css/' + currentTheme + '.css';
  }
};

document.addEventListener("DOMContentLoaded", function() {
  document.body.classList.add("jsenabled");

  var ending = '/custom.css';
  
  //if there's a `link` element with "custom.css", then remember it
  var loadedCss = document.getElementsByTagName('link');
  for (var i in Array.from(loadedCss)) {
	var cssHref = loadedCss[i].href;
  
    if (cssHref !== undefined && cssHref.indexOf(ending) === 
	cssHref.length - ending.length) {
      theme.customCssHref = cssHref;
      break;
    }
  }

  theme.themeLink = document.createElement("link")
  theme.themeLink.type = "text/css";
  theme.themeLink.rel = "stylesheet";
  theme.themeLink.id = "themeLink";
  document.head.insertBefore(theme.themeLink, document.getElementById("nullSyntax"));

  var currentTheme = localStorage.selectedTheme;
  localStorage.selectedTheme = currentTheme === undefined ?
	theme.themes[0].id : currentTheme;

  theme.addThemeSelector();

  theme.load(true);
});
