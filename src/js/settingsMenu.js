var settingsMenu = {};
var themes = {};
var themeLoader = {};

themeLoader.load = function(init) {

  if (init && !localStorage.selectedTheme) {
    return;
  }

  var body = document.getElementsByTagName('body')[0];

  if (localStorage.selectedTheme) {
    if (themeLoader.customCss && themeLoader.customCss.parentNode) {
      themeLoader.customCss.remove();
    }
    body.className = 'theme_' + localStorage.selectedTheme;
  } else {
    if (themeLoader.customCss && !themeLoader.customCss.parentNode) {
      document.head.appendChild(themeLoader.customCss);
    }
    body.className = 'no_theme';
  }

};

var linkedCss = document.getElementsByTagName('link');

for (var i = 0; i < linkedCss.length; i++) {

  var ending = '/custom.css';

  if (linkedCss[i].href.indexOf(ending) === linkedCss[i].href.length
      - ending.length) {
    themeLoader.customCss = linkedCss[i];
    break;
  }
}

themeLoader.load(true);

settingsMenu.init = function() {

  settingsMenu.loadedFilters = JSON.parse(localStorage.filterData || '[]');

  settingsMenu.filterTypes = [ 'Name', 'Tripcode', lang.subject, lang.message, 'Id' ];

  var settingsMenuDiv = document.createElement('div');

  settingsMenu.placeNavBarButton(settingsMenuDiv);

  var settingsMenuHeader = document.createElement('div');
  settingsMenuHeader.className = 'header';
  settingsMenuDiv.appendChild(settingsMenuHeader);

  var settingsMenuLabel = document.createElement('label');
  settingsMenuLabel.innerHTML = lang.settings;
  settingsMenuLabel.className = 'headerLabel';

  settingsMenuHeader.appendChild(settingsMenuLabel);

  settingsMenu.showingSettings = false;

  var closeSettingsMenuButton = document.createElement('span');
  closeSettingsMenuButton.id = 'closeSettingsMenuButton';
  closeSettingsMenuButton.onclick = function() {

    if (!settingsMenu.showingSettings) {
      return;
    }

    settingsMenu.showingSettings = false;
    settingsMenuDiv.style.display = 'none';

  };

  settingsMenuHeader.appendChild(closeSettingsMenuButton);

  settingsMenuDiv.appendChild(document.createElement('hr'));

  settingsMenuDiv.id = 'settingsMenu';
  settingsMenuDiv.className = 'floatingMenu';
  settingsMenuDiv.style.display = 'none';

  document.body.appendChild(settingsMenuDiv);

  draggable.setDraggable(settingsMenuDiv, settingsMenuHeader);

  settingsMenu.tabsDiv = document.createElement('div');
  settingsMenuDiv.appendChild(settingsMenu.tabsDiv);

  settingsMenu.menuContentPanel = document.createElement('div');
  settingsMenu.menuContentPanel.id = 'menuContentPanel';
  settingsMenuDiv.appendChild(settingsMenu.menuContentPanel);

  settingsMenu.fixedTopNav();
  settingsMenu.sfw();
  settingsMenu.postCounter();
  settingsMenu.directDownload();

  settingsMenu.registerTab(lang.mainSettings, settingsMenu.getMainContent(), true);
  settingsMenu.registerTab(lang.filter, settingsMenu.getFiltersContent());
  settingsMenu.registerTab(lang.themes, settingsMenu.getCSSSelectorContent());
  settingsMenu.registerTab(lang.css, settingsMenu.getCSSContent());

};

settingsMenu.selectSettingsPanel = function(tab, panel) {

  if (tab === settingsMenu.currentSettingsTab) {
    return;
  }

  if (settingsMenu.currentSettingsTab) {
    settingsMenu.currentSettingsTab.id = '';
    settingsMenu.currentSettingsPanel.remove();
  }

  settingsMenu.menuContentPanel.appendChild(panel);
  tab.id = 'selectedTab';

  settingsMenu.currentSettingsPanel = panel;
  settingsMenu.currentSettingsTab = tab;

};

settingsMenu.registerTab = function(text, content, select) {

  var newTab = document.createElement('span');
  newTab.innerHTML = text;
  newTab.className = 'settingsTab';
  newTab.onclick = function() {
    settingsMenu.selectSettingsPanel(newTab, content);
  };
  settingsMenu.tabsDiv.appendChild(newTab);

  if (select) {
    newTab.onclick();
  }

};

settingsMenu.placeNavBarButton = function(settingsMenuDiv) {

  var settingsButton = document.getElementById('settingsButton');

  if (!settingsButton) {
    return;
  }

  var referenceNode = settingsButton.nextSibling;
  settingsButton.parentNode.insertBefore(document.createTextNode(' '),
      referenceNode);

  var divider = document.createElement('span');
  divider.innerHTML = '/';
  settingsButton.parentNode.insertBefore(divider, referenceNode);
  settingsButton.parentNode.insertBefore(document.createTextNode(' '),
      referenceNode);

  settingsButton.innerHTML = lang.settings;

  settingsButton.onclick = function() {

    if (settingsMenu.showingSettings) {
      return;
    }

    settingsMenu.showingSettings = true;
    settingsMenuDiv.style.display = 'block';

  }

};

