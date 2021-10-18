////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// calculate solar position
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// time = hours [1,8760]
// longitude
// latitude
// gmt = num hours time change from GMT (from weather file)
const solarPosition = (time, location, logs) => {
  var latitude = location.latitude;
  var longitude = location.longitude;
  var gmt = location.gmt;

  //other
  var solConst = 4871;

  // location
  var shift = -15 * gmt + longitude;
  if (latitude < -90 || latitude > 90)
    logs.log6 += "Illegal latitude specified-- ";
  if (shift < -360 || shift > 360)
    logs.log6 += "Illegal shift value specified-- ";
  var alat = nonZero(rad(latitude));
  var sinlat = Math.sin(alat);
  var coslat = Math.cos(alat);
  var tanlat = sinlat / coslat;

  // declination
  var decl = getDeclination(time);
  var sindec = Math.sin(decl);
  var cosdec = Math.cos(decl);
  var tandec = sindec / cosdec;

  var cc = coslat * cosdec;
  var ss = sinlat * sindec;
  var tt = bounded(-tandec * tanlat, [-1, 1]);
  var ws = Math.acos(tt);

  //Find hour angles for start and end of timestep. The portion of the timestep during which the sun is down is ignored
  var w1 = hourAngle(time, -1, shift);
  var w2 = hourAngle(time, 0, shift);
  if (w2 < w1) w2 += 2 * Math.PI; //Correct the angles for the hour straddling midnight
  if (w2 < w1) logs.log6 += "timestep inconsistency-- ";

  //No point in continuing if there is no sun
  if (w2 > -ws && w1 < ws) {
    w1 = Math.max(w1, -ws);
    w2 = Math.min(w2, ws);
    var w = (w1 + w2) / 2;

    // Set the horizontal extraterrestrial radiation
    var hx = cc * (Math.sin(w2) - Math.sin(w1)) + ss * (w2 - w1);
    var hextra = (solConst * getECC(time) * hx) / (w2 - w1);

    // Find the position of the sun in the sky
    var coshr = Math.cos(w);
    var coszen = bounded(nonZero(cc * coshr + ss), [0.009, 1]); //0.009 = a zenith angle of 89.5
    var zenith = Math.acos(coszen);
    var sinzen = Math.sin(zenith);

    if (Math.abs(sinzen) >= 1e-6) {
      var sinhr = Math.sin(w);
      var sinazm = bounded((cosdec * sinhr) / sinzen, [-1, 1]);
      var sazm = Math.asin(sinazm);

      // Determine if the absolute value of the solar azimuth is greater than 90 degrees by comparing the hour
      // angle with the hour angle at which the solar azimuth is +/- degrees
      var cwew = bounded(tandec / tanlat, [-1, 1]);
      var wew = Math.PI;
      if (alat * (decl - alat) <= 0) wew = Math.acos(cwew);
      if ((Math.abs(w) - Math.abs(wew)) * alat * (decl - alat) <= 0)
        sazm = sign(Math.PI, sazm) - sazm;

      // Don't allow the absolute value of the solar azimuth to be greater than 180 degrees
      if (Math.abs(sazm) > Math.pi) sazm = sazm - sign(2 * Math.PI, sazm);

      logs.log2 += `${(sazm * 180) / Math.PI},${
        (zenith * 180) / Math.PI
      },${coszen},${sinzen} \r\n`;
      logs.log6 += ",";

      return {
        hextra: hextra, //horizontal extraterrestrial radiation
        solarZenith: zenith, //solar zenith, radians
        solarAzimuth: sazm, //solar azimuth, radians
        cosZenith: coszen, //cosine of the solar zenith angle
        sinZenith: sinzen, //sine of the solar zenith angle
        logs: logs,
      };
    }
  }

  logs.log2 += `90,-90,0,1 \r\n`;
  logs.log6 += ",";

  return {
    hextra: 0, //horizontal extraterrestrial radiation
    solarZenith: Math.PI / 2, //solar zenith, radians
    solarAzimuth: -Math.PI / 2, //solar azimuth, radians
    cosZenith: 0, //cosine of the solar zenith angle
    sinZenith: 1, //cosine of the solar zenith angle
    logs: logs,
  };
};

//convert to Radians
const rad = (v) => {
  return (v * Math.PI) / 180;
};

