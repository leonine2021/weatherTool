import * as d3 from "d3";
import {
  radiationMode,
  extrapolateRadiation,
  incidentRadiation,
  solarPosition,
} from "./radiationCalcs";

import { psych } from "./psych";

let dataset = [];
let noteVar = [];

const prepareData = (temp, metricUnits) => {
  // console.log("fn: prepareData");

  if (temp) {
    //determine which vars are present
    noteVar = presentVariables(temp);
    // console.log("notevar:",noteVar)

    //lat, lon and gmt
    let location = getLocations(temp);

    if (isNaN(location.gmt)) {
      let g = prompt(
        "Please enter the correct GMT (East is +), ex. Germany = 1",
        "0"
      );
      if (g != null) location.gmt = g;
    }

    //for missing info add zeros
    //ex. in the case that no precipitation data is in the *109 file
    var temp1 = missingData(temp);
    // console.log("data",temp1)

    //populate hourly data set
    var radMode = radiationMode(noteVar);
    // console.log("radMode:",radMode)
    dataset = populateHourly(temp1, location, radMode);
    // console.log("data2",dataset)
    let dataset2 = dataset;
    if (!metricUnits) dataset2 = convertDataset(dataset2, metricUnits);

    //update noteVar for presence of facade radiation data
    if (radMode) {
      noteVar[0] = 1;
      noteVar[1] = 1;
      noteVar[2] = 1;

      let te = 37;
      while (te-- > 13) {
        noteVar[te] = 1;
      }
    }
    //populate monthly data set
    let monthlyData = populateMonthly(dataset2);

    //populate data parameters
    let dataParams = populateParams(dataset2, metricUnits);
    //set diffuse max radiation to same as beem diffuse radiation (so that they have the same scale)
    dataParams[1].max = dataParams[0].max;

    // console.log("params", dataParams)

    return {
      data: dataset2,
      monthlyData: monthlyData,
      dataParams: dataParams,
      presentVars: noteVar,
      location: location,
    };
  } else {
    alert("Weather data unavailable");
    return {
      data: [],
      monthlyData: [],
      dataParams: [],
      presentVars: [],
      location: { longitude: -99, latitude: -99, gmt: -99 },
    };
  }
};

// const convertData = (metricUnits) => {
//   let dataset2 = convertDataset(metricUnits);

//   //populate monthly data set
//   var monthlyData = populateMonthly(dataset2);

//   //populate data parameters
//   var dataParams = populateParams(dataset2, metricUnits);
//   //set diffuse max radiation to same as beem diffuse radiation (so that they have the same scale)
//   dataParams[1].max = dataParams[0].max;

//   return {
//     data: dataset2,
//     monthlyData: monthlyData,
//     dataParams: dataParams,
//     presentVars: noteVar,
//   };
// };

const turnData = (data, turn, metricUnits) => {
  let newDataset = turnDataset(data, turn);
  // console.log("newDataset", newDataset);

  //populate monthly data set

  var monthlyData = populateMonthly(newDataset);

  //populate data parameters
  var dataParams = populateParams(newDataset, metricUnits);
  //set diffuse max radiation to same as beem diffuse radiation (so that they have the same scale)
  dataParams[1].max = dataParams[0].max;

  return {
    data: newDataset,
    monthlyData: monthlyData,
    dataParams: dataParams,
    presentVars: noteVar,
  };
};

