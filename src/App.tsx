import { useState } from "react";

import "./App.css";
import { Camera } from "./Camera";
import CameraV2 from "./CameraV2";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        {/* <Camera></Camera> */}
        <CameraV2></CameraV2>
      </div>
    </>
  );
}

export default App;
