/*'The function and subfunctions defined herein come with no warranty or certification of fitness for any purpose

'Do not use these functions for conditions outside boundaries defined by their original sources.
'Subfunctions use equations from the following sources:
    'ASHRAE Fundamentals, 2005, SI Edition Chapter 6


'The function will calculate various properties of moist air. Properties calculated include Wet Bulb, Dew Point, Relative Humidity, Humidity Ratio, Vapor Pressure, Degree of Saturation, enthalpy, specific volume of dry air, and moist air density.
'The function requires input of: barometric pressure, temperature, and one other parameter.  This third parameter can be Wet Bulb, Dew Point, RH, or Humidity Ratio.
'Also included are STD_Press(Elevation) and STD_Temp(Elevation)

'Psych was originally made for the WCEC to have simular syntax to a troublesome plugin we were already using.
'Psych will calculate properties of most air. It can calculate
'Wet Bulb, Dew Point, RH, Humidity Ratio, Vapor Pressure, degree of saturation, enthalpy, or specific volume of dry air, or moist air density
'based up Pressure, Temperature, and one other parameter.  This other parameter can be Wet Bulb, Dew Point, RH, Humidity Ratio, or Enthalpy.

'psych(P,Tdb,InV,InNum,OutNum, SIq)

'Where
'P is the barometric pressure in PSI or Pa.
'Tdb is the dry bulb in F or C
'InV is the value of the input parameter 
'InNum is the number that corrisponds to your choice of InVs parameter (1 through 4 or 7 respectivly)
'OutNum is the value requested.  It should be an integer between 1 and 10 excluding 8.  See below
'SIq is the optional unit selector.  true is IP, false is SI.  true/IP is default if ommitted.

'The Numbers for InNum and OutNum are

'1 Web Bulb Temp            F or C                              Valid for Input
'2 Dew point                F or C                              Valid for input
'3 RH                       between 0 and 1                     Valid for input
'4 Humidity Ratio           Mass Water/ Mass Dry Air            Valid for input
'5 Water Vapor Pressure     PSI or Pa
'6 Degree of Saturation     between 0 and 1
'7 Enthalpy                 BTU/lb dry air or kJ/kg dry air     Valid for input
    'Warning 0 state for IP is ~0F, 0% RH ,and  1 ATM, 0 state for SI is 0C, 0%RH and 1 ATM
'8 NOT VALID, Should be entropy
'9 Specific Volume          ft3/lbm or m3/kg dry air
'10 Moist Air Density       lb/ft3 or m3/kg*/

