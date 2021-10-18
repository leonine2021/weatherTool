const months = [
  743, 1415, 2159, 2879, 3623, 4343, 5087, 5831, 6551, 7295, 8015, 8759,
];
const mHours = [744, 672, 744, 720, 744, 720, 744, 744, 720, 744, 720, 744];
const calcValues = (data, unit, hsp, csp) => {
  //metric v. imperial
  let m1 = 1.8;
  let m2 = 32;
  if (unit) {
    m1 = 1;
    m2 = 0;
  }
  hsp = hsp * m1 + m2;
  csp = csp * m1 + m2;

  //calculate values
  let totalrad = 0;
  let south = 0,
    east = 0,
    north = 0,
    west = 0;
  let meantemp = 0,
    dailyavg = 0;
  let hdd = 0,
    hdh = 0,
    cdd = 0,
    cdh = 0;
  let max = -1e99,
    min = 1e99;

  let monthcount = 0;
  let totalradMonthly = 0;
  let sM = 0,
    eM = 0,
    nM = 0,
    wM = 0;
  let meantempMonthly = 0;
  let hddMonthly = 0,
    hdhMonthly = 0,
    cddMonthly = 0,
    cdhMonthly = 0;
  let maxMonthly = -1e99,
    minMonthly = 1e99;

  let totalradVals = [];
  let sV = [],
    eV = [],
    nV = [],
    wV = [];
  let radMin = 1e99,
    radMax = -1e99;
  let meantempVals = [];
  let hddVals = [],
    hdhVals = [],
    cddVals = [],
    cdhVals = [];
  let maxVals = [],
    minVals = [];

  let l = data.length;
  for (let i = 0; i < l; i++) {
    //calculate yearly horizontal radiation
    totalrad += data[i].data[2];
    totalradMonthly += data[i].data[2];

    //calculate yearly facade radiation
    north += data[i].data[17];
    nM += data[i].data[17];
    east += data[i].data[21];
    eM += data[i].data[21];
    south += data[i].data[25];
    sM += data[i].data[25];
    west += data[i].data[29];
    wM += data[i].data[29];

    let temp = data[i].data[3];
    //calculate mean temperature
    meantemp += temp;
    meantempMonthly += temp;
    //calculate heating degree days
    dailyavg += temp;
    if (data[i].clock === 23) {
      dailyavg = dailyavg / 24;
      if (dailyavg < hsp) hdd += hsp - dailyavg;
      if (dailyavg > csp) cdd += Math.abs(csp - dailyavg);
      if (dailyavg < hsp) hddMonthly += hsp - dailyavg;
      if (dailyavg > csp) cddMonthly += Math.abs(csp - dailyavg);
      dailyavg = 0;
    }
    //calculate heating degree hours
    if (temp < hsp) hdh += hsp - temp;
    if (temp > csp) cdh += Math.abs(csp - temp);
    if (temp < hsp) hdhMonthly += hsp - temp;
    if (temp > csp) cdhMonthly += Math.abs(csp - temp);

    // min/max
    if (temp < min) min = temp;
    if (temp < minMonthly) minMonthly = temp;
    if (temp > max) max = temp;
    if (temp > maxMonthly) maxMonthly = temp;

    if (i === months[monthcount]) {
      let trm = Math.round(totalradMonthly / 1000);
      if (trm > radMax) radMax = trm;
      if (trm < radMin) radMin = trm;
      totalradVals.push(totalradMonthly);
      nV.push(nM);
      eV.push(eM);
      sV.push(sM);
      wV.push(wM);
      meantempVals.push(
        Math.round((meantempMonthly * 10) / mHours[monthcount]) / 10
      );
      hddVals.push(hddMonthly);
      hdhVals.push(hdhMonthly);
      cddVals.push(cddMonthly);
      cdhVals.push(cdhMonthly);
      minVals.push(minMonthly);
      maxVals.push(maxMonthly);

      totalradMonthly = 0;
      nM = 0;
      eM = 0;
      sM = 0;
      wM = 0;
      meantempMonthly = 0;
      hddMonthly = 0;
      hdhMonthly = 0;
      cddMonthly = 0;
      cdhMonthly = 0;
      maxMonthly = -1e99;
      minMonthly = 1e99;

      monthcount += 1;
    }
  }
  meantemp = Math.round(meantemp / 876) / 10;

  let radMaxTot = totalrad / 1000;
  totalradVals.push(totalrad);
  nV.push(north);
  eV.push(east);
  sV.push(south);
  wV.push(west);
  meantempVals.push(meantemp);
  hddVals.push(hdd);
  hdhVals.push(hdh);
  cddVals.push(cdd);
  cdhVals.push(cdh);
  minVals.push(min);
  maxVals.push(max);

  return {
    north: nV,
    east: eV,
    south: sV,
    west: wV,
    meantemp: meantempVals,
    totalrad: totalradVals,
    radMin: radMin,
    radMax: radMax,
    radMaxTot: radMaxTot,
    hdd: hddVals,
    hdh: hdhVals,
    cdd: cddVals,
    cdh: cdhVals,
    min: minVals,
    max: maxVals,
  };
};

