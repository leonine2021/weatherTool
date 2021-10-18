// Component to load weather data from weather files in .109 format
// Display some meta data about the weather file
import { useState, useEffect } from "react";
import { NorthArrow } from "./NorthArrow";
import { prepareData, turnData } from "./prepareData";
import { ToggleSwitch } from "./ToggleSwitch";

export const DataLoader = ({ getData }) => {
  const [weatherStation, setWeatherStation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [gmt, setGmt] = useState("");
  const [isMetricUnit, setIsMetricUnit] = useState(true);
  const [turn, setTurn] = useState(0);

  const [dataString, setDataString] = useState("");
  const [dataObj, setDataObj] = useState(null);

  //function to load data from local files, initialize data object
  const loadData = (e) => {
    let file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = () => {
      let fileName = file.name;
      let currentWeatherStationName = fileName.slice(0, fileName.indexOf("."));
      setWeatherStation(currentWeatherStationName);
      let currentDataString = reader.result;
      setDataString(currentDataString);
      let currentDataObj = prepareData(currentDataString, isMetricUnit);
      setDataObj(currentDataObj);
      setLatitude(currentDataObj.location.latitude);
      setLongitude(currentDataObj.location.longitude);
      setGmt(currentDataObj.location.gmt);
    };
    reader.readAsText(file);
  };

  const getUnit = (childProps) => {
    setIsMetricUnit(childProps);
  };

  const getTurn = (childProps) => {
    setTurn(childProps);
  };

  // update data when unit or turn changes
  useEffect(() => {
    if (dataObj && typeof turn == "number") {
      let newDataObj1 = prepareData(dataString, isMetricUnit);
      let newDataObj2 = turnData(newDataObj1.data, turn, isMetricUnit);
      setDataObj(newDataObj2);
    }
  }, [isMetricUnit, turn]);

  // pass data to the parent component: App
  useEffect(() => {
    getData({
      dataObj: dataObj,
      weatherStation: weatherStation,
      isMetricUnit: isMetricUnit,
      turn: turn,
    });
  }, [dataObj, isMetricUnit, turn]);

  // get the orientation angle from the child component: NorthArrow
  return (
    <>
      <div className="container mt-6" id="data-loader">
        <div className="row" id="load-button">
          <div className="col-6">
            <p>
              <strong>Load Weather files (*.109):</strong>
            </p>
          </div>
          <div className="col-6">
            <input
              type="file"
              className="form-control"
              text="Choose Weather File"
              onChange={loadData}
            ></input>
          </div>
        </div>
        <div className="row">
          <p id="data-loaded-text">
            {dataObj ? "Data Loaded!" : "Data Not Loaded..."}
          </p>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <div className="row" id="unit">
              <div className="col-3">
                <p>
                  <strong>Unit:</strong>
                </p>
              </div>
              <div className="col-9">
                <ToggleSwitch label={"unit-switch"} getUnit={getUnit} />
              </div>
            </div>
            <div className="row" id="orientation">
              <div className="col-3">
                <p>
                  <strong>Orientation:</strong>
                </p>
              </div>
              <NorthArrow getTurn={getTurn} />
            </div>
          </div>
          <div className="col-6">
            <div className="row" id="weather-station">
              <div className="col-3">
                <p>
                  <strong>Weather Station:</strong>
                </p>
              </div>
              <div className="col-9">
                <span>{weatherStation}</span>
              </div>
            </div>
            <div className="row" id="latitude">
              <div className="col-3">
                <p>
                  <strong>Latitude:</strong>
                </p>
              </div>
              <div className="col-9">
                <span>{latitude + "°N"}</span>
              </div>
            </div>
            <div className="row" id="longitude">
              <div className="col-3">
                <p>
                  <strong>Longitude:</strong>
                </p>
              </div>
              <div className="col-9">
                <span>{longitude + "°E"}</span>
              </div>
            </div>
            <div className="row" id="gmt">
              <div className="col-3">
                <p>
                  <strong>GMT:</strong>
                </p>
              </div>
              <div className="col-9">
                <span>{"GMT " + gmt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
