export const ItemHeader = ({ id, text, clickToClose }) => {
  const closeInstance = () => {
    clickToClose(true);
  };
  return (
    <section className="row header" id={"header" + id}>
      <div className="col-11">
        <div className="header-text">
          <strong>{("Chart Type: " + text).toUpperCase()}</strong>
        </div>
      </div>
      <div className="col-1">
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={closeInstance}
        ></button>
      </div>
    </section>
  );
};
