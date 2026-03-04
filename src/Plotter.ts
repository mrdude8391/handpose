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

export const initializeCanvas = (canvasRef: RefObject<HTMLCanvasElement | null>) => {
    if (!canvas && canvasRef.current) canvas = canvasRef.current // assign canvas if null
}

export const plotter = (hands: handPoseDetection.Hand[]) => {

    if (hands.length > 0 && canvas) {
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
        ctx.strokeStyle = 'White';
        ctx.lineWidth = 1;

        const drawPoint = (points: handPoseDetection.Keypoint[], finger: number) => {
            for (let i = 0; i < points.length; i++) {
                const point = points[i]

                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)

                ctx.fillStyle = fingerColorIndex[finger]
                ctx.fill();
            }
        }

        const drawPath = (points: handPoseDetection.Keypoint[]) => {
            const region = new Path2D();
            region.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                const point = points[i];
                region.lineTo(point.x, point.y);
            }
            ctx.stroke(region);
        }

        const drawFinger = (points: handPoseDetection.Keypoint[], finger: number) => {
            // set up region for paths
            const region = new Path2D();
            region.moveTo(points[0].x, points[0].y);

            if (finger === 4) {
                // draw point

                ctx.beginPath();
                ctx.arc(points[0].x, points[0].y, 4, 0, 2 * Math.PI)
                ctx.fillStyle = "yellow"
                ctx.fill();
            }

            for (let i = 1; i < points.length; i++) {
                const point = points[i];
                // draw point
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
                ctx.fillStyle = fingerColorIndex[finger]
                ctx.fill();

                // map line path
                region.lineTo(point.x, point.y);
            }
            // stroke the region lines
            ctx.stroke(region);
        }

        hands.forEach((hand) => {
            const fingers = Object.keys(fingerLookupIndices); // array of strings of the fingers [thumb, index, middle,...]
            for (let i = 0; i < fingers.length; i++) {
                // const finger = fingers[i] i.e "thumb"
                const points = fingerLookupIndices[fingers[i]].map(idx => hand.keypoints[idx]); // returns all the points for the i index finger
                // drawPoint(points, i)
                // drawPath(points);
                drawFinger(points, i)
            }
        })
        console.log(hands)
    }
}

export const plot = (hand: handPoseDetection.Hand) => {
    if (hand && canvas) {
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
        ctx.strokeStyle = 'White';
        ctx.lineWidth = 1;

        const drawHand = (points: handPoseDetection.Keypoint[], finger: number) => {
            // set up region for paths
            const region = new Path2D();
            region.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                const point = points[i];
                // draw point
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
                ctx.fillStyle = fingerColorIndex[finger]
                ctx.fill();

                // map line path
                region.lineTo(point.x, point.y);
            }
            // stroke the region lines
            ctx.stroke(region);
        }
        // we have hand object 
        // loop all keypoints 
        hand.keypoints.forEach((keypoints) => {
            for (let i = 0; i < hand.keypoints.length; i++) {

                const fingers = Object.keys(fingerLookupIndices);
                for (let j = 0; j < fingers.length; j++) {
                    const finger = fingers[j];
                    const points = fingerLookupIndices[finger].map(idx => hand.keypoints[idx]);
                    drawHand(points, j)
                }
            }
        })



    }
}