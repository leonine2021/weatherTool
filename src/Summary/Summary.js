import { SideBar } from "./SideBar";
import { ItemHeader } from "../ItemHeader";
import { useState, useMemo } from "react";
import * as d3 from "d3";

import { calcValues, getRowLabels, getTableObj, highContrast } from "./utils";

export const Summary = ({ text, id, dataObj, weatherStation, unit, turn }) => {
  const [hsp, setHsp] = useState(unit ? 18 : 18 * 1.8 + 32);
  const [csp, setCsp] = useState(unit ? 24 : 24 * 1.8 + 32);

  const margin = { top: 0, right: 20, bottom: 50, left: 120 };
  const params = dataObj.dataParams;
  const data = dataObj.data;

  const columnLables = [
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
    "Yearly",
  ];

  let rowLabels = getRowLabels(unit, hsp, csp);
  let rowLabelWidth = 200;

  const width = 200 + 65 * columnLables.length;
  const height = 20 * (rowLabels.length + 1);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  let cellH = innerHeight / (rowLabels.length + 1);
  let cellW = (innerWidth - rowLabelWidth) / (columnLables.length + 1);

  let values = calcValues(data, unit, hsp, csp);

  const rscale = d3
    .scaleLinear()
    .domain([0, values.radMax / 2, values.radMax])
    .range(["#FFFF00", "#FF6600", "#d15628"]);
  const rscaleTot = d3
    .scaleLinear()
    .domain([0, values.radMaxTot / 2, values.radMaxTot])
    .range(["#FFFF00", "#FF6600", "#d15628"]);

  let tableObj = useMemo(() => {
    return getTableObj(data, params[3], values, rscale, rscaleTot);
  }, [data, params, values]);

  console.log(tableObj);
  //close button
  const [isClosed, setIsClosed] = useState(false);
  const closeInstance = (closeSignal) => {
    setIsClosed(closeSignal);
  };

  // get data from children
  const getHtClDegrees = (childProps) => {
    setHsp(childProps.hsp);
    setCsp(childProps.csp);
  };

  if (!isClosed) {
    return (
      <>
        <br></br>
        <div className="container" id={"item" + id}>
          <ItemHeader id={id} text={text} clickToClose={closeInstance} />
          <div className="row mt-3">
            <div className="col-3">
              <SideBar unit={unit} getHtClDegrees={getHtClDegrees} />
            </div>
            <div className="col-9">
              <svg width={width} height={height}>
                <g transform={`translate(${margin.left},${margin.top})`}>
                  {rowLabels.map((d, i) => {
                    return (
                      <text
                        x={0}
                        y={(i + 1) * cellH}
                        dx={rowLabelWidth - 5}
                        dy={12.5}
                        textAnchor={"end"}
                        fontSize={12}
                      >
                        {d}
                      </text>
                    );
                  })}
                </g>
                <g transform={`translate(${margin.left},${margin.top})`}>
                  {tableObj.map((d, i) => {
                    return (
                      <g id="table-row">
                        {d.map((dd, ii) => {
                          return (
                            <rect
                              x={rowLabelWidth + ii * cellW}
                              y={(i + 1) * cellH}
                              width={cellW}
                              height={cellH}
                              fill={dd.f}
                            ></rect>
                          );
                        })}
                      </g>
                    );
                  })}
                  {tableObj.map((d, i) => {
                    return (
                      <g id="table-text">
                        {d.map((dd, ii) => {
                          return (
                            <text
                              x={rowLabelWidth + ii * cellW}
                              y={(i + 1) * cellH}
                              width={cellW}
                              dx={5}
                              dy={12.5}
                              textAnchor={"start"}
                              fontSize={10}
                              fill={highContrast(dd.f)}
                              fontWeight={"bold"}
                            >
                              {dd.v}
                            </text>
                          );
                        })}
                      </g>
                    );
                  })}
                </g>
                <g transform={`translate(${margin.left},${margin.top})`}>
                  <text
                    x={195}
                    y={innerHeight + 20}
                    textAnchor={"end"}
                    fontSize={12}
                  >{`Station Name: ${weatherStation}`}</text>
                  <text
                    x={195}
                    y={innerHeight + 40}
                    textAnchor={"end"}
                    fontSize={12}
                  >{`Turn: ${turn} degrees`}</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </>
    );
  } else return null;
};
