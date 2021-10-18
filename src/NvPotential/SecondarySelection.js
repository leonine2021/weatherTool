import NumericInput from "react-numeric-input";
import { useState, useEffect } from "react";

export const SecondarySelection = ({
  dropdownOptions,
  currentMinMax,
  // onSelectValueChange,
  getDataFromSecondarySelection,
}) => {
  const hr_lower = 2;
  const hr_upper = 12;

  const selectedValue = "humidity ratio";

  const [newMin, setNewMin] = useState(hr_lower);
  const [newMax, setNewMax] = useState(hr_upper);

  // change the new min, max when the secondary selection updates
  // useEffect(() => {
  //   setNewMax(max);
  //   setNewMin(min);
  // }, [selectedValue]);

  // pass the new min, max to the parent level
  useEffect(() => {
    getDataFromSecondarySelection({
      newMin: newMin,
      newMax: newMax,
    });
  }, [newMin, newMax]);

  return (
    <>
      <label htmlFor="data-options" id="secondary-label">
        <strong>Secondary Selection Criteria</strong>
      </label>
      <select
        className="form-control"
        id={"data-options"}
        value={selectedValue}
        disabled={true}
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
            value={newMax}
            onChange={setNewMax}
            step={0.1}
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
            max={newMax}
            value={newMin}
            onChange={setNewMin}
            step={0.1}
          />
        </div>
      </div>
    </>
  );
};
