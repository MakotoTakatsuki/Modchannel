var categories = {};

categories.init = function() {

  let globalCheckbox = document.getElementById('checkboxGlobalReport');
  let combobox = document.getElementById('reportComboboxCategory');

  for (var i = 0; i < combobox.options.length; i++) {
    combobox.options[i].value = combobox.options[i].innerText;
    if (combobox[i].innerText == 'Illegal content') {
      combobox.options[i].innerText = lang.illegalContent;
    } else if (combobox[i].innerText == 'Spam') {
      combobox.options[i].innerText = lang.spam;
    } else if (combobox[i].innerText == 'Other') {
      combobox.options[i].innerText = lang.other;
    }
  }

  categories.adjustGlobalCheckbox(globalCheckbox, combobox.value);

  combobox.onchange = function(e) {
    categories.adjustGlobalCheckbox(globalCheckbox, combobox.value);
  };

};

categories.adjustGlobalCheckbox = function(globalCheckbox, comboboxValue) {

  if (comboboxValue == 'Illegal content') {
    globalCheckbox.checked = true;
    globalCheckbox.disabled = true;
  } else {
    globalCheckbox.checked = false;
    globalCheckbox.disabled = false;
  }

};

categories.init();
