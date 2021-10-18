export const WaterMark = ({
  className,
  weatherStation,
  primarySelection,
  secondarySelection,
  unit1,
  unit2,
  min1,
  max1,
  min2,
  max2,
  startDate,
  endDate,
  startHour,
  endHour,
  numHours,
  turn,
  fontSize,
  spacing,
}) => {
  return (
    <>
      <text
        className={className}
        x={0}
        y={0}
        dy={"0.71em"}
        fontSize={fontSize}
      >{`Station Name: ${weatherStation}`}</text>
      <text
        className={className}
        x={0}
        y={spacing}
        dy={"0.71em"}
        fontSize={fontSize}
      >{`${primarySelection} between ${min1} and ${max1} ${unit1}`}</text>
      <text
        className={className}
        x={0}
        y={spacing * 2}
        dy={"0.71em"}
        fontSize={fontSize}
      >{`${secondarySelection} between ${min2} and ${max2} ${unit2}`}</text>
      <text
        className={className}
        x={0}
        y={spacing * 3}
        dy={"0.71em"}
        fontSize={fontSize}
      >{`${startDate} to ${endDate}`}</text>
      <text
        className={className}
        x={0}
        y={spacing * 4}
        dy={"0.71em"}
        fontSize={fontSize}
      >{`From ${startHour} to ${endHour}h`}</text>
      <text
        className={className}
        x={0}
        y={spacing * 5}
        dy={"0.71em"}
        fontSize={fontSize}
      >{`${numHours}h (${((numHours / 8760) * 100).toFixed(
        1
      )}%) within selection criteria`}</text>
      <text
        className={className}
        x={0}
        y={spacing * 6}
        dy={"0.71em"}
        fontSize={fontSize}
      >{`Turn: ${turn} degrees`}</text>
    </>
  );
};
