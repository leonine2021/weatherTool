// Component of numeric input group, setting display date and time

import NumericInput from "react-numeric-input";
import { useState, useEffect } from "react";

export const NumericField = ({ getNumericInputs }) => {
  const [startHourVal, setStartHourVal] = useState(0);
  const [endHourVal, setEndHourVal] = useState(23);
  const [startDateVal, setStartDateVal] = useState(1);
  const [endDateVal, setEndDateVal] = useState(365);

  // pass states to parent
  useEffect(() => {
    getNumericInputs({
      startHour: startHourVal,
      endHour: endHourVal,
      startDate: startDateVal,
      endDate: endDateVal,
    });
  }, [startHourVal, endHourVal, startDateVal, endDateVal]);

  return (
    <>
      <label className="row mt-3" id="period-label">
        <strong>Display Periods</strong>
      </label>
      <div className="row period">
        <div className="col-5">
          <label className="nice-text" htmlFor="end-hour">
            End Hour
          </label>
        </div>
        <div className="col-4 button">
          <NumericInput
            id="end-hour"
            min={0}
            max={23}
            value={endHourVal}
            size={3}
            onChange={setEndHourVal}
          />
        </div>
      </div>

      <div className="row period">
        <div className="col-5">
          <label className="nice-text" htmlFor="start-hour">
            Start Hour
          </label>
        </div>
        <div className="col-4 button">
          <NumericInput
            id="start-hour"
            min={0}
            max={23}
            value={startHourVal}
            size={3}
            onChange={setStartHourVal}
          />
        </div>
      </div>
      <div className="row period">
        <div className="col-5">
          <label className="nice-text" htmlFor="end-date">
            End Day
          </label>
        </div>
        <div className="col-4 button">
          <NumericInput
            id="end-date"
            min={1}
            max={365}
            value={endDateVal}
            size={3}
            onChange={setEndDateVal}
          />
        </div>
        <div className="col-3">
          <label className="date">{dayToDate(endDateVal)}</label>
        </div>
      </div>
      <div className="row period">
        <div className="col-5">
          <label className="nice-text" htmlFor="start-date">
            Start Day
          </label>
        </div>
        <div className="col-4 button">
          <NumericInput
            id="start-date"
            min={1}
            max={365}
            value={startDateVal}
            size={3}
            onChange={setStartDateVal}
          />
        </div>
        <div className="col-3">
          <label className="date">{dayToDate(startDateVal)}</label>
        </div>
      </div>
    </>
  );
};

export const dayToDate = (day) => {
  if (day > 0 && day <= 31)
    //Jan
    return `Jan.${day}`;
  else if (day > 31 && day <= 59)
    // Feb
    return `Feb.${day - 31}`;
  else if (day > 59 && day <= 90)
    //Mar
    return `Mar.${day - 59}`;
  else if (day > 90 && day <= 120)
    //Apr
    return `Apr.${day - 90}`;
  else if (day > 120 && day <= 151)
    //May
    return `May.${day - 120}`;
  else if (day > 151 && day <= 181)
    //Jun
    return `Jun.${day - 151}`;
  else if (day > 181 && day <= 212)
    //Jul
    return `Jul.${day - 181}`;
  else if (day > 212 && day <= 243)
    //Aug
    return `Aug.${day - 212}`;
  else if (day > 243 && day <= 273)
    //Sep
    return `Sep.${day - 243}`;
  else if (day > 273 && day <= 304)
    //Oct
    return `Oct.${day - 273}`;
  else if (day > 304 && day <= 334)
    //Nov
    return `Nov.${day - 304}`;
  else if (day > 334 && day <= 365)
    //Dec
    return `Dec.${day - 334}`;
  else if (day <= 0)
    //Dec
    return `Jan.1`;
};
