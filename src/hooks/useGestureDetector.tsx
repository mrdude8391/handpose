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

  // --- smoothing state ---
  const smoothingState = useRef<Record<string, MaxVotingState>>({
    Left: { history: [], counts: {} },
    Right: { history: [], counts: {} },
  });

  const WINDOW_SIZE = 20;

  const smoothPrediction = (prediction: string, handedness: string) => {
    const state = smoothingState.current[handedness];

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

  // --- combo state ---
  const comboState = useRef<Record<string, ComboState>>({
    Left: { countdown: 0, comboIdx: 0 },
    Right: { countdown: 0, comboIdx: 0 },
  });

  const combo = ["Point Up", "Point Left"];

  const detectCombo = (gesture: string, handedness: string) => {
    const state = comboState.current[handedness];

    if (state.comboIdx >= combo.length) {
      state.comboIdx = 0;
      console.log("🔥 sequence detected");
      handleChangeImageIdx();
    }

    if (state.countdown <= Date.now() && gesture === combo[0]) {
      state.countdown = Date.now() + 2000;
      state.comboIdx = 1;
    }

    if (state.countdown > Date.now()) {
      if (gesture === combo[state.comboIdx]) {
        state.countdown = Date.now() + 2000;
        state.comboIdx += 1;
      } else if (gesture !== combo[state.comboIdx - 1]) {
        state.comboIdx = 0;
      }
    } else {
      state.comboIdx = 0;
    }
  };

  const createDetector = async () => {
    if (!detectorRef.current) {
      const model = handPoseDetection.SupportedModels.MediaPipeHands;

      detectorRef.current = await handPoseDetection.createDetector(model, {
        runtime: "mediapipe",
        solutionPath: "node_modules/@mediapipe/hands",
        modelType: "full",
        maxHands: 2,
      });

      console.log("Detector created");
    }
  };

  const renderLoop = async () => {
    const webcam = webcamRef.current;
    const canvas = canvasRef.current;

    if (!webcam || !canvas || !detectorRef.current) return;

    if (webcam.video?.readyState !== 4) {
      animationRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const video = webcam.video as HTMLVideoElement;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const hands = await detectorRef.current.estimateHands(video);

    const result: HandGesture = { left: "", right: "" };

    if (hands.length > 0) {
      initializeCanvas(canvasRef);

      hands.forEach((hand) => {
        drawHand(hand);

        const estimated = estimateGestures(hand.keypoints3D as any);

        const handedness = hand.handedness === "Left" ? "Right" : "Left";

        const smooth = smoothPrediction(estimated.name, handedness);

        detectCombo(smooth, handedness);

        result[handedness.toLowerCase()] = smooth;
      });
      console.log(result);
    }

    handleChangeHandGesture(result);

    animationRef.current = requestAnimationFrame(renderLoop);
  };

  useEffect(() => {
    if (!isDetecting) {
      console.log("Detector Dispose");
      detectorRef.current?.dispose();
      detectorRef.current = null;

      if (animationRef.current) {
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
      detectorRef.current?.dispose();
      detectorRef.current = null;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDetecting]);
};
