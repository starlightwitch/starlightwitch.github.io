const runSelectableAreasWidget =
    ({container, interactive, cardMargin, maxSelections, options}) => {
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

      const defaultTheme = 'light';

      // Define global variables that contain colors used by the widget
      defaultThemeColors = getThemeColors(defaultTheme);

      const setThemeColors = (theme) => {
        defaultThemeColors = getThemeColors(theme)
      };

      const themeSetCallback = (event) => {
        setThemeColors(event.detail.newTheme)
      };

      // Change the theme colors when the document theme is changed
      document.addEventListener('themeset', themeSetCallback);

      const node = document.getElementById(container);

      // create and configure the hidden input
      const answerHiddenInput = document.createElement('input');
      answerHiddenInput.type = 'hidden';
      answerHiddenInput.name = 'answers[]';
      answerHiddenInput.value = '';

      const updateHiddenInputs = (output) => {
        answerHiddenInput.value = encodeURIComponent(JSON.stringify(output));
      };

      // Insert the hidden input into the html
      if (interactive) node.append(answerHiddenInput);

      // Define the p5 sketch methods
      const sketch = (p) => {
        p.preload = () => {
          options.forEach((option, i) => {
            // if the path is defined, not empty and not null
            if (typeof option.imagePath !== 'undefined' &&
                option.imagePath !== '' && option.imagePath !== null) {
              // load the image
              p.loadImage(
                  option.imagePath,
                  // save it to the object
                  (img) => {
                    option.loadedImage = img;
                  },
                  // or report the error
                  (err) => {
                    console.log(err);
                  })
            }
          });
        };

        p.setup = () => {
          // get the grid structure
          let gridOfOptions = p.getGridStructure();

          let pictureRowCount = gridOfOptions[0].length;
          let picturelessRowCount = gridOfOptions[1].length;
          let pictureCardHeight =
              (window.innerHeight - picturelessRowCount * p.textSize()) /
              (rowCount + 2)  // adding buffer margin
          let sketchHeight =
              cardHeight * rowCount + cardMargin * (rowCount + 1);

          // create the canvas
          p.createCanvas(node.clientWidth, sketchHeight);

          // Create the widget obejct
          p.widgetObject = new SelectableOptionsWidget(
              {
                interactive,
                cardHeight,
                cardMargin,
                maxSelections,
                gridOfOptions
              },
              p, updateHiddenInputs);
        };

        p.getGridStructure = () => {
          // set the text size
          p.textSize(14);


          let pictureOptions = options.filter(
              (option) => {return (typeof option.loadedImage !== 'undefined')});
          pictureOptions.sort((a, b) => {
            return a.optionText.length - b.optionText.length;
          });

          let picturelessOptions = options.filter(
              (option) => {return (typeof option.loadedImage === 'undefined')});
          picturelessOptions.sort((a, b) => {
            return a.optionText.length - b.optionText.length;
          });

          // arrange options with pictues
          let pictureRows = [];
          let currRow = [];
          let availableWidth = node.clientWidth - cardMargin;
          for (const option of pictureOptions) {
            let neededWidth = p.textWidth(option.optionText) + 12 + cardMargin;
            neededWidth = Math.max(neededWidth, 50 + cardMargin);
            option.cardWidth = neededWidth - cardMargin;
            if (availableWidth > neededWidth) {
              currRow.push(option);
              availableWidth -= neededWidth;
            } else {
              pictureRows.push(currRow);
              currRow = [option];
              availableWidth = node.clientWidth - neededWidth - cardMargin;
            }
          }
          pictureRows.push(currRow);

          // arrange options without pictues
          picturelessRows = [];
          currRow = [];
          availableWidth = node.clientWidth - cardMargin;
          for (const option of picturelessOptions) {
            let neededWidth = p.textWidth(option.optionText) + 12 + cardMargin;
            neededWidth = Math.max(neededWidth, 50 + cardMargin);
            option.cardWidth = neededWidth - cardMargin;
            if (availableWidth > neededWidth) {
              currRow.push(option);
              availableWidth -= neededWidth;
            } else {
              picturelessRows.push(currRow);
              currRow = [option];
              availableWidth = node.clientWidth - neededWidth - cardMargin;
            }
          }
          picturelessRows.push(currRow);

          return [pictureRows, picturelessRows];
        };

        p.windowResized = () => {
          p.resizeCanvas(node.clientWidth, getHeightOfCanvas());
          p.widgetObject.resize();
        };

        p.draw = () => {
          p.background(defaultThemeColors.backgroundColor);
          p.widgetObject.draw();
        };

        p.touchStarted = () => {
          return true;  // prevents touches firing twice on mobile
        };

        p.touchMoved = (e) => {
          // prevent scrolling when the widget is being interacted with
          if (!e.cancelable) return;
        };

        p.mousePressed = () => {
          p.widgetObject.handleClickStart();
        };

        p.mouseReleased = () => {
          p.widgetObject.handleClickEnd();
        };

        p.keyPressed = () => {
          if (!p.focused) return true;

          if (p.keyCode == p.SHIFT) {
            p.widgetObject.shiftDown = true;
            return false;
          } else if (p.keyCode == p.TAB) {
            p.widgetObject.handleTab();
            return false;
          } else if (p.keyCode == p.ENTER) {
            p.widgetObject.handleEnter();
            return false;
          }
        };

        p.keyReleased = () => {
          if (!p.focused) return true;

          if (p.keyCode == p.SHIFT) {
            p.widgetObject.shiftDown = false;
            return false;
          }
        };
      };  // end sketch instance methods

      // Create the canvas and run the sketch in the html node.
      const sketchInstance = new p5(sketch, node);

      const removeAtomicStructure = () => {
        // Remove the p5 sketch instance
        sketchInstance.remove()

        // Remove the theme change callback
        document.removeEventListener('themeset', themeSetCallback)

        // Remove any html elements created by this widget
        node.innerHTML = ''
      };

      return removeAtomicStructure;
    }

