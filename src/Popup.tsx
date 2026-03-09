import { useState } from "react";
import Puppy from "./assets/pup.png";
const Popup = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="popup-containter">
      <button onClick={() => setIsVisible(!isVisible)}>Toggle Animation</button>
      <img
        className={`pup-image ${isVisible ? "slide-up" : ""}`}
        src={Puppy}
      ></img>
    </div>
  );
};

export default Popup;
