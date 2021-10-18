import { NumericField } from "../NumericalField";
import { SaveImgButtons } from "../SaveImgButtons";
import { Instruction } from "./Instruction";

export const SideBar = ({ bounds, colorScale, getPeriodFilters }) => {
  return (
    <div className="row" id="side-bar">
      <NumericField getNumericInputs={getPeriodFilters} />
      <Instruction />
      <SaveImgButtons />
    </div>
  );
};
