const runPeriodicTableWidget = ({
  container,
  interactive,
  scores,
  selectionMode,
  maxSelections,
  displayData,
  showPeriods,
  showGroups,
  tableVersion,
  colorScheme
}) => {
  // organize theme colors
  const defaultTheme = 'light';
  const getThemeColors =
      (theme) => {
        // Edit these colors to change the colors
        // of specific elements of the pie chart
        const themes = {
          light: {
            backgroundColor: '#f5f7fa',
            labelTextColor: '#000000',
          },
          dark: {
            backgroundColor: '#1D2126',
            labelTextColor: '#FFFFFF',
          },
        }

        return themes[theme]
      }

  // "global" variable for current theme colors
  currentThemeColors = getThemeColors(defaultTheme);
  const setThemeColors = (theme) => {
    currentThemeColors = getThemeColors(theme)
  };

  // Change the theme colors when the document theme is changed
  const themeSetCallback = (event) => {
    setThemeColors(event.detail.newTheme)
  };
  document.addEventListener('themeset', themeSetCallback);


  // get the widget container
  const node = document.getElementById(container);

  // create and configure the hidden DOM input used for widget output
  const answerHiddenInput = document.createElement('input');
  answerHiddenInput.type = 'hidden';
  answerHiddenInput.name = 'answers[]';
  answerHiddenInput.value = '';
  const updateHiddenInputs = (output) => {
    output.sort((a, b) => a - b);
    if (selectionMode === 'elements') {
      output = output.map(atomicNumber => {
        return periodicTableData.order[atomicNumber - 1];
      })
    };
    answerHiddenInput.value = encodeURIComponent(JSON.stringify(output));
  };
  if (interactive) node.append(answerHiddenInput);

  /* begin periodic table code */
  const initializeTable = (widgetNode, tableElements, dynamicElement) => {
    // create outermost container
    let tableContainer = document.createElement('div');
    tableContainer.classList.add('tableContainer');
    let emptyDiv = document.createElement('div');
    tableContainer.append(emptyDiv);

    // add group numbers
    if (displayData.groupNumbers) {
      for (let group = 1; group <= 18; group++) {
        if (showGroups.length && !showGroups.includes(group)) continue;
        let groupLabel = document.createElement('p');
        groupLabel.innerHTML = group;
        groupLabel.style.gridRow = 1;
        groupLabel.style.gridColumn = group + 1;
        tableContainer.append(groupLabel);
      }
    }

    // add period numbers
    if (displayData.periodNumbers) {
      for (let period = 1; period <= 7; period++) {
        if (showPeriods.length && !showPeriods.includes(period)) continue;
        let periodLabel = document.createElement('p');
        periodLabel.innerHTML = period;
        periodLabel.style.gridRow = 1 + period;
        periodLabel.style.gridColumn = 1;
        tableContainer.append(periodLabel);
      }
    }

    // create element grid
    let elementGrid = document.createElement('div');
    elementGrid.classList.add('elementGrid');
    for (const tableElement of tableElements) {
      elementGrid.append(tableElement.asDiv());
    }
    tableContainer.append(elementGrid);

    // create table key
    if (displayData.key) {
      let tableKey = document.createElement('div');
      tableKey.classList.add('tableKey');
      let keyElement = document.createElement('div');
      keyElement.classList.add('elementContainer');
      keyElement.classList.add('unknown');

      // mass
      if (displayData.atomicMass) {
        let keyMass = document.createElement('p');
        keyMass.innerHTML = 'relative atomic mass';
        keyMass.classList.add('dynamicElementMass');
        keyElement.append(keyMass);
      }
      // chemical symbol
      if (displayData.chemicalSymbol) {
        let keySymbol = document.createElement('p');
        keySymbol.innerHTML = 'atomic symbol';
        keySymbol.classList.add('dynamicElementSymbol');
        keyElement.append(keySymbol);
      }
      // chemical name
      if (displayData.chemicalName) {
        let keyName = document.createElement('p');
        keyName.innerHTML = 'name';
        keyName.classList.add('dynamicElementName');
        keyElement.append(keyName);
      }
      // atomic number
      if (displayData.atomicNumber) {
        let keyNumber = document.createElement('p');
        keyNumber.innerHTML = 'atomic (proton) number';
        keyNumber.classList.add('dynamicElementNumber');
        keyElement.append(keyNumber);
      }

      tableKey.append(keyElement);
      elementGrid.append(tableKey);
    }

    elementGrid.append(dynamicElement);

    widgetNode.append(tableContainer)
  };

  // event listener callback for indivdiual elements responding to the mouse
  const eventManager = (type, elementNumber, elementGroup, elementPeriod) => {
    // dispatch the appropriate response
    switch (type) {
      case 'leave':
        clearDynamicElement();
        tableElements.forEach(e => e.removeHovered());
        break;
      case 'enter':
        updateDynamicElement(elementNumber);
        if (interactive) {
          switch (selectionMode) {
            case 'elements':
              focusElement(elementNumber);
              break;
            case 'groups':
              focusGroup(elementGroup);
              break;
            case 'periods':
              focusPeriod(elementPeriod);
              break;
          }
        }
        break;
      case 'click': {
        if (!interactive) {
          fireInfoPopUp(elementNumber);
          break;
        }

        switch (selectionMode) {
          case 'elements':
            toggleElementSelection(elementNumber);
            break;
          case 'groups':
            toggleGroupSelection(elementGroup);
            break;
          case 'periods':
            togglePeriodSelection(elementPeriod);
            break;
        }
        // output the model state to the DOM
        updateHiddenInputs(selections);
      }
    }
  };

  const fireInfoPopUp = (elementNumber) => {
    let elementData =
        periodicTableData[periodicTableData.order[elementNumber - 1]];

    let elementInfo = `${elementData.name} has atomic number ${
        elementData.number} and an atomic mass of ${
        elementData.atomic_mass.toFixed(
            2)} Da. It is represented by the symbol ${
        elementData.symbol}, and it's electron configuration is ${
        elementData.electron_configuration}.`;

    if (elementData.popUpText) {
      elementInfo += '<br><br>';
      elementInfo += elementData.popUpText;
    }

    Swal.fire({title: elementData.name, html: elementInfo, icon: 'info'});
  };

  const toggleElementSelection = (elementNumber) => {
    if (selections.includes(elementNumber)) {
      // remove from selections
      selections = selections.filter(selection => selection != elementNumber);
      // remove styling from element
      tableElements[elementNumber - 1].removeSelected();
    } else {
      if (selections.length < maxSelections) {
        // add to selections
        selections.push(elementNumber);
        // add styling to element
        tableElements[elementNumber - 1].setSelected();
      } else {
        Swal.fire({
          title: 'Maximum Selections Exceeded',
          text: 'Please unselect an element before selecting another.',
          icon: 'warning'
        });
      }
    }
  };

  const toggleGroupSelection = (groupNumber) => {
    let groupElements = tableElements.filter(e => e.group == groupNumber);
    if (selections.includes(groupNumber)) {
      // remove from selections
      selections = selections.filter(selection => selection != groupNumber);
      // remove styling from group elements
      groupElements.forEach(e => e.removeSelected());
    } else {
      if (selections.length < maxSelections) {
        // add to selections
        selections.push(groupNumber);
        // add styling to element
        groupElements.forEach(e => e.setSelected());
      } else {
        Swal.fire({
          title: 'Maximum Selections Exceeded',
          text: 'Please unselect a group before selecting another.',
          icon: 'warning'
        });
      }
    }
  };

  const togglePeriodSelection = (periodNumber) => {
    let periodElements = tableElements.filter(e => e.period == periodNumber);
    if (selections.includes(periodNumber)) {
      // remove from selections
      selections = selections.filter(selection => selection != periodNumber);
      // remove styling from group elements
      periodElements.forEach(e => e.removeSelected());
    } else {
      if (selections.length < maxSelections) {
        // add to selections
        selections.push(periodNumber);
        // add styling to element
        periodElements.forEach(e => e.setSelected());
      } else {
        Swal.fire({
          title: 'Maximum Selections Exceeded',
          text: 'Please unselect a period before selecting another.',
          icon: 'warning'
        });
      }
    }
  };

  const focusElement = (elementNumber) => {
    // focus on the sepcified element
    tableElements[elementNumber - 1].setHovered();
  };

  const focusGroup = (groupNumber) => {
    // apply focus to each element with matching groupNumber
    for (const element of tableElements) {
      if (element.group == groupNumber) {
        element.setHovered();
      }
    }
  };

  const focusPeriod = (periodNumber) => {
    // apply focus to each element with matching periodNumber
    for (const element of tableElements) {
      if (element.period == periodNumber) {
        element.setHovered();
      }
    }
  };

  const updateDynamicElement = (elementNumber) => {
    if (!(displayData.chemicalName || displayData.chemicalSymbol ||
          displayData.atomicNumber || displayData.atomicMass))
      return;

    dynamicElement.innerHTML = '';
    let elementDiv =
        tableElements[elementNumber - 1].createDiv(forDynamicElement = true);
    dynamicElement.append(elementDiv);
  };

  const clearDynamicElement = () => {
    dynamicElement.innerHTML = '';
  };

  // initialize the widget
  // clear selections
  let selections = [];
  // create element objects
  let tableElements = [];
  for (const elementTag of periodicTableData.order) {
    // gather and format element data
    let elementData = periodicTableData[elementTag];
    if (elementData.number >= 119) break;
    let elementDisplayData = [
      displayData.chemicalName, displayData.chemicalSymbol,
      displayData.atomicNumber, displayData.atomicMass
    ];

    // make the element
    let currElement = new TableElement(
        elementData, elementDisplayData, tableVersion, colorScheme,
        eventManager);

    // make groups/periods invisible if not in list to show
    let visible = true;
    if (showGroups.length && !showGroups.includes(elementData.group)) {
      currElement.setInvisible();
      visible = false;
    };
    if (showPeriods.length && !showPeriods.includes(elementData.period)) {
      currElement.setInvisible();
      visible = false;
    };
    // apply event callbacks if interactive and not invisible
    if (visible) currElement.setInteractive();

    // apply scoring if not interactive
    if (!interactive) {
      // set which piece of data to score by
      let scoringData = elementTag;
      if (selectionMode === 'groups') scoringData = elementData.group;
      if (selectionMode === 'periods') scoringData = elementData.period;

      // apply scores
      if (scores.correct.includes(scoringData)) {
        currElement.setScore('correct')
      } else if (scores.incorrect.includes(scoringData)) {
        currElement.setScore('incorrect')
      } else if (scores.missed.includes(scoringData)) {
        currElement.setScore('missed')
      }
    }

    // append the element to internal storage array
    tableElements.push(currElement);
  }


  // create dynmic element div
  let dynamicElement = document.createElement('div');
  dynamicElement.classList.add('tableDynamicElement');

  // setup and propogate table
  initializeTable(node, tableElements, dynamicElement);

  // cleanup on widget close
  const removePeriodicTableWidget = () => {
    // Remove the theme change callback
    document.removeEventListener('themeset', themeSetCallback)

    // Remove any html elements created by this widget
    node.innerHTML = ''
  };
  return removePeriodicTableWidget;
};

