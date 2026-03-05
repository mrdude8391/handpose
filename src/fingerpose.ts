import * as fp from "fingerpose";
import type { Keypoint } from "@tensorflow-models/hand-pose-detection";

// add "✌🏻" and "👍" as sample gestures
const GE = new fp.GestureEstimator([
    fp.Gestures.VictoryGesture,
    fp.Gestures.ThumbsUpGesture
]);


export const estimateGestures = (keypoints3D: Keypoint[]) => {
    // using a minimum match score of 8.5 (out of 10)
    const estimatedGestures = GE.estimate(keypoints3D, 8.5);
    console.log(estimatedGestures)
}

