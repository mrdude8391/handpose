import * as fp from "fingerpose";

const { Finger, FingerCurl, FingerDirection } = fp

// describe dog up gesture 
const pointUpDescription = new fp.GestureDescription('Point Up');

// index:
// - curl: none (must)
// - direction: vertical up (best)
// - direction: diagonal up left / right (acceptable)
pointUpDescription.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
pointUpDescription.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.9);
pointUpDescription.addDirection(Finger.Index, FingerDirection.VerticalUp, 1);
pointUpDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.8);
pointUpDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.8);


// thumb:
// - curl: half curl (best)
// - diagonal up left / right (acceptable)
pointUpDescription.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
pointUpDescription.addDirection(Finger.Index, FingerDirection.VerticalUp, 1);
pointUpDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.9);
pointUpDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.9);

// other fingers:
// - curl: full curl (best)
// - diagonal: vertical up (best)
// - diagonal: up left / right (acceptable)
for (let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
    pointUpDescription.addCurl(finger, FingerCurl.FullCurl, 1.0);
    pointUpDescription.addCurl(finger, FingerCurl.HalfCurl, 0.9);
    pointUpDescription.addDirection(finger, FingerDirection.VerticalUp, 1);
    pointUpDescription.addDirection(finger, FingerDirection.DiagonalUpRight, 0.9);
    pointUpDescription.addDirection(finger, FingerDirection.DiagonalUpLeft, 0.9);
}

export default pointUpDescription;
