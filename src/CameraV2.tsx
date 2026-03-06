import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { detect } from "./detector/Detector-V2";
import type { HandGesture } from "./fingerpose/Fingerpose";

const CameraV2 = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [handGestures, setHandGestures] = useState<HandGesture[]>([]);

  const handleChangeHandGestures = (newHandGestures: HandGesture[]) => {
    console.log(handGestures, newHandGestures);
    if (handGestures != newHandGestures) {
      console.log("change gestures");
      setHandGestures(newHandGestures);
    }
  };

  const [isDetecting, setIsDetecting] = useState(false);

  // let rendercounter = useRef(0);

  useEffect(() => {
    // without this use effect everytime we update the DOM using use state the component rerenders and calls detect().
    // This triggers an infinite rerender loop because on every detect it changes the hand gestures list.
    // We add this useEffect hook to only call detect() whenever isDetecting changes.
    // this allows the DOM to rerender to update the handGestestures state variable without calling detect(). avoiding the infinite loop

    // rendercounter.current += 1;
    // console.log("rerender", rendercounter.current);
    detect(webcamRef, isDetecting, canvasRef, handleChangeHandGestures);
  }, [isDetecting]);

  return (
    <div className="camera">
      <div className="menu">
        <button onClick={() => setIsDetecting(!isDetecting)}>
          {isDetecting ? "Stop" : "Start"}
        </button>
        <div>
          {handGestures.map((o) => (
            <>
              <p>{o.hand}</p>
              <p>{o.gesture}</p>
            </>
          ))}
        </div>
      </div>
      <div className="wrapper">
        <Webcam ref={webcamRef} className="video"></Webcam>
        <canvas ref={canvasRef} className="canvas"></canvas>
      </div>
    </div>
  );
};

export default CameraV2;
