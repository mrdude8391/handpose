import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
// import { detect } from "../utilities/Detector-V2";
// import type { HandGesture } from "../utilities/Detector-V2";
import { detect, type HandGesture } from "../utilities/Detector";
import Popup from "./Popup";
import { useWebcam } from "../hooks/useWebcam";
import bucket from "../assets/hats/black bucket.png";
import tophat from "../assets/hats/black top hat.png";
import hatman from "../assets/hats/hat man.png";
import pirate from "../assets/hats/pirate hat.png";
import { useGestureDetector } from "../hooks/useGestureDetector";

const Camera = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [handGesture, setHandGesture] = useState<HandGesture>({
    left: "",
    right: "",
  });

  const [isGestureDog, setIsGestureDog] = useState(false);

  const [imageIdx, setImageIdx] = useState(0);
  const images = [bucket, tophat, hatman, pirate];

  const handleChangeHandGesture = (newHands: HandGesture) => {
    // this event handler is passed to the detect function during the first render of this component
    setHandGesture(newHands);
    setIsGestureDog(newHands.left === "dog" || newHands.right === "dog");
  };

  const handleChangeImageIdx = () => {
    setImageIdx((p) => p + 1);
  };

  const [isDetecting, setIsDetecting] = useState(false);

  const hasWebcam = useWebcam();

  useGestureDetector({
    webcamRef,
    canvasRef,
    isDetecting,
    handleChangeHandGesture,
    handleChangeImageIdx,
  });
  // useEffect(() => {
  //   if (!hasWebcam) {
  //     console.log("Webcam detected: ", hasWebcam);
  //     return;
  //   } else {
  //     console.log("Webcam detected: ", hasWebcam);

  //     // without this use effect everytime we update the DOM using use state the component rerenders and calls detect().
  //     // This triggers an infinite rerender loop because on every detect it changes the hand gestures list.
  //     // We add this useEffect hook to only call detect() whenever isDetecting changes.
  //     // this allows the DOM to rerender to update the handGestestures state variable without calling detect(). avoiding the infinite loop

  //     // rendercounter.current += 1;
  //     // console.log("rerender", rendercounter.current);
  //     detect(
  //       webcamRef,
  //       isDetecting,
  //       canvasRef,
  //       handleChangeHandGesture,
  //       handleChangeImageIdx,
  //     );
  //   }
  // }, [isDetecting]);

  return (
    <div className="app-wrapper">
      <div className="menu">
        <div>
          <button onClick={() => setIsDetecting(!isDetecting)}>
            {isDetecting ? "Stop" : "Start"}
          </button>
        </div>
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
      <div className="video-container">
        <Webcam ref={webcamRef} className="video overlay-element"></Webcam>
        <canvas ref={canvasRef} className="canvas overlay-element"></canvas>
        <Popup isGestureDog={isGestureDog}></Popup>
      </div>
      {/* <img className="hat overlay-element" src={images[imageIdx]} /> */}
    </div>
  );
};

export default Camera;
