// import { useState } from "react";
import Puppy from "../assets/pup.png";

interface PopupProps {
  isGestureDog: boolean;
}

const Popup = (props: PopupProps) => {
  const { isGestureDog } = props;
  // const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="popup-containter">
      {/* <button onClick={() => setIsVisible(!isVisible)}>Toggle Animation</button> */}
      <img
        className={`pup-image ${isGestureDog ? "slide-up" : ""}`}
        src={Puppy}
      ></img>
    </div>
  );
};

export default Popup;
