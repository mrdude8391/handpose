import React, { useRef } from "react";
import Webcam from "react-webcam";
import { detect } from "./detector/Detector-V2";

const CameraV2 = () => {
  const webcamRef = useRef<Webcam | null>(null);

  detect(webcamRef);

  return (
    <div>
      <Webcam ref={webcamRef}></Webcam>
    </div>
  );
};

export default CameraV2;
