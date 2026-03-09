import type { HandGesture } from './../fingerpose/Fingerpose';
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/hands";
import type { MediaPipeHandsMediaPipeModelConfig } from "@tensorflow-models/hand-pose-detection";
import type Webcam from "react-webcam";
import type { RefObject } from "react";
import { drawHand, initializeCanvas, plotter } from "../Plotter";
import { estimateGestures } from "../fingerpose/Fingerpose";
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
            maxHands: 2
        };
        detectorPromise = handPoseDetection.createDetector(model, detectorConfig);
        console.log("Detector created")
    }
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

const history_left: string[] = [];
const counts_left: Record<string, number> = {};

const history_right: string[] = [];

const WINDOW_SIZE = 10;

const smoothPrediction = (prediction: string, handedness: string) => {
    // add the prediction to the history
    if (handedness === 'left') {
        history_left.push(prediction)
        counts_left[prediction] = (counts_left[prediction] || 0) + 1;
        // shift array keep the history within the window size
        if (history_left.length > WINDOW_SIZE) {
            const oldest = history_left.shift()
            if (oldest) {
                counts_left[oldest] -= 1;
            }
        }
    } else {
        history_right.push(prediction)
        // shift array keep the history within the window size
        if (history_right.length > WINDOW_SIZE) {
            history_right.shift()
        }
    }
    // find most common gesture
    const counts: Record<string, number> = {}; // Using an object as a hash map
    let maxCount = 0
    let mostFrequent = ''

    for (const gesture of history_left) {
        if (gesture === '') { continue }
        counts[gesture] = (counts[gesture] || 0) + 1;

        if (counts[gesture] > maxCount) {
            maxCount = counts[gesture]
            mostFrequent = gesture
        }
    }
    // console.log(counts)
    return mostFrequent
}

export const detect = async (webcamRef: RefObject<Webcam | null>, isDetecting: boolean, canvasRef: RefObject<HTMLCanvasElement | null>, handleChangeHandGesture: (handGestures: HandGesture[]) => void) => {
    console.log("detect")
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
            let handGestures: HandGesture[] = []

            hands = await detector.estimateHands(video, { flipHorizontal: false }) // array of hands

            if (hands.length > 0) {
                // console.log(hands)

                initializeCanvas(canvasRef)

                hands.forEach((hand) => {
                    drawHand(hand)
                    const estimatedGesture = estimateGestures(hand.keypoints3D as handPoseDetection.Keypoint[])
                    const handedness = hand.handedness == 'Left' ? 'Right' : 'Left'
                    const mostFrequentGesture = smoothPrediction(estimatedGesture.name, handedness)
                    const handGesture = { hand: handedness, gesture: mostFrequentGesture }
                    handGestures.push(handGesture)
                    // console.log(handGesture)
                })

            }
            handleChangeHandGesture(handGestures)

            // plotter(hands)

            requestAnimationFrame(renderResults);
        }

    }

    // setInterval(() => { renderResults() }, 1000)
    setTimeout(() => { renderResults() }, 1000)




}