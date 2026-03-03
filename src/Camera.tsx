import Webcam from "react-webcam";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/hands";
import type { MediaPipeHandsMediaPipeModelConfig } from "@tensorflow-models/hand-pose-detection";
import { useEffect, useRef } from "react";
import { runHandPose } from "./Detector";

export const Camera = () => {
  const webcamRef = useRef<Webcam | null>(null);

  // Module-level singleton — survives Strict Mode's remount cycle
  let detectorPromise: Promise<handPoseDetection.HandDetector> | null = null;

  const getDetector = () => {
    if (!detectorPromise) {
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig: MediaPipeHandsMediaPipeModelConfig = {
        runtime: "mediapipe",
        solutionPath: "node_modules/@mediapipe/hands",
        modelType: "full",
      };
      detectorPromise = handPoseDetection.createDetector(model, detectorConfig);
      console.log(detectorPromise);
    }
    return detectorPromise;
  };

  // const detectorRef = useRef<handPoseDetection.HandDetector | null>(null);

  // const runHandPose = async () => {
  //   try {
  //     detectorRef.current = await getDetector();
  //     console.log("Detector ready:", detectorRef.current);
  //   } catch (error) {
  //     console.log(error);
  //     alert(error);
  //   }

  //   const detect = async () => {
  //     if (
  //       detectorRef.current &&
  //       webcamRef.current &&
  //       webcamRef.current.video !== null &&
  //       webcamRef.current.video.readyState === 4
  //     ) {
  //       const video: HTMLVideoElement = webcamRef.current.video;
  //       const estimationConfig = { flipHorizontal: false };

  //       const hands = await detectorRef.current.estimateHands(
  //         video,
  //         estimationConfig,
  //       );
  //       console.log(hands);
  //     }
  //   };
  //   setInterval(() => {
  //     detect();
  //   }, 1500);

  //   // detect();
  // };
  // runHandPose();

  useEffect(() => {
    getDetector()?.then((detector) => {
      console.log(detector);

      console.log(detectorPromise);
    });

    return () => {
      console.log("nug");
      getDetector()?.then((detector) => {
        detector.dispose();
        detectorPromise = null;
        console.log(detector);

        console.log("unmount");
        console.log(detectorPromise);
      });
    };
  }, []);

  return (
    <div>
      <Webcam ref={webcamRef}></Webcam>
    </div>
  );
};
