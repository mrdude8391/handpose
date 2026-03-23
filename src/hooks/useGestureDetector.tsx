import { useEffect, useRef } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/hands";
import type Webcam from "react-webcam";
import type { RefObject } from "react";
import { drawHand, initializeCanvas } from "../utilities/Plotter";
import { estimateGestures } from "../utilities/fingerpose/Fingerpose";

type HandGesture = Record<string, string>;

type Props = {
  webcamRef: RefObject<Webcam | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isDetecting: boolean;
  handleChangeHandGesture: (handGestures: HandGesture) => void;
  handleChangeImageIdx: () => void;
};

type MaxVotingState = {
  history: string[];
  counts: Record<string, number>;
};
type ComboState = {
  countdown: number;
  comboIdx: number;
};

export const useGestureDetector = ({
  webcamRef,
  canvasRef,
  isDetecting,
  handleChangeHandGesture,
  handleChangeImageIdx,
}: Props) => {
  const detectorRef = useRef<handPoseDetection.HandDetector | null>(null);
  const animationRef = useRef<number | null>(null);

  // --- smoothing ref ---
  const smoothingRef = useRef<Record<string, MaxVotingState>>({
    Left: { history: [], counts: {} },
    Right: { history: [], counts: {} },
  });

  const WINDOW_SIZE = 20;

  const smoothPrediction = (prediction: string, handedness: string) => {
    const state = smoothingRef.current[handedness];

    state.history.push(prediction);
    state.counts[prediction] = (state.counts[prediction] || 0) + 1;

    if (state.history.length > WINDOW_SIZE) {
      const oldest = state.history.shift()!;
      state.counts[oldest] -= 1;
    }

    return Object.entries(state.counts).reduce((a, b) =>
      b[1] > a[1] ? b : a,
    )[0];
  };

  // --- combo ref ---
  const comboRef = useRef<Record<string, ComboState>>({
    Left: { countdown: 0, comboIdx: 0 },
    Right: { countdown: 0, comboIdx: 0 },
  });

  const combo = ["Point Up", "Point Left"];

  const detectCombo = (gesture: string, handedness: string) => {
    const state = comboRef.current[handedness];
    // console.log(gesture, (state.countdown - Date.now()), state.comboIdx);

    if (state.comboIdx >= combo.length) {
      state.comboIdx = 0;
      console.log("🔥 sequence detected");
      handleChangeImageIdx();
    }

    // if we are neutral and user inputs combo start we initiate the coundown and move idx forward
    if (state.countdown <= Date.now() && gesture === combo[0]) {
      state.countdown = Date.now() + 2000; // 2 seconds
      state.comboIdx = 1;
    }

    if (state.countdown > Date.now()) {
      // countdown is started and we are looking for the next move
      if (gesture === combo[state.comboIdx]) {
        // if user inputs the next move, we can reset the countdown and move idx forward
        state.countdown = Date.now() + 2000;
        state.comboIdx += 1;
      } else if (gesture !== combo[state.comboIdx - 1]) {
        // if the user inputs some gesture that isn't the next move
        // and the gesture is not the current move (user holding the same move)
        // i.e its a move outside of the combo sequence, we will reset the state
        state.comboIdx = 0;
      } // if the user is just holding the current move then we don't need to do anything and just le the countdown do its thing
    } else {
      // the coundown has run out, so we reset the combo state
      state.comboIdx = 0;
    }
  };

  const setElementSize = () => {
    if (webcamRef && canvasRef) {
      const videoWidth = webcam.video.videoWidth;
      const videoHeight = webcam.video.videoHeight;

      webcam.video.width = videoWidth;
      webcam.video.height = videoHeight;

      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }
  };

  const createDetector = async () => {
    if (!detectorRef.current) {
      try {
        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig =
          {
            runtime: "mediapipe",
            solutionPath: "node_modules/@mediapipe/hands",
            modelType: "full",
            maxHands: 2,
          };
        detectorRef.current = await handPoseDetection.createDetector(
          model,
          detectorConfig,
        );
        console.log("Detector created");
      } catch (error) {
        console.error("Failed to create detector", error);
      }
    }
  };

  const renderLoop = async () => {
    const webcam = webcamRef.current;
    const canvas = canvasRef.current;

    // check for: webcam, canvas, and detector exists
    if (!webcam || !canvas || !detectorRef.current) return;

    // check webcam has enough video for inference
    if (webcam.video?.readyState !== 4) {
      // if not then we queue renderloop to run on next animation frame
      // this will cause the render loop to run indefinitely (until isDetecting changes and causes useEffect to run)
      animationRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const video = webcam.video as HTMLVideoElement;

    const videoWidth = webcam.video.videoWidth;
    const videoHeight = webcam.video.videoHeight;

    webcam.video.width = videoWidth;
    webcam.video.height = videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const hands = await detectorRef.current.estimateHands(video);

    const result: HandGesture = { left: "", right: "" };

    // this array will have 1 hand item or 2 hand items,
    // but the left/right being 1st or 2nd will change depending on detection order
    if (hands.length > 0) {
      initializeCanvas(canvasRef);

      hands.forEach((hand) => {
        drawHand(hand);

        const estimated = estimateGestures(
          hand.keypoints3D as handPoseDetection.Keypoint[],
        );
        // swap handedness since webcam is not flipped
        const handedness = hand.handedness === "Left" ? "Right" : "Left";
        // smooth out estimates using max vote technique
        const smooth = smoothPrediction(estimated.name, handedness);
        // input the clean gesture signal to look for combo
        detectCombo(smooth, handedness);

        result[handedness.toLowerCase()] = smooth;
      });
      console.log(result);
    }
    // update frontend
    handleChangeHandGesture(result);

    // request animation and update the current animationref
    animationRef.current = requestAnimationFrame(renderLoop);
  };

  // after mounting call this useEffect
  useEffect(() => {
    if (!isDetecting) {
      detectorRef.current?.dispose();
      detectorRef.current = null;
      console.log("Detector Disposed");

      if (animationRef.current) {
        // cancel the next queued animation frame
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const start = async () => {
      await createDetector();
      renderLoop();
    };

    start();

    return () => {
      // on unmount -> dispose of the detector and cancel queued animation frame
      detectorRef.current?.dispose();
      detectorRef.current = null;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDetecting]);
};
