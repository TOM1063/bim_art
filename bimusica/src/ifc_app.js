import React from "react";
import { IFCLoader } from "web-ifc-three";
import {
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "dat.gui";

class Bimusica {
  constructor() {
    //essential

    this.threeCanvas = document.getElementById("my-canvas");
    this.scene = new Scene();
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.renderer = new WebGLRenderer({
      canvas: this.threeCanvas,
      alpha: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.size.width, this.size.height);

    this.aspect = this.size.width / this.size.height;
    this.camera = new PerspectiveCamera(75, this.aspect);
    this.camera.position.z = 15;
    this.camera.position.y = 13;
    this.camera.position.x = 8;

    this.controls = new OrbitControls(this.camera, this.threeCanvas);
    this.controls.enableDamping = true;
    this.controls.target.set(-2, 0, 0);

    //environment

    let lightColor = 0xffffff;
    let ambientLight = new AmbientLight(lightColor, 0.5);
    this.scene.add(ambientLight);

    let directionalLight = new DirectionalLight(lightColor, 1);
    directionalLight.position.set(0, 10, 0);
    directionalLight.target.position.set(-5, 0, 0);
    this.scene.add(directionalLight);
    this.scene.add(directionalLight.target);

    let grid = new GridHelper(50, 30);
    this.scene.add(grid);

    let axes = new AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 1;
    this.scene.add(axes);

    //ifc init
    this.ifcModels = [];
    this.ifcLoader = new IFCLoader();

    //-------------user parameter-------------

    this.time = 0;
    this.MPM = 60; // meter per minit
    this.DIRECTION = 1; //x:1, y:2, z:3
    this.TARGET_TYPE = ""; // element type to use
    this.BOUND = {
      x: 0,
      y: 0,
      z: 0,
    };

    //gui

    this.gui = new GUI();
    this.gui.add(this, "MPM", 0, 240).name("MPM");
    this.gui.add(this, "DIRECTION", 1, 3).name("Direction");
    this.gui.add(this, "TARGET_TYPE").name("Target Type");
    this.gui.close();
  }

  //-------------methods-------------

  loadIFC = (_file) => {
    this.ifc_file = _file;
    console.log("run main.js with file ", _file);
    this.ifcLoader.ifcManager.setWasmPath("../../wasm/");
    let ifcURL = URL.createObjectURL(_file);
    console.log("url:", ifcURL);
    console.log("path", ifcURL);
    //"/sample-model.ifc"
    this.ifcLoader.load(ifcURL, (ifcModel) => {
      this.ifcModels.push(ifcModel);
      this.scene.add(ifcModel);
    });
  };

  animate = () => {
    this.time += 1 / (60 / this.MPM);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  };

  events = () => {
    window.addEventListener("resize", () => {
      this.size.width = window.innerWidth;
      this.size.height = window.innerHeight;
      this.camera.aspect = this.size.width / this.size.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.size.width, this.size.height);
    });
  };
}

export { Bimusica };
