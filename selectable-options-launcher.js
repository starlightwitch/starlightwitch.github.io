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
      imagePath: 'assets/img/microscope.png',
      optionText: 'Microscope',
      iconMarkType: 'incorrect',
    },
    {
      imagePath: 'assets/img/microscope.png',
      optionText: 'A Scanning Electron Microscope',
      iconMarkType: 'correct',
    },
    {
      imagePath: 'assets/img/beaker.png',
      optionText: '',
      iconMarkType: 'missed',
    },
    {
      imagePath: null,
      optionText: 'An option without a picture.',
      iconMarkType: '',
    },
    {
      imagePath: 'assets/img/beaker.png',
      optionText: 'Beaker',
      iconMarkType: '',
    },
    {
      imagePath: 'assets/img/microscope.png',
      optionText: 'Another Scanning Electron Microscope',
      iconMarkType: '',
    },
    {
      imagePath: 'assets/img/microscope.png',
      optionText: 'A laboratory microscope',
      iconMarkType: '',
    },
    {
      imagePath: null,
      optionText: 'A text option, which turns purple when selected.',
      colorHexCode: '#b4a7d6',
      iconMarkType: '',
    },
    {
      imagePath: null,
      optionText:
          'A very long text option, designed to really test the limits of the auto layout. An option that needs no introduction.',
      iconMarkType: '',
    },
    {
      imagePath: null,
      optionText: 'A laboratory microscope, pictureless.',
      iconMarkType: '',
    },
  ]
}

let removeWidget = runSelectableOptionsWidget(widgetConfig);
