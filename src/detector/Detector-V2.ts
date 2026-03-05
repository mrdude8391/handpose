import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/hands";
import type { MediaPipeHandsMediaPipeModelConfig } from "@tensorflow-models/hand-pose-detection";
import type Webcam from "react-webcam";
import type { RefObject } from "react";
import { drawHand, initializeCanvas, plotter } from "../Plotter";
import { estimateGestures } from "../fingerpose";
// 1. Create Detector
// 2. Run Inference

// Module-level singleton — survives Strict Mode's remount cycle
let detectorPromise: Promise<handPoseDetection.HandDetector> | null = null;
let webcam: Webcam | null = null
let canvas: HTMLCanvasElement | null = null

export const createDetector = () => {


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
    console.log("Detector created")
    return detectorPromise;
};

const disposeDetector = () => {

    if (detectorPromise) {
        detectorPromise?.then((detector) => {
            detector.dispose();
        })
        detectorPromise = null
        console.log("Detector disposed")
    }
    return
}

const setElementSize = () => {
    if (webcam && canvas && webcam.video) {
        const videoWidth = webcam.video.videoWidth
        const videoHeight = webcam.video.videoHeight

        webcam.video.width = videoWidth
        webcam.video.height = videoHeight

        canvas.width = videoWidth
        canvas.height = videoHeight
    }

}



export const detect = async (webcamRef: RefObject<Webcam | null>, isDetecting: boolean, canvasRef: RefObject<HTMLCanvasElement | null>) => {
    webcam = webcamRef.current
    canvas = canvasRef.current

    if (!isDetecting) { disposeDetector(); return }
    await createDetector()

    const renderResults = async () => {

        let hands: handPoseDetection.Hand[]
        if (
            detectorPromise &&
            webcam &&
            canvas &&
            webcam.video !== null &&
            webcam.video.readyState === 4
        ) {

            setElementSize()
            const video = webcam.video as HTMLVideoElement
            const detector = await detectorPromise
            hands = await detector.estimateHands(video) // array of hands

            initializeCanvas(canvasRef)

            hands.forEach((hand) => {
                drawHand(hand)
            })
            // plotter(hands)

            if (hands.length > 0) console.log(hands)
            requestAnimationFrame(renderResults);
        }

    }

    // setInterval(() => { renderResults() }, 1000)
    setTimeout(() => { renderResults() }, 1000)




}