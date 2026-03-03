import Webcam from "react-webcam";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import type { MediaPipeHandsMediaPipeModelConfig } from "@tensorflow-models/hand-pose-detection";
import { useRef } from "react";

export const Camera = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const runHandPose = async () => {
    const model = await handPoseDetection.SupportedModels.MediaPipeHands;
    console.log("model loaded");
    setInterval(() => {
      detect(model);
    }, 2000);
  };

  const detect = async (model) => {
    const detectorConfig: MediaPipeHandsMediaPipeModelConfig = {
      runtime: "mediapipe", // or 'tfjs',
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
      modelType: "full",
    };
    const detector = await handPoseDetection.createDetector(
      model,
      detectorConfig,
    );

    if (webcamRef.current?.video) {
      const video = webcamRef.current.video;

      const hands = await detector.estimateHands(video);
      console.log(hands);
    }
  };

  runHandPose();
  return (
    <div>
      <Webcam ref={webcamRef}></Webcam>
    </div>
  );
};
