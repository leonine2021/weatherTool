import { SideBar } from "../FieldChart/SideBar";
import { ItemHeader } from "../ItemHeader";
import { useState, useMemo, useEffect } from "react";
import * as d3 from "d3";
import {
  updateDiscreteColors,
  colorScaleDiscrete,
  calcStats,
} from "../FieldChart/calColors";
import { WaterMark } from "../FieldChart/WaterMark";
import { dayToDate } from "../NumericalField";
import { psych } from "../psych";
import { ScaleButtons } from "./ScaleButtons";
import "bootstrap/js/dist/popover.js";
import { Button, Popover, PopoverHeader, PopoverBody } from "reactstrap";

export const PsyChart = ({ text, id, dataObj, weatherStation, unit, turn }) => {
  let p = 101353;
  if (!unit) p = 14.7;
  const width = 980;
  const height = 700;
  const margin = { top: 40, right: 60, bottom: 80, left: 40 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const params = dataObj.dataParams;
  const data = dataObj.data;
  const labels = params.map((d) => d.labels);

  //close button
  const [isClosed, setIsClosed] = useState(false);
  const closeInstance = (closeSignal) => {
    setIsClosed(closeSignal);
  };

  //show popup
  const [showPopup, setShowPopup] = useState(false);

  const [primarySelectionIdx, setPrimarySelectionIdx] = useState(3);
  const [secondarySelectionIdx, setSecondarySelectionIdx] = useState(5);

  // min, max and bounds got from all inputs in the primary selection
  const [primaryFilters, setPrimaryFilters] = useState({
    newMax: params[3].max,
    newMin: params[3].min,
    newBounds: params[3].bounds,
    continuous: true,
  });

  const [secondaryFilters, setSecondaryFilters] = useState({
    newMax: params[5].max,
    newMin: params[5].min,
  });

  const [periodFilters, setPeriodFilters] = useState({
    startDate: 1,
    endDate: 365,
    startHour: 0,
    endHour: 23,
  });

  // states to control axis scales
  const [xMin, setXMin] = useState(params[3].min);
  const [xMax, setXMax] = useState(params[3].max);
  const [yMax, setYMax] = useState(params[10].max);

  const getValues = (childProps) => {
    setXMin(childProps.newMinX);
    setXMax(childProps.newMaxX);
    setYMax(childProps.newMaxY);
  };

  useEffect(() => {
    setXMin(params[3].min);
    setXMax(params[3].max);
    setYMax(params[10].max);
  }, [data]);

  // states to control gridline visibilities
  const [toggleDb, setToggleDb] = useState(true);
  const [toggleHr, setToggleHr] = useState(true);
  const [toggleRh, setToggleRh] = useState(true);
  const [toggleWb, setToggleWb] = useState(false);
  const [toggleEnt, setToggleEnt] = useState(false);

  // update current min-max values of both primary and secondary selections
  let currentMinMax = {
    min1: params[primarySelectionIdx].min,
    max1: params[primarySelectionIdx].max,
    min2: params[secondarySelectionIdx].min,
    max2: params[secondarySelectionIdx].max,
  };
  let currentBounds = params[primarySelectionIdx].bounds;
  let currentColorScale = params[primarySelectionIdx].colorScale;

  let discreteColors = updateDiscreteColors(
    currentMinMax.min1,
    currentMinMax.max1,
    currentBounds,
    currentColorScale
  );

  const getDisplayData = (data, filter1, filter2, filter3) => {
    let filteredData = data.filter(
      (d) =>
        d.data[primarySelectionIdx] >= filter1.newMin &&
        d.data[primarySelectionIdx] <= filter1.newMax &&
        d.data[secondarySelectionIdx] >= filter2.newMin &&
        d.data[secondarySelectionIdx] <= filter2.newMax &&
        d.date >= filter3.startDate &&
        d.date <= filter3.endDate &&
        d.clock >= filter3.startHour &&
        d.clock <= filter3.endHour
    );
    return filteredData;
  };

  const getStats = (data, filters) => {
    let numHoursBounds = [0, 0, 0, 0, 0];
    data.forEach((d) => {
      calcStats(d.data[primarySelectionIdx], filters, numHoursBounds);
    });
    return numHoursBounds;
  };

  let displayData = useMemo(() => {
    return getDisplayData(
      data,
      primaryFilters,
      secondaryFilters,
      periodFilters
    );
  }, [data, primaryFilters, secondaryFilters, periodFilters]);

  let numHours = displayData.length;

  let numHoursBounds = useMemo(() => {
    return getStats(displayData, primaryFilters);
  }, [displayData, primaryFilters]);

  let bounds = primaryFilters.newBounds;

  // bdtemp and humidity ratio axes

  let xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([0, innerWidth])
    .nice(10);
  let yScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([innerHeight, 0])
    .nice(10);

  //   console.log(yMax);

  // vars for drawing gridlines
  let tTicks = xScale.ticks();
  let lt = tTicks.length;
  let hTicks = yScale.ticks();
  let lh = hTicks.length;
  let rhLines = [];
  let wbLines = [];
  let entLines = [];

  let lT = xScale.domain()[0];
  let uT = xScale.domain()[1];

  let dbLines = [];
  let hrLines = [];

  //numerical method to find humidity ratio and rh intercept
  const tempFromHR = (hr, rh) => {
    let lH = psych(p, lT, rh, 3, 4, !unit) * 1000;
    let uH = psych(p, uT, rh, 3, 4, !unit) * 1000;
    while (Math.abs(hr - lH) > 0.1 || Math.abs(hr - uH) > 0.1) {
      if (hr < lH) lT -= 20;
      if (hr > uH) uT += 20;
      let mT = lT + (uT - lT) / 2,
        mH = psych(p, mT, rh, 3, 4, !unit) * 1000;
      if (mH > hr) uT = mT;
      if (mH < hr) lT = mT;
      lH = psych(p, lT, rh, 3, 4, !unit) * 1000;
      uH = psych(p, uT, rh, 3, 4, !unit) * 1000;
    }
    return lT + ((hr - lH) * (uT - lT)) / (uH - lH);
  };

  //numerical method to find enthalpy and rh intercept
  const tempFromEnt = (ent) => {
    let lEnt = psych(p, lT, 1, 3, 7, !unit);
    let uEnt = psych(p, uT, 1, 3, 7, !unit);
    while (Math.abs(ent - lEnt) > 0.1 || Math.abs(ent - uEnt) > 0.1) {
      if (ent < lEnt) lT -= 20;
      if (ent > uEnt) uT += 20;
      let mT = lT + (uT - lT) / 2,
        mEnt = psych(p, mT, 1, 3, 7, !unit);
      if (mEnt > ent) uT = mT;
      if (mEnt < ent) lT = mT;
      lEnt = psych(p, lT, 1, 3, 7, !unit);
      uEnt = psych(p, uT, 1, 3, 7, !unit);
    }
    return lT + ((ent - lEnt) * (uT - lT)) / (uEnt - lEnt);
  };

  // get enthalpy labels
  let entLabels = unit
    ? [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    : [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  let coordsEntLabels = [];
  entLabels.forEach((d, i) => {
    let x = tempFromEnt(d);
    let y = psych(p, x, 1, 3, 4, !unit) * 1000;
    coordsEntLabels.push({
      x: xScale(x),
      y: yScale(y),
      label: d,
    });
  });

  //temp Lines
  for (let i = 0; i < lt; i++) {
    dbLines.push([
      {
        x: xScale(tTicks[i]),
        y: yScale(0),
      },
      {
        x: xScale(tTicks[i]),
        y: yScale(psych(p, tTicks[i], 1, 3, 4, !unit) * 1000),
      },
    ]);
  }

  //Hr lines
  for (let i = 0; i < lh; i++) {
    hrLines.push([
      {
        x: xScale(xScale.domain()[1]),
        y: yScale(hTicks[i]),
      },
      {
        x: xScale(tempFromHR(hTicks[i], 1)),
        y: yScale(hTicks[i]),
      },
    ]);
  }

  // RH lines
  for (let i = 0; i < 10; i++) {
    let rhs = [];
    for (let j = tTicks[0]; j <= tTicks[lt - 1]; j += 1) {
      let hr = psych(p, j, 1 - i * 0.1, 3, 4, !unit) * 1000;
      rhs.push({ x: xScale(j), y: yScale(hr) });
    }
    rhLines.push(rhs);
  }

  let lWB = unit ? -10 : -10 * 1.8 + 32;
  let uWB = unit ? 40 : 40 * 1.8 + 32;

  // Wetbulb lines
  for (let i = lWB; i < uWB; i++) {
    let wbs = [];
    for (let j = tTicks[0]; j <= tTicks[lt - 1]; j += 1) {
      let wb = psych(p, j, uWB - i, 1, 4, !unit) * 1000;
      wbs.push({ x: xScale(j), y: yScale(wb) });
    }
    wbLines.push(wbs);
  }

  // Enthalpy lines
  for (let i = 0; i < 120; i++) {
    let ents = [];
    for (let j = tTicks[0]; j <= tTicks[lt - 1]; j += 1) {
      let ent = psych(p, j, 120 - i, 7, 4, !unit) * 1000;
      ents.push({ x: xScale(j), y: yScale(ent) });
    }
    entLines.push(ents);
  }

  //get coordinates for wb labels
  let coordsWbLabels = [];
  dbLines.forEach((d, i) => {
    coordsWbLabels.push({ x: d[1].x, y: d[1].y, label: xScale.ticks()[i] });
  });

  //get coords for rh labels
  let coordsRHLabels = [];
  rhLines.forEach((d, i) => {
    const hr = yScale.ticks()[yScale.ticks().length - 1];
    let coords = {
      x: Math.min(xScale(tempFromHR(hr, 1 - i / 10)), xScale.range()[1]),
      y: Math.max(yScale(hr), d[d.length - 1].y),
      label: 100 - i * 10,
    };
    coordsRHLabels.push(coords);
  });

  let rhEndPoints = [];

  rhLines.forEach((d) => {
    rhEndPoints.push(d[d.length - 1]);
  });

  // clippaths
  // area under 100% rh line
  let l = rhLines[0].length;
  let clipPath1 = [
    ...rhLines[0],
    { x: width, y: rhLines[0][l - 1].y },
    { x: width, y: height },
    { x: 0, y: height },
  ];

  // area under max hr line
  let clipPath2 = [
    { x: -1, y: yScale(yScale.ticks()[yScale.ticks().length - 1]) - 1 },
    {
      x: innerWidth + 5,
      y: yScale(yScale.ticks()[yScale.ticks().length - 1]) - 1,
    },
    { x: innerWidth + 5, y: innerHeight + 1 },
    { x: -1, y: innerHeight + 1 },
  ];

  //
  let p1 = rhLines[0][0];
  let p2 = coordsRHLabels[0];
  let pLabelX = (p1.x + p2.x) / 2;
  let pLabelY = (p1.y + p2.y) / 2;
  let k = Math.abs(p2.y - p1.y) / Math.abs(p2.x - p1.x);

  const togglePopover = () => {
    setShowPopup(!showPopup);
  };

  // render elements
  if (!isClosed) {
    return (
      <>
        <br></br>
        <div className="container" id={"item" + id}>
          <ItemHeader id={id} text={text} clickToClose={closeInstance} />
          <div className="row mt-3">
            <div className="col-3">
              <SideBar
                dropdownOptions={labels}
                currentMinMax={currentMinMax}
                bounds={currentBounds}
                colorScale={currentColorScale}
                getPrimarySelectionIdx={setPrimarySelectionIdx}
                getSecondarySelectionIdx={setSecondarySelectionIdx}
                getPrimaryFilters={setPrimaryFilters}
                getSecondaryFilters={setSecondaryFilters}
                getPeriodFilters={setPeriodFilters}
              />
            </div>
            <div className="col-9">
              <div className="container ms-3" id="toggle-lines">
                <Button
                  id="mypopover"
                  type="button"
                  className="btn btn-secondary btn-sm"
                >
                  Chart Settings
                </Button>
                <Popover
                  isOpen={showPopup}
                  target="mypopover"
                  toggle={togglePopover}
                  fade={false}
                  placement={"bottom-start"}
                  hideArrow={false}
                >
                  <PopoverHeader>Chart Settings</PopoverHeader>
                  <PopoverBody>
                    <ScaleButtons
                      minX={params[3].min}
                      maxX={params[3].max}
                      maxY={params[10].max}
                      getValues={getValues}
                    />
                  </PopoverBody>
                </Popover>

                <div class="form-check form-check-inline">
                  <label className="form-check-label" htmlFor="toggle-db">
                    <strong>Chart Metrics</strong>
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    className={"form-check-input"}
                    type={"checkbox"}
                    checked={toggleDb}
                    id="toggle-db"
                    onChange={() => setToggleDb(!toggleDb)}
                  ></input>
                  <label className="form-check-label" htmlFor="toggle-db">
                    Dry-Bulb Temp.
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    className={"form-check-input"}
                    type={"checkbox"}
                    checked={toggleHr}
                    id="toggle-hr"
                    onChange={() => setToggleHr(!toggleHr)}
                  ></input>
                  <label className="form-check-label" htmlFor="toggle-hr">
                    Absolute Humidity
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    className={"form-check-input"}
                    type={"checkbox"}
                    checked={toggleRh}
                    id="toggle-rh"
                    onChange={() => setToggleRh(!toggleRh)}
                  ></input>
                  <label className="form-check-label" htmlFor="toggle-rh">
                    Relative Humidity
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    className={"form-check-input"}
                    type={"checkbox"}
                    checked={toggleWb}
                    id="toggle-wb"
                    onChange={() => setToggleWb(!toggleWb)}
                  ></input>
                  <label className="form-check-label" htmlFor="toggle-wb">
                    Wet-Bulb Temp.
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    className={"form-check-input"}
                    type={"checkbox"}
                    checked={toggleEnt}
                    id="toggle-ent"
                    onChange={() => {
                      setToggleEnt(!toggleEnt);
                    }}
                  ></input>
                  <label className="form-check-label" htmlFor="toggle-ent">
                    Enthalpy
                  </label>
                </div>
              </div>
              <div className="row" id="psych-chart">
                <svg width={width} height={height}>
                  <g
                    transform={`translate(${margin.left},${margin.top})`}
                    id="watermark-psych"
                  >
                    <WaterMark
                      className={"wtm-text-psych"}
                      weatherStation={weatherStation}
                      primarySelection={labels[primarySelectionIdx].caps}
                      secondarySelection={labels[secondarySelectionIdx].caps}
                      unit1={labels[primarySelectionIdx].units}
                      unit2={labels[secondarySelectionIdx].units}
                      min1={primaryFilters.newMin.toFixed(1)}
                      max1={primaryFilters.newMax.toFixed(1)}
                      min2={secondaryFilters.newMin.toFixed(1)}
                      max2={secondaryFilters.newMax.toFixed(1)}
                      startDate={dayToDate(periodFilters.startDate)}
                      endDate={dayToDate(periodFilters.endDate)}
                      startHour={periodFilters.startHour}
                      endHour={periodFilters.endHour}
                      numHours={numHours}
                      turn={turn}
                      fontSize={12}
                      spacing={15}
                    />
                  </g>
                  <g
                    transform={`translate(${margin.left}, ${margin.top + 150})`}
                    id="axis-legend"
                  >
                    <rect
                      x={0}
                      y={-9}
                      width={10}
                      height={10}
                      fill={discreteColors[0]}
                    ></rect>
                    <text
                      x={12}
                      y={0}
                      fontSize={11}
                    >{`${primaryFilters.newMin.toFixed(
                      1
                    )} to ${bounds[0].toFixed(1)} ${
                      params[primarySelectionIdx].labels.units
                    }: ${numHoursBounds[0]} hours (${(
                      (numHoursBounds[0] / numHours) *
                      100
                    ).toFixed(1)}%)`}</text>
                    <rect
                      x={0}
                      y={9}
                      width={10}
                      height={10}
                      fill={discreteColors[1]}
                    ></rect>
                    <text x={12} y={18} fontSize={11}>{`${bounds[0].toFixed(
                      1
                    )} to ${bounds[1].toFixed(1)} ${
                      params[primarySelectionIdx].labels.units
                    }: ${numHoursBounds[1]} hours (${(
                      (numHoursBounds[1] / numHours) *
                      100
                    ).toFixed(1)}%)`}</text>
                    <rect
                      x={0}
                      y={27}
                      width={10}
                      height={10}
                      fill={discreteColors[2]}
                    ></rect>
                    <text x={12} y={36} fontSize={11}>{`${bounds[1].toFixed(
                      1
                    )} to ${bounds[2].toFixed(1)} ${
                      params[primarySelectionIdx].labels.units
                    }: ${numHoursBounds[2]} hours (${(
                      (numHoursBounds[2] / numHours) *
                      100
                    ).toFixed(1)}%)`}</text>
                    <rect
                      x={0}
                      y={45}
                      width={10}
                      height={10}
                      fill={discreteColors[3]}
                    ></rect>
                    <text x={12} y={54} fontSize={11}>{`${bounds[2].toFixed(
                      1
                    )} to ${bounds[3].toFixed(1)} ${
                      params[primarySelectionIdx].labels.units
                    }: ${numHoursBounds[3]} hours (${(
                      (numHoursBounds[3] / numHours) *
                      100
                    ).toFixed(1)}%)`}</text>
                    <rect
                      x={0}
                      y={63}
                      width={10}
                      height={10}
                      fill={discreteColors[4]}
                    ></rect>
                    <text x={12} y={72} fontSize={11}>{`${bounds[3].toFixed(
                      1
                    )} to ${primaryFilters.newMax.toFixed(1)} ${
                      params[primarySelectionIdx].labels.units
                    }: ${numHoursBounds[4]} hours (${(
                      (numHoursBounds[4] / numHours) *
                      100
                    ).toFixed(1)}%)`}</text>
                  </g>

                  <defs>
                    <clipPath id="clip">
                      <rect
                        x={margin.left}
                        y={margin.top}
                        width={innerWidth}
                        height={innerHeight}
                      ></rect>
                    </clipPath>
                  </defs>
                  <defs>
                    <clipPath id="clip-100%RH">
                      <path
                        d={d3
                          .line()
                          .x((d) => d.x)
                          .y((d) => d.y)(clipPath1)}
                      ></path>
                    </clipPath>
                  </defs>
                  <defs>
                    <clipPath id="clip-hrMax">
                      <path
                        d={d3
                          .line()
                          .x((d) => d.x)
                          .y((d) => d.y)(clipPath2)}
                      ></path>
                    </clipPath>
                  </defs>
                  <g
                    id="temp-axis"
                    transform={`translate(${margin.left}, ${
                      margin.top + innerHeight
                    })`}
                    mask={"url(#mask-hrMax)"}
                  >
                    {xScale.ticks().map((d) => {
                      if (toggleDb) {
                        return (
                          <g>
                            <text
                              x={xScale(d)}
                              y={12}
                              dy={"0.32em"}
                              textAnchor={"middle"}
                              fontSize={10}
                            >
                              {d}
                            </text>
                            <line
                              x1={xScale(d)}
                              y1={0}
                              x2={xScale(d)}
                              y2={6}
                              stroke={"black"}
                            ></line>
                            <text
                              x={innerWidth / 2}
                              y={20}
                              dy={"0.71em"}
                              textAnchor={"middle"}
                              fontSize={10}
                            >{`Dry-Bulb Temp.[${unit ? "°C" : "°F"}]`}</text>
                          </g>
                        );
                      }
                    })}
                  </g>
                  <g
                    id="hr-axis"
                    transform={`translate(${margin.left + innerWidth}, ${
                      margin.top
                    })`}
                  >
                    {yScale.ticks().map((d) => {
                      if (toggleHr) {
                        return (
                          <g>
                            <text
                              x={10}
                              y={yScale(d)}
                              dy={"0.3em"}
                              textAnchor={"start"}
                              fontSize={10}
                            >
                              {d}
                            </text>
                            <line
                              x1={0}
                              y1={yScale(d)}
                              x2={6}
                              y2={yScale(d)}
                              stroke={"black"}
                            ></line>
                            <text
                              transform={`rotate(90)`}
                              x={innerHeight / 2}
                              y={-40}
                              dy={"0.71em"}
                              textAnchor={"middle"}
                              fontSize={10}
                            >{`Humidity Ratio.[${
                              unit ? "g/kg dry air" : "lb/klb dry air"
                            }]`}</text>
                          </g>
                        );
                      }
                    })}
                  </g>
                  <g
                    id="wb-lines"
                    transform={`translate(${margin.left},${margin.top})`}
                    clipPath={"url(#clip)"}
                    clipPath={"url(#clip-hrMax)"}
                  >
                    {wbLines.map((d, i) => {
                      if (toggleWb) {
                        return (
                          <path
                            d={d3
                              .line()
                              .x((d) => d.x)
                              .y((d) => d.y)
                              .curve(d3.curveBasis)(d)}
                            fill={"none"}
                            stroke={"gray"}
                            strokeWidth={i % 5 === 0 ? 2 : 0.5}
                            clipPath={"url(#clip-100%RH)"}
                          ></path>
                        );
                      }
                    })}
                  </g>
                  <g
                    id="wb-labels"
                    transform={`translate(${margin.left},${margin.top})`}
                  >
                    {coordsWbLabels.map((d) => {
                      if (toggleWb && !toggleEnt) {
                        return (
                          <>
                            <text
                              x={d.x - 3}
                              y={d.y - 3}
                              textAnchor={"end"}
                              fontSize={10}
                            >
                              {d.y >
                              yScale(yScale.ticks()[yScale.ticks().length - 1])
                                ? d.label
                                : ""}
                            </text>
                          </>
                        );
                      }
                    })}
                    <text
                      x={0}
                      y={0}
                      fontSize={10}
                      transform={`rotate(-${(Math.atan(k) / Math.PI) * 180})
                          translate(${pLabelY - 150}, ${pLabelX + 50})`}
                      opacity={toggleWb && !toggleEnt ? 100 : 0}
                      textAnchor={"middle"}
                    >
                      {`Wet-Bulb Temperature[${unit ? "°C" : "°F"}]`}
                    </text>
                  </g>
                  <g
                    id="enthalpy-lines"
                    transform={`translate(${margin.left},${margin.top})`}
                    clipPath={"url(#clip)"}
                    clipPath={"url(#clip-hrMax)"}
                  >
                    {entLines.map((d, i) => {
                      let numEnt = unit ? 10 : 5;
                      if (toggleEnt) {
                        return (
                          <path
                            d={d3
                              .line()
                              .x((d) => d.x)
                              .y((d) => d.y)
                              .curve(d3.curveBasis)(d)}
                            fill={"none"}
                            stroke={i % numEnt === 0 ? "gray" : "lightgray"}
                            strokeWidth={i % numEnt === 0 ? 2 : 0.5}
                            clipPath={"url(#clip-100%RH)"}
                          ></path>
                        );
                      }
                    })}
                    <text
                      x={0}
                      y={0}
                      fontSize={10}
                      transform={`rotate(-${(Math.atan(k) / Math.PI) * 180})
                          translate(${pLabelY - 150}, ${pLabelX + 50})`}
                      opacity={toggleEnt ? 100 : 0}
                      opacity={toggleEnt ? 100 : 0}
                      textAnchor={"middle"}
                    >
                      {`Enthalpy[${unit ? "kJ/kg" : "Btu/lb"}]`}
                    </text>
                  </g>
                  <g
                    id="dbLines"
                    transform={`translate(${margin.left}, ${margin.top})`}
                    clipPath={"url(#clip)"}
                    clipPath={"url(#clip-hrMax)"}
                  >
                    {dbLines.map((d, i) => {
                      if (toggleDb) {
                        return (
                          <path
                            d={d3
                              .line()
                              .x((d) => d.x)
                              .y((d) => d.y)(d)}
                            fill={"none"}
                            stroke={
                              i === 0 || i === dbLines.length - 1
                                ? "black"
                                : "lightgray"
                            }
                            strokeWidth={
                              i === 0 || i === dbLines.length - 1 ? 2 : 0.5
                            }
                          ></path>
                        );
                      }
                    })}
                  </g>
                  <g
                    id="hrLines"
                    transform={`translate(${margin.left}, ${margin.top})`}
                    clipPath={"url(#clip)"}
                    clipPath={"url(#clip-hrMax)"}
                  >
                    {hrLines.map((d, i) => {
                      if (toggleHr) {
                        return (
                          <path
                            d={d3
                              .line()
                              .x((d) => d.x)
                              .y((d) => d.y)(d)}
                            fill={"none"}
                            stroke={
                              i === 0 || i === hrLines.length - 1
                                ? "black"
                                : "lightgray"
                            }
                            strokeWidth={
                              i === 0 || i === hrLines.length - 1 ? 2 : 0.5
                            }
                          ></path>
                        );
                      }
                    })}
                  </g>
                  <g
                    id="rh-lines"
                    transform={`translate(${margin.left},${margin.top})`}
                    clipPath={"url(#clip)"}
                    clipPath={"url(#clip-hrMax)"}
                  >
                    {rhLines.map((d, i) => {
                      if (toggleRh) {
                        return (
                          <path
                            d={d3
                              .line()
                              .x((d) => d.x)
                              .y((d) => d.y)
                              .curve(d3.curveBasis)(d)}
                            fill={"none"}
                            stroke={i === 0 ? "black" : "gray"}
                            strokeDasharray={i === 0 ? "" : "10 5"}
                            strokeWidth={i === 0 ? 2 : 1}
                          ></path>
                        );
                      }
                    })}
                  </g>
                  <g
                    id="rh-labels"
                    transform={`translate(${margin.left},${margin.top})`}
                  >
                    {coordsRHLabels.map((d, i) => {
                      if (toggleRh) {
                        return (
                          <text
                            x={d.x - 2}
                            y={d.y - 10}
                            dy={"0.79em"}
                            textAnchor={"end"}
                            fontSize={10}
                          >{`${d.label}%`}</text>
                        );
                      }
                    })}
                  </g>
                  <g
                    id="ent-labels"
                    transform={`translate(${margin.left},${margin.top})`}
                  >
                    {coordsEntLabels.map((d, i) => {
                      if (toggleEnt) {
                        return (
                          <text
                            x={d.x - 2}
                            y={d.y - 10}
                            dy={"0.79em"}
                            textAnchor={"end"}
                            fontSize={10}
                          >
                            {d.y >
                            yScale(yScale.ticks()[yScale.ticks().length - 1])
                              ? d.label
                              : ""}
                          </text>
                        );
                      }
                    })}
                  </g>
                  <g
                    id="marks"
                    transform={`translate(${margin.left},${margin.top})`}
                  >
                    {displayData.map((d) => {
                      return (
                        <circle
                          cx={xScale(d.data[3])}
                          cy={yScale(d.data[10])}
                          r={3}
                          fill={
                            primaryFilters.continuous
                              ? currentColorScale(d.data[primarySelectionIdx])
                              : colorScaleDiscrete(
                                  d.data[primarySelectionIdx],
                                  bounds,
                                  currentMinMax.min1,
                                  currentMinMax.max1,
                                  discreteColors
                                )
                          }
                        ></circle>
                      );
                    })}
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else return null;
};
