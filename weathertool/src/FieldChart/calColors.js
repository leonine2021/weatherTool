const updateDiscreteColors = (min, max, bounds, colorScale) => {
  let avgs = [
    (min + bounds[0]) / 2,
    (bounds[0] + bounds[1]) / 2,
    (bounds[1] + bounds[2]) / 2,
    (bounds[2] + bounds[3]) / 2,
    (bounds[3] + max) / 2,
  ];
  var cols = [];
  for (let i = 0; i < avgs.length; i++) {
    cols.push(colorScale(avgs[i]));
  }
  return cols;
};

const updateBinColors = (min, max, numBins, colorScale) => {
  var cArray = [];
  for (var i = 0; i < numBins; i++) {
    cArray.push(colorScale(min + ((max - min) * i) / numBins));
  }
  return cArray;
};

const inRangeX = (x) => {
  let a = x[0],
    b = x[1],
    c = x[2];
  let bool = false;
  if (a < b) {
    if (c >= a && c < b) bool = true;
    else bool = false;
  }
  if (a > b) {
    if (c >= b && c < a) bool = true;
    else bool = false;
  }
  return bool;
};

const colorScaleDiscrete = (
  v,
  bounds,
  currentMin,
  currentMax,
  discreteColors
) => {
  if (inRangeX([currentMin, bounds[0], v])) return discreteColors[0];
  if (inRangeX([bounds[0], bounds[1], v])) return discreteColors[1];
  if (inRangeX([bounds[1], bounds[2], v])) return discreteColors[2];
  if (inRangeX([bounds[2], bounds[3], v])) return discreteColors[3];
  if (inRangeX([bounds[3], currentMax + 1, v])) return discreteColors[4];
};

//which dots to show?
// const checkDots = (
//   d,
//   idx1,
//   idx2,
//   primaryFilters,
//   secondaryFilters,
//   periodFilters,
//   altZBool,
//   numHoursBounds,
//   numHours
// ) => {
//   let ind = d.date - 1;
//   let hr = d.clock;
//   let v1 = d.data[idx1];
//   let v2 = d.data[idx2];

//   let matrix = [
//     [periodFilters.startDate - 1, periodFilters.endDate - 1, ind],
//     [periodFilters.startHour, periodFilters.endHour, hr],
//     [secondaryFilters.newMin, secondaryFilters.newMax, v2],
//   ];

//   if (altZBool)
//     matrix.push([
//       Math.max(0.1, primaryFilters.newMin),
//       primaryFilters.newMax,
//       v1,
//     ]);
//   else matrix.push([primaryFilters.newMin, primaryFilters.newMax, v1]);

//   if (evalRanges(matrix)) {
//     calcStats(
//       v1,
//       primaryFilters.newMin,
//       primaryFilters.newMax,
//       primaryFilters.newBounds,
//       numHoursBounds,
//       numHours
//     ); //calculate stats before discounting those dots off screen
//     return true;
//   }
//   return false;
// };

const calcStats = (v, filters, numHoursBounds) => {
  //evaluate stats
  // numHours++;
  if (inRangeX([filters.newMin, filters.newBounds[0], v])) numHoursBounds[0]++;
  if (inRangeX([filters.newBounds[0], filters.newBounds[1], v]))
    numHoursBounds[1]++;
  if (inRangeX([filters.newBounds[1], filters.newBounds[2], v]))
    numHoursBounds[2]++;
  if (inRangeX([filters.newBounds[2], filters.newBounds[3], v]))
    numHoursBounds[3]++;
  if (inRangeX([filters.newBounds[3], filters.newMax + 1, v]))
    numHoursBounds[4]++;
};

//evalRanges
// const evalRanges = (ar) => {
//   let bool = true;
//   let lar = ar.length;
//   while (lar--) {
//     if (!inRange(ar[lar])) bool = false;
//   }
//   return bool;
// };

//inRange
//determine if c is between a and b
// const inRange = (x) => {
//   let a = x[0],
//     b = x[1],
//     c = x[2];
//   if (a < b) {
//     if (c >= a && c <= b) return true;
//     else return false;
//   }
//   if (a > b) {
//     if (c >= a || c <= b) return true;
//     else return false;
//   }
//   return false;
// };

export {
  updateDiscreteColors,
  updateBinColors,
  colorScaleDiscrete,
  inRangeX,
  calcStats,
};
