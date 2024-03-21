// color codes from figma
// blue   '#50DFFF'
// red    '#FF1616'
// green  '#63C616'
// orange '#FF5C00'

const widgetConfig = {
  container: 'answer-visual-container',
  interactive: true,
  maxSelections: 3,
  options: [
    {
      imagePath: '',
      optionText: 'Microscope',
      iconMarkType: 'incorrect',
    },
    {
      imagePath: null,
      optionText: 'A Scanning Electron Microscope',
      iconMarkType: 'correct',
    },
    {
      optionText: 'Option for testing purposes',
      iconMarkType: 'missed',
    },
    {
      imagePath: null,
      optionText: 'An option without a picture.',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: null,
      optionText: 'Beaker',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: null,
      optionText: 'Another Scanning Electron Microscope',
      colorHexCode: '',
      iconMarkType: '',
    },
    {
      imagePath: null,
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
