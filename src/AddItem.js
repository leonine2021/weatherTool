// button components for generating different visualizations
export const AddItem = ({ text, getText }) => {
  // pass the button text to its parent component: App
  const passText = () => {
    getText(text);
  };
  return (
    <button
      className="btn btn-success ms-1"
      id={"btn-" + text}
      onClick={passText}
    >
      {text}
    </button>
  );
};
