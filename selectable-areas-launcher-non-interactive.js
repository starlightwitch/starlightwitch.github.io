// color codes from figma
// blue   '#50DFFF'
// red    '#FF1616'
// green  '#63C616'
// orange '#FF5C00'

const widgetConfig = {
  container: 'answer-visual-container',
  interactive: false,
  imagePath: 'assets/img/solar-system.png',
  imageWidthFactor: 1,
  imageMaxHeightFactor: 0.5,
  maxSelections: 3,
  hotspots: [
    {
      area: [
        [0.365625, 0.31], [0.419375, 0.3151497538293217],
        [0.451875, 0.37423071663019697], [0.425625, 0.4508171498905908],
        [0.361875, 0.43987623085339167], [0.346875, 0.3764189004376368]
      ],
      colorHexCode: '',
      iconMarkVertexIndex: 1,
      iconMarkType: 'correct',
      tooltipID: 'Venus'
    },
    {
      area: [
        [0.636875, 0.2910797319474836], [0.706875, 0.3348434080962801],
        [0.736875, 0.45956988512035013], [0.705625, 0.560226340262582],
        [0.634375, 0.5799199945295405], [0.561875, 0.5186508479212254],
        [0.543125, 0.38954800328227573], [0.578125, 0.310773386214442]
      ],
      colorHexCode: '',
      iconMarkVertexIndex: 1,
      iconMarkType: 'incorrect',
      tooltipID: 'Jupiter'

    },
    {
      area: [
        [0.8331005586592178, 0.5908609135667396],
        [0.8624301675977654, 0.6061782002188184],
        [0.8736033519553073, 0.6499418763676149], [0.875, 0.7024582877461707],
        [0.848463687150838, 0.7287164934354486],
        [0.8051675977653632, 0.724340125820569],
        [0.7870111731843575, 0.6762000820568927],
        [0.7981843575418994, 0.6149309354485777]
      ],
      colorHexCode: '',
      iconMarkVertexIndex: 1,
      iconMarkType: 'missed',
      tooltipID: 'Uranus'

    },
    {
      area: [
        [0.8819832402234636, 0.19917601203501092],
        [0.9182960893854749, 0.20136419584245077],
        [0.9252793296089385, 0.24512787199124728],
        [0.9252793296089385, 0.28670336433260396],
        [0.901536312849162, 0.31952612144420134],
        [0.8596368715083799, 0.31952612144420134],
        [0.8428770949720671, 0.2779506291028447],
        [0.854050279329609, 0.2057405634573304]
      ],
      colorHexCode: '#50DFFF',
      iconMarkVertexIndex: 1,
      iconMarkType: 'correct',
      tooltipID: 'Neptune'
    },
    {
      area: [
        [0.6906424581005587, 0.24512787199124728],
        [0.6710893854748603, 0.20136419584245077],
        [0.6571229050279329, 0.16197688730853393],
        [0.6263966480446927, 0.09633137308533918],
        [0.6766759776536313, 0.05037951312910285],
        [0.7534916201117319, 0.035062226477024075],
        [0.789804469273743, 0.09195500547045952],
        [0.7995810055865922, 0.1772941739606127],
        [0.8107541899441341, 0.2473160557986871],
        [0.7297486033519553, 0.26263334245076586]
      ],
      colorHexCode: '#50DFFF',
      iconMarkVertexIndex: 1,
      iconMarkType: 'none',
      tooltipID: 'Saturn'
    },
    {
      area: [
        [0.5314245810055865, 0.6783882658643327],
        [0.5523743016759777, 0.6805764496717724],
        [0.5649441340782123, 0.7133992067833699],
        [0.5649441340782123, 0.7330928610503282],
        [0.5649441340782123, 0.7812329048140044],
        [0.5244413407821229, 0.7812329048140044],
        [0.49511173184357543, 0.7527865153172867],
        [0.5034916201117319, 0.7090228391684902],
        [0.5146648044692738, 0.6937055525164114]
      ],
      colorHexCode: '#50DFFF',
      iconMarkVertexIndex: 1,
      iconMarkType: 'correct',
      tooltipID: 'Mars'
    },
    {
      area: [
        [0.9643854748603352, 0.498957193654267],
        [0.9825418994413407, 0.48801627461706787],
        [0.9825418994413407, 0.4442525984682713],
        [0.9629888268156425, 0.42893531181619254],
        [0.9350558659217877, 0.4311234956236324],
        [0.9420391061452514, 0.47269898796498905]
      ],
      colorHexCode: '#50DFFF',
      iconMarkVertexIndex: 1,
      iconMarkType: 'correct',
      tooltipID: 'Pluto'
    },
    {
      area: [
        [0.4574022346368715, 0.4923926422319475],
        [0.46997206703910616, 0.4026771061269147],
        [0.5314245810055865, 0.40486528993435456],
        [0.5314245810055865, 0.4814517231947484],
        [0.5314245810055865, 0.5667908916849015],
        [0.5090782122905028, 0.647753692560175],
        [0.4420391061452514, 0.6586946115973742],
        [0.42248603351955305, 0.5252153993435449]
      ],
      colorHexCode: '#50DFFF',
      iconMarkVertexIndex: 1,
      iconMarkType: 'correct',
      tooltipID: 'Earth Moon System'
    },
    {
      area: [
        [0.3191340782122905, 0.6061782002188184],
        [0.3470670391061452, 0.6193073030634574],
        [0.3610335195530726, 0.6674473468271335],
        [0.3442737430167598, 0.7287164934354486],
        [0.2925977653631285, 0.7287164934354486],
        [0.2702513966480447, 0.6521300601750547],
        [0.2842178770949721, 0.6346245897155361]
      ],
      colorHexCode: '#50DFFF',
      iconMarkVertexIndex: 1,
      iconMarkType: 'correct',
      tooltipID: 'Mercury'
    }
  ]
};

let removeWidget = runSelectableAreasWidget(widgetConfig);
