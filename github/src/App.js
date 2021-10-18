import { useState } from "react";
import { AddItem } from "./AddItem";
import { DataDisplay } from "./DataDisplay";
import { DataLoader } from "./DataLoader";

function App() {
  const [itemList, setItemList] = useState([]); // list of visualizations to display
  const [counter, setCounter] = useState(0); // number of items
  const [dataObj, setDataObj] = useState(""); // data from dataloader and pass to the children
  const [weatherStation, setWeatherStation] = useState(""); // weather station name passed from the DataLoader
  const [turn, setTurn] = useState(0);
  const [isMetricUnit, setIsMetricUnit] = useState(true);

  // get data from the child component: DataLoader
  const getData = (childProps) => {
    setDataObj(childProps.dataObj);
    setWeatherStation(childProps.weatherStation);
    setTurn(childProps.turn);
    setIsMetricUnit(childProps.isMetricUnit);
  };

  // get data from the child component: AddItem
  const getText = (buttonText) => {
    let currentCounter = counter;
    currentCounter += 1;
    setCounter(currentCounter);

    let currentList = itemList;
    currentList.push(buttonText);
    setItemList(currentList);
  };

  return (
    <>
      <DataLoader getData={getData} />
      <section className="container mt-3" id="button-area">
        <AddItem text={"Summary"} getText={getText} />
        <AddItem text={"Histogram"} getText={getText} />
        <AddItem text={"Field"} getText={getText} />
        <AddItem text={"Natural Ventilation Potential"} getText={getText} />
        <AddItem text={"Wind Field"} getText={getText} />
        <AddItem text={"Psychrometric Chart"} getText={getText} />
      </section>
      <br></br>
      <DataDisplay
        itemList={itemList}
        dataObj={dataObj}
        weatherStation={weatherStation}
        turn={turn}
        unit={isMetricUnit}
      />
    </>
  );
}

export default App;