//generalized beta
const gBeta = (day) => {
  return rad((day * 360) / 365);
};

// new algorithm: declination from Spencer (1971) as cited by Iqbal (1983) as cited by Beckman in Solar Engineering of Thermal Processes (2006)
// returns units in radians
const getDeclination = (time) => {
  var day = Math.floor(time / 24) + 1; //bugfix:05.07.2012
  var beta = gBeta(day - 1);
  // new algorithm:05.07.2012
  return (
    0.006918 -
    0.399912 * Math.cos(beta) +
    0.070257 * Math.sin(beta) -
    0.006758 * Math.cos(2 * beta) +
    0.000907 * Math.sin(2 * beta) -
    0.002697 * Math.cos(3 * beta) +
    0.00148 * Math.sin(3 * beta)
  );
};

// new algorithm: equation of time from Solar Engineering of Thermal Processes (2006)
// returns units in radians
const getEOT = (time) => {
  var day = Math.floor(time / 24) + 1; //bugfix:05.07.2012
  var beta = gBeta(day - 1);
  //!new eot algorithm:05.07.2012
  return (
    (229.2 / 60) *
    (0.000075 +
      0.001868 * Math.cos(beta) -
      0.032077 * Math.sin(beta) -
      0.014615 * Math.cos(2 * beta) -
      0.04089 * Math.sin(2 * beta))
  );
};

const getECC = (time) => {
  var day = Math.floor(time / 24) + 1; //bugfix:05.07.2012
  return 1 + 0.033 * Math.cos(gBeta(day));
};

//hour angle
const hourAngle = (time, offset, shift) => {
  var et = getEOT(time);
  return rad((((time + offset + et) % 24) - 12) * 15 + shift);
};

//non zero
const nonZero = (v) => {
  return sign(Math.max(Math.abs(v), 1e-6), v);
};

const bounded = (v, b) => {
  if (v >= b[1]) return b[1];
  if (v <= b[0]) return b[0];
  return v;
};