class SelectableOptionsWidget {
  /**
   * @param config
   * - interactive: boolean / controls widget response to input
   * - maxSelections: int / the number of options a user can select at once
   * - options: object containing data of the user's options
   *    - image: p5.Image object
   *    - optionText: string
   *    - colorHexCode: string
   *    - iconMarkType: string
   * @param updateHiddenInputs function / exports widget data to hidden HTMl
                                input fields
   */
  constructor(
      {
        interactive,
        columns,
        cardHeight,
        cardMargin,
        maxSelections,
        gridOfOptions
      },
      p, updateHiddenInputs) {
    /* begin control panel */
    // stroke weights are set by line thickness in pixels
    this.defaultOptionStrokeWeight = 3;
    this.hoveredAreaStrokeWeight = 3;
    this.keyboardFocusedAreaStrokeWeight = 4;
    this.selectedAreaStrokeWeight = 3;

    // hover effects
    this.tooltipDuration = 120;      // number of frames
    this.hoverEffectDuration = 20;   // number of frames
    this.selectedFillOpacity = 100;  // 0-255, 0 is clear and 255 fully opaque
    this.lineDashLength = 5;         // length in pixels
    this.lineGapLength = 10;         // length in pixels

    // text
    this.tooltipTextHeight = 14;  // height in pixels
    /* end control panel */

    // read configuration data
    this.interactive = interactive;
    this.columns = columns;
    this.cardHeight = cardHeight;
    this.cardMargin = cardMargin;
    this.maxSelections = maxSelections;
    this.gridOfOptions = gridOfOptions;

    // link to the sketch instance and document output function
    this.p = p;
    this.updateHiddenInputs = updateHiddenInputs;

    // interactivity
    this.lastInputFrame = 0;
    this.sweetAlertShowing = false;
    this.mouseVec = this.p.createVector();
    this.keyboardFocusIndex = -1;
    this.shiftDown = false;

    // complete setup in the resize function
    this.selectableOptions = [];
    this.resize();
  }

