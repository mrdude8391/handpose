import * as fp from "fingerpose";

const { Finger, FingerCurl, FingerDirection } = fp

// describe dog up gesture 
const dogDescription = new fp.GestureDescription('dog');

// thumb:
// - curl: none (must)
// - direction horizontal left / right (acceptable)
dogDescription.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
dogDescription.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 1);
dogDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.9);
dogDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.9);
dogDescription.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1);


// index // pinky:
// - no curl (best)
// - diagonal up left / right (acceptable)
for (let finger of [Finger.Index, Finger.Pinky]) {
    dogDescription.addCurl(finger, FingerCurl.NoCurl, 1.0);
    dogDescription.addDirection(finger, FingerDirection.DiagonalUpRight, 1);
    dogDescription.addDirection(finger, FingerDirection.DiagonalUpLeft, 1);
}

// ring // middle:
// - half curl (best)
// - diagonal up left / right (acceptable)
for (let finger of [Finger.Middle, Finger.Ring]) {
    dogDescription.addCurl(finger, FingerCurl.HalfCurl, 1.0);
    dogDescription.addDirection(finger, FingerDirection.DiagonalUpRight, 1);
    dogDescription.addDirection(finger, FingerDirection.DiagonalUpLeft, 1);
}

export default dogDescription;
