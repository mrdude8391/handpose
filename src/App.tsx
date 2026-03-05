import { useState } from "react";

import "./App.css";
import { Camera } from "./Camera";
import CameraV2 from "./CameraV2";
import Canvas from "./Canvas";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      {/* <Camera></Camera> */}
      <CameraV2></CameraV2>
    </>
  );
}

export default App;
