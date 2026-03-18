import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/hands";
import type { MediaPipeHandsMediaPipeModelConfig } from "@tensorflow-models/hand-pose-detection";
import type Webcam from "react-webcam";
import type { RefObject } from "react";
import { drawHand, initializeCanvas } from "./Plotter";
import { estimateGestures } from "./fingerpose/Fingerpose";

export type HandGesture = Record<string, string>

// 1. Create Detector
// 2. Run Inference

// Module-level singleton — survives Strict Mode's remount cycle
let detectorPromise: Promise<handPoseDetection.HandDetector> | null = null;
let webcam: Webcam | null = null;
let canvas: HTMLCanvasElement | null = null;

const createDetector = async () => {
    if (!detectorPromise) {
        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig: MediaPipeHandsMediaPipeModelConfig = {
            runtime: "mediapipe",
            solutionPath: "node_modules/@mediapipe/hands",
            modelType: "full",
            maxHands: 2,
        };
        detectorPromise = handPoseDetection.createDetector(model, detectorConfig);
        console.log("Detector created");
    }
};

const disposeDetector = () => {
    if (detectorPromise) {
        detectorPromise?.then((detector) => {
            detector.dispose();
        });
        detectorPromise = null;
        console.log("Detector disposed");
    }
    return;
};

const hasWebcam = () => {
    return (webcam && webcam.video && webcam.video.readyState === 4)
}

const setElementSize = () => {
    if (webcam && canvas && webcam.video) {
        const videoWidth = webcam.video.videoWidth;
        const videoHeight = webcam.video.videoHeight;

        webcam.video.width = videoWidth;
        webcam.video.height = videoHeight;

        canvas.width = videoWidth;
        canvas.height = videoHeight;
    }
};

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
    console.log(prediction);
    // add the prediction to the history
    if (handedness === "Left") {
        history_left.push(prediction);
        counts_left[prediction] = (counts_left[prediction] || 0) + 1;
        // shift array keep the history within the window size
        if (history_left.length > WINDOW_SIZE) {
            const oldest = history_left.shift() as string;
            counts_left[oldest] -= 1;
        }
        // reduce to find max key value
        const mostFrequent = Object.entries(counts_left).reduce((acc, curr) => {
            return curr[1] > acc[1] ? curr : acc;
        });
        return mostFrequent[0];
    } else {
        history_right.push(prediction);
        counts_right[prediction] = (counts_right[prediction] || 0) + 1;
        // shift array keep the history within the window size
        if (history_right.length > WINDOW_SIZE) {
            const oldest = history_right.shift() as string;
            counts_right[oldest] -= 1;
        }
        // reduct to find max key value
        const mostFrequent = Object.entries(counts_right).reduce((acc, curr) => {
            return curr[1] > acc[1] ? curr : acc;
        });
        return mostFrequent[0];
    }
};

let countdown = 0;
let combo_idx = 0;
const combo = ["thumbs_up", "victory", "dog"];

const detectCombo = (gesture: string, combo: string[]) => {
    console.log(gesture, countdown, combo_idx);
    if (combo_idx >= combo.length) {
        combo_idx = 0;
        console.log("sequence detected and reset");
    }
    if (countdown === 0 && gesture === combo[0]) {
        // if we are neutral and user inputs combo start we initiate the coundown and move idx forward
        countdown = 200;
        combo_idx = 1;
    }

    if (countdown > 0) {
        // countdown is started and we are looking for the next move
        if (gesture === combo[combo_idx]) {
            // if user inputs the next move, we can reset the countdown and move idx forward
            countdown = 200;
            combo_idx += 1;
        } else if (gesture === combo[combo_idx - 1]) {
            // if the user is still inputting the current move, then we can just reset the countdown indefinitely
            countdown = 200;
        } else {
            // user inputs something that is not the next move, or the current move, meaning its the wrong move
            // we have to cancel the combo since the inputs are wrong
            combo_idx = 0;
        }
        // at the end we always move the countdown down
        countdown -= 1;
    }
};

export const detect = async (
    webcamRef: RefObject<Webcam | null>,
    isDetecting: boolean,
    canvasRef: RefObject<HTMLCanvasElement | null>,
    handleChangeHandGesture: (handGestures: HandGesture) => void,
) => {
    console.log("detect");
    webcam = webcamRef.current;
    canvas = canvasRef.current;

    if (!isDetecting) {
        disposeDetector();
        return;
    }
    await createDetector();

    const renderResults = async () => {
        let hands: handPoseDetection.Hand[];
        if (
            detectorPromise &&
            webcam &&
            canvas &&
            webcam.video !== null &&
            webcam.video.readyState === 4
        ) {
            setElementSize();
            const video = webcam.video as HTMLVideoElement;
            const detector = await detectorPromise;
            const handGesture: HandGesture = {
                left: '',
                right: '',
            };

            // array of hands
            hands = await detector.estimateHands(video, { flipHorizontal: false });

            if (hands.length > 0) {
                // console.log(hands)
                initializeCanvas(canvasRef);

                // this array will have 1 hand item or 2 hand items, but the left/right being 1st or 2nd will change depending on detection order
                hands.forEach((hand) => {
                    drawHand(hand);
                    const estimatedGesture = estimateGestures(
                        hand.keypoints3D as handPoseDetection.Keypoint[],
                    );
                    // swap handedness since webcam is not flipped
                    const handedness = hand.handedness == "Left" ? "Right" : "Left";
                    // smooth out estimates using max vote technique
                    const mostFrequentGesture = smoothPrediction(
                        estimatedGesture.name,
                        handedness,
                    );
                    // console.log("most freq", mostFrequentGesture);
                    // input the clean gesture signal to look for combo
                    detectCombo(mostFrequentGesture, combo);

                    handGesture[handedness.toLocaleLowerCase()] = mostFrequentGesture
                    // console.log(handGesture)
                });
            }
            handleChangeHandGesture(handGesture);

            // plotter(hands)

            requestAnimationFrame(renderResults);
        }
    };

    // setInterval(() => { renderResults() }, 1000)
    setTimeout(() => {
        renderResults();
    }, 1000);
};
