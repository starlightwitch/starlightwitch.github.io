const runPeriodicTableWidget = ({
  container,
  interactive,
  selectionMode,
  maxSelections,
  displayData,
  showPeriods,
  showGroups,
  tableVersion
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
    answerHiddenInput.value = encodeURIComponent(JSON.stringify(output));
  };
  if (interactive) node.append(answerHiddenInput);

  /* begin periodic table code */
  const initializeTable = (widgetNode, tableElements) => {
    let tableContainer = document.createElement('div');
    tableContainer.classList.add('tableContainer')

    for (const tableElement of tableElements) {
      tableContainer.append(tableElement.asDiv());
    }

    widgetNode.append(tableContainer)
  };

  // event listener callback for indivdiual elements responding to the mouse
  const mouseManager = (type, elementNumber, elementGroup, elementPeriod) => {
    switch (type) {
      case 'leave':
        tableElements.forEach(e => e.removeHovered());
        break;
      case 'enter':
        switch (selectionMode) {
          case 'elements':
            tableElements[elementNumber - 1].setHovered();
            break;
          case 'groups': {
            let groupElements =
                tableElements.filter(e => e.group == elementGroup);
            groupElements.forEach(e => e.setHovered());
          } break;
          case 'periods': {
            let periodElements =
                tableElements.filter(e => e.period == elementPeriod);
            periodElements.forEach(e => e.setHovered());
          } break;
        }
        break;
      case 'click': {
        switch (selectionMode) {
          case 'elements':
            if (selections.includes(elementNumber)) {
              // remove from selections
              selections =
                  selections.filter(selection => selection != elementNumber);
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
            break;
          case 'groups': {
            let groupElements =
                tableElements.filter(e => e.group == elementGroup);
            if (selections.includes(elementGroup)) {
              // remove from selections
              selections =
                  selections.filter(selection => selection != elementGroup);
              // remove styling from group elements
              groupElements.forEach(e => e.removeSelected());
            } else {
              if (selections.length < maxSelections) {
                // add to selections
                selections.push(elementGroup);
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
          } break;
          case 'periods': {
            let periodElements =
                tableElements.filter(e => e.period == elementPeriod);
            if (selections.includes(elementPeriod)) {
              // remove from selections
              selections =
                  selections.filter(selection => selection != elementPeriod);
              // remove styling from group elements
              periodElements.forEach(e => e.removeSelected());
            } else {
              if (selections.length < maxSelections) {
                // add to selections
                selections.push(elementPeriod);
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
          } break;
        }
      }
    }

    updateHiddenInputs(selections);
  };

  // initialize the widget
  let selections = [];
  let tableElements = [];
  for (const elementTag of periodicTableData.order) {
    let elementData = periodicTableData[elementTag];
    if (elementData.number >= 119) break;

    let elementDisplayData = [
      displayData.chemicalName, displayData.chemicalSymbol,
      displayData.atomicNumber, displayData.atomicMass
    ];

    let currElement = new TableElement(
        elementData, elementDisplayData, tableVersion, mouseManager);
    if (interactive) currElement.setInteractive();

    tableElements.push(currElement);
  }

  initializeTable(node, tableElements);

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
      tableVersion, mouseManager) {
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
    this.mouseManager = mouseManager;

    this.elementDiv = this.createDiv();
  };

  createDiv() {
    let elementDiv = document.createElement('div');
    let elementMass = document.createElement('p');
    let elementSymbol = document.createElement('p');
    let elementName = document.createElement('p')
    let elementNumber = document.createElement('p');

    // stylize container
    elementDiv.classList.add('elementContainer');
    elementDiv.classList.add(this.category)
    if (this.name === 'Helium') {
      elementDiv.style.gridColumnStart = 18;
    }
    else if (this.name === 'Boron' || this.name === 'Aluminium') {
      elementDiv.style.gridColumnStart = 13;
    }
    else if (this.name === 'Cerium' || this.name === 'Throium') {
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
      elementMass.classList.add('elementMass');
      elementDiv.append(elementMass);
    }

    // set and stylize element symbol, then append to element div
    if (this.showChemicalSymbol) {
      elementSymbol.innerHTML = this.symbol;
      elementSymbol.classList.add('elementSymbol');
      elementDiv.append(elementSymbol);
    }

    // set and stylize element name, then append to element div
    if (this.showChemicalName) {
      elementName.innerHTML = this.name;
      let nameCSSClass =
          this.name.length > 7 ? 'elementLongName' : 'elementName';
      elementName.classList.add(nameCSSClass);
      elementDiv.append(elementName);
    }

    // set and stylize element number, then append to element div
    if (this.showAtomicNumber) {
      elementNumber.innerHTML = this.number;
      elementNumber.classList.add('elementNumber');
      elementDiv.append(elementNumber);
    }

    return elementDiv;
  };

  asDiv() {
    return this.elementDiv;
  };

  setInteractive() {
    // set interactive cursor
    this.elementDiv.style.cursor = 'pointer';

    // set event listeners
    this.elementDiv.addEventListener('mouseenter', (e) => {
      this.mouseManager('enter', this.number, this.group, this.period);
    });
    this.elementDiv.addEventListener('mouseleave', (e) => {
      this.mouseManager('leave', this.number, this.group, this.period);
    });
    this.elementDiv.addEventListener('click', (e) => {
      this.mouseManager('click', this.number, this.group, this.period);
    });
  }

  setHovered() {
    this.elementDiv.classList.add(this.category + '-hovered')
  }

  removeHovered() {
    this.elementDiv.classList.remove(this.category + '-hovered');
  }

  setSelected() {
    this.elementDiv.classList.add('selectedElement')
  }

  removeSelected() {
    this.elementDiv.classList.remove('selectedElement')
  }

  clearEffects() {
    this.elementDiv.classList.remove(this.category + '-hovered');
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
    'category': 'diatomic-nonmetal'
  },
  'helium': {
    'name': 'Helium',
    'atomic_mass': 4.0026022,
    'number': 2,
    'symbol': 'He',
    'group': 18,
    'period': 1,
    'category': 'noble-gas'
  },
  'lithium': {
    'name': 'Lithium',
    'atomic_mass': 6.94,
    'number': 3,
    'symbol': 'Li',
    'group': 1,
    'period': 2,
    'category': 'alkali-metal'
  },
  'beryllium': {
    'name': 'Beryllium',
    'atomic_mass': 9.01218315,
    'number': 4,
    'symbol': 'Be',
    'group': 2,
    'period': 2,
    'category': 'alkaline-earth-metal'
  },
  'boron': {
    'name': 'Boron',
    'atomic_mass': 10.81,
    'number': 5,
    'symbol': 'B',
    'group': 13,
    'period': 2,
    'category': 'metalloid'
  },
  'carbon': {
    'name': 'Carbon',
    'atomic_mass': 12.011,
    'number': 6,
    'symbol': 'C',
    'group': 14,
    'period': 2,
    'category': 'polyatomic-nonmetal'
  },
  'nitrogen': {
    'name': 'Nitrogen',
    'atomic_mass': 14.007,
    'number': 7,
    'symbol': 'N',
    'group': 15,
    'period': 2,
    'category': 'diatomic-nonmetal'
  },
  'oxygen': {
    'name': 'Oxygen',
    'atomic_mass': 15.999,
    'number': 8,
    'symbol': 'O',
    'group': 16,
    'period': 2,
    'category': 'diatomic-nonmetal'
  },
  'fluorine': {
    'name': 'Fluorine',
    'atomic_mass': 18.9984031636,
    'number': 9,
    'symbol': 'F',
    'group': 17,
    'period': 2,
    'category': 'diatomic-nonmetal'
  },
  'neon': {
    'name': 'Neon',
    'atomic_mass': 20.17976,
    'number': 10,
    'symbol': 'Ne',
    'group': 18,
    'period': 2,
    'category': 'noble-gas'
  },
  'sodium': {
    'name': 'Sodium',
    'atomic_mass': 22.989769282,
    'number': 11,
    'symbol': 'Na',
    'group': 1,
    'period': 3,
    'category': 'alkali-metal'
  },
  'magnesium': {
    'name': 'Magnesium',
    'atomic_mass': 24.305,
    'number': 12,
    'symbol': 'Mg',
    'group': 2,
    'period': 3,
    'category': 'alkaline-earth-metal'
  },
  'aluminium': {
    'name': 'Aluminium',
    'atomic_mass': 26.98153857,
    'number': 13,
    'symbol': 'Al',
    'group': 13,
    'period': 3,
    'category': 'post-transition-metal'
  },
  'silicon': {
    'name': 'Silicon',
    'atomic_mass': 28.085,
    'number': 14,
    'symbol': 'Si',
    'group': 14,
    'period': 3,
    'category': 'metalloid'
  },
  'phosphorus': {
    'name': 'Phosphorus',
    'atomic_mass': 30.9737619985,
    'number': 15,
    'symbol': 'P',
    'group': 15,
    'period': 3,
    'category': 'polyatomic-nonmetal'
  },
  'sulfur': {
    'name': 'Sulfur',
    'atomic_mass': 32.06,
    'number': 16,
    'symbol': 'S',
    'group': 16,
    'period': 3,
    'category': 'polyatomic-nonmetal'
  },
  'chlorine': {
    'name': 'Chlorine',
    'atomic_mass': 35.45,
    'number': 17,
    'symbol': 'Cl',
    'group': 17,
    'period': 3,
    'category': 'diatomic-nonmetal'
  },
  'argon': {
    'name': 'Argon',
    'atomic_mass': 39.9481,
    'number': 18,
    'symbol': 'Ar',
    'group': 18,
    'period': 3,
    'category': 'noble-gas'
  },
  'potassium': {
    'name': 'Potassium',
    'atomic_mass': 39.09831,
    'number': 19,
    'symbol': 'K',
    'group': 1,
    'period': 4,
    'category': 'alkali-metal'
  },
  'calcium': {
    'name': 'Calcium',
    'atomic_mass': 40.0784,
    'number': 20,
    'symbol': 'Ca',
    'group': 2,
    'period': 4,
    'category': 'alkaline-earth-metal'
  },
  'scandium': {
    'name': 'Scandium',
    'atomic_mass': 44.9559085,
    'number': 21,
    'symbol': 'Sc',
    'group': 3,
    'period': 4,
    'category': 'transition-metal'
  },
  'titanium': {
    'name': 'Titanium',
    'atomic_mass': 47.8671,
    'number': 22,
    'symbol': 'Ti',
    'group': 4,
    'period': 4,
    'category': 'transition-metal'
  },
  'vanadium': {
    'name': 'Vanadium',
    'atomic_mass': 50.94151,
    'number': 23,
    'symbol': 'V',
    'group': 5,
    'period': 4,
    'category': 'transition-metal'
  },
  'chromium': {
    'name': 'Chromium',
    'atomic_mass': 51.99616,
    'number': 24,
    'symbol': 'Cr',
    'group': 6,
    'period': 4,
    'category': 'transition-metal'
  },
  'manganese': {
    'name': 'Manganese',
    'atomic_mass': 54.9380443,
    'number': 25,
    'symbol': 'Mn',
    'group': 7,
    'period': 4,
    'category': 'transition-metal'
  },
  'iron': {
    'name': 'Iron',
    'atomic_mass': 55.8452,
    'number': 26,
    'symbol': 'Fe',
    'group': 8,
    'period': 4,
    'category': 'transition-metal'
  },
  'cobalt': {
    'name': 'Cobalt',
    'atomic_mass': 58.9331944,
    'number': 27,
    'symbol': 'Co',
    'group': 9,
    'period': 4,
    'category': 'transition-metal'
  },
  'nickel': {
    'name': 'Nickel',
    'atomic_mass': 58.69344,
    'number': 28,
    'symbol': 'Ni',
    'group': 10,
    'period': 4,
    'category': 'transition-metal'
  },
  'copper': {
    'name': 'Copper',
    'atomic_mass': 63.5463,
    'number': 29,
    'symbol': 'Cu',
    'group': 11,
    'period': 4,
    'category': 'transition-metal'
  },
  'zinc': {
    'name': 'Zinc',
    'atomic_mass': 65.382,
    'number': 30,
    'symbol': 'Zn',
    'group': 12,
    'period': 4,
    'category': 'transition-metal'
  },
  'gallium': {
    'name': 'Gallium',
    'atomic_mass': 69.7231,
    'number': 31,
    'symbol': 'Ga',
    'group': 13,
    'period': 4,
    'category': 'post-transition-metal'
  },
  'germanium': {
    'name': 'Germanium',
    'atomic_mass': 72.6308,
    'number': 32,
    'symbol': 'Ge',
    'group': 14,
    'period': 4,
    'category': 'metalloid'
  },
  'arsenic': {
    'name': 'Arsenic',
    'atomic_mass': 74.9215956,
    'number': 33,
    'symbol': 'As',
    'group': 15,
    'period': 4,
    'category': 'metalloid'
  },
  'selenium': {
    'name': 'Selenium',
    'atomic_mass': 78.9718,
    'number': 34,
    'symbol': 'Se',
    'group': 16,
    'period': 4,
    'category': 'polyatomic-nonmetal'
  },
  'bromine': {
    'name': 'Bromine',
    'atomic_mass': 79.904,
    'number': 35,
    'symbol': 'Br',
    'group': 17,
    'period': 4,
    'category': 'diatomic-nonmetal'
  },
  'krypton': {
    'name': 'Krypton',
    'atomic_mass': 83.7982,
    'number': 36,
    'symbol': 'Kr',
    'group': 18,
    'period': 4,
    'category': 'noble-gas'
  },
  'rubidium': {
    'name': 'Rubidium',
    'atomic_mass': 85.46783,
    'number': 37,
    'symbol': 'Rb',
    'group': 1,
    'period': 5,
    'category': 'alkali-metal'
  },
  'strontium': {
    'name': 'Strontium',
    'atomic_mass': 87.621,
    'number': 38,
    'symbol': 'Sr',
    'group': 2,
    'period': 5,
    'category': 'alkaline-earth-metal'
  },
  'yttrium': {
    'name': 'Yttrium',
    'atomic_mass': 88.905842,
    'number': 39,
    'symbol': 'Y',
    'group': 3,
    'period': 5,
    'category': 'transition-metal'
  },
  'zirconium': {
    'name': 'Zirconium',
    'atomic_mass': 91.2242,
    'number': 40,
    'symbol': 'Zr',
    'group': 4,
    'period': 5,
    'category': 'transition-metal'
  },
  'niobium': {
    'name': 'Niobium',
    'atomic_mass': 92.906372,
    'number': 41,
    'symbol': 'Nb',
    'group': 5,
    'period': 5,
    'category': 'transition-metal'
  },
  'molybdenum': {
    'name': 'Molybdenum',
    'atomic_mass': 95.951,
    'number': 42,
    'symbol': 'Mo',
    'group': 6,
    'period': 5,
    'category': 'transition-metal'
  },
  'technetium': {
    'name': 'Technetium',
    'atomic_mass': 98,
    'number': 43,
    'symbol': 'Tc',
    'group': 7,
    'period': 5,
    'category': 'transition-metal'
  },
  'ruthenium': {
    'name': 'Ruthenium',
    'atomic_mass': 101.072,
    'number': 44,
    'symbol': 'Ru',
    'group': 8,
    'period': 5,
    'category': 'transition-metal'
  },
  'rhodium': {
    'name': 'Rhodium',
    'atomic_mass': 102.905502,
    'number': 45,
    'symbol': 'Rh',
    'group': 9,
    'period': 5,
    'category': 'transition-metal'
  },
  'palladium': {
    'name': 'Palladium',
    'atomic_mass': 106.421,
    'number': 46,
    'symbol': 'Pd',
    'group': 10,
    'period': 5,
    'category': 'transition-metal'
  },
  'silver': {
    'name': 'Silver',
    'atomic_mass': 107.86822,
    'number': 47,
    'symbol': 'Ag',
    'group': 11,
    'period': 5,
    'category': 'transition-metal'
  },
  'cadmium': {
    'name': 'Cadmium',
    'atomic_mass': 112.4144,
    'number': 48,
    'symbol': 'Cd',
    'group': 12,
    'period': 5,
    'category': 'transition-metal'
  },
  'indium': {
    'name': 'Indium',
    'atomic_mass': 114.8181,
    'number': 49,
    'symbol': 'In',
    'group': 13,
    'period': 5,
    'category': 'post-transition-metal'
  },
  'tin': {
    'name': 'Tin',
    'atomic_mass': 118.7107,
    'number': 50,
    'symbol': 'Sn',
    'group': 14,
    'period': 5,
    'category': 'post-transition-metal'
  },
  'antimony': {
    'name': 'Antimony',
    'atomic_mass': 121.7601,
    'number': 51,
    'symbol': 'Sb',
    'group': 15,
    'period': 5,
    'category': 'metalloid'
  },
  'tellurium': {
    'name': 'Tellurium',
    'atomic_mass': 127.603,
    'number': 52,
    'symbol': 'Te',
    'group': 16,
    'period': 5,
    'category': 'metalloid'
  },
  'iodine': {
    'name': 'Iodine',
    'atomic_mass': 126.904473,
    'number': 53,
    'symbol': 'I',
    'group': 17,
    'period': 5,
    'category': 'diatomic-nonmetal'
  },
  'xenon': {
    'name': 'Xenon',
    'atomic_mass': 131.2936,
    'number': 54,
    'symbol': 'Xe',
    'group': 18,
    'period': 5,
    'category': 'noble-gas'
  },
  'cesium': {
    'name': 'Cesium',
    'atomic_mass': 132.905451966,
    'number': 55,
    'symbol': 'Cs',
    'group': 1,
    'period': 6,
    'category': 'alkali-metal'
  },
  'barium': {
    'name': 'Barium',
    'atomic_mass': 137.3277,
    'number': 56,
    'symbol': 'Ba',
    'group': 2,
    'period': 6,
    'category': 'alkaline-earth-metal'
  },
  'lanthanum': {
    'name': 'Lanthanum',
    'atomic_mass': 138.905477,
    'number': 57,
    'symbol': 'La',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'cerium': {
    'name': 'Cerium',
    'atomic_mass': 140.1161,
    'number': 58,
    'symbol': 'Ce',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'praseodymium': {
    'name': 'Praseodymium',
    'atomic_mass': 140.907662,
    'number': 59,
    'symbol': 'Pr',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'neodymium': {
    'name': 'Neodymium',
    'atomic_mass': 144.2423,
    'number': 60,
    'symbol': 'Nd',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'promethium': {
    'name': 'Promethium',
    'atomic_mass': 145,
    'number': 61,
    'symbol': 'Pm',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'samarium': {
    'name': 'Samarium',
    'atomic_mass': 150.362,
    'number': 62,
    'symbol': 'Sm',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'europium': {
    'name': 'Europium',
    'atomic_mass': 151.9641,
    'number': 63,
    'symbol': 'Eu',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'gadolinium': {
    'name': 'Gadolinium',
    'atomic_mass': 157.253,
    'number': 64,
    'symbol': 'Gd',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'terbium': {
    'name': 'Terbium',
    'atomic_mass': 158.925352,
    'number': 65,
    'symbol': 'Tb',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'dysprosium': {
    'name': 'Dysprosium',
    'atomic_mass': 162.5001,
    'number': 66,
    'symbol': 'Dy',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'holmium': {
    'name': 'Holmium',
    'atomic_mass': 164.930332,
    'number': 67,
    'symbol': 'Ho',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'erbium': {
    'name': 'Erbium',
    'atomic_mass': 167.2593,
    'number': 68,
    'symbol': 'Er',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'thulium': {
    'name': 'Thulium',
    'atomic_mass': 168.934222,
    'number': 69,
    'symbol': 'Tm',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'ytterbium': {
    'name': 'Ytterbium',
    'atomic_mass': 173.0451,
    'number': 70,
    'symbol': 'Yb',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'lutetium': {
    'name': 'Lutetium',
    'atomic_mass': 174.96681,
    'number': 71,
    'symbol': 'Lu',
    'group': 3,
    'period': 6,
    'category': 'lanthanide'
  },
  'hafnium': {
    'name': 'Hafnium',
    'atomic_mass': 178.492,
    'number': 72,
    'symbol': 'Hf',
    'group': 4,
    'period': 6,
    'category': 'transition-metal'
  },
  'tantalum': {
    'name': 'Tantalum',
    'atomic_mass': 180.947882,
    'number': 73,
    'symbol': 'Ta',
    'group': 5,
    'period': 6,
    'category': 'transition-metal'
  },
  'tungsten': {
    'name': 'Tungsten',
    'atomic_mass': 183.841,
    'number': 74,
    'symbol': 'W',
    'group': 6,
    'period': 6,
    'category': 'transition-metal'
  },
  'rhenium': {
    'name': 'Rhenium',
    'atomic_mass': 186.2071,
    'number': 75,
    'symbol': 'Re',
    'group': 7,
    'period': 6,
    'category': 'transition-metal'
  },
  'osmium': {
    'name': 'Osmium',
    'atomic_mass': 190.233,
    'number': 76,
    'symbol': 'Os',
    'group': 8,
    'period': 6,
    'category': 'transition-metal'
  },
  'iridium': {
    'name': 'Iridium',
    'atomic_mass': 192.2173,
    'number': 77,
    'symbol': 'Ir',
    'group': 9,
    'period': 6,
    'category': 'transition-metal'
  },
  'platinum': {
    'name': 'Platinum',
    'atomic_mass': 195.0849,
    'number': 78,
    'symbol': 'Pt',
    'group': 10,
    'period': 6,
    'category': 'transition-metal'
  },
  'gold': {
    'name': 'Gold',
    'atomic_mass': 196.9665695,
    'number': 79,
    'symbol': 'Au',
    'group': 11,
    'period': 6,
    'category': 'transition-metal'
  },
  'mercury': {
    'name': 'Mercury',
    'atomic_mass': 200.5923,
    'number': 80,
    'symbol': 'Hg',
    'group': 12,
    'period': 6,
    'category': 'transition-metal'
  },
  'thallium': {
    'name': 'Thallium',
    'atomic_mass': 204.38,
    'number': 81,
    'symbol': 'Tl',
    'group': 13,
    'period': 6,
    'category': 'post-transition-metal'
  },
  'lead': {
    'name': 'Lead',
    'atomic_mass': 207.21,
    'number': 82,
    'symbol': 'Pb',
    'group': 14,
    'period': 6,
    'category': 'post-transition-metal'
  },
  'bismuth': {
    'name': 'Bismuth',
    'atomic_mass': 208.980401,
    'number': 83,
    'symbol': 'Bi',
    'group': 15,
    'period': 6,
    'category': 'post-transition-metal'
  },
  'polonium': {
    'name': 'Polonium',
    'atomic_mass': 209,
    'number': 84,
    'symbol': 'Po',
    'group': 16,
    'period': 6,
    'category': 'post-transition-metal'
  },
  'astatine': {
    'name': 'Astatine',
    'atomic_mass': 210,
    'number': 85,
    'symbol': 'At',
    'group': 17,
    'period': 6,
    'category': 'metalloid'
  },
  'radon': {
    'name': 'Radon',
    'atomic_mass': 222,
    'number': 86,
    'symbol': 'Rn',
    'group': 18,
    'period': 6,
    'category': 'noble-gas'
  },
  'francium': {
    'name': 'Francium',
    'atomic_mass': 223,
    'number': 87,
    'symbol': 'Fr',
    'group': 1,
    'period': 7,
    'category': 'alkali-metal'
  },
  'radium': {
    'name': 'Radium',
    'atomic_mass': 226,
    'number': 88,
    'symbol': 'Ra',
    'group': 2,
    'period': 7,
    'category': 'alkaline-earth-metal'
  },
  'actinium': {
    'name': 'Actinium',
    'atomic_mass': 227,
    'number': 89,
    'symbol': 'Ac',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'thorium': {
    'name': 'Thorium',
    'atomic_mass': 232.03774,
    'number': 90,
    'symbol': 'Th',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'protactinium': {
    'name': 'Protactinium',
    'atomic_mass': 231.035882,
    'number': 91,
    'symbol': 'Pa',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'uranium': {
    'name': 'Uranium',
    'atomic_mass': 238.028913,
    'number': 92,
    'symbol': 'U',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'neptunium': {
    'name': 'Neptunium',
    'atomic_mass': 237,
    'number': 93,
    'symbol': 'Np',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'plutonium': {
    'name': 'Plutonium',
    'atomic_mass': 244,
    'number': 94,
    'symbol': 'Pu',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'americium': {
    'name': 'Americium',
    'atomic_mass': 243,
    'number': 95,
    'symbol': 'Am',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'curium': {
    'name': 'Curium',
    'atomic_mass': 247,
    'number': 96,
    'symbol': 'Cm',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'berkelium': {
    'name': 'Berkelium',
    'atomic_mass': 247,
    'number': 97,
    'symbol': 'Bk',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'californium': {
    'name': 'Californium',
    'atomic_mass': 251,
    'number': 98,
    'symbol': 'Cf',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'einsteinium': {
    'name': 'Einsteinium',
    'atomic_mass': 252,
    'number': 99,
    'symbol': 'Es',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'fermium': {
    'name': 'Fermium',
    'atomic_mass': 257,
    'number': 100,
    'symbol': 'Fm',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'mendelevium': {
    'name': 'Mendelevium',
    'atomic_mass': 258,
    'number': 101,
    'symbol': 'Md',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'nobelium': {
    'name': 'Nobelium',
    'atomic_mass': 259,
    'number': 102,
    'symbol': 'No',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'lawrencium': {
    'name': 'Lawrencium',
    'atomic_mass': 266,
    'number': 103,
    'symbol': 'Lr',
    'group': 3,
    'period': 7,
    'category': 'actinide'
  },
  'rutherfordium': {
    'name': 'Rutherfordium',
    'atomic_mass': 267,
    'number': 104,
    'symbol': 'Rf',
    'group': 4,
    'period': 7,
    'category': 'transition-metal'
  },
  'dubnium': {
    'name': 'Dubnium',
    'atomic_mass': 268,
    'number': 105,
    'symbol': 'Db',
    'group': 5,
    'period': 7,
    'category': 'transition-metal'
  },
  'seaborgium': {
    'name': 'Seaborgium',
    'atomic_mass': 269,
    'number': 106,
    'symbol': 'Sg',
    'group': 6,
    'period': 7,
    'category': 'transition-metal'
  },
  'bohrium': {
    'name': 'Bohrium',
    'atomic_mass': 270,
    'number': 107,
    'symbol': 'Bh',
    'group': 7,
    'period': 7,
    'category': 'transition-metal'
  },
  'hassium': {
    'name': 'Hassium',
    'atomic_mass': 269,
    'number': 108,
    'symbol': 'Hs',
    'group': 8,
    'period': 7,
    'category': 'transition-metal'
  },
  'meitnerium': {
    'name': 'Meitnerium',
    'atomic_mass': 278,
    'number': 109,
    'symbol': 'Mt',
    'group': 9,
    'period': 7,
    'category': 'unknown'
  },
  'darmstadtium': {
    'name': 'Darmstadtium',
    'atomic_mass': 281,
    'number': 110,
    'symbol': 'Ds',
    'group': 10,
    'period': 7,
    'category': 'unknown'
  },
  'roentgenium': {
    'name': 'Roentgenium',
    'atomic_mass': 282,
    'number': 111,
    'symbol': 'Rg',
    'group': 11,
    'period': 7,
    'category': 'unknown'
  },
  'copernicium': {
    'name': 'Copernicium',
    'atomic_mass': 285,
    'number': 112,
    'symbol': 'Cn',
    'group': 12,
    'period': 7,
    'category': 'transition-metal'
  },
  'nihonium': {
    'name': 'Nihonium',
    'atomic_mass': 286,
    'number': 113,
    'symbol': 'Nh',
    'group': 13,
    'period': 7,
    'category': 'unknown'
  },
  'flerovium': {
    'name': 'Flerovium',
    'atomic_mass': 289,
    'number': 114,
    'symbol': 'Fl',
    'group': 14,
    'period': 7,
    'category': 'post-transition-metal'
  },
  'moscovium': {
    'name': 'Moscovium',
    'atomic_mass': 289,
    'number': 115,
    'symbol': 'Mc',
    'group': 15,
    'period': 7,
    'category': 'unknown'
  },
  'livermorium': {
    'name': 'Livermorium',
    'atomic_mass': 293,
    'number': 116,
    'symbol': 'Lv',
    'group': 16,
    'period': 7,
    'category': 'unknown'
  },
  'tennessine': {
    'name': 'Tennessine',
    'atomic_mass': 294,
    'number': 117,
    'symbol': 'Ts',
    'group': 17,
    'period': 7,
    'category': 'unknown'
  },
  'oganesson': {
    'name': 'Oganesson',
    'atomic_mass': 294,
    'number': 118,
    'symbol': 'Og',
    'group': 18,
    'period': 7,
    'category': 'unknown'
  },
  'ununennium': {
    'name': 'Ununennium',
    'atomic_mass': 315,
    'number': 119,
    'symbol': 'Uue',
    'group': 1,
    'period': 8,
    'category': 'unknown'
  }
};
