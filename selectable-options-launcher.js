// color codes from figma
// blue   '#50DFFF'
// red    '#FF1616'
// green  '#63C616'
// orange '#FF5C00'

const widgetConfig = {
  container: 'answer-visual-container',
  interactive: true,
  cardMargin: 20,  // in pixels
  maxSelections: 3,
  options: [
    {
      imagePath: 'assets/img/microscope.png',
      optionText: 'Microscope',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: 'assets/img/microscope.png',
      optionText: 'A Scanning Electron Microscope',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: 'assets/img/beaker.png',
      optionText: '',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: null,
      optionText: 'An option without a picture.',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: 'assets/img/beaker.png',
      optionText: 'Beaker',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: 'assets/img/microscope.png',
      optionText: 'Another Scanning Electron Microscope',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: 'assets/img/microscope.png',
      optionText: 'A laboratory microscope',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: null,
      optionText: 'A text option.',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: null,
      optionText:
          'A very long text option, designed to really test the limits of the auto layout. An option that needs no introduction.',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: null,
      optionText: 'A laboratory microscope, pictureless.',
      colorHexCode: '',
      iconMarkType: '',
    },
  ]
}

let removeWidget = runSelectableOptionsWidget(widgetConfig);
