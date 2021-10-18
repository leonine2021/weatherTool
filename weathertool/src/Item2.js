import { useState } from "react";
import { ItemHeader } from "./ItemHeader";

export const Item2 = ({ text, id }) => {
  const [isClosed, setIsClosed] = useState(false);
  const closeInstance = (closeSignal) => {
    setIsClosed(closeSignal);
  };
  if (!isClosed) {
    return (
      <div className="container" id={"item" + id}>
        <ItemHeader id={id} text={text} clickToClose={closeInstance} />
        <section className="row viz" id={"viz" + id}>
          <svg width="100%" height="100%">
            <rect width="100%" height="100%" fill="orange"></rect>
          </svg>
        </section>
      </div>
    );
  }
  return null;
};
