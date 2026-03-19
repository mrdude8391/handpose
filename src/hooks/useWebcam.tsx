import { useEffect, useState } from "react";

export const useWebcam = () => {
  const [hasWebcam, setHasWebcam] = useState(false);

  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
    } else {
      // List cameras and microphones.
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const isWebcam = devices.some(
            (device) => device.kind === "videoinput",
          );
          console.log(isWebcam);
          if (isWebcam) {
            setHasWebcam(true);
          } else {
            setHasWebcam(false);
          }
        })
        .catch((err) => {
          console.error(`${err.name}: ${err.message}`);
          setHasWebcam(false);
        });
    }
  }, []);

  return hasWebcam;
};