class TableElement {
  constructor(
      {name, atomic_mass, number, symbol, group, period, category},
      [showChemicalName, showChemicalSymbol, showAtomicNumber, showAtomicMass],
      tableVersion, colorScheme, eventManager) {
    this.name = name;
    this.atomic_mass = atomic_mass;
    this.number = number;
    this.symbol = symbol;
    this.group = group;
    this.period = period;
    this.category = category;

    this.showChemicalName = showChemicalName;
    this.showChemicalSymbol = showChemicalSymbol;
    this.showAtomicNumber = showAtomicNumber;
    this.showAtomicMass = showAtomicMass;

    this.tableVersion = tableVersion;
    this.colorScheme = colorScheme;
    this.eventManager = eventManager;

    this.elementDiv = this.createDiv();
  };

  createDiv(forDynamicElement = false) {
    let elementDiv = document.createElement('div');
    let elementMass = document.createElement('p');
    let elementSymbol = document.createElement('p');
    let elementName = document.createElement('p')
    let elementNumber = document.createElement('p');

    // stylize container
    elementDiv.classList.add('elementContainer');
    elementDiv.classList.add(this.colorSchemeClass());
    if (this.name === 'Helium') {
      elementDiv.style.gridColumnStart = 18;
    } else if (this.name === 'Boron' || this.name === 'Aluminium') {
      elementDiv.style.gridColumnStart = 13;
    } else if (this.name === 'Cerium' || this.name === 'Throium') {
      elementDiv.style.gridColumnStart = 4;
    }

    // set and stylize the element mass, then append to element div
    if (this.showAtomicMass) {
      let roundedMass;
      if (this.tableVersion === 'alevel') {
        roundedMass = this.atomic_mass.toFixed(1);
      } else if (this.tableVersion === 'gcse') {
        roundedMass = '' + Math.round(this.atomic_mass);
        if (this.number == 29) {
          roundedMass = '63.5';
        }
        if (this.number == 17) {
          roundedMass = '35.5';
        }
      }
      elementMass.innerHTML = roundedMass;
      if (forDynamicElement) {
        elementMass.classList.add('dynamicElementMass');
      } else {
        elementMass.classList.add('elementMass');
      }
      elementDiv.append(elementMass);
    }

    // set and stylize element symbol, then append to element div
    if (this.showChemicalSymbol) {
      elementSymbol.innerHTML = this.symbol;
      if (forDynamicElement) {
        elementSymbol.classList.add('dynamicElementSymbol');
      } else {
        elementSymbol.classList.add('elementSymbol');
      }
      elementDiv.append(elementSymbol);
    }

    // set and stylize element name, then append to element div
    if (this.showChemicalName) {
      elementName.innerHTML = this.name;
      let nameCSSClass =
          this.name.length > 9 ? 'elementLongName' : 'elementName';
      if (forDynamicElement) nameCSSClass = 'dynamicElementName';
      elementName.classList.add(nameCSSClass);
      elementDiv.append(elementName);
    }

    // set and stylize element number, then append to element div
    if (this.showAtomicNumber) {
      elementNumber.innerHTML = this.number;
      if (forDynamicElement) {
        elementNumber.classList.add('dynamicElementNumber');
      } else {
        elementNumber.classList.add('elementNumber');
      }
      elementDiv.append(elementNumber);
    }

    return elementDiv;
  };

