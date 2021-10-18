import { NumericField } from "../NumericalField";
import { PrimarySelection } from "./PrimarySelection";
import { SecondarySelection } from "./SecondarySelection";
import { SaveImgButtons } from "../SaveImgButtons";

export const SideBar = ({
  dropdownOptions,
  currentMinMax,
  bounds,
  colorScale,
  getPrimaryFilters,
  getSecondaryFilters,
  getPeriodFilters,
  unit,
}) => {
  return (
    <div className="row" id="side-bar">
      <PrimarySelection
        dropdownOptions={dropdownOptions}
        currentMinMax={currentMinMax}
        bounds={bounds}
        colorScale={colorScale}
        getDataFromPrimarySelection={getPrimaryFilters}
        unit={unit}
      />
      <SecondarySelection
        dropdownOptions={dropdownOptions}
        currentMinMax={currentMinMax}
        getDataFromSecondarySelection={getSecondaryFilters}
      />
      <NumericField getNumericInputs={getPeriodFilters} />
      <SaveImgButtons />
    </div>
  );
};