// same as FORTRAN SIGN() and DSIGN()
// returns value of a with sign of b
const sign = (a, b) => {
  if (b !== 0) return Math.abs(a) * (b / Math.abs(b));
  else return Math.abs(a);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// calculate incident solar radiation
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// what radiation data is available
const radiationMode = (noteVar) => {
  var beamBool = noteVar[0],
    diffBool = noteVar[1],
    globalBool = noteVar[2],
    tambBool = noteVar[3],
    rhBool = noteVar[5];
  var radMode = false;
  if (!globalBool) {
    //no data can be calculated
    if (!diffBool || !beamBool) {
      //do nothing
    }
    //Ib and Id  are inputs
    if (diffBool) if (beamBool) radMode = true;
  }
  // Iglob: reduced Reindl or full Reindl
  if (globalBool) {
    if (!diffBool && !beamBool) {
      if (tambBool && rhBool) radMode = true;
      else radMode = true;
    }
    //no data can be calculated
    if (!diffBool && beamBool) {
      //do nothing
    }
    // I  and Id  are inputs
    if (diffBool && !beamBool) radMode = true;
    // I, Id  and Ib  are inputs; kick off Ib
    if (diffBool && beamBool) radMode = true;
  }
  //return updated noteVar;
  return radMode;
};

// calculate missing radiation data
//order of temp values => ["IBEAM_H","IDIFF_H","IGLOB_H","TAMB","WSPEED","RHUM","WDIR","CCOVER","PAMB","PRECIP","HRATIO"]
const extrapolateRadiation = (noteVar, temp, solarPos, logs) => {
  var rad = { beam: temp[0], diffuse: temp[1], global: temp[2], logs: logs };
  var beamBool = noteVar[0],
    diffBool = noteVar[1],
    globalBool = noteVar[2],
    tambBool = noteVar[3],
    rhBool = noteVar[5];
  if (!globalBool) {
    //no data can be calculated
    if (!diffBool || !beamBool) logs.log6 += "rad mode: insufficient data,";
    //Ib and Id  are inputs
    if (diffBool && beamBool)
      rad = beamDiffuse(solarPos, rad.beam, rad.diffuse, logs);
  }
  // Iglob: reduced Reindl or full Reindl
  if (globalBool) {
    if (!diffBool && !beamBool) {
      if (tambBool && rhBool)
        rad = globalAndTemp(
          solarPos.hextra,
          solarPos.cosZenith,
          rad.global,
          temp[3],
          temp[5],
          logs
        );
      else
        rad = globalOnly(solarPos.hextra, solarPos.cosZenith, rad.global, logs);
    }
    //no data can be calculated
    if (!diffBool && beamBool) logs.log6 += "rad mode: insufficient data,";
    // I  and Id  are inputs
    if (diffBool && !beamBool)
      rad = globalDiffuse(solarPos.hextra, rad.diffuse, rad.global, logs);
    // I, Id  and Ib  are inputs; kick off Ib
    if (diffBool && beamBool)
      rad = globalDiffuse(solarPos.hextra, rad.diffuse, rad.global, logs);
  }

  let diffuseratio = 0;
  let beamratio = 0;
  // Check for beam radiation greater than extraterrestrial radiation
  if (rad.beam > solarPos.hextra) {
    diffuseratio = bounded(rad.diffuse / rad.global, [1e-6, 1]);
    beamratio = bounded(rad.beam / rad.global, [1e-6, 1]);
    rad.beam = solarPos.hextra;
    rad.global = rad.beam / beamratio;
    rad.diffuse = rad.global * diffuseratio;
    logs.log6 +=
      "Horizontal beam calculation greater than extraterrestrial radiation on the horizontal surface";
  }
  logs.log6 += ",";
  rad.logs = logs;
  return rad;
};

//Use Reindl correlation to estimate horizontal diffuse
//Use horizontal extraterrestrial profile to set total radiation on a horizontal plane
const globalOnly = (hextra, coszen, global, logs) => {
  logs.log6 += "rad mode: global only,";

  if (global > hextra) {
    global = hextra;
    logs.log6 +=
      "Total horizontal calculation greater than extraterrestrial radiation on the horizontal surface-- ";
  }

  var xkt = global / hextra,
    dfract;
  if (xkt <= 0.3) dfract = Math.min(1.02 - 0.254 * xkt + 0.0123 * coszen, 1);
  if (xkt > 0.3 && xkt < 0.78)
    dfract = Math.max(Math.min(1.4 - 1.749 * xkt + 0.177 * coszen, 0.97), 0.1);
  if (xkt >= 0.78)
    dfract = Math.max(Math.min(0.486 * xkt - 0.182 * coszen, 0.97), 0.1);

  var hd = dfract * global,
    hb = global - hd;

  return { global: global, beam: hb, diffuse: hd, logs: logs };
};

// Use Reindl full correlation (Ta in C, rel humidity as int [0,100]) note that Ta and rel humidity are not interpolated
// Use horizontal extraterrestrial profile to set total radiation on a horizontal plane
const globalAndTemp = (hextra, coszen, global, tamb, rh, logs) => {
  logs.log6 += "rad mode: global and temp,";

  if (global > hextra) {
    global = hextra;
    logs.log6 +=
      "Total horizontal calculation greater than extraterrestrial radiation on the horizontal surface-- ";
  }
  var xkt = Math.min(1.1, global / hextra),
    dfract;
  if (xkt <= 0.3) {
    dfract = 1 - 0.232 * xkt + 0.0239 * coszen - 0.000682 * tamb + 0.0195 * rh;
    if (dfract > 1) dfract = 1;
  }
  if (xkt > 0.3 && xkt < 0.78) {
    dfract = 1.329 - 1.716 * xkt + 0.267 * coszen - 0.00357 * tamb + 0.106 * rh;
    if (dfract > 0.97) dfract = 0.97;
    if (dfract < 0.1) dfract = 0.1;
  }
  if (xkt <= 0.78) {
    dfract = 0.426 * xkt - 0.256 * coszen + 0.00349 * tamb + 0.0734 * rh;
    if (dfract > 0.97) dfract = 0.97;
    if (dfract < 0.1) dfract = 0.1;
  }

  var hd = dfract * global,
    hb = global - hd;

  return { global: global, beam: hb, diffuse: hd, logs: logs };
};

// Inputs are beam on horizontal and diffuse on horizontal
const beamDiffuse = (hextra, beam, diff, logs) => {
  logs.log6 += "rad mode: beam and diffuse,";

  // Use horizontal extraterrestrial profile to set beam radiation on a horizontal plane
  if (beam > hextra) {
    beam = hextra;
    logs.log6 +=
      "Horizontal beam calculation greater than extraterrestrial radiation on the horizontal surface-- ";
  }

  // Use horizontal extraterrestrial profile to set diffuse radiation on a horizontal plane
  if (diff > hextra) {
    diff = hextra;
    logs.log6 +=
      "Horizontal diffuse calculation greater than extraterrestrial radiation on the horizontal surface-- ";
  }

  var hhor = beam + diff;
  if (hhor > hextra) {
    diff = hextra * bounded(diff / hhor, [1e-6, 1]);
    beam = hextra * bounded(beam / hhor, [1e-6, 1]);
    hhor = hextra;
    logs.log6 +=
      "Total horizontal calculation greater than extraterrestrial radiation on the horizontal surface due to sum of beam and diffuse, ratios used to set beam and diffuse-- ";
  }

  return { global: hhor, beam: beam, diffuse: diff, logs: logs };
};

// Inputs are total (horizontal) and diffuse (horizontal)
const globalDiffuse = (hextra, diff, global, logs) => {
  logs.log6 += "rad mode: diffuse and global";

  if (global > hextra) {
    global = hextra;
    logs.log6 +=
      "Total horizontal  calculation greater than extraterrestrial radiation on the horizontal surface-- ";
  }

  if (diff > hextra) {
    diff = hextra;
    logs.log6 +=
      "Horizontal diffuse calculation greater than extraterrestrial radiation on the horizontal surface-- ";
  }

  var hb = global - diff;
  if (hb < 0) {
    hb = 0;
    diff = global;
    logs.log6 +=
      "Calculated value of beam radiation on the horizontal is less than 0, set horizontal diffuse to total horizontal and horizontal beam to zero-- ";
  }

  return { global: global, beam: hb, diffuse: diff, logs: logs };
};

// slope = slope of surface [degrees]
// azimuth = azimuth of surface [degrees]
// radiation = radiation data object
const incidentRadiation = (slope, azimuth, solarPos, radiation, logs) => {
  var solConst = 4871;

  // Calculate beam radiation, total radiation and incidence angle for each slope.
  var axslp = rad(slope);
  var axazm = rad(azimuth);
  //   var sinasl = Math.sin(axslp);
  //   var cosasl = nonZero(Math.cos(axslp));
  //   var tanasl = sinasl / cosasl;

  // Keep the difference of solar azimuth and axis azimuth between 180 and -180 degrees
  var alf = nonZero(solarPos.solarAzimuth - axazm);
  if (Math.abs(alf) > Math.PI) alf = alf - sign(2 * Math.PI, alf);
  //   var costtp = nonZero(
  //     cosasl * solarPos.cosZenith + sinasl * solarPos.sinZenith * Math.cos(alf)
  //   );

  var sinslp = Math.sin(axslp);
  var cosslp = Math.cos(axslp);
  var costt = Math.min(
    cosslp * solarPos.cosZenith +
      sinslp * solarPos.sinZenith * Math.cos(solarPos.solarAzimuth - axazm),
    1
  );

  // Beam and ground reflected radiation independent of tilted surface model
  var rb = Math.max(costt, 0) / Math.max(solarPos.cosZenith, 0.01745);
  var surfBeam = radiation.beam * rb;
  var grndRef = 0.2;
  var surfGrndRef = radiation.global * grndRef * 0.5 * (1 - cosslp);

  logs.log4 += `${axslp},${axazm},${cosslp},${sinslp},${solarPos.cosZenith},${solarPos.sinZenith},${solarPos.solarAzimuth},${costt},${rb},${surfBeam} \r\n`;

  var surfDiff, surfDiffCirc, surfDiffBright, surfDiffIso;
  if (radiation.beam > 0) {
    logs.log6 += "beam > 0 -- ";
    // Perez point source model (Sandia report Oct. 1988)
    var p1 = Math.max(
      param(
        0,
        radiation.beam,
        radiation.diffuse,
        solarPos.solarZenith,
        solarPos.cosZenith,
        solarPos.hextra
      ),
      0
    );
    var p2 = param(
      1,
      radiation.beam,
      radiation.diffuse,
      solarPos.solarZenith,
      solarPos.cosZenith,
      solarPos.hextra
    );
    var a1 = Math.max(costt, 0);
    var b1 = Math.max(Math.cos(rad(85)), solarPos.cosZenith);

    surfDiff =
      radiation.diffuse *
      (0.5 * (1 - p1) * (1 + cosslp) + (p1 * a1) / b1 + p2 * sinslp);
    logs.log5 += `${radiation.diffuse},${p1},${p2},${a1},${b1},${costt},${cosslp},${sinslp},EOL \r\n`;
    surfDiffCirc = radiation.diffuse * ((p1 * a1) / b1);
    surfDiffBright = radiation.diffuse * p2 * sinslp;
    surfDiffIso = surfDiff - surfDiffCirc - surfDiffBright;
  } else {
    logs.log6 += "beam < 0 -- ";
    // Diffuse assumed isotropic if beam not positive
    surfDiff = radiation.diffuse * 0.5 * (1 + cosslp);
    surfDiffCirc = 0;
    surfDiffBright = 0;
    surfDiffIso = surfDiff - surfDiffCirc - surfDiffBright;
  }
  if (surfDiff < 0) {
    logs.log6 += "diffuse < 0 -- ";
    surfDiff = 0;
    surfDiffCirc = 0;
    surfDiffBright = 0;
    surfDiffIso = surfDiff - surfDiffCirc - surfDiffBright;
  }

  // Output total (flat surface) radiation, beam radiation, diffuse radiation, incidence angle, and slope.
  var surfTotal = surfBeam + surfDiff + surfGrndRef;
  if (surfTotal > solConst) {
    surfBeam = (surfBeam * solConst) / surfTotal;
    surfDiff = (surfDiff * solConst) / surfTotal;
    surfGrndRef = (surfGrndRef * solConst) / surfTotal;
    logs.log6 +=
      "Horizontal beam calculation greater than extraterrestrial radiation on the horizontal surface-- ";
  }
  logs.log6 += ",";

  //results
  return {
    total: surfTotal,
    beam: surfBeam,
    diffuse: surfDiff,
    grndRef: surfGrndRef,
    diffIso: surfDiffIso,
    diffCirc: surfDiffCirc,
    diffBright: surfDiffBright,
    logs: logs,
  };
};

const bin = (eps) => {
  if (eps > 0 && eps <= 1.065) return 0;
  if (eps > 1.065 && eps <= 1.23) return 1;
  if (eps > 1.23 && eps <= 1.5) return 2;
  if (eps > 1.5 && eps <= 1.95) return 3;
  if (eps > 1.95 && eps <= 2.8) return 4;
  if (eps > 2.8 && eps <= 4.5) return 5;
  if (eps > 4.5 && eps <= 6.2) return 6;
  if (eps > 6.2) return 7;
};

// Data for the Perez model reported in Sandia report, 1988
const param = (rank, hb, hd, zenith, coszen, hextra) => {
  var p11 = [-0.196, 0.236, 0.454, 0.866, 1.026, 0.978, 0.748, 0.318];
  var p12 = [1.084, 0.519, 0.321, -0.381, -0.711, -0.986, -0.913, -0.757];
  var p13 = [-0.006, -0.18, -0.255, -0.375, -0.426, -0.35, -0.236, 0.103];
  var p21 = [-0.114, -0.011, 0.072, 0.203, 0.273, 0.28, 0.173, 0.062];
  var p22 = [0.18, 0.02, -0.098, -0.403, -0.602, -0.915, -1.045, -1.698];
  var p23 = [-0.019, -0.038, -0.046, -0.049, -0.061, -0.024, 0.065, 0.236];
  var pa = [
    [p11, p12, p13],
    [p21, p22, p23],
  ];

  var nbin;
  if (hd < 1e-6) {
    nbin = 7;
  } else {
    var hdn = hb / coszen;
    var epsilon = (hd + hdn) / hd;
    var eps = (epsilon + 1.041 * zenith ** 3) / (1 + 1.041 * zenith ** 3);
    nbin = bin(eps);
  }

  return (
    pa[rank][0][nbin] +
    (pa[rank][1][nbin] * hd) / hextra +
    pa[rank][2][nbin] * zenith
  );
};

export {
  radiationMode,
  extrapolateRadiation,
  incidentRadiation,
  solarPosition,
};
