import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/hands";
import type { MediaPipeHandsMediaPipeModelConfig } from "@tensorflow-models/hand-pose-detection";
import type Webcam from "react-webcam";
import type { RefObject } from "react";

// const createDetector = async () => {
//     const model: handPoseDetection.SupportedModels =
//         handPoseDetection.SupportedModels.MediaPipeHands;
//     const detectorConfig: MediaPipeHandsMediaPipeModelConfig = {
//         runtime: "mediapipe", // or 'tfjs',
//         solutionPath: "node_modules/@mediapipe/hands", // in npm | non npm -> 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
//         modelType: "full",
//     };
//     return handPoseDetection.createDetector(model, detectorConfig);
// };

// 1. Create Detector
// 2. Run Inference

// Module-level singleton — survives Strict Mode's remount cycle
let detectorPromise: Promise<handPoseDetection.HandDetector> | null = null;


export const createDetector = () => {

    console.log("create detector")
    if (!detectorPromise) {

        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig: MediaPipeHandsMediaPipeModelConfig = {
            runtime: "mediapipe",
            solutionPath: "node_modules/@mediapipe/hands",
            modelType: "full",
            maxHands: 4
        };
        detectorPromise = handPoseDetection.createDetector(model, detectorConfig);
    }
    return detectorPromise;
};



export const detect = async (webcamRef: RefObject<Webcam | null>) => {
    await createDetector()

    const renderResults = async () => {
        let hands

        if (
            detectorPromise &&
            webcamRef.current &&
            webcamRef.current.video !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            const video = webcamRef.current.video as HTMLVideoElement
            const detector = await detectorPromise
            hands = await detector.estimateHands(video)
            console.log(hands)
            // requestAnimationFrame(renderResults);
        }

    }

    setInterval(() => { renderResults() }, 1000)




}