//--------------------------------------------------------------------------------------
// F U N C T I O N S
//--------------------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//determine which weather file variables are present in weather file
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const presentVariables = (temp) => {
  var nv = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0, //classic
    0,
    0,
    0,
    0, //rad Hor
    0,
    0,
    0,
    0, //rad North
    0,
    0,
    0,
    0, //rad South
    0,
    0,
    0,
    0, //rad East
    0,
    0,
    0,
    0, //rad West
    0,
    0,
    0,
    0, //rad All Facades
  ];

  //check for one hour data interval
  var interval = "";
  interval = temp.slice(
    temp.indexOf("<interval>"),
    temp.indexOf("<firsttime>")
  );
  if (parseInt(interval.match(/\d+/g)[0]) !== 1)
    alert("File is not in hourly time steps");

  //check for specific variables that are present in *109
  var dataVar = temp.slice(temp.indexOf("<firsttime>"), temp.indexOf("<data>"));
  dataVar = dataVar.split("<var>");
  var ldv = dataVar.length,
    varAr = [];
  for (var i = 1; i < ldv; i++) {
    varAr.push(dataVar[i].split("<col>")[0].replace(/ /g, ""));
  }
  var allVar = [
    "IBEAM_H",
    "IDIFF_H",
    "IGLOB_H",
    "TAMB",
    "WSPEED",
    "RHUM",
    "WDIR",
    "CCOVER",
    "PAMB",
    "PRECIP",
    "HRATIO",
  ];
  var lva = varAr.length,
    lav = allVar.length;
  for (let i = 0; i < lva; i++) {
    for (let j = 0; j < lav; j++) {
      if (varAr[i] === allVar[j]) {
        nv[j] = 1;
        if (i < lva - 1) {
          j = i;
          i = i + 1;
        }
      }
    }
  }
  //humidity ratio
  if (nv[3] === 1 && nv[5] === 1) nv[10] = 1;

  //wet bulb
  if (nv[3] === 1 && nv[5] === 1) nv[11] = 1;

  //dew point
  if (nv[3] === 1 && nv[5] === 1) nv[12] = 1;

  return nv;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get location from weather file
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getLocations = (temp) => {
  //find weather station elevation
  var longitude = 0,
    latitude = 0,
    gmt = 0;
  var ia = temp.indexOf("<longitude>");
  var ib = temp.indexOf("<latitude>");
  var ic = temp.indexOf("<gmt>");
  longitude = parseFloat(temp.slice(ia + 12, ia + 20)) * -1;
  latitude = parseFloat(temp.slice(ib + 12, ib + 20));

  let time = temp.slice(ic + 5, ic + 20).trim(),
    solarTime = false;
  if (time === "solar") {
    gmt = 0;
    solarTime = true;
  } else {
    gmt = parseFloat(temp.slice(ic + 5, ic + 20));
  }

  // console.log("longitude: ",longitude,"latitude: ",latitude,"gmt: ",gmt,"solarTime: ",solarTime);

  return {
    longitude: longitude,
    latitude: latitude,
    gmt: gmt,
    solarTime: solarTime,
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//for missing info add zeros
//ex. in the case that no precipitation data is in the *109 file
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const missingData = (temp) => {
  var count = (temp.match(/var/g) || []).length;
  var temp2 = parseData(7 + count, temp);

  //for missing info add zeros
  //ex. in the case that no precipitation data is in the *109 file
  var lt2 = temp2.length;
  var lnv = noteVar.length;
  var temp1 = [];
  for (var i = 0; i < lt2; i++) {
    var indV = 1;
    temp1.push([]);
    for (var j = 0; j < lnv; j++) {
      if (noteVar[j] === 1) {
        temp1[i].push(temp2[i][indV]);
        indV += 1;
      } else {
        temp1[i].push(0);
      }
    }
  }
  return temp1;
};

//split all into n-dimensional arrays, removing all header material
const parseData = (num, array) => {
  var array1 = array.split("\r\n"),
    array2 = [];
  for (var i = num; i < array1.length; i++) {
    var ar = array1[i].split(/\s/g);
    var ar2 = [];
    var c = true;
    for (var j = 0; j < ar.length; j++) {
      if (c && ar[j].length > 0) {
        ar2.push(parseInt(ar[j]));
        c = false;
      } else {
        if (ar[j].length > 0) ar2.push(parseFloat(ar[j]));
      }
    }
    array2.push(ar2);
  }
  // console.log("parseData",array2)
  return array2;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//populate hourly data set
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let logs = {
  log1: "beam,diffuse,global,beamX,diffuseX,globalX,hextra \r\n",
  log2: "azimuth,zenith,coszen,sinzen \r\n",
  log3: "Tot_Hor,Beam_Hor,Diff_Hor,Grnd_Hor,Tot_N,Beam_N,Diff_N,Grnd_N,Tot_S,Beam_S,Diff_S,Grnd_S,Tot_E,Beam_E,Diff_E,Grnd_E,Tot_W,Beam_W,Diff_W,Grnd_W \r\n",
  log4: "axslp,axazm,cosslp,sinslp,coszen,sinzen,solarAzimuth,costt,rb,surfBeam \r\n",
  log5: "diffuse,p1,p2,a1,b1,costt,cosslp,sinslp \r\n",
  log6: "solarPosition messages,rad mode, rad mode message, Hor messages, South messages, West messages, North messages, East messages \r\n",
};

// let lshd =
//   "sky vf, ground vf, beam vf, sky vf, ground vf, beam vf,sky vf, ground vf, beam vf, sky vf, ground vf, beam vf,sky vf, ground vf, beam vf, sky vf, ground vf, beam vf \r\n";

// let getLogs = () => {
//   download(logs.log1, "radiation.csv");
//   download(logs.log2, "solarPos.csv");
//   download(logs.log3, "surfaceRadiation.csv");
//   download(logs.log4, "log4.csv");
//   download(logs.log5, "log5.csv");
//   download(logs.log6, "notices.csv");
//   logs.log1 = "";
//   logs.log2 = "";
//   logs.log3 = "";
//   logs.log4 = "";
//   logs.log5 = "";
//   logs.log6 = "";
// };

// const getLogs2 = () => {
//   download(lshd, "viewFactor.csv");
//   lshd = "";
// };

// const download = (text, name) => {
//   var pom = document.createElement("a");
//   var file = new Blob([text]);
//   pom.setAttribute("href", URL.createObjectURL(file));
//   pom.setAttribute("download", name);
//   pom.style.display = "none";
//   document.body.appendChild(pom);
//   pom.click();
//   document.body.removeChild(pom);
// };

//data class constructor
class TimeStep {
  constructor(data, date, clock, pos) {
    this.data = data;
    this.date = date;
    this.clock = clock;
    this.solarPosition = pos;
  }
}

const populateHourly = (temp1, location, radMode) => {
  const timeStepData = (solarPos, temp) => {
    //get radiation mode and extrapolate missing radiation data
    var rad = extrapolateRadiation(noteVar, temp, solarPos, logs);
    logs = rad.logs;

    var hor = { total: 0, beam: 0, diffuse: 0, grndRef: 0 },
      s = { total: 0, beam: 0, diffuse: 0, grndRef: 0 },
      w = { total: 0, beam: 0, diffuse: 0, grndRef: 0 },
      n = { total: 0, beam: 0, diffuse: 0, grndRef: 0 },
      e = { total: 0, beam: 0, diffuse: 0, grndRef: 0 },
      av = { total: 0, beam: 0, diffuse: 0, grndRef: 0 };
    if (radMode) {
      //get radiation on surfaces
      hor = incidentRadiation(0, 0, solarPos, rad, logs);
      logs = hor.logs;
      s = incidentRadiation(90, 0, solarPos, rad, logs);
      logs = s.logs;
      w = incidentRadiation(90, 90, solarPos, rad, logs);
      logs = w.logs;
      n = incidentRadiation(90, 180, solarPos, rad, logs);
      logs = n.logs;
      e = incidentRadiation(90, 270, solarPos, rad, logs);
      logs = e.logs;
      av.total = s.total + w.total + n.total + e.total;
      av.beam = s.beam + w.beam + n.beam + e.beam;
      av.diffuse = s.diffuse + w.diffuse + n.diffuse + e.diffuse;
      av.grndRef = s.grndRef + w.grndRef + n.grndRef + e.grndRef;
    }
    logs.log3 += `${hor.total},${hor.beam},${hor.diffuse},${hor.grndRef},${n.total},${n.beam},${n.diffuse},${n.grndRef},${s.total},${s.beam},${s.diffuse},${s.grndRef},${e.total},${e.beam},${e.diffuse},${e.grndRef},${w.total},${w.beam},${w.diffuse},${w.grndRef} \r\n`;
    logs.log6 += " \r\n";

    // .109
    //[IBEAM_H W/m2,IDIFF_H W/m2,IGLOB_H W/m2,TAMB C,WSPEED m/s,RHUM %RH,WDIR wind direction (north=0;east=90),CCOVER,PAMB (sometimes),PRECIP (sometimes),...
    //calculate humidity ratio
    var humidityRatio;
    if (noteVar[10] === 1) {
      humidityRatio =
        Math.round(
          psych(101353, temp[3], temp[5] / 100, 3, 4, false) * 1000 * 10
        ) / 10;
    }

    //calculate wet bulb
    var wetBulb;
    if (noteVar[11] === 1) {
      wetBulb =
        Math.round(psych(101353, temp[3], temp[5] / 100, 3, 1, false) * 10) /
        10;
    }

    //calculate dew point
    var dewPoint;
    if (noteVar[12] === 1) {
      dewPoint =
        Math.round(psych(101353, temp[3], temp[5] / 100, 3, 2, false) * 10) /
        10;
    }

    //if total radiation is not available add diffuse and direct together
    var totalRad = temp[2];
    if (noteVar[2] === 0) {
      totalRad = temp[0] + temp[1];
    }
    logs.log1 += `${temp[0]},${temp[1]},${totalRad},${rad.beam},${rad.diffuse},${rad.global},${solarPos.hextra}\r\n`;

    return [
      rad.beam,
      rad.diffuse,
      rad.global,
      temp[3],
      temp[4],
      temp[5],
      temp[6],
      temp[7] * 100,
      temp[8],
      temp[9],
      humidityRatio,
      wetBulb,
      dewPoint,
      hor.total,
      hor.beam,
      hor.diffuse,
      hor.grndRef,
      n.total,
      n.beam,
      n.diffuse,
      n.grndRef,
      e.total,
      e.beam,
      e.diffuse,
      e.grndRef,
      s.total,
      s.beam,
      s.diffuse,
      s.grndRef,
      w.total,
      w.beam,
      w.diffuse,
      w.grndRef,
      av.total,
      av.beam,
      av.diffuse,
      av.grndRef,
    ];
  };

  //produce 8760 objects representing each hour and monthly objects
  let ds = [];
  let nd = 0;
  //   let l = temp1.length;
  for (let i = 0; i < 8760; i++) {
    //populate hourly timesteps
    if (i % 24 === 0) nd += 1;
    //get sun position
    let solarPos = solarPosition(i + 1, location, logs);
    //time step data
    let tsd = timeStepData(solarPos, temp1[i]);
    ds.push(new TimeStep(tsd, nd, i % 24, solarPos));
  }
  return ds;
};

const convertDataset = (dataset, metricUnits) => {
  let conv = [
    [1, 0],
    [0.092936, 0], // W/m2 -> W/sqft
    [1.8, 32], // C -> F
    [2.2369, 0], // m/s -> mph
    [0.000145038, 0], // Pa -> Psi
    [0.03936, 0], // mm -> inch
  ];
  let cf = [
    1, 1, 1, 2, 3, 0, 0, 0, 4, 5, 0, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ];
  let ds = [];
  let l = dataset.length;
  for (let i = 0; i < l; i++) {
    let dh = new TimeStep(
      dataset[i].data,
      dataset[i].date,
      dataset[i].clock,
      dataset[i].solarPosition
    );
    dh.data = dh.data.map((e, j) => ip(e, conv[cf[j]]), metricUnits);
    ds.push(dh);
  }
  return ds;
};

const ip = (val, conv, metricUnits) => {
  if (metricUnits) return Math.round(val * 100) / 100;
  else return Math.round((val * conv[0] + conv[1]) * 100) / 100;
};

const turnDataset = (dataset, t) => {
  // console.log("inside turn dataset", dataset);
  let ds = [];
  let turn = parseInt(t);
  let radMode = radiationMode(noteVar);
  let l = dataset.length;
  // console.log("l", l);
  for (let i = 0; i < l; i++) {
    let solarPos = dataset[i].solarPosition;
    let dh = new TimeStep(
      dataset[i].data,
      dataset[i].date,
      dataset[i].clock,
      solarPos
    );
    //calculate new radiation data
    let rad = extrapolateRadiation(noteVar, dh.data, solarPos, logs);
    logs = rad.logs;

    let hor = { total: 0, beam: 0, diffuse: 0, grndRef: 0 },
      s = { total: 0, beam: 0, diffuse: 0, grndRef: 0 },
      w = { total: 0, beam: 0, diffuse: 0, grndRef: 0 },
      n = { total: 0, beam: 0, diffuse: 0, grndRef: 0 },
      e = { total: 0, beam: 0, diffuse: 0, grndRef: 0 },
      av = { total: 0, beam: 0, diffuse: 0, grndRef: 0 };
    if (radMode) {
      //get radiation on surfaces
      hor = incidentRadiation(0, 0, solarPos, rad, logs);
      logs = hor.logs;
      s = incidentRadiation(90, 0 + turn, solarPos, rad, logs);
      logs = s.logs;
      w = incidentRadiation(90, 90 + turn, solarPos, rad, logs);
      logs = w.logs;
      n = incidentRadiation(90, 180 + turn, solarPos, rad, logs);
      logs = n.logs;
      e = incidentRadiation(90, 270 + turn, solarPos, rad, logs);
      logs = e.logs;
      av.total = s.total + w.total + n.total + e.total;
      av.beam = s.beam + w.beam + n.beam + e.beam;
      av.diffuse = s.diffuse + w.diffuse + n.diffuse + e.diffuse;
      av.grndRef = s.grndRed + w.grndRef + n.grndRef + e.grndRef;
    }
    dh.data = [
      dh.data[0],
      dh.data[1],
      dh.data[2],
      dh.data[3],
      dh.data[4],
      dh.data[5],
      dh.data[6],
      dh.data[7],
      dh.data[8],
      dh.data[9],
      dh.data[10],
      dh.data[11],
      dh.data[12],
      hor.total,
      hor.beam,
      hor.diffuse,
      hor.grndRef,
      n.total,
      n.beam,
      n.diffuse,
      n.grndRef,
      e.total,
      e.beam,
      e.diffuse,
      e.grndRef,
      s.total,
      s.beam,
      s.diffuse,
      s.grndRef,
      w.total,
      w.beam,
      w.diffuse,
      w.grndRef,
      av.total,
      av.beam,
      av.diffuse,
      av.grndRef,
    ];
    // if (i === 12) console.log(90 + turn);
    ds.push(dh);
  }
  return ds;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//populate daily data set
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function populateDaily(ds){
//     // var DailyTimeStep = function(max,min,avg){
//     // 	this.max = max;
//     // 	this.min = min;
//     // 	this.avg = avg;
//     // }

//     // let dailyData = [];

//     // let lp = ds.data[0].length;
//     // let l = ds.length;
//     // for(var j = 0; j < lp; j++){
//     // 	let series = [];
//     // 	let max = -1e99, min = 1e99, sum = 0;
//     // 	for(var i = 0; i < l; i++){
//     // 		var v = data[i].data[j];
//     // 		max = Math.max(v,max);
//     // 		min = Math.min(v,min);
//     // 		sum += v;
//     // 		if(data[i].clock === 23){
//     // 			series.push(new DailyTimeStep(max,min,sum/24));
//     // 			max = -1e99, min = 1e99, sum = 0;
//     // 		}
//     // 	}
//     // 	dailyData.push(series);
//     // }
//     // return dailyData;
// }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//populate monthly data set
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const populateMonthly = (ds) => {
  // console.log(ds);
  //data class constructor
  class MonthlyTimeStep {
    constructor(n, alldata) {
      this.data = alldata;
      this.month = n;
    }
  }

  let monthlyData = [];
  let monthEnd = [30, 58, 89, 119, 150, 180, 211, 242, 272, 303, 333, 364],
    l = ds[0].data.length,
    sum = primeArray(l, 0),
    sumn = 0,
    nd = 0,
    nm = 0;

  for (let i = 0; i < 8760; i++) {
    if (i % 24 === 0) nd += 1;
    let j;
    for (j = 0; j < l; j++) {
      sum[j] = sum[j] + parseFloat(ds[i].data[j]);
    }
    if (nd === monthEnd[nm]) {
      monthlyData.push(new MonthlyTimeStep(nm, averageAr(sum, sumn)));
      nm = nm + 1;
      sum = primeArray(l, 0);
      sumn = 0;
    }
    sumn = sumn + 1;
  }
  return monthlyData;
};

//this function will mistreat wind direction
const averageAr = (ar, n) => {
  let l = ar.length;
  for (let i = 0; i < l; i++) {
    ar[i] = ar[i] / n;
  }
  return ar;
};

//add set (n) amount of items (p) to an array
const primeArray = (n, p) => {
  let a = [];
  while (n--) a.push(p);
  return a;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//populate dataParams
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const populateParams = (ds, metricUnits) => {
  //data class constructor
  //produce one object for each type of data (ambient temp, relative humidity, etc.)
  class DataType {
    constructor() {
      this.setData = (ind) => {
        //significant digits
        var sigdigs = [
          0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ];
        this.sigdigs = sigdigs[ind];

        //units
        this.labels = dataLabels(ind, metricUnits);

        //minimum and maximum values
        this.min = d3.min(ds, function (d) {
          return d.data[ind];
        });
        this.max = d3.max(ds, function (d) {
          return d.data[ind];
        });
        if (ind === 6) {
          this.min = 0;
          this.max = 360;
        }
        this.bounds = [
          Math.round(this.min + ((this.max - this.min) * 1) / 5),
          Math.round(this.min + ((this.max - this.min) * 2) / 5),
          Math.round(this.min + ((this.max - this.min) * 3) / 5),
          Math.round(this.min + ((this.max - this.min) * 4) / 5),
        ];

        //colours
        const cList = [
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#4575b4", "#ffffdf", "#d73027", "#FFFFFF"],
          ["#99ccff", "#4575b4", "#0A122A", "#FFFFFF"],
          ["#EFF2FB", "#4575b4", "#0A122A", "#FFFFFF"],
          ["#30BCBF", "#FFD707", "#30BCBF", "#FFFFFF"],
          ["#EFF2FB", "#4575b4", "#0A122A", "#FFFFFF"],
          ["#EFF2FB", "#4575b4", "#0A122A", "#FFFFFF"],
          ["#EFF2FB", "#4575b4", "#0A122A", "#FFFFFF"],
          ["#EFF2FB", "#4575b4", "#0A122A", "#FFFFFF"],
          ["#4575b4", "#ffffdf", "#d73027", "#FFFFFF"],
          ["#4575b4", "#ffffdf", "#d73027", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"],
          ["#FFFF00", "#FF6600", "#800000", "#FFFFFF"], //total all vertical facades grnd ref radiation
        ];
        //Use alternate zero color
        let alt = false;
        if (ind >= 0 && ind <= 2) alt = true;
        if (ind >= 13) alt = true;
        this.altZBool = alt;

        //use relative or absolute colour scale
        let relCol = false;
        if (ind === 3) relCol = true;
        if (ind === 11 || ind === 12) relCol = true;

        //colour scale
        let colorDomain;
        let colorRange;
        if (relCol) {
          colorRange = [
            "#0F0445",
            "#0F0471",
            "#2068B5",
            "#59ADD6",
            "#EBEEEF",
            "#FFC059",
            "#D60000",
            "#5F1300",
          ];
          if (metricUnits) colorDomain = [-90, -60, -30, -5, 0, 15, 30, 60];
          else
            colorDomain = [
              ctof(-90),
              ctof(-60),
              ctof(-30),
              ctof(-5),
              ctof(0),
              ctof(15),
              ctof(30),
              ctof(60),
            ];
        } else {
          colorRange = [cList[ind][0], cList[ind][1], cList[ind][2]];
          colorDomain = [this.min, (this.max + this.min) / 2, this.max];
        }
        let colorScale = d3.scaleLinear().domain(colorDomain).range(colorRange);
        this.colorScale = colorScale;

        const discreteColors = (min, max, scale, bins) => {
          let cArray = [];
          for (let i = 0; i < bins; i++) {
            cArray.push(scale(min + ((max - min) * i) / bins));
          }
          return cArray;
        };

        //discrete colors display
        this.colorScaleDiscrete = d3
          .scaleOrdinal()
          // .threshold()
          .domain(this.bounds)
          .range(discreteColors(this.min, this.max, this.colorScale, 5));
        // .range([0, 1, 2, 3, 4]);
        this.legendColors = discreteColors(
          this.min,
          this.max,
          this.colorScale,
          10
        );

        this.genGradient = (currentMin, currentMax) => {
          let bins = [];
          let ldom = colorDomain.length;
          for (let i = 1; i < ldom; i++) {
            if (currentMax === colorDomain[i]) {
              bins.push({
                val: currentMax,
                offset: "0%",
                stopcolor: colorScale(currentMax),
              });
            }
            if (
              currentMax > colorDomain[i - 1] &&
              currentMax < colorDomain[i]
            ) {
              bins.push({
                val: currentMax,
                offset: "0%",
                stopcolor: colorScale(currentMax),
              });
            }
          }
          for (let i = ldom - 1; i >= 0; i--) {
            if (currentMin < colorDomain[i] && currentMax > colorDomain[i]) {
              let offset = Math.round(
                100 -
                  ((colorDomain[i] - currentMin) / (currentMax - currentMin)) *
                    100
              );
              let so = offset + "%";
              bins.push({
                val: colorDomain[i],
                offset: so,
                stopcolor: colorScale(colorDomain[i]),
              });
            }
          }
          for (let i = 0; i < ldom - 1; i++) {
            if (currentMin === colorDomain[i]) {
              bins.push({
                val: currentMin,
                offset: "100%",
                stopcolor: colorScale(currentMin),
              });
            }
            if (
              currentMin > colorDomain[i] &&
              currentMin < colorDomain[i + 1]
            ) {
              bins.push({
                val: currentMin,
                offset: "100%",
                stopcolor: colorScale(currentMin),
              });
            }
          }
          return bins;
        };
      };
    }
  }

  //get all dataParams
  var dataParams = [];
  var l = noteVar.length;
  for (var i = 0; i < l; i++) {
    var d = new DataType();
    d.setData(i);
    dataParams.push(d);
  }
  return dataParams;
};

//data labels
function dataLabels(i, metricUnits) {
  const unitsList = [
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["C", "F"],
    ["m/s", "mph"],
    ["%", "%"],
    ["degrees", "degrees"],
    ["%", "%"],
    ["Pa", "Psi"],
    ["mm", "inch"],
    ["g/kg", "lb/klb"],
    ["C", "F"],
    ["C", "F"],
    //radiation
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
    ["W/m2", "W/ft2"],
  ];
  const units = unitsList[i][metricUnits ? 0 : 1];

  const capsList = [
    "Horizontal beam radiation",
    "Horizontal diffuse radiation",
    "Total horizontal radiation",
    "Temperature",
    "Wind speed",
    "Relative humidity",
    "Wind direction",
    "Cloud cover",
    "Pressure",
    "Precipitation",
    "Humidity ratio",
    "Wet bulb temperature",
    "Dew point temperature",
    //radiation
    "Total horizontal facade radiation",
    "Horizontal facade beam radiation",
    "Horizontal facade diffuse radiation",
    "Horizontal facade grnd ref radiation",
    "Total north facade radiation",
    "North facade beam radiation",
    "North facade diffuse radiation",
    "North facade grnd ref radiation",
    "Total east facade radiation",
    "East facade beam radiation",
    "East facade diffuse radiation",
    "East facade grnd ref radiation",
    "Total south facade radiation",
    "South facade beam radiation",
    "South facade diffuse radiation",
    "South facade grnd ref radiation",
    "Total west facade radiation",
    "West facade beam radiation",
    "West facade diffuse radiation",
    "West facade grnd ref radiation",
    "Total all facades radiation",
    "All facades beam radiation",
    "All facades diffuse radiation",
    "All facades grnd ref radiation",
  ];

  const noncapsList = [
    "horizontal beam radiation",
    "horizontal diffuse radiation",
    "total horizontal radiation",
    "temperature",
    "wind speed",
    "relative humidity",
    "wind direction",
    "cloud cover",
    "pressure",
    "precipitation",
    "humidity ratio",
    "wet bulb temperature",
    "dew point temperature",
    //radiation
    "total horizontal facade radiation",
    "horizontal facade beam radiation",
    "horizontal facade diffuse radiation",
    "horizontal facade grnd ref radiation",
    "total north facade radiation",
    "north facade beam radiation",
    "north facade diffuse radiation",
    "north facade grnd ref radiation",
    "total east facade radiation",
    "east facade beam radiation",
    "east facade diffuse radiation",
    "east facade grnd ref radiation",
    "total south facade radiation",
    "south facade beam radiation",
    "south facade diffuse radiation",
    "south facade grnd ref radiation",
    "total west facade radiation",
    "west facade beam radiation",
    "west facade diffuse radiation",
    "west facade grnd ref radiation",
    "total all facades radiation",
    "all facades beam radiation",
    "all facades diffuse radiation",
    "all facades grnd ref radiation",
  ];

  let labels = {
    units: units,
    capsUnits: `${capsList[i]} [${units}]`,
    caps: capsList[i],
    noncapsUnits: `${noncapsList[i]} [${units}]`,
    noncaps: noncapsList[i],
  };
  return labels;
}

//celsius to fahrenheit
const ctof = (n) => {
  return n * 1.8 + 32;
};

export { prepareData, turnData };
