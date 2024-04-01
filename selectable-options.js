const runSelectableOptionsWidget =
    ({container, interactive, maxSelections, options}) => {
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
          optionImage.className = 'optionCardImage';
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

          if (textOnly) {
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
        } else if (
            typeof optionData.iconMarkType !== 'undefined' &&
            optionData.iconMarkType !== '' && optionData.iconMarkType != null) {
          let iconMarkDiv = document.createElement('div');
          iconMarkDiv.classList.add('iconMarkContainer');
          let iconMarkText = document.createElement('p');
          iconMarkText.classList.add('iconMarkText');

          iconMarkDiv.append(iconMarkText);

          // add the correct icon mark
          switch (optionData.iconMarkType) {
            case 'correct':
              iconMarkText.innerHTML = '\u2713';
              break;
            case 'incorrect':
              iconMarkText.innerHTML = '\u2715';
              break;
            case 'missed':
              iconMarkText.innerHTML = '\u2014';
              break;
          };

          // color the icon mark and card
          iconMarkText.style.color = optionData.colorHexCode;
          iconMarkDiv.style.borderColor = optionData.colorHexCode;
          card.style.borderColor = optionData.colorHexCode;
          card.style.backgroundColor = optionData.colorHexCode + '60';

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
            // fire a sweet alert to the user
            Swal.fire({
              title: 'Maximum Selections Exceeded',
              text: 'Please unselect an option before selecting another.',
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
          if (option.colorHexCode) continue;

          // infer the color otherwise
          if (!interactive) {
            switch (option.iconMarkType) {
              case 'correct':
                option.colorHexCode = '#009444';
                break;
              case 'incorrect':
                option.colorHexCode = '#BE1E2D';
                break;
              case 'missed':
                option.colorHexCode = '#F15A29';
                break;
              case 'none':
                option.colorHexCode = '#00000000';
                break;
            }
          }
        }
      };

      const resizeGridItems = () => {
        const rowHeight = getStyleValue(gridNode, 'grid-auto-rows');
        const rowGap = getStyleValue(gridNode, 'grid-row-gap');
        gridNode.style.gridAutoRows = 'auto';
        gridNode.style.alignItems = 'self-start';
        let gridItems = gridNode.childNodes;
        for (const item of gridItems) {
          item.style.gridRowEnd = `span ${
              Math.ceil((item.offsetHeight + rowGap) / (rowHeight + rowGap))}`;
        }
        gridNode.removeAttribute('style');
      };

      const getStyleValue = (element, style) => {
        return parseInt(
            window.getComputedStyle(element).getPropertyValue(style));
      };

      // initialize the widget
      let selections = [];
      const gridNode = document.createElement('div');
      const textOnly = !options.some(option => {return option.imagePath});
      const imageOnly = options.every(option => {return option.imagePath});
      if (textOnly) {
        gridNode.classList.add('selectableTextOptionsGridContainer');
      } else {
        gridNode.classList.add('selectableOptionsGridContainer');
      }
      node.append(gridNode);
      indexOptions();
      inferColors();
      populateGrid(gridNode);

      if (!textOnly) {
        window.addEventListener('load', resizeGridItems)
        window.addEventListener('resize', resizeGridItems)
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