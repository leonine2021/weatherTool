import { useState } from "react";
export const DropdownMenus = ({
  labels,
  placeholder,
  id,
  caption,
  onSelectValueChange,
}) => {
  let optionValueList = labels.map((d) => d.noncaps);
  const [selectedValue, setSelectedValue] = useState("temperature");
  return (
    <>
      <label htmlFor={"data-options" + id}>{caption}</label>
      <select
        className="form-control"
        id={"data-options" + id}
        value={selectedValue}
        onChange={(e) => {
          onSelectValueChange(optionValueList.indexOf(e.target.value));
          setSelectedValue(e.target.value);
        }}
      >
        {labels.map((d, i) => {
          return (
            <option
              key={d.caps}
              value={d.noncaps}
              // selected={i == 3 ? true : false}
            >
              {d.capsUnits}
            </option>
          );
        })}
      </select>
    </>
  );
};
