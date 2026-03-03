import { useState } from "react";

import "./App.css";
import { Camera } from "./Camera";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <Camera></Camera>
      </div>
    </>
  );
}

export default App;
