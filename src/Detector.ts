import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/hands";
import type { MediaPipeHandsMediaPipeModelConfig } from "@tensorflow-models/hand-pose-detection";
import type { RefObject } from "react";
import type Webcam from "react-webcam";

// https://github.com/google-ai-edge/mediapipe/issues/3807
// occurs when a WASM module initializes multiple times, often due to React Strict Mode or inefficient component re-renders

let detector: Promise<handPoseDetection.HandDetector> | null

export const createDetector = async () => {
    const model: handPoseDetection.SupportedModels =
        handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig: MediaPipeHandsMediaPipeModelConfig = {
        runtime: "mediapipe", // or 'tfjs',
        solutionPath: "node_modules/@mediapipe/hands", // in npm | non npm -> 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
        modelType: "full",
    };
    detector = handPoseDetection.createDetector(model, detectorConfig)
    console.log("detector created")
    return detector;
};

const checkDetector = async () => {
    if (detector != null) {
        detector.dispose();
    }

    try {
        detector = await createDetector();
    } catch (error) {
        detector = null;
        alert(error);
    }
};

export const runHandPose = async (webcamRef: RefObject<Webcam | null>) => {
    
    createDetector().then((detector)=>{
        console.log(detector)
    }).catch(error=>{
        console.error(error)
    })

    
};

// export const runHandPose = async (video: HTMLVideoElement) => {
//     // https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection/src/mediapipe

//     // Pass in handPoseDetection.SupportedModels.MediaPipeHands from the handPoseDetection.SupportedModel enum list
//     // along with a detectorConfig to the createDetector method to load and initialize the model.
//   const model: handPoseDetection.SupportedModels =
//     handPoseDetection.SupportedModels.MediaPipeHands;
//   const detectorConfig: MediaPipeHandsMediaPipeModelConfig = {
//     runtime: "mediapipe", // or 'tfjs',
//     solutionPath: "node_modules/@mediapipe/hands", // in npm | non npm -> 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
//     modelType: "full",
//   };
//   if (!detector) {
//     detector = await handPoseDetection.createDetector(model, detectorConfig);
//     console.log("detector created");
//     setInterval(() => {
//       detect(detector, video);
//     }, 2000);
//   }
// };

// const detect = async (
//   detector: handPoseDetection.HandDetector | null,
//   video: HTMLVideoElement,
// ) => {
//   if (video &&
//       video.readyState === 4 && detector) {

//     const hands = await detector.estimateHands(video);
//     console.log(hands);
//   }
// };
