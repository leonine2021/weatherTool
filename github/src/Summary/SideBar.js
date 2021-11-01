import { SaveImgButtons } from "../SaveImgButtons";
import NumericInput from "react-numeric-input";
import { useState, useEffect } from "react";

export const SideBar = ({ unit, getHtClDegrees }) => {
  const [heatingDegree, setHeatingDegree] = useState(unit ? 18 : 18 * 1.8 + 32);
  const [coolingDegree, setCoolingDegree] = useState(unit ? 24 : 24 * 1.8 + 32);
  const [skipCount, setSkipCount] = useState(true);

  useEffect(() => {
    if (skipCount) setSkipCount(false);
    if (!skipCount) {
      if (!unit) {
        setHeatingDegree(Math.round(heatingDegree * 1.8 + 32, 1));
        setCoolingDegree(Math.round(coolingDegree * 1.8 + 32, 1));
      } else {
        setHeatingDegree(Math.round((heatingDegree - 32) / 1.8, 1));
        setCoolingDegree(Math.round((coolingDegree - 32) / 1.8, 1));
      }
    }
  }, [unit]);

  useEffect(() => {
    getHtClDegrees({
      hsp: heatingDegree,
      csp: coolingDegree,
    });
  }, [heatingDegree, coolingDegree]);

  return (
    <div className="row" id="side-bar">
      <label htmlFor="heating-degree">Heating Degree</label>
      <NumericInput
        id="heating-degree"
        value={heatingDegree}
        onChange={setHeatingDegree}
      />
      <label htmlFor="cooling-degree">Cooling Degree</label>
      <NumericInput
        id="cooling-degree"
        value={coolingDegree}
        onChange={setCoolingDegree}
      />
      <SaveImgButtons />
    </div>
  );
};
