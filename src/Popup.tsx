import { useState } from "react";
import Puppy from "./assets/pup.png";
import type { HandGesture } from "./fingerpose/Fingerpose";

interface PopupProps {
  gesture: HandGesture;
}

const Popup = (props: PopupProps) => {
  const { gesture } = props;
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="popup-containter">
      <button onClick={() => setIsVisible(!isVisible)}>Toggle Animation</button>
      <img
        className={`pup-image ${gesture?.gesture == "dog" ? "slide-up" : ""}`}
        src={Puppy}
      ></img>
    </div>
  );
};

export default Popup;
