// Visualization Item: Histogram
import { useState, useEffect } from "react";
import { ItemHeader } from "../ItemHeader";
import * as d3 from "d3";
import { calcHistogram } from "./calcBins";
import { SideBar } from "./SideBar";
import { WaterMark } from "../FieldChart/WaterMark";
import { Button, Popover, PopoverHeader, PopoverBody } from "reactstrap";
import { ScaleButtons } from "./ScaleButtons";
import { dayToDate } from "../NumericalField";

export const Histogram = ({
  text,
  id,
  dataObj,
  weatherStation,
  unit,
  turn,
}) => {
  // cosntant values
  const width = 800;
  const height = 600;
  const margin = { top: 50, right: 20, bottom: 180, left: 80 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const params = dataObj.dataParams;
  const data = dataObj.data;
  const labels = params.map((d) => d.labels);

  // console.log(labels[0].units);

  //close button
  const [isClosed, setIsClosed] = useState(false);
  // dropdown menus
  const [primarySelectionIdx, setPrimarySelectionIdx] = useState(3);
  const [secondarySelectionIdx, setSecondarySelectionIdx] = useState(5);

  const [toggleSum, setToggleSum] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  const [primaryFilters, setPrimaryFilters] = useState({
    newMax: params[3].max,
    newMin: params[3].min,
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

  useEffect(() => {
    setPrimaryFilters({
      newMax: params[primarySelectionIdx].max,
      newMin: params[primarySelectionIdx].min,
    });
    setSecondaryFilters({
      newMax: params[secondarySelectionIdx].max,
      newMin: params[secondarySelectionIdx].min,
    });
  }, [data]);

  const [xMin, setXMin] = useState(params[3].min);
  const [xMax, setXMax] = useState(params[3].max);
  const [numBins, setNumBins] = useState(10);
  const [binColor, setBinColor] = useState("lightblue");
  const [lineColor, setLineColor] = useState("orange");

  useEffect(() => {
    setXMin(params[primarySelectionIdx].min);
    setXMax(params[primarySelectionIdx].max);
  }, [primarySelectionIdx, data]);

  useEffect(() => {
    setShowPopup(false);
  }, [primarySelectionIdx, secondarySelectionIdx, data]);

  let xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, innerWidth]);
  let altZBool = params[primarySelectionIdx].altZBool;

  let histogram = calcHistogram(
    data,
    xMin,
    xMax,
    numBins,
    altZBool,
    primarySelectionIdx,
    secondarySelectionIdx,
    primaryFilters.newMin,
    primaryFilters.newMax,
    secondaryFilters.newMin,
    secondaryFilters.newMax,
    periodFilters.startHour,
    periodFilters.endHour,
    periodFilters.startDate,
    periodFilters.endDate
  );

  // console.log(histogram.maxHours);
  // let maxHour = histogram.maxHours;
  const [yMax, setYMax] = useState(histogram.maxHours);

  // useEffect(() => {
  //   setYMax(yMax);
  // }, [histogram]);

  const getValues = (childProps) => {
    setXMin(childProps.newMinX);
    setXMax(childProps.newMaxX);
    setYMax(childProps.newMaxY);
    setNumBins(childProps.newNumBins);
    setBinColor(childProps.newBinColor);
    setLineColor(childProps.newLineColor);
  };

  // states to control axis scales

  let yScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([innerHeight, 0])
    .nice(10);

  let sumScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([innerHeight, 0])
    .nice(10);

  let bins = histogram.bins;
  let tw = 0;
  let bw = 0;
  let xAxisTicksValues = [];
  if (bins.length) {
    bins.forEach((d) => {
      xAxisTicksValues.push(isNaN(d) ? d.min : 0);
    });
    xAxisTicksValues.push(bins[bins.length - 1].max);

    tw = xScale(bins[0].max) - xScale(bins[0].min);
    bw = 0.95 * tw;
  }

  const closeInstance = (closeSignal) => {
    setIsClosed(closeSignal);
  };

  const togglePopover = () => {
    setShowPopup(!showPopup);
  };

  if (!isClosed && data) {
    return (
      <>
        <br></br>
        <div className="container" id={"item" + id}>
          <ItemHeader id={id} text={text} clickToClose={closeInstance} />
          <div className="row mt-3">
            <div className="col-3">
              <SideBar
                dropdownOptions={labels}
                currentMinMax={{
                  min1: params[primarySelectionIdx].min,
                  min2: params[secondarySelectionIdx].min,
                  max1: params[primarySelectionIdx].max,
                  max2: params[secondarySelectionIdx].max,
                }}
                getPrimarySelectionIdx={setPrimarySelectionIdx}
                getSecondarySelectionIdx={setSecondarySelectionIdx}
                getPrimaryFilters={setPrimaryFilters}
                getSecondaryFilters={setSecondaryFilters}
                getPeriodFilters={setPeriodFilters}
              />
            </div>
            <div className="col-9">
              <div className="container ms-3" id="toggle-lines">
                <div class="form-check form-check-inline">
                  <label className="form-check-label" htmlFor="toggle-db">
                    <strong>Chart Metrics</strong>
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    className={"form-check-input"}
                    type={"checkbox"}
                    checked={toggleSum}
                    id="toggle-db"
                    onChange={() => setToggleSum(!toggleSum)}
                  ></input>
                  <label className="form-check-label" htmlFor="toggle-db">
                    Show Sum
                  </label>
                </div>
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
                >
                  <PopoverHeader>Chart Settings</PopoverHeader>
                  <PopoverBody>
                    <ScaleButtons
                      minX={xMin}
                      maxX={xMax}
                      maxY={yMax}
                      numBins={numBins}
                      binColor={binColor}
                      lineColor={lineColor}
                      initialValues={{
                        xmin: params[primarySelectionIdx].min,
                        xmax: params[primarySelectionIdx].max,
                        ymax: histogram.maxHours,
                        numBins: 10,
                        binColor: "lightblue",
                        lineColor: "orange",
                      }}
                      getValues={getValues}
                    />
                  </PopoverBody>
                </Popover>
              </div>

              <div className="row viz" id="histogram">
                <svg width={width} height={height}>
                  <g transform={`translate(${margin.left},${margin.top})`}>
                    {xAxisTicksValues.map((tickVal) => {
                      return (
                        <g transform={`translate(${xScale(tickVal)},0)`}>
                          <line
                            y1={innerHeight + 6}
                            y2={innerHeight}
                            stroke="black"
                          />
                          <text
                            y={innerHeight + 12}
                            dy={"0.71em"}
                            style={{ textAnchor: "middle" }}
                            fontSize={"10pt"}
                            transform={`rotate(${
                              xAxisTicksValues.length >= 20 ? 90 : 0
                            }) translate(${
                              xAxisTicksValues.length >= 20
                                ? innerHeight + 25
                                : 0
                            },${
                              xAxisTicksValues.length >= 20
                                ? -(innerHeight + 15)
                                : 0
                            })`}
                          >
                            {tickVal.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}
                    {yScale.ticks().map((tickVal) => {
                      return (
                        <g transform={`translate(0,${yScale(tickVal)})`}>
                          <line x1={-6} x2={0} stroke="black" />
                          <text
                            x={-12}
                            dy={"0.32em"}
                            style={{ textAnchor: "end" }}
                            fontSize={"10pt"}
                          >
                            {Math.round(tickVal)}
                          </text>
                        </g>
                      );
                    })}
                    {sumScale.ticks().map((tickVal) => {
                      return (
                        toggleSum && (
                          <g transform={`translate(0,${sumScale(tickVal)})`}>
                            <line
                              x1={innerWidth}
                              x2={innerWidth + 6}
                              stroke="black"
                            />
                            <text
                              x={innerWidth + 12}
                              dy={"0.32em"}
                              style={{ textAnchor: "start" }}
                              fontSize={"10pt"}
                            >
                              {Math.round(tickVal) + "%"}
                            </text>
                          </g>
                        )
                      );
                    })}
                    <text
                      id="label-sumAxis"
                      x={0}
                      y={0}
                      transform={`rotate(90) translate(${innerHeight / 2},${
                        -innerWidth - 55
                      })`}
                      textAnchor="middle"
                      fontSize={"12pt"}
                    >
                      {toggleSum ? "Percent of Hours(%)" : ""}
                    </text>

                    <text
                      id="label-yAxis"
                      x={0}
                      y={0}
                      transform={`rotate(-90) translate(${
                        -innerHeight / 2
                      },${-60})`}
                      textAnchor="middle"
                      fontSize={"12pt"}
                    >
                      {"Hours Counts(hrs)"}
                    </text>

                    <text
                      id="label-xAxis"
                      x={innerWidth / 2}
                      y={innerHeight + 55}
                      textAnchor="middle"
                      fontSize={"12pt"}
                    >
                      {labels[primarySelectionIdx].capsUnits}
                    </text>

                    {bins.map((bin) => {
                      return (
                        <rect
                          x={(tw - bw) / 2 + xScale(bin.min)}
                          y={yScale(bin.n)}
                          width={bw}
                          height={innerHeight - yScale(bin.n)}
                          fill={binColor}
                        ></rect>
                      );
                    })}
                    <path
                      fill="None"
                      stroke={toggleSum ? lineColor : "none"}
                      strokeWidth={2}
                      interpolate={"curveCatmullRom"}
                      d={d3
                        .line()
                        .x((d) => xScale(d.min + (d.max - d.min) / 2))
                        .y((d) => sumScale((d.c * 100) / 8760))
                        .curve(d3.curveBasis)(bins)}
                    ></path>
                  </g>
                  <g
                    transform={`translate(${margin.left},${
                      height - margin.bottom + 75
                    })`}
                    id="axis-watermark-histogram"
                  >
                    <WaterMark
                      className={"wtm-text-histogram"}
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
                      numHours={histogram.totalHours}
                      turn={turn}
                      fontSize={12}
                      spacing={15}
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return null;
};
