import { NumericField } from "../NumericalField";
import { PrimarySelection } from "./PrimarySelection";
import { SecondarySelection } from "../FieldChart/SecondarySelection";
import { SaveImgButtons } from "../SaveImgButtons";

export const SideBar = ({
  dropdownOptions,
  currentMinMax,
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
