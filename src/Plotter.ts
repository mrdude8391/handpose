import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import type { RefObject } from "react";

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

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

export const initializeCanvas = (canvasRef: RefObject<HTMLCanvasElement | null>) => {
    if (!canvas && canvasRef.current) {
        canvas = canvasRef.current
        ctx = canvas.getContext("2d") as CanvasRenderingContext2D

    } // assign canvas if null
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

export const drawHand = (hand: handPoseDetection.Hand) => {
    if (hand && canvas && ctx) {
        ctx.strokeStyle = 'White';
        ctx.lineWidth = 1;
        const drawFinger = (points: handPoseDetection.Keypoint[], finger: number) => {

            // set up region for paths
            const region = new Path2D();
            region.moveTo(points[0].x, points[0].y);
            // index start at 1 and ignore drawing point 0 multiple times
            for (let i = 1; i < points.length; i++) {
                const point = points[i];
                // draw point
                ctx!.beginPath();
                ctx!.arc(point.x, point.y, 4, 0, 2 * Math.PI)
                ctx!.fillStyle = fingerColorIndex[finger]
                ctx!.fill();

                // map line path
                region.lineTo(point.x, point.y);
            }
            // stroke the region lines
            ctx!.stroke(region);
        }
        // go through all the fingers one at a time to draw the lines for each finger
        // array of fingers
        const fingers = Object.keys(fingerLookupIndices);
        // loop through all the fingers
        for (let i = 0; i < fingers.length; i++) {
            const finger = fingers[i]; // current finger i.e. thumb
            const points = fingerLookupIndices[finger].map(idx => hand.keypoints[idx]); // using the index, enter the thumb key. get all the indexes for thumb.
            // using the index of each thumb keypoint. get all the keypoints from hand object.
            // draw the finger using all the points, and pass the index of the finger. ie thumb is 0
            drawFinger(points, i)
        }

        // exception draw wrist point 0 on its own
        const wrist = hand.keypoints[0]
        // draw point
        ctx.beginPath();
        ctx.arc(wrist.x, wrist.y, 4, 0, 2 * Math.PI)
        ctx.fillStyle = 'yellow'
        ctx.fill();
    }
}