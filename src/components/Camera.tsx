import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
// import { detect } from "../utilities/Detector-V2";
// import type { HandGesture } from "../utilities/Detector-V2";
import { detect } from "../utilities/Detector";
import type { HandGesture } from "../utilities/Detector";
import Popup from "./Popup";
import { useWebcam } from "../hooks/useWebcam";

const Camera = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [handGesture, setHandGesture] = useState<HandGesture>({
    left: "",
    right: "",
  });

  const [isGestureDog, setIsGestureDog] = useState(false);

  const handleChangeHandGesture = (newHands: HandGesture) => {
    // this event handler is passed to the detect function during the first render of this component
    setHandGesture(newHands);
    setIsGestureDog(newHands.left === "dog" || newHands.right === "dog");
  };

  const [isDetecting, setIsDetecting] = useState(false);

  const hasWebcam = useWebcam();

  // let rendercounter = useRef(0);

  useEffect(() => {
    if (!hasWebcam) {
      console.log("Webcam detected: ", hasWebcam);
      return;
    } else {
      // without this use effect everytime we update the DOM using use state the component rerenders and calls detect().
      // This triggers an infinite rerender loop because on every detect it changes the hand gestures list.
      // We add this useEffect hook to only call detect() whenever isDetecting changes.
      // this allows the DOM to rerender to update the handGestestures state variable without calling detect(). avoiding the infinite loop

      // rendercounter.current += 1;
      // console.log("rerender", rendercounter.current);
      detect(webcamRef, isDetecting, canvasRef, handleChangeHandGesture);
    }
  }, [isDetecting]);

  return (
    <div className="app-wrapper">
      <div className="menu">
        <button onClick={() => setIsDetecting(!isDetecting)}>
          {isDetecting ? "Stop" : "Start"}
        </button>
        <div className="hands-container">
          <div className="hand-wrapper">
            <p>Left Hand</p>
            {/* <p>Hand : {handGestures[0]?.hand}</p> */}
            <p>Gesture : {handGesture.left}</p>
          </div>
          <div className="hand-wrapper">
            <p>Right Hand</p>
            {/* <p>Hand : {handGestures[1]?.hand}</p> */}
            <p>Gesture : {handGesture.right}</p>
          </div>

          {/* {handGestures.map((o) => (
            <>
              <p>{o.hand}</p>
              <p>{o.gesture}</p>
            </>
          ))} */}
        </div>
      </div>
      {!hasWebcam && <div>No Webcam detected</div>}
      <div className="video-wrapper">
        <Webcam ref={webcamRef} className="video"></Webcam>
        <canvas ref={canvasRef} className="canvas"></canvas>
      </div>

      <Popup isGestureDog={isGestureDog}></Popup>
    </div>
  );
};

export default Camera;
