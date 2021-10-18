import NumericInput from "react-numeric-input";
import * as d3 from "d3";
import { useState, useEffect } from "react";
import { updateDiscreteColors, updateBinColors } from "./calColors";

export const PrimaryLegend = ({
  min,
  max,
  bounds,
  colorScale,
  getDataFromChild,
}) => {
  let discreteColors = updateDiscreteColors(min, max, bounds, colorScale);
  let binColors = updateBinColors(min, max, 20, colorScale);
  let legendRectSize = 7.5;
  let svgWidth = 80;
  let svgHeight = 150;
  let margin = { left: 0, top: 3, right: 0, bottom: 3 };
  let innerHeight = svgHeight - margin.top - margin.bottom;

  const [continuous, setContinuous] = useState(true);
  const [newMin, setNewMin] = useState(min);
  const [newMax, setNewMax] = useState(max);
  const [newUppper, setNewUpper] = useState(bounds[3]);
  const [newThird, setNewThird] = useState(bounds[2]);
  const [newSecond, setNewSecond] = useState(bounds[1]);
  const [newLower, setNewLower] = useState(bounds[0]);
  const [newBounds, setNewBounds] = useState(bounds);
  const [isEven, setIsEven] = useState(false);

  // update min,max, bounds when primary selection change
  useEffect(() => {
    setNewLower(bounds[0]);
    setNewSecond(bounds[1]);
    setNewThird(bounds[2]);
    setNewUpper(bounds[3]);
    setNewMin(min);
    setNewMax(max);
  }, [bounds]);

  // update bounds when number inputs change
  useEffect(() => {
    setNewBounds([newLower, newSecond, newThird, newUppper]);
  }, [newLower, newSecond, newThird, newUppper]);

  // pass the new min, max, bounds, continuity to the parent level
  useEffect(() => {
    getDataFromChild({
      newMax: newMax,
      newMin: newMin,
      newBounds: newBounds,
      continuous: continuous,
    });
  }, [newMax, newMin, newBounds, continuous]);

  const toggleDiscrete = () => {
    setContinuous(!continuous);
  };

  const toggleEvenSpace = () => {
    setIsEven(!isEven);
  };

  let legendScale = d3.scaleLinear().domain([max, min]).range([0, innerHeight]);

  //handle even distribution
  useEffect(() => {
    if (isEven) {
      setNewLower(newMin + (newMax - newMin) / 5);
      setNewSecond(newMin + ((newMax - newMin) * 2) / 5);
      setNewThird(newMin + ((newMax - newMin) * 3) / 5);
      setNewUpper(newMin + ((newMax - newMin) * 4) / 5);
    }
  }, [isEven, newMax, newMin]);

  return (
    <>
      <div className="row" id="continue-or-discrete">
        <div className="col-6">
          <input
            type={"checkbox"}
            checked={continuous}
            id="continue"
            onChange={toggleDiscrete}
          ></input>
          <label htmlFor="continue">Continuous</label>
        </div>
        <div className="col-6">
          <input
            type={"checkbox"}
            id="discrete"
            checked={!continuous}
            onChange={toggleDiscrete}
          ></input>
          <label htmlFor="discrete">Discrete</label>
        </div>
      </div>
      <div className="row mt-3" id="primary-legend-area">
        <div className="col-8" id="min-max-bounds">
          <div className="row numeric-input">
            <div className="col-8">
              <label>Max: </label>
            </div>
            <div className="col-4">
              <NumericInput
                size={3}
                min={newUppper}
                max={max}
                value={newMax.toFixed(1)}
                onChange={setNewMax}
              />
            </div>
          </div>
          <div className="row numeric-input">
            <div className="col-8">
              <label>Upper Bound: </label>
            </div>
            <div className="col-4">
              <NumericInput
                size={3}
                min={newThird}
                max={newMax}
                disabled={isEven}
                value={newUppper.toFixed(1)}
                onChange={setNewUpper}
              />
            </div>
          </div>
          <div className="row numeric-input">
            <div className="col-8">
              <label>Third Bound:</label>
            </div>
            <div className="col-4">
              <NumericInput
                size={3}
                min={newSecond}
                max={newUppper}
                disabled={isEven}
                value={newThird.toFixed(1)}
                onChange={setNewThird}
              />
            </div>
          </div>

          <div className="row numeric-input">
            <div className="col-8">
              <label>Second Bound:</label>
            </div>
            <div className="col-4">
              <NumericInput
                size={3}
                min={newLower}
                max={newThird}
                disabled={isEven}
                value={newSecond.toFixed(1)}
                onChange={setNewSecond}
              />
            </div>
          </div>
          <div className="row numeric-input">
            <div className="col-8">
              <label>Lower Bound: </label>
            </div>
            <div className="col-4">
              <NumericInput
                size={3}
                min={newMin}
                max={newSecond}
                disabled={isEven}
                value={newLower.toFixed(1)}
                onChange={setNewLower}
              />
            </div>
          </div>
          <div className="row numeric-input">
            <div className="col-8">
              <label>Min: </label>
            </div>
            <div className="col-4">
              <NumericInput
                size={3}
                min={min}
                max={newLower}
                value={newMin.toFixed(1)}
                onChange={setNewMin}
              />
            </div>
          </div>
        </div>
        <div className="col-4" id="primary-legend">
          <div className="row ms-1">
            <svg
              width={svgWidth}
              height={svgHeight}
              className="primary-legend-bars"
            >
              <g
                className="discrete-color-legend"
                transform={`translate(${margin.left},${margin.top})`}
              >
                <rect
                  x={10}
                  y={legendScale(newMax)}
                  width={legendRectSize}
                  height={legendScale(newBounds[3]) - legendScale(newMax)}
                  fill={discreteColors[4]}
                ></rect>
                <rect
                  x={10}
                  y={legendScale(newBounds[3])}
                  width={legendRectSize}
                  height={legendScale(newBounds[2]) - legendScale(newBounds[3])}
                  fill={discreteColors[3]}
                ></rect>
                <rect
                  x={10}
                  y={legendScale(newBounds[2])}
                  width={legendRectSize}
                  height={legendScale(newBounds[1]) - legendScale(newBounds[2])}
                  fill={discreteColors[2]}
                ></rect>
                <rect
                  x={10}
                  y={legendScale(newBounds[1])}
                  width={legendRectSize}
                  height={legendScale(newBounds[0]) - legendScale(newBounds[1])}
                  fill={discreteColors[1]}
                ></rect>
                <rect
                  x={10}
                  y={legendScale(newBounds[0])}
                  width={legendRectSize}
                  height={legendScale(newMin) - legendScale(newBounds[0])}
                  fill={discreteColors[0]}
                ></rect>
              </g>
              <g
                className="continuous-color-legend"
                transform={`translate(${margin.left + 62.5},${margin.top})`}
              >
                {binColors.map((c, i) => {
                  return (
                    <rect
                      x={0}
                      y={(innerHeight / 20) * (binColors.length - 1 - i)}
                      width={innerHeight / 20}
                      height={innerHeight / 20}
                      fill={c}
                    ></rect>
                  );
                })}
                <text
                  x={-3}
                  y={0}
                  dy={"0.79em"}
                  textAnchor={"end"}
                  fontSize="8pt"
                >
                  {max.toFixed(1)}
                </text>
                <text
                  x={-3}
                  y={innerHeight - 9}
                  dy={"0.79em"}
                  textAnchor={"end"}
                  fontSize="8pt"
                >
                  {min.toFixed(1)}
                </text>
                <line
                  x1={-2}
                  y1={legendScale(newMax)}
                  x2={innerHeight / 20 + 2}
                  y2={legendScale(newMax)}
                  stroke="black"
                  strokeWidth={2}
                  id="mark-top"
                ></line>
                <line
                  x1={-2}
                  y1={legendScale(newMin)}
                  x2={innerHeight / 20 + 2}
                  y2={legendScale(newMin)}
                  stroke="black"
                  strokeWidth={2}
                  id="mark-bottom"
                ></line>
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div className="row mt-1" id="even-space">
        <div className="col-1">
          <input type={"checkbox"} id="even" onChange={toggleEvenSpace}></input>
        </div>
        <div className="col-10">
          <label htmlFor="even">Evenly Spaced Bounds</label>
        </div>
      </div>
    </>
  );
};