const getRowLabels = (unit, hsp, csp) => {
  //metric v. imperial
  let u0 = "kWh/ft2",
    u1 = "F",
    m1 = 1.8,
    m2 = 32,
    degreedays = "F-days",
    degreehours = "F-hrs";
  if (unit) {
    u0 = "kWh/m2";
    u1 = "C";
    m1 = 1;
    m2 = 0;
    degreedays = "K-days";
    degreehours = "K-hrs";
  }
  //   hsp = hsp * m1 + m2;
  //   csp = csp * m1 + m2;

  return [
    `Total Horizontal Insolation (${u0})`,
    `Total North Facade Insolation (${u0})`,
    `Total East Facade Insolation (${u0})`,
    `Total South Facade Insolation (${u0})`,
    `Total West Facade Insolation (${u0})`,
    "",
    `Max Outisde Temperature (${u1})`,
    `Mean Outside Temperature (${u1})`,
    `Min Outside Temperature (${u1})`,
    "",
    `Heating Degree Days (${degreedays} from ${
      Math.round(hsp * 10) / 10
    } ${u1})`,
    `Heating Degree Hours (${degreehours} from ${
      Math.round(hsp * 10) / 10
    } ${u1})`,
    `Cooling Degree Days (${degreedays} from ${
      Math.round(csp * 10) / 10
    } ${u1})`,
    `Cooling Degree Hours (${degreehours} from ${
      Math.round(csp * 10) / 10
    } ${u1})`,
  ];
};

const getTableObj = (data, param, values, rscale, rscaleTot) => {
  let o = values;

  let horRow = [],
    nRow = [],
    eRow = [],
    sRow = [],
    wRow = [],
    maxRow = [],
    minRow = [],
    meanRow = [],
    hddRow = [],
    hdhRow = [],
    cddRow = [],
    cdhRow = [],
    blank = [];

  var l = o.totalrad.length;
  for (var i = 0; i < l; i++) {
    let tr = Math.round(o.totalrad[i] / 1000),
      nr = Math.round(o.north[i] / 1000),
      er = Math.round(o.east[i] / 1000),
      sr = Math.round(o.south[i] / 1000),
      wr = Math.round(o.west[i] / 1000);
    let tc = rscale(tr),
      nc = rscale(nr),
      ec = rscale(er),
      sc = rscale(sr),
      wc = rscale(wr);
    if (i === 12) {
      tc = rscaleTot(tr);
      nc = rscaleTot(nr);
      ec = rscaleTot(er);
      sc = rscaleTot(sr);
      wc = rscaleTot(wr);
    }
    horRow.push({ v: addCommas(tr), f: tc });
    nRow.push({ v: addCommas(nr), f: nc });
    eRow.push({ v: addCommas(er), f: ec });
    sRow.push({ v: addCommas(sr), f: sc });
    wRow.push({ v: addCommas(wr), f: wc });
    maxRow.push({
      v: Math.round(o.max[i] * 10) / 10,
      f: param.colorScale(o.max[i]),
    });
    minRow.push({
      v: Math.round(o.min[i] * 10) / 10,
      f: param.colorScale(o.min[i]),
    });
    meanRow.push({ v: o.meantemp[i], f: param.colorScale(o.meantemp[i]) });
    hddRow.push({ v: addCommas(Math.round(o.hdd[i])), f: "none" });
    hdhRow.push({ v: addCommas(Math.round(o.hdh[i])), f: "none" });
    cddRow.push({ v: addCommas(Math.round(o.cdd[i])), f: "none" });
    cdhRow.push({ v: addCommas(Math.round(o.cdh[i])), f: "none" });
    blank.push({ v: "", f: "none" });
  }
  return [
    horRow,
    nRow,
    eRow,
    sRow,
    wRow,
    blank,
    maxRow,
    meanRow,
    minRow,
    blank,
    hddRow,
    hdhRow,
    cddRow,
    cdhRow,
  ];
};

