// utility functions for calculatig histogram
const inRange = (a, b, c) => {
  //determine if c is between a and b
  if (a < b) {
    if (c >= a && c <= b) return true;
    else return false;
  }
  if (a > b) {
    if (c >= a || c <= b) return true;
    else return false;
  }
  return false;
};

const checkRanges = (a) => {
  let bool = true;
  a.forEach((d) => {
    if (!inRange(d[0], d[1], d[2])) bool = false;
  });
  return bool;
};

const calcBins = (min, max, numBins) => {
  let bins = [];
  let dx = (max - min) / Math.max(numBins, 1);
  let b = [];
  for (let i = 0; i < numBins; i++) {
    b.push(min + i * dx);
  }
  b.push(max);

  b.forEach((d, i, a) => {
    if (typeof a[i + 1] != "undefined") {
      bins.push({
        min: d,
        max: a[i + 1],
        n: 0,
        c: 0,
      });
    }
  });
  return bins;
};

export const calcHistogram = (
  data,
  min,
  max,
  numBins,
  altZBool,
  selectedIdxPrimary,
  selectedIdxSecondary,
  currentMin1,
  currentMax1,
  currentMin2,
  currentMax2,
  startHourVal,
  endHourVal,
  startDateVal,
  endDateVal
) => {
  let bins = calcBins(min, max, numBins);
  let totalHours = 0;
  let maxHours = 0;
  //go through every time step
  let l = data.length;
  for (let i = 0; i < l; i++) {
    let v = data[i].data[selectedIdxPrimary];
    let v2 = data[i].data[selectedIdxSecondary];
    let hour = data[i].clock;
    let day = data[i].date;

    //exclude values not between currentMin/currentMax, currentMin2/currentMax2, hour, date
    let countZero = true;
    if (altZBool && v === 0) countZero = false;
    if (countZero) {
      let a = [
        [currentMin1, currentMax1, v],
        [currentMin2, currentMax2, v2],
        [startHourVal, endHourVal, hour],
        [startDateVal, endDateVal, day],
      ];
      let check = checkRanges(a);
      if (check) {
        //choose what bin the value fits into
        bins.forEach((d) => {
          if (v >= d.min) d.c += 1;
          if (v >= d.min && v < d.max) {
            d.n += 1;
            totalHours += 1;
          }
          if (d.n > maxHours) maxHours = d.n;
        });
      }
    }
  }
  return { bins: bins, maxHours: maxHours, totalHours: totalHours };
};