function psych(p, tdb, inv, innum, outnum, si_bool) {
  if (si_bool === undefined) si_bool = true;

  var twb, dew, rh, w, h, out;

  if (!si_bool) {
    //If metric
    p = p / 1000; //'Turns Pa to kPA
    if (innum === 1) twb = inv;
    if (innum === 2) dew = inv;
    if (innum === 3) rh = inv;
    if (innum === 4) w = inv;
    if (innum === 7) h = inv;
  } else {
    //'This section turns US Customary Units to SI units
    tdb = (tdb - 32) / 1.8;
    p = (p * 4.4482216152605) / Math.pow(0.0254, 2) / 1000; //'PSI to kPa  Conversion factor exact
    if (innum === 1) twb = (inv - 32) / 1.8; //'F to C
    if (innum === 2) dew = (inv - 32) / 1.8; //'F to C
    if (innum === 3) rh = inv; //'no need to change
    if (innum === 4) w = inv; //'no need to change
    if (innum === 7) h = (inv * 1.055056) / 0.45359237 - 17.884444444; //' 1.055056 kJ/(ISO_BTU)  .45359237 kg/lb   17.884444 kJ/kg 0 pt difference [Dry air at 0C and  dry air at 0F are both 0 enthalpy in their respective units]
  }

  if (outnum === 3 || outnum === 1) {
    //'Find RH
    if (innum === 1) rh = rel_hum(tdb, twb, p); //'given Twb
    if (innum === 2) rh = sat_press(dew) / sat_press(tdb); //'given Dew
    if (innum === 4) rh = part_press(p, w) / sat_press(tdb); //'given W
    if (innum === 7) {
      w = (1.006 * tdb - h) / -(2501 + 1.86 * tdb); //' Algebra from 2005 ASHRAE Handbook - Fundamentals - SI P6.9 eqn 32
      rh = part_press(p, w) / sat_press(tdb);
    }
  } else {
    //'find W
    if (innum === 1) w = hum_rat(tdb, twb, p); //'Given Twb
    if (innum === 2) w = (0.621945 * sat_press(dew)) / (p - sat_press(dew)); //'Given Dew - Equation taken from eq 20 of 2009 Fundemental chapter 1
    if (innum === 3) w = hum_rat2(tdb, rh, p); //'Given RH
    if (innum === 7) w = (1.006 * tdb - h) / -(2501 + 1.86 * tdb); //'Given h - Algebra from 2005 ASHRAE Handbook - Fundamentals - SI P6.9 eqn 32
  }

  //'P, Tdb, and W are now availible
  if (outnum === 1) out = wet_bulb(tdb, rh, p); //'requesting Twb
  if (outnum === 2) out = dew_point(p, w); //'requesting Dew
  if (outnum === 3) out = rh; //'Request RH
  if (outnum === 4) out = w; //'Request W
  if (outnum === 5) out = part_press(p, w) * 1000; //'Request Pw
  if (outnum === 6) out = w / hum_rat2(tdb, 1, p); //'Request deg of sat
  if (outnum === 7) out = enthalpy_air_h2o(tdb, w); //'Request enthalpy
  if (outnum === 8) alert("No enthalpy equation");
  if (outnum === 9) out = 1 / dry_air_density(p, tdb, w); //'Request specific volume
  if (outnum === 10) out = dry_air_density(p, tdb, w) * (1 + w); //'Request density

  //'Convert to IP
  if (si_bool) {
    if (outnum === 1 || outnum === 2) out = 1.8 * out + 32; //'Temperature
    //'OutNum 3 and 4 (RH and W) are unitless
    if (outnum === 5) out = (out * Math.pow(0.0254, 2)) / 4.448230531; //'Pressure
    if (outnum === 7) out = ((out + 17.88444444444) * 0.45359237) / 1.055056; //'Enthalpy
    if (outnum === 9) out = (out * 0.45359265) / Math.pow(12 * 0.0254, 3); //'Specific Volume
    if (outnum === 10) out = (out * Math.pow(12 * 0.0254, 3)) / 0.45359265; //'Density
  }

  return out;
}

function part_press(p, w) {
  //' Function to compute partial vapor pressure in [kPa]
  //' From page 6.9 equation 38 in ASHRAE Fundamentals handbook (2005)
  //'   P = ambient pressure [kPa]
  //'   W = humidity ratio [kg/kg dry air]

  return (p * w) / (0.62198 + w);
}

function sat_press(tdb) {
  //' Function to compute saturation vapor pressure in [kPa]
  //' ASHRAE Fundamentals handbood (2005) p 6.2, equation 5 and 6
  //'   Tdb = Dry bulb temperature [degC]
  //' Valid from -100C to 200 C

  var c1 = -5674.5359,
    c2 = 6.3925247,
    c3 = -0.009677843,
    c4 = 0.00000062215701,
    c5 = 2.0747825e-9,
    c6 = -9.484024e-13,
    c7 = 4.1635019,
    c8 = -5800.2206,
    c9 = 1.3914993,
    c10 = -0.048640239,
    c11 = 0.000041764768,
    c12 = -0.000000014452093,
    c13 = 6.5459673;

  var tk = tdb + 273.15; //'Converts from degC to degK
  var e = 2.71828;
  if (tk <= 273.15)
    return (
      Math.pow(
        e,
        c1 / tk +
          c2 +
          c3 * tk +
          c4 * Math.pow(tk, 2) +
          c5 * Math.pow(tk, 3) +
          c6 * Math.pow(tk, 4) +
          c7 * Math.log(tk)
      ) / 1000
    );
  else
    return (
      Math.pow(
        e,
        c8 / tk +
          c9 +
          c10 * tk +
          c11 * Math.pow(tk, 2) +
          c12 * Math.pow(tk, 3) +
          c13 * Math.log(tk)
      ) / 1000
    );
}

