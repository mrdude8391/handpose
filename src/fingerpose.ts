import * as fp from "fingerpose";
import type { Keypoint } from "@tensorflow-models/hand-pose-detection";

// add "✌🏻" and "👍" as sample gestures
const GE = new fp.GestureEstimator([
    fp.Gestures.VictoryGesture,
    fp.Gestures.ThumbsUpGesture
]);



export const estimateGestures = (keypoints: Keypoint) => {
    // using a minimum match score of 8.5 (out of 10)
    const estimatedGestures = GE.estimate(keypoints, 8.5);
    return estimatedGestures
}
