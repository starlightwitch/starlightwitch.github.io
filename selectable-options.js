const runSelectableOptionsWidget = ({
  container,
  interactive,
  maxSelections,
  options
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
    answerHiddenInput.value =
        encodeURIComponent(JSON.stringify(output.toSorted()));
  };

  // Insert the hidden input into the html
  if (interactive) node.append(answerHiddenInput);

  /* begin selectable options code */

  // assigns each option an index
  const indexOptions = () => {
    options.forEach((option, i) => option.optionIndex = i);
  };

  // converts a javascript object of option data into an HTML element
  const createOptionCard = (optionData) => {
    // create the option card div
    let card = document.createElement('div');
    if (textOnly) {
      card.className = 'selectableTextOptionCard';
    } else {
      card.className = 'selectableOptionCard';
    }

    // create and append the option's image
    if (typeof optionData.imagePath !== 'undefined' &&
        optionData.imagePath != null && optionData.imagePath != '') {
      let optionImage = document.createElement('img');
      optionImage.classList.add('optionCardImage');
      if (optionData.imageInvertible ||
          typeof optionData.imageInvertible === 'undefined')
        optionImage.classList.add('invertibleOptionImage');
      optionImage.src = optionData.imagePath;

      card.classList.add('optionWithImage')
      card.append(optionImage);
    };

    // create and append the option's text
    if (typeof optionData.optionText !== 'undefined' &&
        optionData.optionText != null && optionData.optionText != '') {
      let optionParagraph = document.createElement('p');
      optionParagraph.innerHTML = optionData.optionText;
      optionParagraph.classList.add('optionParagraph');

      if (textOnly || !optionData.imagePath) {
        optionParagraph.classList.add('textOnlyOptionParagraph');
      } else if (imageOnly) {
        optionParagraph.classList.add('imageOnlyOptionParagraph');
      } else {
        optionParagraph.classList.add('mixedTextAndImageOptionsParagraph');
      };

      card.append(optionParagraph);
    }

    // style the card
    if (interactive) {
      // make it keyboard accesible
      card.tabIndex = 0;

      // add the hover effect css class
      card.classList.add('interactiveCard');

      // link to the selection state manager
      card.addEventListener(
          'click', () => {toggleSelection(optionData.optionIndex)});
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          toggleSelection(optionData.optionIndex)
        }
      });
    } else if (optionData.iconMarkType && optionData.iconMarkType !== 'none') {
      let iconMarkDiv = document.createElement('div');
      iconMarkDiv.classList.add('iconMarkContainer');
      let iconMarkText = document.createElement('p');
      iconMarkText.classList.add('iconMarkText');

      iconMarkDiv.append(iconMarkText);

      // add the icon mark text and CSS class
      switch (optionData.iconMarkType) {
        case 'correct':
          iconMarkText.innerHTML = '\u2713';
          iconMarkDiv.classList.add('sow-correctIconMark')
          card.classList.add('sow-cardScoredCorrect');
          break;
        case 'incorrect':
          iconMarkText.innerHTML = '\u2715';
          iconMarkDiv.classList.add('sow-incorrectIconMark')
          card.classList.add('sow-cardScoredIncorrect');
          break;
        case 'missed':
          iconMarkText.innerHTML = '\u2014';
          iconMarkDiv.classList.add('sow-missedIconMark')
          card.classList.add('sow-cardScoredMissed');
          break;
      };

      card.prepend(iconMarkDiv)
    };

    return card;
  };

  // clears and then fills an HTML container with HTML option cards
  const populateGrid = (gridContainer) => {
    // clear the container
    gridContainer.innerHTML = '';

    // append option cards
    for (const optionData of options) {
      let optionCard = createOptionCard(optionData);
      gridContainer.append(optionCard);
      optionNodes.push(optionCard);
    }
  };

  // toggles the selection of the option with the given index
  // if the user tries to select an option while having already
  // selected the max number of options, fires a sweet alert message
  const toggleSelection = (index) => {
    if (selections.includes(index)) {
      // remove the index from selections
      selections = selections.filter(entry => {return entry != index})
      // remove selected stlye
      gridNode.childNodes[index].classList.remove('selectedOptionCard')
      gridNode.childNodes[index].style.backgroundColor = '';
    } else {
      if (selections.length < maxSelections) {
        // add the index to the selections
        selections.push(index);
        // add selected style to card
        if (options[index].colorHexCode) {
          gridNode.childNodes[index].style.backgroundColor =
              options[index].colorHexCode;
        } else {
          gridNode.childNodes[index].classList.add('selectedOptionCard')
        }
      } else {
        // format sweet alert message
        let messageText = `You can select up to ${maxSelections} answer`;
        messageText += maxSelections > 1 ? 's' : '';  // pluralize answers
        // fire a sweet alert to the user
        Swal.fire({
          title: 'Maximum Answers Reached',
          text: messageText,
          icon: 'warning'
        });
      }
    }

    // update the DOM elements with current selections
    updateHiddenInputs(selections);
  };

  const inferColors = () => {
    for (const option of options) {
      // use supplied color
      if (option.colorHexCode) {
        option.backgroundHexCode = option.colorHexCode;
        option.borderHexCode = '#000000';
        continue;
      }

      // infer the color otherwise
      if (!interactive) {
        switch (option.iconMarkType) {
          case 'correct':
            option.borderHexCode = '#009444';
            option.backgroundHexCode = '#bde3bd';
            break;
          case 'incorrect':
            option.borderHexCode = '#BE1E2D';
            option.backgroundHexCode = '#ffa3a3'
            break;
          case 'missed':
            option.borderHexCode = '#F15A29';
            option.backgroundHexCode = '#ffdcb5';
            break;
        }
      }
    }
  };

  const resizeGridItems = () => {
    debugger;
    const rowHeight = getStyleValue(gridNode, 'grid-auto-rows');
    const rowGap = getStyleValue(gridNode, 'grid-row-gap');
    gridNode.style.gridAutoRows = 'auto';
    gridNode.style.alignItems = 'self-start';
    let gridItems = gridNode.childNodes;
    for (const item of gridItems) {
      let spanAmt =
          Math.ceil((item.offsetHeight + rowGap) / (rowHeight + rowGap));

      item.style.gridRowEnd = `span ${spanAmt}`;
    }
    gridNode.removeAttribute('style');
  };

  const getStyleValue = (element, style) => {
    return parseInt(window.getComputedStyle(element).getPropertyValue(style));
  };

  // initialize the widget
  let selections = [];
  const gridNode = document.createElement('div');
  const textOnly = !options.some(option => {return option.imagePath});
  const imageOnly = options.every(option => {return option.imagePath});

  // initialize option grid
  if (textOnly) {
    gridNode.classList.add('selectableTextOptionsGridContainer');
  } else {
    gridNode.classList.add('selectableOptionsGridContainer');
  }
  node.append(gridNode);
  indexOptions();
  inferColors();
  var optionNodes = [];
  populateGrid(gridNode);

  // handle sizing;
  if (!textOnly) {
    window.addEventListener('load', resizeGridItems)
    window.addEventListener('resize', resizeGridItems)

    // resize the grid items on image loads
    for (let optNode of optionNodes) {
      let imgCollection = optNode.getElementsByTagName('img');
      for (let img of imgCollection) {
        img.addEventListener('load', resizeGridItems)
      }
    }
  }


  // cleanup on widget close
  const removeSelectableOptionsWidget = () => {
    // Remove the theme change callback
    document.removeEventListener('themeset', themeSetCallback)

    // Remove any html elements created by this widget
    node.innerHTML = ''
  };
  return removeSelectableOptionsWidget;
};