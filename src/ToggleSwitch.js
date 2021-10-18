import React, { useState, useEffect } from "react";
import "./ToggleSwitch.css";

export const ToggleSwitch = ({ label, getUnit }) => {
  const [isMetricUnit, setIsMetricUnit] = useState(true);

  const changeUnits = () => {
    setIsMetricUnit(!isMetricUnit);
  };

  // pass unit to the parent
  useEffect(() => {
    getUnit(isMetricUnit);
  }, [isMetricUnit]);

  return (
    <div className="row">
      <div className="col-4">
        <div className="toggle-switch">
          <input
            type="checkbox"
            className="checkbox"
            name={label}
            id={label}
            onClick={changeUnits}
          />
          <label className="label" htmlFor={label}>
            <span className="inner" />
            <span className="switch" />
          </label>
        </div>
      </div>
      <div className="col-8">
        <p id="unitsHighlight">{isMetricUnit ? "Metrics" : "Imperial"}</p>
      </div>
    </div>
  );
};
