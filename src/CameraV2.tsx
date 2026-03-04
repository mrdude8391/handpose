import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { detect } from "./detector/Detector-V2";

const CameraV2 = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isDetecting, setIsDetecting] = useState(false);

  detect(webcamRef, isDetecting, canvasRef);

  return (
    <div>
      <button onClick={() => setIsDetecting(!isDetecting)}>
        {isDetecting ? "Stop" : "Start"}
      </button>
      <div className="wrapper">
        <Webcam ref={webcamRef} className="video"></Webcam>
        <canvas ref={canvasRef} className="canvas"></canvas>
      </div>
    </div>
  );
};

export default CameraV2;