  asDiv() {
    return this.elementDiv;
  };

  colorSchemeClass() {
    // get CSS class for container according to colorScheme
    switch (this.colorScheme) {
      case 'exam':
        return 'exam-color';
      case 'original':
        return this.category;
      case 'metals':
        if (this.category === 'metalloid' ||
            this.category === 'polyatomic-nonmetal' ||
            this.category === 'diatomic-nonmetal' ||
            this.category === 'noble-gas' || this.name === 'Oganesson') {
          return 'alkali-metal';
        } else {
          return 'lanthanide';
        };
      case 'basic_groups':
        if (this.category === 'alkali-metal' || this.category === 'noble-gas' ||
            this.category === 'halogen' ||
            this.category === 'transition-metal') {
          return this.category;
        } else if (
            this.category === 'lanthanide' || this.category === 'actinide' ||
            (this.number >= 109 && this.number <= 111)) {
          return 'transition-metal';
        } else if (this.group == 17 && this.number != 117) {
          return 'diatomic-nonmetal';
        } else {
          return 'unknown';
        }
      case 'shell_blocks':
        if (this.group <= 2 || this.number == 2) {
          return 'polyatomic-nonmetal';
        } else if (this.group >= 13) {
          return 'diatomic-nonmetal'
        } else if (
            (this.number >= 58 && this.number <= 71) ||
            (this.number >= 90 && this.number <= 103)) {
          return 'alkali-metal';
        } else {
          return 'alkaline-earth-metal';
        }
    }
  }

  setInteractive() {
    // set interactive cursor
    this.elementDiv.classList.add('hand-cursor');

    // make tab-able
    this.elementDiv.tabIndex = '0';

    // set event listeners
    this.elementDiv.addEventListener('mouseenter', (e) => {
      this.eventManager('enter', this.number, this.group, this.period);
    });
    this.elementDiv.addEventListener('mouseleave', (e) => {
      this.eventManager('leave', this.number, this.group, this.period);
    });
    this.elementDiv.addEventListener('click', (e) => {
      this.eventManager('click', this.number, this.group, this.period);
    });
    this.elementDiv.addEventListener('keyup', (e) => {
      if (e.key === 'Tab') {
        this.eventManager('leave', this.number, this.group, this.period);
        this.eventManager('enter', this.number, this.group, this.period);
      }
    });
    this.elementDiv.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.eventManager('click', this.number, this.group, this.period);
      }
    });
  }

  setHovered() {
    this.elementDiv.classList.add(this.colorSchemeClass() + '-hovered');
    this.elementDiv.classList.add('focusedElement');
  }

  removeHovered() {
    this.elementDiv.classList.remove(this.colorSchemeClass() + '-hovered');
    this.elementDiv.classList.remove('focusedElement');
  }

  setSelected() {
    this.elementDiv.classList.add('selectedElement');
  }

  removeSelected() {
    this.elementDiv.classList.remove('selectedElement');
  }

  setInvisible() {
    this.elementDiv.classList.add('invisible-element');
  }

  setScore(score = 'correct') {
    let iconMarkDiv = document.createElement('div');
    iconMarkDiv.classList.add('iconMarkContainer');
    iconMarkDiv.style.zIndex = 1;


    let iconMarkText = document.createElement('p');
    iconMarkText.classList.add('iconMarkText');

    iconMarkDiv.append(iconMarkText);

    // add the correct icon mark & colors
    let borderHexCode;
    let backgroundHexCode;
    switch (score) {
      case 'correct':
        iconMarkText.innerHTML = '\u2713';
        borderHexCode = '#009444';
        backgroundHexCode = '#bde3bd';
        break;
      case 'incorrect':
        borderHexCode = '#BE1E2D';
        backgroundHexCode = '#ffa3a3'
        iconMarkText.innerHTML = '\u2715';
        break;
      case 'missed':
        borderHexCode = '#F15A29';
        backgroundHexCode = '#ffdcb5';
        iconMarkText.innerHTML = '\u2014';
        break;
    };

    // color the icon mark and card
    iconMarkText.style.color = borderHexCode;
    iconMarkDiv.style.borderColor = borderHexCode;
    this.elementDiv.style.borderColor = borderHexCode;
    this.elementDiv.style.backgroundColor = backgroundHexCode;

    this.elementDiv.append(iconMarkDiv)
  }

  clearEffects() {
    this.elementDiv.classList.remove(this.colorSchemeClass() + '-hovered');
    this.elementDiv.classList.remove('selectedElement');
  }
}

