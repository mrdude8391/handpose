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

type MaxVotingState = {
    history: string[],
    counts: Record<string, number>
}

const smoothingHandState: Record<string, MaxVotingState> = {
    Left: { history: [], counts: {} },
    Right: { history: [], counts: {} },
}

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
    const state = smoothingHandState[handedness]
    // add the prediction to the history
    state.history.push(prediction);
    state.counts[prediction] = (state.counts[prediction] || 0) + 1;
    // shift array keep the history within the window size
    if (state.history.length > WINDOW_SIZE) {
        const oldest = state.history.shift() as string;
        state.counts[oldest] -= 1;
    }
    // reduce to find max key value
    const mostFrequent = Object.entries(state.counts).reduce((acc, curr) => {
        return curr[1] > acc[1] ? curr : acc;
    });
    return mostFrequent[0];
};

type ComboState = {
    countdown: number,
    comboIdx: number
}
const comboHandState: Record<string, ComboState> = {
    Left: { countdown: 0, comboIdx: 0 },
    Right: { countdown: 0, comboIdx: 0 },
}
const combo = ["thumbs_up", "victory", "dog"];

const detectCombo = (gesture: string, handedness: string, combo: string[]) => {
    const state = comboHandState[handedness]
    console.log(gesture, state.countdown, state.comboIdx);
    if (state.comboIdx >= combo.length) {
        state.comboIdx = 0;
        console.log("====\n\nsequence detected and reset\n\n====\n");
    }
    if (state.countdown === 0 && gesture === combo[0]) {
        // if we are neutral and user inputs combo start we initiate the coundown and move idx forward
        state.countdown = 200;
        state.comboIdx = 1;
    }

    if (state.countdown > 0) {
        // countdown is started and we are looking for the next move
        if (gesture === combo[state.comboIdx]) {
            // if user inputs the next move, we can reset the countdown and move idx forward
            state.countdown = 200;
            state.comboIdx += 1;
        } else if (gesture === combo[state.comboIdx - 1]) {
            // if the user is still inputting the current move, then we can just reset the countdown indefinitely
            state.countdown = 200;
        } else {
            // user inputs something that is not the next move, or the current move, meaning its the wrong move
            // we have to cancel the combo since the inputs are wrong
            state.comboIdx = 0;
        }
        // at the end we always move the countdown down
        state.countdown -= 1;
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
                    detectCombo(mostFrequentGesture, handedness, combo);

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
