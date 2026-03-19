import * as fp from "fingerpose";
import type { Keypoint } from "@tensorflow-models/hand-pose-detection";
import dogDescription from "./gestures/Dog";
import pointUpDescription from "./gestures/PointingUp";
import pointLeftDescription from "./gestures/PointingLeft";
import pointRightDescription from "./gestures/PointingRight";

// add "✌🏻" and "👍" as sample gestures
const GE = new fp.GestureEstimator([
    // fp.Gestures.VictoryGesture,
    // fp.Gestures.ThumbsUpGesture,
    dogDescription,
    pointUpDescription,
    pointLeftDescription,
    pointRightDescription
]);

interface Keypoint3D {
    x: number;
    y: number;
    z: number;
}

export const estimateGestures = (keypoints3D: Keypoint[]) => {
    const formattedKeypoints: Keypoint3D[] = keypoints3D.map((kp) => {
        const z = kp.z as number
        return { x: kp.x, y: kp.y, z: z }
    })
    // using a minimum match score of 8.5 (out of 10)
    const estimatedGestures = GE.estimate(formattedKeypoints, 8.5);
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