const addCommas = (n) => {
  var s = n + "";
  s = s.split("");
  var s2 = "";
  var ls = s.length;
  for (var i = 1; i < ls; i++) {
    s2 = s[ls - i] + s2;
    if (i % 3 === 0) s2 = "," + s2;
  }
  s2 = s[0] + s2;
  return s2;
};

const highContrast = (col) => {
  //decide whether to use black or white text for higher contrast
  var c1 = contrastRatio(0, relativeLuminance(hexToRGB(col)));
  var c2 = contrastRatio(1, relativeLuminance(hexToRGB(col))) + 3;
  if (c2 > c1) return "white";
  else return "black";
};

const contrastRatio = (l1, l2) => {
  //numerator is the relative luminance of the lighter color
  //denominator is the constrast ratio of the darker color
  if (l1 > l2) return (l1 + 0.05) / (l2 + 0.05);
  if (l1 < l2) return (l2 + 0.05) / (l1 + 0.05);
};

const relativeLuminance = (rgb) => {
  //the relative brightness of any point in a colorspace, normalized to 0 for darkest black and 1 for lightest white
  //Note 1: For the sRGB colorspace, the relative luminance of a color is defined as L = 0.2126 * R + 0.7152 * G + 0.0722 * B where R, G and B are defined as:
  let red = rgb[0] / 255;
  let green = rgb[1] / 255;
  let blue = rgb[2] / 255;
  let r, g, b;
  if (red <= 0.03928) r = red / 12.92;
  else r = ((red + 0.055) / 1.055) ** 2.4;

  if (green <= 0.03928) g = green / 12.92;
  else g = ((green + 0.055) / 1.055) ** 2.4;

  if (blue <= 0.03928) b = blue / 12.92;
  else b = ((blue + 0.055) / 1.055) ** 2.4;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const hexToRGB = (h) => {
  h = h.split("");
  let rgb = [];
  var lh = h.length;
  for (var i = 1; i < lh; i += 2) {
    rgb.push(h2d(h[i]) * 16 + h2d(h[i + 1]));
  }
  return rgb;
};

const h2d = (n) => {
  if (n === "0") n = 0;
  if (n === "1") n = 1;
  if (n === "2") n = 2;
  if (n === "3") n = 3;
  if (n === "4") n = 4;
  if (n === "5") n = 5;
  if (n === "6") n = 6;
  if (n === "7") n = 7;
  if (n === "8") n = 8;
  if (n === "9") n = 9;
  if (n === "a") n = 10;
  if (n === "b") n = 11;
  if (n === "c") n = 12;
  if (n === "d") n = 13;
  if (n === "e") n = 14;
  if (n === "f") n = 15;
  return n;
};

export { calcValues, getRowLabels, getTableObj, highContrast };
