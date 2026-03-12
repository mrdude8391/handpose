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
const counts_right: Record<string, number> = {};

const WINDOW_SIZE = 20;

// 1. add the prediction to the history
// 2. log the prediction into the dictionary along with its count
// 3. check if the history is within max size 
// 4. if its too big, then shift
// 4.1  then take the oldest and find in dictionary, reducing count by 1
// ** this keeps the dictionary with a count that reflects the history
// 5. call reduce on the dictionary values

const smoothPrediction = (prediction: string, handedness: string) => {
    console.log(prediction)
    // add the prediction to the history
    if (handedness === 'Left') {
        history_left.push(prediction)
        counts_left[prediction] = (counts_left[prediction] || 0) + 1;
        // shift array keep the history within the window size
        if (history_left.length > WINDOW_SIZE) {
            const oldest = history_left.shift() as string
            counts_left[oldest] -= 1;
        }
        // reduct to find max key value
        const mostFrequent = Object.entries(counts_left).reduce((acc, curr) => {
            return curr[1] > acc[1] ? curr : acc
        })
        return mostFrequent[0]
    } else {
        history_right.push(prediction)
        counts_right[prediction] = (counts_right[prediction] || 0) + 1;
        // shift array keep the history within the window size
        if (history_right.length > WINDOW_SIZE) {
            const oldest = history_right.shift() as string
            counts_right[oldest] -= 1;
        }
        // reduct to find max key value
        const mostFrequent = Object.entries(counts_right).reduce((acc, curr) => {
            return curr[1] > acc[1] ? curr : acc
        })
        return mostFrequent[0]
    }
}

let gestureState = 0

const processSequence = (gesture: string) => {
    if (gestureState === 0 && gesture === 'thumbs_up') {
        gestureState = 1
        console.log('state', gestureState)

    } else if (gestureState === 1 && gesture === 'victory') {
        gestureState = 2
        console.log('state', gestureState)
    } else if (gestureState === 2 && gesture === 'dog') {
        console.log('sequence detected')
        gestureState = 0
    }

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
                    console.log('most freq', mostFrequentGesture)
                    processSequence(mostFrequentGesture)
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