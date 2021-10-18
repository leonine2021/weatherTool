import { useState, useEffect } from "react";
import NumericInput from "react-numeric-input";

export const ScaleButtons = ({ minX, maxX, maxY, getValues }) => {
  const [newMinX, setNewMinX] = useState(minX);
  const [newMaxX, setNewMaxX] = useState(maxX);
  const [newMaxY, setNewMaxY] = useState(maxY);

  const reset = () => {
    setNewMinX(minX);
    setNewMaxX(maxX);
    setNewMaxY(maxY);
  };

  // update when unit changes
  useEffect(() => {
    setNewMinX(minX);
    setNewMaxX(maxX);
    setNewMaxY(maxY);
  }, [minX, maxX, maxY]);

  useEffect(() => {
    getValues({
      newMinX: newMinX,
      newMaxX: newMaxX,
      newMaxY: newMaxY,
    });
  }, [newMinX, newMaxX, newMaxY]);

  return (
    <>
      <div className="row axis-range-label">
        <span>{"Min. Dry-Bulb Temperature"}</span>
      </div>
      <div className="row axis-range-input">
        <NumericInput
          id="minDB"
          value={newMinX}
          size={5}
          onChange={setNewMinX}
        />
      </div>
      <div className="row axis-range-label mt-3">
        <span>{"Max. Dry-Bulb Temperature"}</span>
      </div>
      <div className="row axis-range-input">
        <NumericInput
          id="maxDB"
          value={newMaxX}
          size={5}
          onChange={setNewMaxX}
        />
      </div>
      <div className="row axis-range-label mt-3">
        <span>{"Max. Humidity Ratio"}</span>
      </div>
      <div className="row axis-range-input">
        <NumericInput
          id="maxHR"
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
    </>
  );
};