settingsMenu.addFilterDisplay = function(filter) {

  var filterCell = document.createElement('div');

  var cellWrapper = document.createElement('div');
  settingsMenu.existingFiltersDiv.appendChild(cellWrapper);

  var filterTypeLabel = document.createElement('span');
  filterTypeLabel.innerHTML = settingsMenu.filterTypes[filter.type];
  filterTypeLabel.className = 'existingFilterTypeLabel';
  filterCell.appendChild(filterTypeLabel);

  var filterContentLabel = document.createElement('span');
  var contentToDisplay = filter.filter;
  if (filter.regex) {
    contentToDisplay = '/' + contentToDisplay + '/';
  }
  filterContentLabel.innerHTML = contentToDisplay;
  filterContentLabel.className = 'existingFilterContentLabel';
  filterCell.appendChild(filterContentLabel);

  var button = document.createElement('span');
  button.className = 'filterDeleteButton';
  filterCell.appendChild(button);

  button.onclick = function() {

    settingsMenu.loadedFilters.splice(settingsMenu.loadedFilters
        .indexOf(filter), 1);

    localStorage.filterData = JSON.stringify(settingsMenu.loadedFilters);

    hiding.checkFilters();

    cellWrapper.remove();

  };

  cellWrapper.appendChild(document.createElement('hr'));
  cellWrapper.appendChild(filterCell);

};

settingsMenu.createFilter = function(content, regex, type) {

  var newFilterData = {
    filter : content,
    regex : regex,
    type : type
  };

  settingsMenu.addFilterDisplay(newFilterData);

  settingsMenu.loadedFilters.push(newFilterData);

  localStorage
      .setItem('filterData', JSON.stringify(settingsMenu.loadedFilters));

  hiding.checkFilters();

};

settingsMenu.getFiltersContent = function() {

  var filtersPanel = document.createElement('div');

  var newFilterPanel = document.createElement('span');
  newFilterPanel.id = 'newFilterPanel';

  filtersPanel.appendChild(newFilterPanel);

  var newFilterTypeCombo = document.createElement('select');

  for (var i = 0; i < 4; i++) {

    var option = document.createElement('option');
    option.innerHTML = settingsMenu.filterTypes[i];
    newFilterTypeCombo.appendChild(option);
  }

  newFilterPanel.appendChild(newFilterTypeCombo);

  var newFilterField = document.createElement('input');
  newFilterField.type = 'text';
  newFilterField.placeholder = lang.placeHolderFilter;
  newFilterPanel.appendChild(newFilterField);

  var regexLabel = document.createElement('label');
  regexLabel.innerHTML = 'Regex';
  regexLabel.className = 'settingsLabel';
  newFilterPanel.appendChild(regexLabel);

  var newFilterRegex = document.createElement('input');
  newFilterRegex.type = 'checkbox';
  regexLabel.className = 'settingsCheckbox';
  newFilterPanel.appendChild(newFilterRegex);

  var newFilterButton = document.createElement('button');
  newFilterButton.innerHTML = lang.addFilter;
  newFilterButton.onclick = function() {

    var filterContent = newFilterField.value.trim();

    if (!filterContent) {
      return;
    }

    settingsMenu.createFilter(filterContent, newFilterRegex.checked,
        newFilterTypeCombo.selectedIndex);

  };
  newFilterPanel.appendChild(newFilterButton);

  var existingFiltersLabelsPanel = document.createElement('div');
  filtersPanel.appendChild(existingFiltersLabelsPanel);

  var labelType = document.createElement('label');
  labelType.innerHTML = lang.type;
  labelType.id = 'labelExistingFilfterType';
  existingFiltersLabelsPanel.appendChild(labelType);

  var labelContent = document.createElement('label');
  labelContent.innerHTML = lang.content;
  labelContent.id = 'labelExistingFilfterContent';
  existingFiltersLabelsPanel.appendChild(labelContent);

  settingsMenu.existingFiltersDiv = document.createElement('div');
  settingsMenu.existingFiltersDiv.id = 'existingFiltersPanel';
  filtersPanel.appendChild(settingsMenu.existingFiltersDiv);

  for (var i = 0; i < settingsMenu.loadedFilters.length; i++) {
    settingsMenu.addFilterDisplay(settingsMenu.loadedFilters[i]);
  }

  return filtersPanel;

};

settingsMenu.fixedTopNav = function() {

  if (settings.get('fixedTopNav')) {
    document.getElementById('topNav').style = 'position: fixed; background: #eee; box-shadow: 0 1px 0 rgba(0, 0, 0, .15) !important;';
  }

};

