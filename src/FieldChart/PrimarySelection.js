import { PrimaryLegend } from "./PrimaryLegend";
import { useState } from "react";

export const PrimarySelection = ({
  dropdownOptions,
  currentMinMax,
  bounds,
  colorScale,
  onSelectValueChange,
  getDataFromPrimarySelection,
}) => {
  let optionValueList = dropdownOptions.map((d) => d.noncaps);
  const [selectedValue, setSelectedValue] = useState("temperature");

  return (
    <>
      <label htmlFor="data-options" id="primary-label">
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
      <PrimaryLegend
        min={currentMinMax.min1}
        max={currentMinMax.max1}
        bounds={bounds}
        colorScale={colorScale}
        getDataFromChild={getDataFromPrimarySelection}
      />
    </>
  );
};