  // used for canvas-size-dependent elements
  resize() {
    // set the card sizes
    let topLeftCornerVec =
        this.p.createVector(this.cardMargin, this.cardMargin);


    for (const row of this.gridOfOptions) {
      for (const optionData of row) {
        // add new object
        this.selectableOptions.push(new SelectableOption(
            this.p, this, topLeftCornerVec.copy(),
            this.p.createVector(optionData.cardWidth, this.cardHeight),
            optionData.colorHexCode, optionData.loadedImage,
            optionData.optionText, optionData.iconMarkType));
        // shift corner
        topLeftCornerVec.x += optionData.cardWidth + this.cardMargin;
      }
      topLeftCornerVec.x = this.cardMargin;
      topLeftCornerVec.y += this.cardHeight + this.cardMargin;
    };
  }

  draw() {
    // respond to the mosue
    this.updateHoverEffects();

    // draw the selectable options
    for (const selectableOption of this.selectableOptions) {
      selectableOption.draw();
    }
    // draw tooltips over everything else
    for (const selectableOption of this.selectableOptions) {
      selectableOption.drawTooltip();
    }
  }

  updateHoverEffects() {
    // update mouse vector object
    this.mouseVec.x = this.p.mouseX;
    this.mouseVec.y = this.p.mouseY;

    // update each area's focus
    for (const selectableOption of this.selectableOptions) {
      selectableOption.mouseFocused =
          selectableOption.mouseWithin(this.mouseVec);
    };

    // update the cursor
    if (this.selectableOptions.some(s => s.mouseFocused)) {
      this.p.cursor(this.p.HAND);
    } else {
      this.p.cursor(this.p.ARROW);
    };
  }

  exportModelState() {
    let selectedIndices = [];
    for (const [index, area] of this.selectableOptions.entries()) {
      if (area.selected) {
        selectedIndices.push(index);
      }
    }
    this.updateHiddenInputs(selectedIndices);
  }

  handleClickStart() {
    if (this.sweetAlertShowing) {
      return;
    }

    // register click with widget state
    this.lastInputFrame = this.p.frameCount;
    this.mouseVec.x = this.p.mouseX;
    this.mouseVec.y = this.p.mouseY;

    for (const selectableOption of this.selectableOptions) {
      if (selectableOption.mouseWithin(this.mouseVec)) {
        this.toggleSelection(selectableOption);
        break;
      }
    }
  }

  handleClickEnd() {
    return true;
  }

  handleTab() {
    // increment the focused element index
    if (this.shiftDown) {
      this.keyboardFocusIndex--;
      if (this.keyboardFocusIndex < -1) {
        this.keyboardFocusIndex = this.selectableOptions.length - 1;
      }
    } else {
      this.keyboardFocusIndex++;
      if (this.keyboardFocusIndex >= this.selectableOptions.length) {
        this.keyboardFocusIndex = -1;
      }
    }

    // update the focus
    for (const [index, option] of this.selectableOptions.entries()) {
      option.keyboardFocused = index == this.keyboardFocusIndex;
    }
  }

  handleEnter() {
    // return if non-interactive
    if (!this.interactive) return;
    // return if the focus index is out of bounds
    if (this.keyboardFocusIndex < 0 ||
        this.keyboardFocusIndex >= this.selectableOptions.length) {
      return;
    }

    // toggle selection on the currently keyboard focused option
    this.toggleSelection(this.selectableOptions[this.keyboardFocusIndex]);
  }

  toggleSelection(selectableOption) {
    // toggle selection on clicked selectable areas
    let currSelectedOptionCount =
        this.selectableOptions.filter(s => {return s.selected}).length;

    if (selectableOption.selected) {
      selectableOption.selected = false;
      selectableOption.tooltipFrames = 0;
    } else {
      if (currSelectedOptionCount < this.maxSelections) {
        selectableOption.selected = true;
        selectableOption.tooltipFrames = 0;
      } else {
        this.sweetAlertShowing = true;
        Swal.fire({
              title: 'Maximum Selections Exceeded',
              text: 'Please unselect an option before selecting another.',
              icon: 'warning'
            })
            .then((result) => {
              this.sweetAlertShowing = false;
            });
      }
    }

    // update the outputted selections
    this.exportModelState();
  }
}



