import { useEffect, useRef, type RefObject } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
};

// Plotter utility but in the form of a react hook
export const usePlotter = ({ canvasRef }: Props) => {
  // we need to pass in the canvasRef so the plotter has access to it
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null); // useRef here to have one instance of the context

  interface fingerLookupIndices {
    [key: string]: number[];
  }

  const fingerLookupIndices: fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20],
  }; // for rendering each finger as a polyline

  const fingerColorIndex = ["green", "purple", "blue", "red", "orange"];

  useEffect(() => {
    // console.log("usePlotter useEffect"); // This useEffect runs first, before useGestureDetector
    // we need to initialize the canvas rendering context so we can draw on the canvas
    if (canvasRef.current) {
      console.log("Canvas Context Initialized");
      ctxRef.current = canvasRef.current.getContext(
        "2d",
      ) as CanvasRenderingContext2D;
    }

    return () => {
      console.log("unmount plotter");
      ctxRef.current = null; // cleanup ctxRef when plotter is unmounted
    };
  }, []);

  const drawHand = (hand: handPoseDetection.Hand) => {
    if (hand && canvasRef.current && ctxRef.current) {
      ctxRef.current.strokeStyle = "White";
      ctxRef.current.lineWidth = 1;
      const drawFinger = (
        points: handPoseDetection.Keypoint[],
        finger: number,
      ) => {
        // set up region for paths
        const region = new Path2D();
        region.moveTo(points[0].x, points[0].y);
        // index start at 1 and ignore drawing point 0 multiple times
        for (let i = 1; i < points.length; i++) {
          const point = points[i];
          // draw point
          ctxRef.current!.beginPath();
          ctxRef.current!.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctxRef.current!.fillStyle = fingerColorIndex[finger];
          ctxRef.current!.fill();

          // map line path
          region.lineTo(point.x, point.y);
        }
        // stroke the region lines
        ctxRef.current!.stroke(region);
      };
      // go through all the fingers one at a time to draw the lines for each finger
      // array of fingers
      const fingers = Object.keys(fingerLookupIndices);
      // loop through all the fingers
      for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i]; // current finger i.e. thumb
        const points = fingerLookupIndices[finger].map(
          (idx) => hand.keypoints[idx],
        ); // using the index, enter the thumb key. get all the indexes for thumb.
        // using the index of each thumb keypoint. get all the keypoints from hand object.
        // draw the finger using all the points, and pass the index of the finger. ie thumb is 0
        drawFinger(points, i);
      }

      // exception draw wrist point 0 on its own
      const wrist = hand.keypoints[0];
      // draw point
      ctxRef.current.beginPath();
      ctxRef.current.arc(wrist.x, wrist.y, 4, 0, 2 * Math.PI);
      ctxRef.current.fillStyle = "yellow";
      ctxRef.current.fill();
    }
  };

  return { drawHand };
};