const periodicTableData = {
  'order': [
    'hydrogen',    'helium',       'lithium',      'beryllium',
    'boron',       'carbon',       'nitrogen',     'oxygen',
    'fluorine',    'neon',         'sodium',       'magnesium',
    'aluminium',   'silicon',      'phosphorus',   'sulfur',
    'chlorine',    'argon',        'potassium',    'calcium',
    'scandium',    'titanium',     'vanadium',     'chromium',
    'manganese',   'iron',         'cobalt',       'nickel',
    'copper',      'zinc',         'gallium',      'germanium',
    'arsenic',     'selenium',     'bromine',      'krypton',
    'rubidium',    'strontium',    'yttrium',      'zirconium',
    'niobium',     'molybdenum',   'technetium',   'ruthenium',
    'rhodium',     'palladium',    'silver',       'cadmium',
    'indium',      'tin',          'antimony',     'tellurium',
    'iodine',      'xenon',        'cesium',       'barium',
    'lanthanum',   'cerium',       'praseodymium', 'neodymium',
    'promethium',  'samarium',     'europium',     'gadolinium',
    'terbium',     'dysprosium',   'holmium',      'erbium',
    'thulium',     'ytterbium',    'lutetium',     'hafnium',
    'tantalum',    'tungsten',     'rhenium',      'osmium',
    'iridium',     'platinum',     'gold',         'mercury',
    'thallium',    'lead',         'bismuth',      'polonium',
    'astatine',    'radon',        'francium',     'radium',
    'actinium',    'thorium',      'protactinium', 'uranium',
    'neptunium',   'plutonium',    'americium',    'curium',
    'berkelium',   'californium',  'einsteinium',  'fermium',
    'mendelevium', 'nobelium',     'lawrencium',   'rutherfordium',
    'dubnium',     'seaborgium',   'bohrium',      'hassium',
    'meitnerium',  'darmstadtium', 'roentgenium',  'copernicium',
    'nihonium',    'flerovium',    'moscovium',    'livermorium',
    'tennessine',  'oganesson',    'ununennium'
  ],
  'hydrogen': {
    'name': 'Hydrogen',
    'atomic_mass': 1.008,
    'number': 1,
    'symbol': 'H',
    'group': 1,
    'period': 1,
    'electron_configuration': '1s1',
    'popUpText': 'Hydrogen is the most abundant element in the universe.',
    'category': 'diatomic-nonmetal'
  },
  'helium': {
    'name': 'Helium',
    'atomic_mass': 4.0026022,
    'number': 2,
    'symbol': 'He',
    'group': 18,
    'period': 1,
    'electron_configuration': '1s2',
    'category': 'noble-gas'
  },
  'lithium': {
    'name': 'Lithium',
    'atomic_mass': 6.94,
    'number': 3,
    'symbol': 'Li',
    'group': 1,
    'period': 2,
    'electron_configuration': '1s2 2s1',
    'category': 'alkali-metal'
  },
  'beryllium': {
    'name': 'Beryllium',
    'atomic_mass': 9.01218315,
    'number': 4,
    'symbol': 'Be',
    'group': 2,
    'period': 2,
    'electron_configuration': '1s2 2s2',
    'category': 'alkaline-earth-metal'
  },
  'boron': {
    'name': 'Boron',
    'atomic_mass': 10.81,
    'number': 5,
    'symbol': 'B',
    'group': 13,
    'period': 2,
    'electron_configuration': '1s2 2s2 2p1',
    'category': 'metalloid'
  },
  'carbon': {
    'name': 'Carbon',
    'atomic_mass': 12.011,
    'number': 6,
    'symbol': 'C',
    'group': 14,
    'period': 2,
    'electron_configuration': '1s2 2s2 2p2',
    'category': 'polyatomic-nonmetal'
  },
  'nitrogen': {
    'name': 'Nitrogen',
    'atomic_mass': 14.007,
    'number': 7,
    'symbol': 'N',
    'group': 15,
    'period': 2,
    'electron_configuration': '1s2 2s2 2p3',
    'category': 'diatomic-nonmetal'
  },
  'oxygen': {
    'name': 'Oxygen',
    'atomic_mass': 15.999,
    'number': 8,
    'symbol': 'O',
    'group': 16,
    'period': 2,
    'electron_configuration': '1s2 2s2 2p4',
    'category': 'diatomic-nonmetal'
  },
  'fluorine': {
    'name': 'Fluorine',
    'atomic_mass': 18.9984031636,
    'number': 9,
    'symbol': 'F',
    'group': 17,
    'period': 2,
    'electron_configuration': '1s2 2s2 2p5',
    'category': 'diatomic-nonmetal'
  },
  'neon': {
    'name': 'Neon',
    'atomic_mass': 20.17976,
    'number': 10,
    'symbol': 'Ne',
    'group': 18,
    'period': 2,
    'electron_configuration': '1s2 2s2 2p6',
    'category': 'noble-gas'
  },
  'sodium': {
    'name': 'Sodium',
    'atomic_mass': 22.989769282,
    'number': 11,
    'symbol': 'Na',
    'group': 1,
    'period': 3,
    'electron_configuration': '1s2 2s2 2p6 3s1',
    'category': 'alkali-metal'
  },
  'magnesium': {
    'name': 'Magnesium',
    'atomic_mass': 24.305,
    'number': 12,
    'symbol': 'Mg',
    'group': 2,
    'period': 3,
    'electron_configuration': '1s2 2s2 2p6 3s2',
    'category': 'alkaline-earth-metal'
  },
  'aluminium': {
    'name': 'Aluminium',
    'atomic_mass': 26.98153857,
    'number': 13,
    'symbol': 'Al',
    'group': 13,
    'period': 3,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p1',
    'category': 'post-transition-metal'
  },
  'silicon': {
    'name': 'Silicon',
    'atomic_mass': 28.085,
    'number': 14,
    'symbol': 'Si',
    'group': 14,
    'period': 3,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p2',
    'category': 'metalloid'
  },
  'phosphorus': {
    'name': 'Phosphorus',
    'atomic_mass': 30.9737619985,
    'number': 15,
    'symbol': 'P',
    'group': 15,
    'period': 3,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p3',
    'category': 'polyatomic-nonmetal'
  },
  'sulfur': {
    'name': 'Sulfur',
    'atomic_mass': 32.06,
    'number': 16,
    'symbol': 'S',
    'group': 16,
    'period': 3,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p4',
    'category': 'polyatomic-nonmetal'
  },
  'chlorine': {
    'name': 'Chlorine',
    'atomic_mass': 35.45,
    'number': 17,
    'symbol': 'Cl',
    'group': 17,
    'period': 3,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p5',
    'category': 'diatomic-nonmetal'
  },
  'argon': {
    'name': 'Argon',
    'atomic_mass': 39.9481,
    'number': 18,
    'symbol': 'Ar',
    'group': 18,
    'period': 3,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6',
    'category': 'noble-gas'
  },
  'potassium': {
    'name': 'Potassium',
    'atomic_mass': 39.09831,
    'number': 19,
    'symbol': 'K',
    'group': 1,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s1',
    'category': 'alkali-metal'
  },
  'calcium': {
    'name': 'Calcium',
    'atomic_mass': 40.0784,
    'number': 20,
    'symbol': 'Ca',
    'group': 2,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2',
    'category': 'alkaline-earth-metal'
  },
  'scandium': {
    'name': 'Scandium',
    'atomic_mass': 44.9559085,
    'number': 21,
    'symbol': 'Sc',
    'group': 3,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d1',
    'category': 'transition-metal'
  },
  'titanium': {
    'name': 'Titanium',
    'atomic_mass': 47.8671,
    'number': 22,
    'symbol': 'Ti',
    'group': 4,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d2',
    'category': 'transition-metal'
  },
  'vanadium': {
    'name': 'Vanadium',
    'atomic_mass': 50.94151,
    'number': 23,
    'symbol': 'V',
    'group': 5,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d3',
    'category': 'transition-metal'
  },
  'chromium': {
    'name': 'Chromium',
    'atomic_mass': 51.99616,
    'number': 24,
    'symbol': 'Cr',
    'group': 6,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s1 3d5',
    'category': 'transition-metal'
  },
  'manganese': {
    'name': 'Manganese',
    'atomic_mass': 54.9380443,
    'number': 25,
    'symbol': 'Mn',
    'group': 7,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d5',
    'category': 'transition-metal'
  },
  'iron': {
    'name': 'Iron',
    'atomic_mass': 55.8452,
    'number': 26,
    'symbol': 'Fe',
    'group': 8,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d6',
    'category': 'transition-metal'
  },
  'cobalt': {
    'name': 'Cobalt',
    'atomic_mass': 58.9331944,
    'number': 27,
    'symbol': 'Co',
    'group': 9,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d7',
    'category': 'transition-metal'
  },
  'nickel': {
    'name': 'Nickel',
    'atomic_mass': 58.69344,
    'number': 28,
    'symbol': 'Ni',
    'group': 10,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d8',
    'category': 'transition-metal'
  },
  'copper': {
    'name': 'Copper',
    'atomic_mass': 63.5463,
    'number': 29,
    'symbol': 'Cu',
    'group': 11,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s1 3d10',
    'category': 'transition-metal'
  },
  'zinc': {
    'name': 'Zinc',
    'atomic_mass': 65.382,
    'number': 30,
    'symbol': 'Zn',
    'group': 12,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10',
    'category': 'transition-metal'
  },
  'gallium': {
    'name': 'Gallium',
    'atomic_mass': 69.7231,
    'number': 31,
    'symbol': 'Ga',
    'group': 13,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p1',
    'category': 'post-transition-metal'
  },
  'germanium': {
    'name': 'Germanium',
    'atomic_mass': 72.6308,
    'number': 32,
    'symbol': 'Ge',
    'group': 14,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p2',
    'category': 'metalloid'
  },
  'arsenic': {
    'name': 'Arsenic',
    'atomic_mass': 74.9215956,
    'number': 33,
    'symbol': 'As',
    'group': 15,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p3',
    'category': 'metalloid'
  },
  'selenium': {
    'name': 'Selenium',
    'atomic_mass': 78.9718,
    'number': 34,
    'symbol': 'Se',
    'group': 16,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p4',
    'category': 'polyatomic-nonmetal'
  },
  'bromine': {
    'name': 'Bromine',
    'atomic_mass': 79.904,
    'number': 35,
    'symbol': 'Br',
    'group': 17,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p5',
    'category': 'diatomic-nonmetal'
  },
  'krypton': {
    'name': 'Krypton',
    'atomic_mass': 83.7982,
    'number': 36,
    'symbol': 'Kr',
    'group': 18,
    'period': 4,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6',
    'category': 'noble-gas'
  },
  'rubidium': {
    'name': 'Rubidium',
    'atomic_mass': 85.46783,
    'number': 37,
    'symbol': 'Rb',
    'group': 1,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1',
    'category': 'alkali-metal'
  },
  'strontium': {
    'name': 'Strontium',
    'atomic_mass': 87.621,
    'number': 38,
    'symbol': 'Sr',
    'group': 2,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2',
    'category': 'alkaline-earth-metal'
  },
  'yttrium': {
    'name': 'Yttrium',
    'atomic_mass': 88.905842,
    'number': 39,
    'symbol': 'Y',
    'group': 3,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d1',
    'category': 'transition-metal'
  },
  'zirconium': {
    'name': 'Zirconium',
    'atomic_mass': 91.2242,
    'number': 40,
    'symbol': 'Zr',
    'group': 4,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d2',
    'category': 'transition-metal'
  },
  'niobium': {
    'name': 'Niobium',
    'atomic_mass': 92.906372,
    'number': 41,
    'symbol': 'Nb',
    'group': 5,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d4',
    'category': 'transition-metal'
  },
  'molybdenum': {
    'name': 'Molybdenum',
    'atomic_mass': 95.951,
    'number': 42,
    'symbol': 'Mo',
    'group': 6,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d5',
    'category': 'transition-metal'
  },
  'technetium': {
    'name': 'Technetium',
    'atomic_mass': 98,
    'number': 43,
    'symbol': 'Tc',
    'group': 7,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d5',
    'category': 'transition-metal'
  },
  'ruthenium': {
    'name': 'Ruthenium',
    'atomic_mass': 101.072,
    'number': 44,
    'symbol': 'Ru',
    'group': 8,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d7',
    'category': 'transition-metal'
  },
  'rhodium': {
    'name': 'Rhodium',
    'atomic_mass': 102.905502,
    'number': 45,
    'symbol': 'Rh',
    'group': 9,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d8',
    'category': 'transition-metal'
  },
  'palladium': {
    'name': 'Palladium',
    'atomic_mass': 106.421,
    'number': 46,
    'symbol': 'Pd',
    'group': 10,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 4d10',
    'category': 'transition-metal'
  },
  'silver': {
    'name': 'Silver',
    'atomic_mass': 107.86822,
    'number': 47,
    'symbol': 'Ag',
    'group': 11,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d10',
    'category': 'transition-metal'
  },
  'cadmium': {
    'name': 'Cadmium',
    'atomic_mass': 112.4144,
    'number': 48,
    'symbol': 'Cd',
    'group': 12,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10',
    'category': 'transition-metal'
  },
  'indium': {
    'name': 'Indium',
    'atomic_mass': 114.8181,
    'number': 49,
    'symbol': 'In',
    'group': 13,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p1',
    'category': 'post-transition-metal'
  },
  'tin': {
    'name': 'Tin',
    'atomic_mass': 118.7107,
    'number': 50,
    'symbol': 'Sn',
    'group': 14,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p2',
    'category': 'post-transition-metal'
  },
  'antimony': {
    'name': 'Antimony',
    'atomic_mass': 121.7601,
    'number': 51,
    'symbol': 'Sb',
    'group': 15,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p3',
    'category': 'metalloid'
  },
  'tellurium': {
    'name': 'Tellurium',
    'atomic_mass': 127.603,
    'number': 52,
    'symbol': 'Te',
    'group': 16,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p4',
    'category': 'metalloid'
  },
  'iodine': {
    'name': 'Iodine',
    'atomic_mass': 126.904473,
    'number': 53,
    'symbol': 'I',
    'group': 17,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p5',
    'category': 'diatomic-nonmetal'
  },
  'xenon': {
    'name': 'Xenon',
    'atomic_mass': 131.2936,
    'number': 54,
    'symbol': 'Xe',
    'group': 18,
    'period': 5,
    'electron_configuration': '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6',
    'category': 'noble-gas'
  },
  'cesium': {
    'name': 'Cesium',
    'atomic_mass': 132.905451966,
    'number': 55,
    'symbol': 'Cs',
    'group': 1,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s1',
    'category': 'alkali-metal'
  },
  'barium': {
    'name': 'Barium',
    'atomic_mass': 137.3277,
    'number': 56,
    'symbol': 'Ba',
    'group': 2,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2',
    'category': 'alkaline-earth-metal'
  },
  'lanthanum': {
    'name': 'Lanthanum',
    'atomic_mass': 138.905477,
    'number': 57,
    'symbol': 'La',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 5d1',
    'category': 'lanthanide'
  },
  'cerium': {
    'name': 'Cerium',
    'atomic_mass': 140.1161,
    'number': 58,
    'symbol': 'Ce',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 5d1 4f1',
    'category': 'lanthanide'
  },
  'praseodymium': {
    'name': 'Praseodymium',
    'atomic_mass': 140.907662,
    'number': 59,
    'symbol': 'Pr',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f3',
    'category': 'lanthanide'
  },
  'neodymium': {
    'name': 'Neodymium',
    'atomic_mass': 144.2423,
    'number': 60,
    'symbol': 'Nd',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f4',
    'category': 'lanthanide'
  },
  'promethium': {
    'name': 'Promethium',
    'atomic_mass': 145,
    'number': 61,
    'symbol': 'Pm',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f5',
    'category': 'lanthanide'
  },
  'samarium': {
    'name': 'Samarium',
    'atomic_mass': 150.362,
    'number': 62,
    'symbol': 'Sm',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f6',
    'category': 'lanthanide'
  },
  'europium': {
    'name': 'Europium',
    'atomic_mass': 151.9641,
    'number': 63,
    'symbol': 'Eu',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f7',
    'category': 'lanthanide'
  },
  'gadolinium': {
    'name': 'Gadolinium',
    'atomic_mass': 157.253,
    'number': 64,
    'symbol': 'Gd',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f7 5d1',
    'category': 'lanthanide'
  },
  'terbium': {
    'name': 'Terbium',
    'atomic_mass': 158.925352,
    'number': 65,
    'symbol': 'Tb',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f9',
    'category': 'lanthanide'
  },
  'dysprosium': {
    'name': 'Dysprosium',
    'atomic_mass': 162.5001,
    'number': 66,
    'symbol': 'Dy',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f10',
    'category': 'lanthanide'
  },
  'holmium': {
    'name': 'Holmium',
    'atomic_mass': 164.930332,
    'number': 67,
    'symbol': 'Ho',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f11',
    'category': 'lanthanide'
  },
  'erbium': {
    'name': 'Erbium',
    'atomic_mass': 167.2593,
    'number': 68,
    'symbol': 'Er',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f12',
    'category': 'lanthanide'
  },
  'thulium': {
    'name': 'Thulium',
    'atomic_mass': 168.934222,
    'number': 69,
    'symbol': 'Tm',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f13',
    'category': 'lanthanide'
  },
  'ytterbium': {
    'name': 'Ytterbium',
    'atomic_mass': 173.0451,
    'number': 70,
    'symbol': 'Yb',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14',
    'category': 'lanthanide'
  },
  'lutetium': {
    'name': 'Lutetium',
    'atomic_mass': 174.96681,
    'number': 71,
    'symbol': 'Lu',
    'group': 3,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d1',
    'category': 'lanthanide'
  },
  'hafnium': {
    'name': 'Hafnium',
    'atomic_mass': 178.492,
    'number': 72,
    'symbol': 'Hf',
    'group': 4,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d2',
    'category': 'transition-metal'
  },
  'tantalum': {
    'name': 'Tantalum',
    'atomic_mass': 180.947882,
    'number': 73,
    'symbol': 'Ta',
    'group': 5,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d3',
    'category': 'transition-metal'
  },
  'tungsten': {
    'name': 'Tungsten',
    'atomic_mass': 183.841,
    'number': 74,
    'symbol': 'W',
    'group': 6,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d4',
    'category': 'transition-metal'
  },
  'rhenium': {
    'name': 'Rhenium',
    'atomic_mass': 186.2071,
    'number': 75,
    'symbol': 'Re',
    'group': 7,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d5',
    'category': 'transition-metal'
  },
  'osmium': {
    'name': 'Osmium',
    'atomic_mass': 190.233,
    'number': 76,
    'symbol': 'Os',
    'group': 8,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d6',
    'category': 'transition-metal'
  },
  'iridium': {
    'name': 'Iridium',
    'atomic_mass': 192.2173,
    'number': 77,
    'symbol': 'Ir',
    'group': 9,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d7',
    'category': 'transition-metal'
  },
  'platinum': {
    'name': 'Platinum',
    'atomic_mass': 195.0849,
    'number': 78,
    'symbol': 'Pt',
    'group': 10,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s1 4f14 5d9',
    'category': 'transition-metal'
  },
  'gold': {
    'name': 'Gold',
    'atomic_mass': 196.9665695,
    'number': 79,
    'symbol': 'Au',
    'group': 11,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s1 4f14 5d10',
    'category': 'transition-metal'
  },
  'mercury': {
    'name': 'Mercury',
    'atomic_mass': 200.5923,
    'number': 80,
    'symbol': 'Hg',
    'group': 12,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10',
    'category': 'transition-metal'
  },
  'thallium': {
    'name': 'Thallium',
    'atomic_mass': 204.38,
    'number': 81,
    'symbol': 'Tl',
    'group': 13,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p1',
    'category': 'post-transition-metal'
  },
  'lead': {
    'name': 'Lead',
    'atomic_mass': 207.21,
    'number': 82,
    'symbol': 'Pb',
    'group': 14,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p2',
    'category': 'post-transition-metal'
  },
  'bismuth': {
    'name': 'Bismuth',
    'atomic_mass': 208.980401,
    'number': 83,
    'symbol': 'Bi',
    'group': 15,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p3',
    'category': 'post-transition-metal'
  },
  'polonium': {
    'name': 'Polonium',
    'atomic_mass': 209,
    'number': 84,
    'symbol': 'Po',
    'group': 16,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p4',
    'category': 'post-transition-metal'
  },
  'astatine': {
    'name': 'Astatine',
    'atomic_mass': 210,
    'number': 85,
    'symbol': 'At',
    'group': 17,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p5',
    'category': 'metalloid'
  },
  'radon': {
    'name': 'Radon',
    'atomic_mass': 222,
    'number': 86,
    'symbol': 'Rn',
    'group': 18,
    'period': 6,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6',
    'category': 'noble-gas'
  },
  'francium': {
    'name': 'Francium',
    'atomic_mass': 223,
    'number': 87,
    'symbol': 'Fr',
    'group': 1,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s1',
    'category': 'alkali-metal'
  },
  'radium': {
    'name': 'Radium',
    'atomic_mass': 226,
    'number': 88,
    'symbol': 'Ra',
    'group': 2,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2',
    'category': 'alkaline-earth-metal'
  },
  'actinium': {
    'name': 'Actinium',
    'atomic_mass': 227,
    'number': 89,
    'symbol': 'Ac',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 6d1',
    'category': 'actinide'
  },
  'thorium': {
    'name': 'Thorium',
    'atomic_mass': 232.03774,
    'number': 90,
    'symbol': 'Th',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 6d2',
    'category': 'actinide'
  },
  'protactinium': {
    'name': 'Protactinium',
    'atomic_mass': 231.035882,
    'number': 91,
    'symbol': 'Pa',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f2 6d1',
    'category': 'actinide'
  },
  'uranium': {
    'name': 'Uranium',
    'atomic_mass': 238.028913,
    'number': 92,
    'symbol': 'U',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f3 6d1',
    'category': 'actinide'
  },
  'neptunium': {
    'name': 'Neptunium',
    'atomic_mass': 237,
    'number': 93,
    'symbol': 'Np',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f4 6d1',
    'category': 'actinide'
  },
  'plutonium': {
    'name': 'Plutonium',
    'atomic_mass': 244,
    'number': 94,
    'symbol': 'Pu',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f6',
    'category': 'actinide'
  },
  'americium': {
    'name': 'Americium',
    'atomic_mass': 243,
    'number': 95,
    'symbol': 'Am',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f7',
    'category': 'actinide'
  },
  'curium': {
    'name': 'Curium',
    'atomic_mass': 247,
    'number': 96,
    'symbol': 'Cm',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f7 6d1',
    'category': 'actinide'
  },
  'berkelium': {
    'name': 'Berkelium',
    'atomic_mass': 247,
    'number': 97,
    'symbol': 'Bk',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f9',
    'category': 'actinide'
  },
  'californium': {
    'name': 'Californium',
    'atomic_mass': 251,
    'number': 98,
    'symbol': 'Cf',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f10',
    'category': 'actinide'
  },
  'einsteinium': {
    'name': 'Einsteinium',
    'atomic_mass': 252,
    'number': 99,
    'symbol': 'Es',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f11',
    'category': 'actinide'
  },
  'fermium': {
    'name': 'Fermium',
    'atomic_mass': 257,
    'number': 100,
    'symbol': 'Fm',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f12',
    'category': 'actinide'
  },
  'mendelevium': {
    'name': 'Mendelevium',
    'atomic_mass': 258,
    'number': 101,
    'symbol': 'Md',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f13',
    'category': 'actinide'
  },
  'nobelium': {
    'name': 'Nobelium',
    'atomic_mass': 259,
    'number': 102,
    'symbol': 'No',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14',
    'category': 'actinide'
  },
  'lawrencium': {
    'name': 'Lawrencium',
    'atomic_mass': 266,
    'number': 103,
    'symbol': 'Lr',
    'group': 3,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 7p1',
    'category': 'actinide'
  },
  'rutherfordium': {
    'name': 'Rutherfordium',
    'atomic_mass': 267,
    'number': 104,
    'symbol': 'Rf',
    'group': 4,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d2',
    'category': 'transition-metal'
  },
  'dubnium': {
    'name': 'Dubnium',
    'atomic_mass': 268,
    'number': 105,
    'symbol': 'Db',
    'group': 5,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d3',
    'category': 'transition-metal'
  },
  'seaborgium': {
    'name': 'Seaborgium',
    'atomic_mass': 269,
    'number': 106,
    'symbol': 'Sg',
    'group': 6,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d4',
    'category': 'transition-metal'
  },
  'bohrium': {
    'name': 'Bohrium',
    'atomic_mass': 270,
    'number': 107,
    'symbol': 'Bh',
    'group': 7,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d5',
    'category': 'transition-metal'
  },
  'hassium': {
    'name': 'Hassium',
    'atomic_mass': 269,
    'number': 108,
    'symbol': 'Hs',
    'group': 8,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d6',
    'category': 'transition-metal'
  },
  'meitnerium': {
    'name': 'Meitnerium',
    'atomic_mass': 278,
    'number': 109,
    'symbol': 'Mt',
    'group': 9,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d7',
    'category': 'unknown'
  },
  'darmstadtium': {
    'name': 'Darmstadtium',
    'atomic_mass': 281,
    'number': 110,
    'symbol': 'Ds',
    'group': 10,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d8',
    'category': 'unknown'
  },
  'roentgenium': {
    'name': 'Roentgenium',
    'atomic_mass': 282,
    'number': 111,
    'symbol': 'Rg',
    'group': 11,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d9',
    'category': 'unknown'
  },
  'copernicium': {
    'name': 'Copernicium',
    'atomic_mass': 285,
    'number': 112,
    'symbol': 'Cn',
    'group': 12,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10',
    'category': 'transition-metal'
  },
  'nihonium': {
    'name': 'Nihonium',
    'atomic_mass': 286,
    'number': 113,
    'symbol': 'Nh',
    'group': 13,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p1',
    'category': 'unknown'
  },
  'flerovium': {
    'name': 'Flerovium',
    'atomic_mass': 289,
    'number': 114,
    'symbol': 'Fl',
    'group': 14,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p2',
    'category': 'post-transition-metal'
  },
  'moscovium': {
    'name': 'Moscovium',
    'atomic_mass': 289,
    'number': 115,
    'symbol': 'Mc',
    'group': 15,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p3',
    'category': 'unknown'
  },
  'livermorium': {
    'name': 'Livermorium',
    'atomic_mass': 293,
    'number': 116,
    'symbol': 'Lv',
    'group': 16,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p4',
    'category': 'unknown'
  },
  'tennessine': {
    'name': 'Tennessine',
    'atomic_mass': 294,
    'number': 117,
    'symbol': 'Ts',
    'group': 17,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p5',
    'category': 'unknown'
  },
  'oganesson': {
    'name': 'Oganesson',
    'atomic_mass': 294,
    'number': 118,
    'symbol': 'Og',
    'group': 18,
    'period': 7,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p6',
    'category': 'unknown'
  },
  'ununennium': {
    'name': 'Ununennium',
    'atomic_mass': 315,
    'number': 119,
    'symbol': 'Uue',
    'group': 1,
    'period': 8,
    'electron_configuration':
        '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p6 8s1',
    'category': 'unknown'
  }
};
