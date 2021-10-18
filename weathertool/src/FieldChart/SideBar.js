import { NumericField } from "../NumericalField";
import { PrimarySelection } from "./PrimarySelection";
import { SecondarySelection } from "./SecondarySelection";
import { SaveImgButtons } from "../SaveImgButtons";

export const SideBar = ({
  dropdownOptions,
  currentMinMax,
  bounds,
  colorScale,
  getPrimarySelectionIdx,
  getSecondarySelectionIdx,
  getPrimaryFilters,
  getSecondaryFilters,
  getPeriodFilters,
}) => {
  return (
    <div className="row" id="side-bar">
      <PrimarySelection
        dropdownOptions={dropdownOptions}
        currentMinMax={currentMinMax}
        bounds={bounds}
        colorScale={colorScale}
        onSelectValueChange={getPrimarySelectionIdx}
        getDataFromPrimarySelection={getPrimaryFilters}
      />
      <SecondarySelection
        dropdownOptions={dropdownOptions}
        currentMinMax={currentMinMax}
        onSelectValueChange={getSecondarySelectionIdx}
        getDataFromSecondarySelection={getSecondaryFilters}
      />
      <NumericField getNumericInputs={getPeriodFilters} />
      <SaveImgButtons />
    </div>
  );
};
