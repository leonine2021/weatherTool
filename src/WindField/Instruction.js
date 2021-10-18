export const Instruction = () => {
  return (
    <div className="row mt-5" id="guide-text-area">
      <span id="text-instruct">
        <strong>{"A Short Guide to Interpret This Chart"}</strong>
      </span>
      <ul id="guide">
        <li className="text-guide">
          {"Every arrow represents one hr of the year"}
        </li>
        <li className="text-guide">{"Every column represents one day"}</li>
        <li className="text-guide">{"Every row represents one time of day"}</li>
        <li className="text-guide">
          {"The size of the arrow represents wind speed"}
        </li>
        <li className="text-guide">
          {
            "The orientation of the arrow represents wind direction (north is up)"
          }
        </li>
        <li className="text-guide">
          {"The color of the arrow represents air temperature"}
        </li>
      </ul>
    </div>
  );
};