function hum_rat(tdb, twb, p) {
  //' Function to calculate humidity ratio [kg H2O/kg air]
  //' Given dry bulb and wet bulb temp inputs [degC]
  //' ASHRAE Fundamentals handbood (2005)
  //'   Tdb = Dry bulb temperature [degC]
  //'   Twb = Wet bulb temperature [degC]
  //'   P = Ambient Pressure [kPa]

  var pws = sat_press(twb),
    ws = (0.62198 * pws) / (p - pws); //' Equation 23, p6.8
  if (tdb >= 0)
    return (
      ((2501 - 2.326 * twb) * ws - 1.006 * (tdb - twb)) /
      (2501 + 1.86 * tdb - 4.186 * twb)
    );
  //' Equation 35, p6.9
  else
    return (
      ((2830 - 0.24 * twb) * ws - 1.006 * (tdb - twb)) /
      (2830 + 1.86 * tdb - 2.1 * twb)
    ); //' Equation 37, p6.9
}

function hum_rat2(tdb, rh, p) {
  //' Function to calculate humidity ratio [kg H2O/kg air]
  //' Given dry bulb and wet bulb temperature inputs [degC]
  //' ASHRAE Fundamentals handbood (2005)
  //'   Tdb = Dry bulb temperature [degC]
  //'   RH = Relative Humidity [Fraction or %]
  //'   P = Ambient Pressure [kPa]

  var pws = sat_press(tdb);
  return (0.62198 * rh * pws) / (p - rh * pws); //' Equation 22, 24, p6.8
}

function rel_hum(tdb, twb, p) {
  //' Calculates relative humidity ratio
  //' ASHRAE Fundamentals handbood (2005)
  //'   Tdb = Dry bulb temperature [degC]
  //'   Twb = Wet bulb temperature [degC]
  //'   P = Ambient Pressure [kPa]

  var w = hum_rat(tdb, twb, p);
  return part_press(p, w) / sat_press(tdb); //' Equation 24, p6.8
}

// function rel_hum2(tdb, w, p) {
//   //' Calculates the relative humidity given:
//   //'   Tdb = Dry bulb temperature [degC]
//   //'   P = ambient pressure [kPa]
//   //'   W = humidity ratio [kg/kg dry air]

//   var Pw = part_press(p, w),
//     Pws = sat_press(tdb);
//   return Pw / Pws;
// }

function wet_bulb(tdb, rh, p) {
  //' Calculates the Wet Bulb temp given dry blub temp [degC] and Relative Humidity
  //' Uses Newton-Rhapson iteration to converge quickly
  //'   Tdb = Dry bulb temperature [degC]
  //'   RH = Relative humidity ratio [Fraction or %]
  //'   P = Ambient Pressure [kPa]

  var w_normal = hum_rat2(tdb, rh, p),
    wet_bulb = tdb;
  //' Solve to within 0.001% accuracy using Newton-Rhapson
  var w_new = hum_rat(tdb, wet_bulb, p);
  while (Math.abs((w_new - w_normal) / w_normal) > 0.00001) {
    var w_new2 = hum_rat(tdb, wet_bulb - 0.001, p),
      dw_dtwb = (w_new - w_new2) / 0.001;
    wet_bulb = wet_bulb - (w_new - w_normal) / dw_dtwb;
    w_new = hum_rat(tdb, wet_bulb, p);
  }
  return wet_bulb; //not sure about what this one was supposed to be returning...
}

