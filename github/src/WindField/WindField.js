import { SideBar } from "./SideBar";
import { ItemHeader } from "../ItemHeader";
import { useState, useMemo } from "react";
import * as d3 from "d3";

export const WindField = ({ text, id, dataObj, weatherStationn, unit }) => {
  const [periodFilters, setPeriodFilters] = useState({
    startDate: 1,
    endDate: 365,
    startHour: 1,
    endHour: 24,
  });
  const margin = { top: 10, right: 50, bottom: 50, left: 40 };
  const params = dataObj.dataParams;
  const data = dataObj.data;

  const months = [
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
  ];

  const width = 1000;
  const height = 900;

  const innerWidth = width - margin.left - margin.right;

  //close button
  const [isClosed, setIsClosed] = useState(false);
  const closeInstance = (closeSignal) => {
    setIsClosed(closeSignal);
  };

  const getDisplayIdx = (fiter) => {
    let inds = [];
    for (let i = fiter.startDate; i < fiter.endDate + 1; i++) {
      for (let j = fiter.startHour; j < fiter.endHour + 1; j++) {
        inds.push((i - 1) * 24 + j);
      }
    }
    return inds;
  };

  let displayIdx = useMemo(() => {
    return getDisplayIdx(periodFilters);
  }, [periodFilters]);

  let max = params[4].max < 12.5 ? 12.5 : params[4].max;
  let dotRadius = 5;

  const radScale = d3
    .scaleLinear()
    .domain([0, max])
    .range([0, 5 * dotRadius]);

  const numSection = 3;
  const maxNumCols = 8760 / numSection;
  const sectionDistance = 250;
  const colorScale = params[3].colorScale;

  const getSectionIdx = (idx, maxNumCols) => {
    return Math.floor(idx / maxNumCols);
  };

  const dataPoints = (
    i,
    temp,
    spd,
    dir,
    sectionIdx,
    sectionDistance,
    dotRadius,
    maxNumCols,
    a,
    b
  ) => {
    let pts = [
      { x: 1, y: -1 },
      { x: -1, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: -1 },
    ];
    let o = (25 * 3.1415) / 180;
    return {
      id: i,
      spd: spd,
      tri: pts.map((pel) => {
        return {
          x:
            Math.floor((i - sectionIdx * maxNumCols) / 24) * a * dotRadius +
            pel.x * Math.sin(o) * b * radScale(spd),
          y:
            (i % 24) * a * dotRadius +
            sectionDistance * sectionIdx +
            pel.y * Math.cos(o) * b * radScale(spd),
        };
      }),
      temp: temp,
      rot: `rotate(${dir},${
        Math.floor((i - sectionIdx * maxNumCols) / 24) * a * dotRadius
      },${(i % 24) * a * dotRadius + sectionDistance * sectionIdx})`,
    };
  };

  let displayData = data.map((d, i) => {
    if (displayIdx.includes(i)) {
      return dataPoints(
        i,
        d.data[3],
        d.data[4],
        d.data[6],
        getSectionIdx(i, maxNumCols),
        sectionDistance,
        dotRadius,
        maxNumCols,
        1.545,
        0.7
      );
    } else {
      return dataPoints(i, 0, 0, 0, 0, 0, 0);
    }
  });

  //   console.log(displayData);
  //water marks
  let spacing = 20;
  let xPos = 100;
  let yPos = 780;
  let speeds = [0.5, 3.5, 6.5, 9.5, 12.5];
  let wunit = "m/s";
  if (!unit) {
    speeds = [1.1, 7.8, 14.5, 21.3, 28];
    wunit = "mph";
  }
  let legendData = speeds.map((d, i) =>
    dataPoints(
      i,
      0,
      d,
      90,
      0,
      getSectionIdx(i, 1),
      spacing,
      dotRadius,
      1,
      1.58,
      0.8
    )
  );

  //legend temperature

  let tMin = params[3].min;
  let tMax = params[3].max;

  function a(d, l) {
    return tMin + (d * (tMax - tMin)) / l;
  }
  let n = [0, 1, 2, 3, 4];
  let bounds = n.map((d) => (a(d, n.length) + a(d + 1, n.length)) / 2);

  let tunit = "C";
  if (!unit) tunit = "F";
  let texts = n.map(
    (d) =>
      `${Math.round(a(d, n.length) * 10) / 10} to ${
        Math.round(a(d + 1, n.length) * 10) / 10
      } ${tunit}`
  );

  if (!isClosed) {
    return (
      <>
        <br></br>
        <div className="container" id={"item" + id}>
          <ItemHeader id={id} text={text} clickToClose={closeInstance} />
          <div className="row mt-3">
            <div className="col-3">
              <SideBar getPeriodFilters={setPeriodFilters} />
            </div>
            <div className="col-9">
              <svg width={width} height={height}>
                <g
                  id="axis-months"
                  transform={`translate(${margin.left},${margin.top})`}
                >
                  {months.map((d, i) => {
                    return (
                      <text
                        x={((i - getSectionIdx(i, 4) * 4) * innerWidth) / 4}
                        y={(getSectionIdx(i, 4) + 1) * 250 - 40}
                        textAnchor={"start"}
                        fontSize={12}
                      >
                        {d}
                      </text>
                    );
                  })}
                </g>
                <g id="axis-hours" transform={`translate(0,${margin.top})`}>
                  {["0", "12h", "24h"].map((d, i) => {
                    return (
                      <text
                        x={30}
                        y={i * 90}
                        dy={"0.32em"}
                        textAnchor={"end"}
                        fontSize={12}
                      >
                        {d}
                      </text>
                    );
                  })}
                  {["0", "12h", "24h"].map((d, i) => {
                    return (
                      <text
                        x={30}
                        y={i * 90 + 250}
                        dy={"0.32em"}
                        textAnchor={"end"}
                        fontSize={12}
                      >
                        {d}
                      </text>
                    );
                  })}
                  {["0", "12h", "24h"].map((d, i) => {
                    return (
                      <text
                        x={30}
                        y={i * 90 + 250 * 2}
                        dy={"0.32em"}
                        textAnchor={"end"}
                        fontSize={12}
                      >
                        {d}
                      </text>
                    );
                  })}
                </g>
                <g transform={`translate(${margin.left},${margin.top})`}>
                  {displayData.map((d, i) => {
                    return (
                      <path
                        d={d3
                          .line()
                          .x((d) => d.x)
                          .y((d) => d.y)(d.tri)}
                        transform={d.rot}
                        fill={colorScale(d.temp)}
                      ></path>
                    );
                  })}
                </g>
                <g
                  id="windField-legend"
                  transform={`translate(${margin.left}, ${margin.top})`}
                >
                  <text
                    x={xPos - 100}
                    y={yPos - 40}
                    dy={"0.79em"}
                    fontStyle={"bold"}
                  >
                    {"Legend"}
                  </text>
                  {speeds.map((d, i) => {
                    return (
                      <text
                        x={xPos}
                        y={yPos + i * spacing}
                      >{`${d} ${wunit}`}</text>
                    );
                  })}
                  {legendData.map((d, i) => {
                    return (
                      <path
                        d={d3
                          .line()
                          .x((d) => d.x)
                          .y((d) => d.y)(d.tri)}
                        transform={
                          ` translate(${margin.left + xPos - 100}, ${
                            margin.top + yPos - 20
                          }) ` + d.rot
                        }
                        fill={"gray"}
                      ></path>
                    );
                  })}
                  {bounds.map((d, i) => {
                    return (
                      <rect
                        x={xPos + 100}
                        y={yPos + i * spacing - 10}
                        width={10}
                        height={10}
                        fill={params[3].colorScale(d)}
                      >
                        {d}
                      </rect>
                    );
                  })}
                  {texts.map((d, i) => {
                    return (
                      <text x={xPos + 120} y={yPos + i * spacing}>
                        {d}
                      </text>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </>
    );
  } else return null;
};
