import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import type { RefObject } from "react";

let canvas: HTMLCanvasElement | null = null

interface fingerLookupIndices {
    [key: string]: number[]
}

const fingerLookupIndices: fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20],
}; // for rendering each finger as a polyline

const fingerColorIndex = ["green", "purple", "blue", "red", 'orange']

const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20]
];



export const plotter = (hands: handPoseDetection.Hand[], canvasRef: RefObject<HTMLCanvasElement | null>) => {



    if (canvasRef.current) canvas = canvasRef.current

    if (hands.length > 0 && canvas) {
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

        const drawPoint = (points: handPoseDetection.Keypoint[], finger: number) => {
            for (let i = 0; i < points.length; i++) {
                const point = points[i]
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 3 * Math.PI)

                ctx.fillStyle = fingerColorIndex[finger]
                ctx.strokeStyle = 'White';
                ctx.lineWidth = 1;
                ctx.fill();
            }

        }

        const drawPath = (points: handPoseDetection.Keypoint[], closePath: boolean) => {
            const region = new Path2D();
            region.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                const point = points[i];
                region.lineTo(point.x, point.y);
            }

            if (closePath) {
                region.closePath();
            }
            ctx.stroke(region);
        }

        hands.forEach((hand) => {
            for (let i = 0; i < hand.keypoints.length; i++) {

                const fingers = Object.keys(fingerLookupIndices);
                for (let i = 0; i < fingers.length; i++) {
                    const finger = fingers[i];
                    const points = fingerLookupIndices[finger].map(idx => hand.keypoints[idx]);
                    drawPath(points, false);
                    drawPoint(points, i)
                }
            }
        })


        console.log(hands)
    }
}