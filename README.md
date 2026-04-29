# 🌐 Hand Tracking Gesture Classifier

## 📃 Description

A Web app built using React and inference performed by MediaPipe Hands model. When a webcam is connected click start and the app will start detecting for hands. The main gesture is a "dog" hand sign which will summon the Fox Devil from the popular manga and anime series Chainsaw Man.<br>

## 🖼️ Demo
<img width="480" height="270" alt="480gif" src="https://github.com/user-attachments/assets/c6fc85d9-d5e7-43ea-ac3a-5272f68248f5" /><br>

## 👓 How it works
The webcam's video input is fed into MediaPipe Hands API and for each frame it returns a list of hands with the 21 3D hand keypoints or landmarks. The keypoints are then fed into the Fingerpose library to estimate the gesture being performed. The signal output can be noisy (i.e. blank or incorrect estimate in a rapid stream of estimates) so the raw ouput is fed into a smoothing function that will return the most frequent estimate in the last 20 estimates.  

## 🛠️ Libraries
* [Fingerpose](https://github.com/andypotato/fingerpose/tree/master) - A useful library for classifying gestures based on calculated weights on finger curl and direction
* [MediaPipeHands](https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection/src/mediapipe) - MediaPipe's hand landmark detection model

### Installing

* Clone repo

### Executing program

```
cd handpose
npm run dev
```


## 📝 Forward

The available gestures are essentially hard coded since they are calculated by math using the keypoints in relation to each other which can make the estimates finicky when trying to add new gestures. It would be an improvement if I could implement [MediaPipes gesture recognizer model](https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer/web_js?_gl=1*1pnkns7*_up*MQ..*_ga*MTIzMzQ0MDE5LjE3Nzc0ODAzMTk.*_ga_P1DBVKWT6V*czE3Nzc0OTMwODMkbzIkZzAkdDE3Nzc0OTMwODMkajYwJGwwJGgxMjM3NzE1MTY2)
. The tradeoff is that for each new custom gesture, the model will need labelled data for those gestures and I would have to retrain the model for detection. 
