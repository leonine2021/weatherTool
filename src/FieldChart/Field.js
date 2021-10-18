import { SideBar } from "./SideBar";
import { ItemHeader } from "../ItemHeader";
import { useState, useMemo } from "react";
import * as d3 from "d3";
import {
  updateDiscreteColors,
  colorScaleDiscrete,
  calcStats,
} from "./calColors";
import { WaterMark } from "./WaterMark";
import { dayToDate } from "../NumericalField";

export const Field = ({ text, id, dataObj, weatherStation, turn }) => {
  const width = 980;
  const height = 340;
  const margin = { top: 60, right: 0, bottom: 240, left: 35 };

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

  // d3 scales
  let xScale = d3.scaleLinear().domain([0.5, 365.5]).range([0, innerWidth]);
  let yScale = d3.scaleLinear().domain([0, 23]).range([innerHeight, 0]);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const hours = ["0", "12h", "24h"];
  let monthScale = d3.scaleBand().domain(months).range([0, innerWidth]);
  let hourScale = d3.scalePoint().domain(hours).range([innerHeight, 0]);

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

  // Draw monthly data

  // Iris chart
  let radius = 140; // Outer heat radius in pixels
  let heatmapThickness = 0.3; // Fraction of radius
  let dotRadius = 1.5;
  let outerRadiusMonth = radius * (1 - heatmapThickness * 1.1);
  let angleScale = d3
    .scaleLinear()
    .domain([0, 364])
    .range([0, Math.PI * 2]);
  let radiusHourScale = d3
    .scaleLinear()
    .domain([0, 23])
    .range([1 - heatmapThickness, 1]); // Min and max distance from center in fraction of radius
  let dotRadiusScale = d3
    .scaleLinear()
    .domain([0, 23])
    .range([dotRadius * 0.8, dotRadius]);
  let centerCoordinates = radius + dotRadius;
  let angleScaleMonth = d3
    .scaleLinear()
    .domain([0, 12])
    .range([0, 2 * Math.PI]);

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
              <div className="row" id="rectangular-field">
                <svg width={width} height={height}>
                  <g
                    transform={`translate(${margin.left},${margin.top})`}
                    id="svg-field-chart"
                  >
                    {displayData.map((d) => {
                      return (
                        <circle
                          cx={xScale(d.date)}
                          cy={yScale(d.clock)}
                          r={1.2}
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
                  <g
                    transform={`translate(${margin.left}, ${
                      innerHeight + margin.top
                    })`}
                    id="axis-months"
                  >
                    {months.map((d) => {
                      return (
                        <g>
                          <text
                            x={monthScale(d)}
                            y={10}
                            dy={"0.71em"}
                            fontSize={12}
                          >
                            {d}
                          </text>
                          <line
                            x1={monthScale(d) + 1.2}
                            y1={3}
                            x2={monthScale(d) + 1.2}
                            y2={7}
                            stroke={"black"}
                          ></line>
                        </g>
                      );
                    })}
                  </g>
                  <g
                    transform={`translate(${margin.left},${margin.top})`}
                    id="axis-hours"
                  >
                    {hours.map((d) => {
                      return (
                        <g>
                          <text
                            x={-8}
                            y={hourScale(d)}
                            textAnchor="end"
                            dy={"0.32em"}
                            fontSize={12}
                          >
                            {d}
                          </text>
                          <line
                            x1={-2}
                            y1={hourScale(d)}
                            x2={-6}
                            y2={hourScale(d)}
                            stroke={"black"}
                          ></line>
                        </g>
                      );
                    })}
                  </g>
                  <g
                    transform={`translate(${margin.left}, ${
                      height - margin.bottom + 50
                    })`}
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

                    <text
                      className="wtm-text"
                      x={innerWidth + margin.left - 50}
                      y={-95}
                      fontSize={11}
                    >{`Total Hours: ${numHours} hours`}</text>
                  </g>
                  <g
                    transform={`translate(${innerWidth + margin.left - 15},${
                      height - margin.bottom + 45
                    })`}
                    id="axis-watermark-linear"
                  >
                    <WaterMark
                      className={"wtm-text-linear"}
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
                </svg>
              </div>
              <div className="row" id="iris-field">
                <svg width={width} height={height}>
                  <g
                    transform={`translate(${margin.left + 30},${
                      margin.top - 40
                    })`}
                    id="svg-iris-chart"
                  >
                    <circle
                      cx={radius + dotRadius}
                      cy={radius + dotRadius}
                      r={radius + 2 * dotRadius}
                      fill={"none"}
                      stroke={"#635f5d"}
                      strokeWidth={1}
                      id="outer-circle"
                    ></circle>
                    <circle
                      cx={radius + dotRadius}
                      cy={radius + dotRadius}
                      r={radius * (1 - heatmapThickness * 1.05)}
                      fill={"none"}
                      stroke={"#635f5d"}
                      strokeWidth={1}
                      id="inner-circle"
                    ></circle>
                    {displayData.map((d) => {
                      return (
                        <circle
                          cx={
                            radiusHourScale(d.clock) *
                              radius *
                              Math.cos(angleScale(d.date) - Math.PI * 0.5) +
                            centerCoordinates
                          }
                          cy={
                            radiusHourScale(d.clock) *
                              radius *
                              Math.sin(angleScale(d.date) - Math.PI * 0.5) +
                            centerCoordinates
                          }
                          r={dotRadiusScale(d.clock)}
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
                  <g
                    transform={`translate(${margin.left + 30},${
                      margin.top - 40
                    })`}
                    id="ring-months"
                  >
                    {dataObj.monthlyData.map((d) => {
                      return (
                        <path
                          d={d3
                            .arc()
                            .innerRadius(outerRadiusMonth - 10)
                            .outerRadius(outerRadiusMonth)
                            .startAngle(angleScaleMonth(d.month))
                            .endAngle(angleScaleMonth(d.month + 1))
                            .padAngle(0.007)(d)}
                          fill={currentColorScale(d.data[primarySelectionIdx])}
                          transform={`translate(${centerCoordinates},${centerCoordinates})`}
                        ></path>
                      );
                    })}
                  </g>
                  <g
                    transform={`translate(${margin.left + 30},${
                      margin.top - 40
                    })`}
                    id="axis-months-iris"
                  >
                    {months.map((d, i) => {
                      return (
                        <text
                          x={0}
                          y={0}
                          dy={"0.79em"}
                          fontSize={12}
                          textAnchor={i < 6 ? "start" : "end"}
                          transform={`translate(${
                            radius *
                              Math.cos(
                                angleScale(15 + 30 * i) - Math.PI * 0.5
                              ) *
                              1.05 +
                            centerCoordinates
                          },${
                            radius *
                              Math.sin(
                                angleScale(15 + 30 * i) - Math.PI * 0.5
                              ) *
                              1.05 +
                            centerCoordinates
                          }) rotate(${((15 + 30 * i) % 180) - 90})`}
                        >
                          {d}
                        </text>
                      );
                    })}
                  </g>
                  <g
                    transform={`translate(${innerWidth + margin.left - 550},${
                      height - margin.bottom
                    })`}
                    id="axis-watermark-iris"
                  >
                    <WaterMark
                      className={"wtm-text-iris"}
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
                    transform={`translate(${margin.left + innerWidth - 550}, ${
                      height - margin.bottom + 150
                    })`}
                    id="axis-legend-iris"
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
                </svg>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else return null;
};
