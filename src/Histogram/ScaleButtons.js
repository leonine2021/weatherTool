import { useState, useEffect } from "react";
import NumericInput from "react-numeric-input";

export const ScaleButtons = ({
  minX,
  maxX,
  maxY,
  numBins,
  binColor,
  lineColor,
  initialValues,
  getValues,
}) => {
  const [newMinX, setNewMinX] = useState(minX);
  const [newMaxX, setNewMaxX] = useState(maxX);
  const [newMaxY, setNewMaxY] = useState(maxY);
  const [newNumBins, setNewNumBins] = useState(numBins);
  const [newBinColor, setNewBinColor] = useState(binColor);
  const [newLineColor, setNewLineColor] = useState(lineColor);

  useEffect(() => {
    getValues({
      newMinX: newMinX,
      newMaxX: newMaxX,
      newMaxY: newMaxY,
      newNumBins: newNumBins,
      newBinColor: newBinColor,
      newLineColor: newLineColor,
    });
  }, [newMinX, newMaxX, newMaxY, newNumBins, newBinColor, newLineColor]);

  const reset = () => {
    setNewMinX(initialValues.xmin);
    setNewMaxX(initialValues.xmax);
    setNewMaxY(initialValues.ymax);
    setNewNumBins(initialValues.numBins);
    setNewBinColor(initialValues.binColor);
    setNewLineColor(initialValues.lineColor);
  };

  return (
    <>
      <div className="row axis-range-label">
        <span>{"Set X Axis Lower Limit"}</span>
      </div>
      <div className="row axis-range-input">
        <NumericInput
          id="minX"
          value={newMinX}
          size={5}
          onChange={setNewMinX}
        />
      </div>
      <div className="row axis-range-label mt-3">
        <span>{"Set X Axis upper Limit"}</span>
      </div>
      <div className="row axis-range-input">
        <NumericInput
          id="maxX"
          value={newMaxX}
          size={5}
          onChange={setNewMaxX}
        />
      </div>
      <div className="row axis-range-label mt-3">
        <span>{"Set Number of Bins"}</span>
      </div>
      <div className="row axis-range-input">
        <NumericInput
          id="numbin"
          value={newNumBins}
          min={1}
          size={5}
          onChange={setNewNumBins}
        />
      </div>
      <div className="row axis-range-label mt-3">
        <span>{"Set Y Axis Upper Limit"}</span>
      </div>
      <div className="row axis-range-input">
        <NumericInput
          id="maxY"
          value={newMaxY}
          size={5}
          onChange={setNewMaxY}
        />
      </div>
      <div className="input-group mt-3">
        <button className={"btn btn-secondary"} onClick={reset}>
          {"Reset"}
        </button>
      </div>
      <div className="row axis-range-label mt-3">
        <span>{"Set Bin Color"}</span>
      </div>
      <div className="row axis-range-input">
        <input
          className="form-control"
          type="color"
          id="colorpicker-bin"
          onChange={(e) => {
            setNewBinColor(e.target.value);
          }}
        ></input>
      </div>
      <div className="row axis-range-label mt-3">
        <span>{"Set Line Color"}</span>
      </div>
      <div className="row axis-range-input">
        <input
          className="form-control"
          type="color"
          id="colorpicker-line"
          onChange={(e) => {
            setNewLineColor(e.target.value);
          }}
        ></input>
      </div>
    </>
  );
};
