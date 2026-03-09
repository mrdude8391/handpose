import * as fp from "fingerpose";
import type { Keypoint } from "@tensorflow-models/hand-pose-detection";
import dogDescription from "./gestures/Dog";

// add "✌🏻" and "👍" as sample gestures
const GE = new fp.GestureEstimator([
    fp.Gestures.VictoryGesture,
    fp.Gestures.ThumbsUpGesture,
    dogDescription
]);

export interface HandGesture {
    hand: string,
    gesture: string
}

export const estimateGestures = (keypoints3D: Keypoint[]) => {
    // using a minimum match score of 8.5 (out of 10)
    const estimatedGestures = GE.estimate(keypoints3D, 8.5);
    console.log('est', estimatedGestures)
    let result = {
        name: '',
        score: 0
    }
    // originally the fingerpose library from npm is using outdated handpose library whichcan only detect one hand.
    // new updtaed fingerpose library is only available on github and supports multiple hands and uses the 3d keypoints

    // console.log(estimatedGestures)
    if (estimatedGestures.gestures.length > 0) {
        result = estimatedGestures.gestures.reduce((p, c) => {
            return (p.score > c.score) ? p : c
        })
        return result
    }

    return result

}

