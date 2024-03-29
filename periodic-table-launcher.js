const widgetConfig = {
  container: 'answer-visual-container',
  interactive: true,
  selectionMode: 'groups',  // options: elements | groups | periods
  maxSelections: 3,
  displayData: {
    chemicalName: true,
    chemicalSymbol: true,
    atomicNumber: true,
    atomicMass: true,
    periodNumbers: true,
    groupNumbers: true,
    key: true
  },
  showPeriods: [],       // indices of periods to show, empty array for all
  showGroups: [],        // indices of groups to show, empty array for all
  tableVersion: 'gcse',  // options: gsce | alevel
}

let removeWidget = runPeriodicTableWidget(widgetConfig);