function enthalpy_air_h2o(tdb, w) {
  //' Calculates enthalpy in kJ/kg (dry air)
  //'   Tdb = Dry bulb temperature [degC]
  //'   W = Humidity Ratio [kg/kg dry air]

  return 1.006 * tdb + w * (2501 + 1.86 * tdb); //' Calculations from 2005 ASHRAE Handbook - Fundamentals - SI P6.9 eqn 32
}

function dew_point(p, w) {
  //' Function to compute the dew point temperature (deg C)
  //' From page 6.9 equation 39 and 40 in ASHRAE Fundamentals handbook (2005)
  //'   P = ambient pressure [kPa]
  //'   W = humidity ratio [kg/kg dry air]
  //'   Valid for Dew Points less than 93 C

  var c14 = 6.54,
    c15 = 14.526,
    c16 = 0.7389,
    c17 = 0.09486,
    c18 = 0.4569;

  var pw = part_press(p, w),
    alpha = Math.log(pw),
    tdp1 =
      c14 +
      c15 * alpha +
      c16 * Math.pow(alpha, 2) +
      c17 * Math.pow(alpha, 4) +
      c18 * Math.pow(pw, 0.1984),
    tdp2 = 6.09 + 12.608 * alpha + 0.4959 * Math.pow(alpha, 2);
  if (tdp1 >= 0) return tdp1;
  else return tdp2;
}

function dry_air_density(p, tdb, w) {
  //' Function to compute the dry air density (kg_dry_air/m3), using pressure
  //' [kPa], temperature [C] and humidity ratio
  //' From page 6.8 equation 28 ASHRAE Fundamentals handbook (2005)
  //' [rho_dry_air] = Dry_Air_Density(P, Tdb, w)
  //' Note that total density of air-h2o mixture is:
  //' rho_air_h2o = rho_dry_air * (1 + W)
  //' gas constant for dry air

  var r_da = 287.055;

  return (1000 * p) / (r_da * (273.15 + tdb) * (1 + 1.6078 * w));
}

// function std_press(elevation) {
//   //' Module to calculate the standard pressure [kPa] at given elevation (meters)
//   //'   ASHRAE Fundamentals 2005 - chap 6, eqn 3
//   //' Valid from -5000m to 11000m

//   return Math.pow(101.325 * (1 - 0.0000225577 * elevation), 5.2559);
// }

// function std_temp(elevation) {
//   //' Module to calculate the standard temperature [degC] at given elevation (meters)
//   //'   ASHRAE Fundamentals 2005 - chap 6, eqn 4
//   //' Valid from -5000m to 11000m

//   return 15 - 0.0065 * elevation;
// }

//numerical method to find dry bulb temp intercept for a given humidity ratio and 100% rh
// function tempFromHrRH(hr, rh, si_bool) {
//   let p = 101353;
//   if (si_bool) p = 14.7;

//   let lT = -50,
//     uT = 50;
//   let lH = psych(p, lT, rh, 3, 4, si_bool),
//     uH = psych(p, uT, rh, 3, 4, si_bool);
//   while (Math.abs(hr - lH) > 0.1 || Math.abs(hr - uH) > 0.1) {
//     if (hr < lH) {
//       lT -= 20;
//       lH = psych(p, lT, rh, 3, 4, si_bool);
//     }
//     if (hr > uH) {
//       uT += 20;
//       uH = psych(p, uT, rh, 3, 4, si_bool);
//     }
//     if (lH <= hr && hr <= uH) {
//       let mT = lT + (uT - lT) / 2,
//         mH = psych(p, mT, rh, 3, 4, si_bool);
//       if (mH > hr) {
//         uT = mT;
//         uH = mH;
//       }
//       if (mH < hr) {
//         lT = mT;
//         lH = mH;
//       }
//     }
//   }
//   return lT + ((hr - lH) * (uT - lT)) / (uH - lH);
// }

export { psych };
