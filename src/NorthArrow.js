// component: north arrow

import NumericInput from "react-numeric-input";
import { useState, useEffect } from "react";

export const NorthArrow = ({ getTurn }) => {
  const [turn, setTurn] = useState(0);

  const onNumericInputChange = (value) => {
    setTurn(value);
  };

  // pass turn to the parent
  useEffect(() => {
    getTurn(turn);
  }, [turn]);

  return (
    <>
      <div className="col-3">
        <NumericInput
          min={-45}
          max={45}
          value={turn}
          size={2}
          onChange={onNumericInputChange}
        />
      </div>
      <div className="col-6">
        <svg id="sqr" width="35px" height="80px" transform={`rotate(${turn})`}>
          <rect
            x="0"
            y="15"
            width="35"
            height="45"
            stroke="black"
            fill="white"
            strokeWidth="2pt"
          ></rect>
          <line
            x1="17.5px"
            y1="15px"
            x2="17.5px"
            y2="37.5px"
            stroke="black"
            strokeWidth="1pt"
          ></line>
          <text x="17.5" y="11" textAnchor="middle">
            N
          </text>
        </svg>
      </div>
    </>
  );
};
