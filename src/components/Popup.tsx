// import { useState } from "react";
import Puppy from "../assets/pup.png";
import FoxDevil from "../assets/fox_devil.png";

interface PopupProps {
  isGestureDog: boolean;
}

const Popup = (props: PopupProps) => {
  const { isGestureDog } = props;
  // const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="popup-containter overlay-element">
      {/* <button onClick={() => setIsVisible(!isVisible)}>Toggle Animation</button> */}
      <img
        className={`pup-image ${isGestureDog ? "slide-up" : "hidden"}`}
        src={FoxDevil}
      ></img>
    </div>
  );
};

export default Popup;
