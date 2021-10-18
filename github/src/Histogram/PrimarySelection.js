import NumericInput from "react-numeric-input";
import { useState, useEffect } from "react";

export const PrimarySelection = ({
  dropdownOptions,
  currentMinMax,
  onSelectValueChange,
  getDataFromPrimarySelection,
}) => {
  let min = currentMinMax.min1;
  let max = currentMinMax.max1;
  let optionValueList = dropdownOptions.map((d) => d.noncaps);
  const [selectedValue, setSelectedValue] = useState("temperature");

  const [newMin, setNewMin] = useState(min);
  const [newMax, setNewMax] = useState(max);

  // change the new min, max when the Primary selection updates
  useEffect(() => {
    setNewMax(max);
    setNewMin(min);
  }, [selectedValue, min, max]);

  // pass the new min, max to the parent level
  useEffect(() => {
    getDataFromPrimarySelection({
      newMin: newMin,
      newMax: newMax,
    });
  }, [newMin, newMax]);

  return (
    <>
      <label htmlFor="data-options" id="Primary-label">
        <strong>Primary Selection Criteria</strong>
      </label>
      <select
        className="form-control"
        id={"data-options"}
        value={selectedValue}
        onChange={(e) => {
          onSelectValueChange(optionValueList.indexOf(e.target.value));
          setSelectedValue(e.target.value);
        }}
      >
        {dropdownOptions.map((l) => {
          return (
            <option key={l.caps} value={l.noncaps}>
              {l.capsUnits}
            </option>
          );
        })}
      </select>
      <br></br>
      <div className="row numeric-input mt-3">
        <div className="col-5">
          <label>Max: </label>
        </div>
        <div className="col-7 button">
          <NumericInput
            size={3}
            min={newMin}
            max={max}
            value={newMax}
            onChange={setNewMax}
          />
        </div>
      </div>
      <div className="row numeric-input">
        <div className="col-5">
          <label>Min: </label>
        </div>
        <div className="col-7 button">
          <NumericInput
            size={3}
            min={min}
            max={newMax}
            value={newMin}
            onChange={setNewMin}
          />
        </div>
      </div>
    </>
  );
};
