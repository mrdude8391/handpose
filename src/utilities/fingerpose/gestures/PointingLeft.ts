import * as fp from "fingerpose";

const { Finger, FingerCurl, FingerDirection } = fp

const pointLeftDescription = new fp.GestureDescription('Point Left');

// thumb:
// - curl: half curl (best)
// - direction: horizontal left (best)
pointLeftDescription.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1);
pointLeftDescription.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.9);
pointLeftDescription.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 1);
pointLeftDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.8);
pointLeftDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalDownLeft, 0.8);

// index:
// - curl: none (must)
// - direction: horizontal left(best)
pointLeftDescription.addCurl(Finger.Index, FingerCurl.NoCurl, 1);
pointLeftDescription.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.9);
pointLeftDescription.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 1);
pointLeftDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.9);
pointLeftDescription.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.8);

// other fingers:
// - curl: full curl (best)
// - diagonal: horizontal left (best)
for (let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
    pointLeftDescription.addCurl(finger, FingerCurl.FullCurl, 1.0);
    pointLeftDescription.addDirection(finger, FingerDirection.HorizontalLeft, 1);
    pointLeftDescription.addDirection(finger, FingerDirection.DiagonalUpLeft, 0.9);
    pointLeftDescription.addDirection(finger, FingerDirection.DiagonalDownLeft, 0.8);
}

export default pointLeftDescription;
