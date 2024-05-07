import React from "react";
import classes from "./FileUploader.module.scss";
import { useState, useEffect } from "react";

const FileUploader = (props) => {
  const [file, setFile] = useState("");
  const onFileSelected = (e) => {
    let file_name = e.currentTarget.files[0];
    setFile(file_name);
    console.log("selected : ", file);
  };
  const play = () => {
    console.log("play with : ", file);
    props.start(file);
  };
  return (
    <div className={classes.container}>
      <div className={classes.file_uploader}>
        <h1 className={classes.title}>What is bimusica ?</h1>
        <p className={classes.description}>
          bimusica is an web-app that generate visual and sound from your bim
          data. Drag and drop your bim data (.ifc) and start !
        </p>
        <div className={classes.drag_area}>
          <div className={classes.icon_container}>
            <img src="upload.svg" />
            <div className={classes.file_selector}>
              <input
                type="file"
                accept=".ifc"
                onChange={(e) => {
                  onFileSelected(e);
                }}
              />
            </div>
          </div>
        </div>
        <div className={classes.button_container}>
          <button
            className={file ? classes.button : classes.button_disabled}
            onClick={play}
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
