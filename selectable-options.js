const runSelectableOptionsWidget =
    ({container, interactive, cardMargin, maxSelections, options}) => {
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
        card.className = 'selectableOptionCard';
        let cardContent = document.createElement('div');
        cardContent.className = 'selectableOptionCardContent';

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
          optionParagraph.className = 'optionParagraph'

          card.append(optionParagraph);
        }

        // card.append(cardContent);
        card.tabIndex = 0;

        // link to the selection state manager
        card.addEventListener(
            'click', () => {toggleSelection(optionData.optionIndex)});

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
        } else {
          if (selections.length < maxSelections) {
            // add the index to the selections
            selections.push(index);
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
        styleSelectedCards();
      };

      // assigns the CSS class 'selectedCard' to currently selected options
      const styleSelectedCards = () => {
        let cards = document.getElementsByClassName('selectableOptionCard')
        Array.prototype.forEach.call(cards, (card, i) => {
          card.classList.remove('selectedCard')
          if (selections.includes(i)) {
            card.classList.add('selectedCard')
          };
        });
      };


      const resizeGridItems = () => {
        let grid = node;
        const rowHeight = getStyleValue(grid, 'grid-auto-rows');
        const rowGap = getStyleValue(grid, 'grid-row-gap');
        grid.style.gridAutoRows = 'auto';
        grid.style.alignItems = 'self-start';
        let gridItems = grid.childNodes;
        for (const item of gridItems) {
          item.style.gridRowEnd = `span ${
              Math.ceil((item.clientHeight + rowGap) / (rowHeight + rowGap))}`;
        }
        grid.removeAttribute('style');
      };

      const getStyleValue = (element, style) => {
        return parseInt(
            window.getComputedStyle(element).getPropertyValue(style));
      };

      // initialize the widget
      let selections = [];
      node.classList.add('selectableOptionsGridContainer');
      indexOptions();
      populateGrid(node);

      window.addEventListener('load', resizeGridItems)
      window.addEventListener('resize', resizeGridItems)


      // cleanup on widget close
      const removeSelectableOptionsWidget = () => {
        // Remove the theme change callback
        document.removeEventListener('themeset', themeSetCallback)

        // Remove any html elements created by this widget
        node.innerHTML = ''
      };
      return removeSelectableOptionsWidget;
    };