class SelectableOption {
  constructor(
      p, widgetController, topLeftCorner, dimensions, colorHexCode, optionImage,
      optionText, iconMarkType) {
    // link to sketch enviroment and controller
    this.p = p;
    this.widgetController = widgetController;

    // posiiton and sizing
    this.dimensions = dimensions;
    this.topLeftCorner = topLeftCorner;
    this.bottomRightCorner = topLeftCorner.copy().add(dimensions);

    // inner image
    if (typeof optionImage !== 'undefined') {
      this.innerImageMargin = 10;
      this.innerImageWidth = this.dimensions.x - this.innerImageMargin * 2;
      this.innerImageHeight =
          this.innerImageWidth * optionImage.height / optionImage.width;

      if (this.innerImageHeight > this.dimensions.y * 0.7) {
        this.innerImageHeight = this.dimensions.y * 0.7;
        this.innerImageWidth =
            this.innerImageHeight * optionImage.width / optionImage.height
      }
    }

    // colors
    this.strokeColor = this.p.color(colorHexCode);
    this.fillColor = this.p.color(colorHexCode);
    this.fillColor.setAlpha(this.widgetController.selectedFillOpacity);

    // option content
    this.optionImage = optionImage;
    this.optionText = optionText;
    this.iconMarkType = iconMarkType;

    // interactivity
    this.focusedFrames = 0;
    this.selectedFrames = 0;
    this.mouseFocused = false;
    this.keyboardFocused = false;
    this.selected = false;
  }

  draw() {
    // update timed animation frames
    if (this.selected) {
      this.selectedFrames = Math.min(
          this.selectedFrames + 1, this.widgetController.hoverEffectDuration);
    } else {
      this.selectedFrames = Math.max(this.selectedFrames - 2, 0);
    };
    if (this.keyboardFocused || this.mouseFocused) {
      this.focusedFrames = Math.min(
          this.focusedFrames + 1, this.widgetController.hoverEffectDuration);
    } else {
      this.focusedFrames = Math.max(this.focusedFrames - 2, 0)
    };
    let focusProgress =
        this.focusedFrames / this.widgetController.hoverEffectDuration;
    let selectedProgress =
        this.selectedFrames / this.widgetController.hoverEffectDuration;

    // base styling
    this.p.strokeWeight(this.widgetController.defaultOptionStrokeWeight);
    this.p.stroke(0);
    this.p.noFill();

    // set the fill
    if (focusProgress > 0) {
      this.p.fill(this.p.lerp(255, 200, focusProgress))
    }
    if (selectedProgress > 0) {
      let currFill = this.p.color(this.p.lerp(255, 200, focusProgress));
      let selectedFill = this.p.color('#A9EAFF');
      this.p.fill(this.p.lerpColor(currFill, selectedFill, selectedProgress))
    }

    // set the stroke for keyboard highlight
    if (this.keyboardFocused) {
      this.p.stroke('#FFA500');
    }


    this.p.push();
    this.p.rectMode(this.p.CORNER);
    this.p.rect(
        this.topLeftCorner.x, this.topLeftCorner.y, this.dimensions.x,
        this.dimensions.y, 6);


    let textHeightOffset = this.p.textSize();
    if (typeof this.optionImage !== 'undefined') {
      this.p.imageMode(this.p.CENTER);
      this.p.image(
          this.optionImage, this.topLeftCorner.x + this.dimensions.x / 2,
          this.topLeftCorner.y + this.dimensions.y / 2, this.innerImageWidth,
          this.innerImageHeight);
    } else {
      textHeightOffset = this.dimensions.y / 2;
    }

    if (this.optionText != '') {
      this.p.noStroke();
      this.p.fill(0);
      this.p.textAlign(this.p.CENTER);
      this.p.text(
          this.optionText, this.topLeftCorner.x + this.dimensions.x / 2,
          this.bottomRightCorner.y - textHeightOffset);
    }

    this.p.pop();
  }

  drawTooltip() {
    return true;  // TODO
  }

  mouseWithin(mouseVec) {
    return mouseVec.x > this.topLeftCorner.x &&
        mouseVec.x < this.bottomRightCorner.x &&
        mouseVec.y > this.topLeftCorner.y &&
        mouseVec.y < this.bottomRightCorner.y;
  }
}