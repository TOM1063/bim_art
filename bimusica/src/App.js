import classes from "./App.module.scss";
import FileUploader from "./FileUploader";
import { Bimusica } from "./ifc_app.js";
import { useEffect, useState } from "react";

function App() {
  const [file, setFile] = useState("");
  const start = (file_name) => {
    setFile(file_name);
    console.log("start with ", file_name);
    let bimusica = new Bimusica();
    bimusica.loadIFC(file_name);
    bimusica.animate();
    bimusica.events();
  };
  return (
    <div className={classes.app}>
      <h1 className={classes.title}>bimusica</h1>
      <canvas id="my-canvas" className="classes.my_canvas"></canvas>
      <link rel="stylesheet" href="https://use.typekit.net/xxn4fmg.css"></link>
      {!file ? <FileUploader start={start}></FileUploader> : ""}
    </div>
  );
}

export default App;
