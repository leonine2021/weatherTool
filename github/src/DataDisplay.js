// Component to display visualizations in the itemList

import { Field } from "./FieldChart/Field";
import { Histogram } from "./Histogram/Histogram";
import { NV } from "./NvPotential/NV";
import { PsyChart } from "./Psychrometric/PsyChart";
import { Summary } from "./Summary/Summary";
import { WindField } from "./WindField/WindField";

export const DataDisplay = ({
  itemList,
  dataObj,
  weatherStation,
  turn,
  unit,
}) => {
  return (
    <div className="container" id="items">
      {itemList.map((d, i) => {
        switch (d) {
          case "Summary":
            return (
              dataObj && (
                <Summary
                  key={"summary" + i}
                  text={d}
                  id={i}
                  dataObj={dataObj}
                  weatherStation={weatherStation}
                  turn={turn}
                  unit={unit}
                />
              )
            );
          case "Field":
            return (
              dataObj && (
                <Field
                  key={"field" + i}
                  text={d}
                  id={i}
                  dataObj={dataObj}
                  weatherStation={weatherStation}
                  turn={turn}
                />
              )
            );
          case "Natural Ventilation Potential":
            return (
              dataObj && (
                <NV
                  key={"nv" + i}
                  text={d}
                  id={i}
                  dataObj={dataObj}
                  weatherStation={weatherStation}
                  unit={unit}
                  turn={turn}
                />
              )
            );
          case "Histogram":
            // if (dataObj) {

            // } else return null;
            return (
              dataObj && (
                <Histogram
                  key={"histogram" + i}
                  text={d}
                  id={i}
                  dataObj={dataObj}
                  weatherStation={weatherStation}
                  unit={unit}
                  turn={turn}
                />
              )
            );
          case "Wind Field":
            if (dataObj) {
              return (
                <WindField
                  key={"WindField" + i}
                  text={d}
                  id={i}
                  dataObj={dataObj}
                  weatherStation={weatherStation}
                  unit={unit}
                />
              );
            } else return null;
          case "Psychrometric Chart":
            if (dataObj) {
              return (
                <PsyChart
                  key={"Psychrometric Chart" + i}
                  text={d}
                  id={i}
                  dataObj={dataObj}
                  weatherStation={weatherStation}
                  unit={unit}
                />
              );
            } else return null;
          default:
            return null;
        }
      })}
    </div>
  );
};