settingsMenu.sfw = function() {

  if (settings.get('sfwMode')) {
    document.body.className += ' ' + 'sfw';
  }

};

settingsMenu.postCounter = function() {

  if (settings.get('postCounter')) {
    document.body.className += ' ' + 'postCounter';
  }

};

settingsMenu.directDownload = function() {

  if (!settings.get('directDownload')) {
    var namelinks = document.getElementsByClassName('originalNameLink');
    for (var i = 0; i < namelinks.length; i++) {
      namelinks[i].href = namelinks[i].href.replace('/dl/', '/');
    }
  }

};

settingsMenu.getCSSContent = function() {

  var savedCSS = localStorage.customCSS;

  var head = document.getElementsByTagName('head')[0];

  var newCSS = document.createElement('style');

  head.appendChild(newCSS);

  if (savedCSS) {
    newCSS.innerHTML = savedCSS;
  }

  var cssPanel = document.createElement('div');

  var cssArea = document.createElement('textarea');
  cssPanel.appendChild(cssArea);
  if (savedCSS) {
    cssArea.value = savedCSS;
  }
  cssArea.id = 'cssInput';

  var bottomDiv = document.createElement('div');
  cssPanel.appendChild(bottomDiv);

  var saveButton = document.createElement('button');
  saveButton.className = 'saveButton';
  saveButton.innerHTML = lang.save;
  bottomDiv.appendChild(saveButton);

  saveButton.onclick = function() {
    newCSS.innerHTML = cssArea.value.trim();
    localStorage.customCSS = newCSS.innerHTML;
  };

  return cssPanel;

};

settingsMenu.getCSSSelectorContent = function() {

  themes.themes = [ {
    label : 'Clear',
    id : 'clear'
  }, {
    label : 'Minimal',
    id : 'minimal'
  }, {
    label : 'Dark Reader',
    id : 'darkreader'
  }, {
    label : 'Dark Reader Minimal',
    id : 'darkreader_minimal'
  }, {
    label : 'Christmas Tomorrow',
    id : 'christmas_tomorrow'
  }, {
    label : 'Tomorrow',
    id : 'tomorrow'
  }, {
    label : 'Hadmut',
    id : 'hadmut'
  }, {
    label : 'Green',
    id : 'green'
  }, {
    label : 'Yotsuba B',
    id : 'yotsubaB'
  } ];

    var cssPanel = document.createElement('div');

    var themeSelector = document.createElement('select');
    cssPanel.appendChild(themeSelector);

    themeSelector.id = 'themeSelector';

    var vanillaOption = document.createElement('option');
    vanillaOption.innerHTML = 'Default';
    themeSelector.appendChild(vanillaOption);

    for (var i = 0; i < themes.themes.length; i++) {

      var theme = themes.themes[i];

      var themeOption = document.createElement('option');
      themeOption.innerHTML = theme.label;

      if (theme.id === localStorage.selectedTheme) {
        themeOption.selected = true;
      }

      themeSelector.appendChild(themeOption);

    }

    themeSelector.onchange = function() {

      if (!themeSelector.selectedIndex) {

        if (localStorage.selectedTheme) {
          delete localStorage.selectedTheme;
          themeLoader.load();
        }

        return;
      }

      var selectedTheme = themes.themes[themeSelector.selectedIndex - 1];

      if (selectedTheme.id === localStorage.selectedTheme) {
        return;
      }

      localStorage.selectedTheme = selectedTheme.id;

      themeLoader.load();

    };

  var bottomDiv = document.createElement('div');
  cssPanel.appendChild(bottomDiv);

  return cssPanel;

};

settingsMenu.getMainContent = function() {

  var mainPanel = document.createElement('div');
  mainPanel.className = "mainPanel";

  var relativeDivs = [];
  var relativeCheckBoxes = [];

  var mainPanelSubContainer = document.createElement('div');
  mainPanelSubContainer.className = "mainPanelSubContainer";

  for (var key in settings.modes) {

    var div = document.createElement('div');
    mainPanelSubContainer.appendChild(div);

    var label = document.createElement('label');
    var checkBox = document.createElement('input');
    var text = document.createTextNode(settings.modes[key].text);

    checkBox.id = 'checkbox-' + key;
    checkBox.type = 'checkbox';
    checkBox.className = 'settingsCheckbox';
    checkBox.checked = settings.get(key);

    label.appendChild(checkBox);
    label.appendChild(text)
    div.appendChild(label);

  }

  mainPanel.append(mainPanelSubContainer);

  var saveButton = document.createElement('button');
  mainPanel.appendChild(saveButton);
  saveButton.innerHTML = lang.save;
  saveButton.className = 'saveButton';

  saveButton.onclick = function() {
    for (var key in settings.modes) {
      settings.set(key, document.getElementById('checkbox-' + key).checked);
    }
    location.reload();
  };

  return mainPanel;

};

settingsMenu.init();
