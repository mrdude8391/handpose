import * as fp from "fingerpose";

const { Finger, FingerCurl, FingerDirection } = fp

const pointRightDescription = new fp.GestureDescription('Point Right');

// index:
// - curl: none (must)
// - direction: horizontal left(best)
pointRightDescription.addCurl(Finger.Index, FingerCurl.NoCurl, 1);
pointRightDescription.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.9);
pointRightDescription.addDirection(Finger.Index, FingerDirection.HorizontalRight, 1);
pointRightDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.8);
pointRightDescription.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 0.8);



// thumb:
// - curl: half curl (best)
// - direction: horizontal left (best)
pointRightDescription.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1);
pointRightDescription.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.9);
pointRightDescription.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1);
pointRightDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.8);
pointRightDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalDownRight, 0.8);

// other fingers:
// - curl: full curl (best)
// - diagonal: horizontal left (best)
for (let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
    pointRightDescription.addCurl(finger, FingerCurl.FullCurl, 1.0);
    pointRightDescription.addDirection(finger, FingerDirection.HorizontalRight, 1);
    pointRightDescription.addDirection(finger, FingerDirection.DiagonalUpRight, 0.8);
    pointRightDescription.addDirection(finger, FingerDirection.DiagonalDownRight, 0.8);
}

export default pointRightDescription;
