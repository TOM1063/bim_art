import React from "react";
import { IFCLoader } from "web-ifc-three";
import {
  IFCWALL,
  IFCWALLSTANDARDCASE,
  IFCAIRTERMINAL,
  IFCAIRTERMINALBOX,
  IFCROTA,
} from "web-ifc";
import {
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  PlaneGeometry,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Mesh,
  DoubleSide,
  Plane,
  Vector3,
  AddEquation,
  MeshStandardMaterial,
  LineBasicMaterial,
  Raycaster,
  Vector2,
  OrthographicCamera,
  Box3,
  BoxGeometry,
} from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "dat.gui";

class Bimusica {
  constructor() {
    //essential

    this.selectModel = { id: -1 };

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

    this.mouse = new Vector2(0, 0);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.size.width, this.size.height);

    this.aspect = this.size.width / this.size.height;
    this.camera = new PerspectiveCamera(75, this.aspect);
    this.camera.position.z = 15;
    this.camera.position.y = 13;
    this.camera.position.x = 8;

    this.camera.depthTest = false;

    this.controls = new OrbitControls(this.camera, this.threeCanvas);
    this.controls.enableDamping = true;
    this.controls.target.set(-2, 0, 0);

    this.raycaster = new Raycaster();
    this.raycaster.firstHitOnly = true;

    this.texts_on_screen = [];

    //environment

    let grid = new GridHelper(50, 30);
    this.grid = grid;
    this.scene.add(grid);

    let axes = new AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 1;
    this.axes = axes;
    this.scene.add(axes);

    this.axes.visible = false;
    this.grid.visible = false;

    //component

    this.highlight_material = new MeshBasicMaterial({
      color: 0xff0000,
      side: DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    this.wire_material = new MeshBasicMaterial({
      color: 0xffffff,
      side: DoubleSide,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });
    this.outline_wire_material = new MeshBasicMaterial({
      color: 0xffffff,
      side: DoubleSide,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });

    // this.renderer.clippingPlanes = [scanner_plane];

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
    this.DEBUG = false;

    //gui

    this.gui = new GUI();
    this.gui.add(this, "MPM", 0, 240).name("MPM");
    this.gui.add(this, "DIRECTION", 1, 3).name("Direction");
    this.gui.add(this, "TARGET_TYPE").name("Target Type");
    this.gui.add(this, "DEBUG").name("debug mode");
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
      //compute bounding
      let bound = new Box3().setFromObject(ifcModel);
      let width = bound.max.x - bound.min.x;
      let height = bound.max.y - bound.min.y;
      let depth = bound.max.z - bound.min.z;
      let box = new BoxGeometry(width, height, depth);
      let bbox = new Mesh(box, this.outline_wire_material);

      let loaded_model_center = new Vector3(
        (bound.max.x + bound.min.x) / 2,
        (bound.max.y + bound.min.y) / 2,
        (bound.max.z + bound.min.z) / 2
      );

      this.controls.target.set(
        loaded_model_center.x,
        loaded_model_center.y,
        loaded_model_center.z
      );

      bbox.position.x = loaded_model_center.x;
      bbox.position.y = loaded_model_center.y;
      bbox.position.z = loaded_model_center.z;
      // bbox.position.y = height / 2;
      this.scene.add(bbox);
      this.bbox = bound;
      //
      //set bounding box

      const scanner_plane = new PlaneGeometry(width, height);

      // this.renderer.localClippingEnabled = true;
      // this.clip_plane = new Plane(new Vector3(0, 0, 1), 0);
      // this.clipping_material = new MeshBasicMaterial({
      //   clippingPlanes: [this.clip_plane],
      //   color: 0xffffff,
      //   side: DoubleSide,
      //   wireframe: true,
      // });
      const material = new MeshBasicMaterial({
        color: 0xffffff,
        side: DoubleSide,
        transparent: true,
        opacity: 0.5,
        blendAlpha: AddEquation,
        depthTest: false,
      });

      let scanner_mesh = new Mesh(scanner_plane, material);
      scanner_mesh.position.x = loaded_model_center.x;
      scanner_mesh.position.y = loaded_model_center.y;
      scanner_mesh.position.z = loaded_model_center.z;
      this.scanner = scanner_mesh;
      this.scene.add(scanner_mesh);

      //set model
      ifcModel.material = this.wire_material;
      this.ifcModels.push(ifcModel);
      this.scene.add(ifcModel);
      console.log(ifcModel);

      // this.ifcLoader.ifcManager
      //   .getAllItemsOfType(0, IFCWALLSTANDARDCASE, true)
      //   .then((item) => {
      //     console.log(item);
      //   });
    });
  };

  mouseHighlighting = () => {
    let touching = this.cast()[0];
    console.log("cast:", touching);
    if (touching) {
      this.selectModel = touching;

      let model_id = touching.object.modelID;
      let index = touching.faceIndex;
      let geometry = touching.object.geometry;
      let id = this.ifcLoader.ifcManager.getExpressId(geometry, index);
      this.highlight(this.highlight_material, model_id, id);
      this.displayProps(touching, model_id, id);
    }
  };

  cast = () => {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(this.ifcModels);
  };

  highlight = (_material, _modelid, _id) => {
    this.ifcLoader.ifcManager.createSubset({
      modelID: _modelid,
      ids: [_id],
      material: _material,
      scene: this.scene,
      removePrevious: true,
    });
  };

  displayProps = (_object, _modelid, _id) => {
    this.ifcLoader.ifcManager.getItemProperties(_modelid, _id).then((props) => {
      let name = props.Name.value;
      console.log("props:", props, "name", name, "object:", _object.point);
      let position = _object.point.clone();
      this.texts_on_screen.push(new TextOnScreen(_id, position, name));
    });
  };

  animate = () => {
    this.time += 1 / (60 / this.MPM);
    //1 / (60 / this.MPM)
    let clip = this.time % 60;
    if (this.scanner && this.bbox) {
      let position = map_range(clip, 0, 60, this.bbox.min.z, this.bbox.max.z);
      this.scanner.position.z = position;
    }
    // this.clip_plane.set(new Vector3(0, 0, 1), -position);
    // this.clipping_material = new MeshBasicMaterial({
    //   clippingPlanes: [this.clip_plane],
    //   color: 0xffffff,
    //   side: DoubleSide,
    //   // wireframe: true,
    //   transparent: true,
    //   blendEquation: AddEquation,
    //   blendEquationAlpha: AddEquation,
    //   opacity: 0.1,
    // });

    for (let text of this.texts_on_screen) {
      text.update(this.camera);
    }

    if (this.DEBUG) {
      this.axes.visible = true;
      this.grid.visible = true;
    } else {
      this.axes.visible = false;
      this.grid.visible = false;
    }
    //this.ifcModels.material = this.clipping_material;
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

    window.addEventListener("mousemove", (e) => {
      if (true) {
        this.mouse.x = (e.clientX / this.size.width) * 2 - 1;
        this.mouse.y = (e.clientY / this.size.height) * -2 + 1;
      }
    });

    window.addEventListener("mousedown", (e) => {
      console.log("thismouse", this.mouse);
      this.mouseHighlighting();
    });
  };
}

class TextOnScreen {
  constructor(_id, _pos, _text) {
    this.id = _id;
    this.pos = _pos;
    this.coord = "";
    this.text_dom = document.createElement("p");
    this.text_dom.style.setProperty("position", "absolute");
    //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
    this.text_dom.innerHTML = _text;
    this.text_dom.style.setProperty("color", "rgba(255,0,0)");
    this.text_dom.style.setProperty("pointer-events", "none");
    document.body.appendChild(this.text_dom);
  }

  update = (_camera) => {
    let coord = this.pos.clone();
    coord.project(_camera);
    this.coord = coord;
    let translation =
      "translate(" +
      window.innerWidth * ((coord.x + 1) / 2) +
      "px, " +
      window.innerHeight * ((-coord.y + 1) / 2) +
      "px)";
    // console.log("_pos:", _pos, "translation:", translation);
    this.text_dom.style.setProperty("transform", translation);
  };

  destructor() {
    this.id = "";
    this.pos = "";
    this.coord = "";
    this.text_dom = "";
  }
}

class TimeLine {
  constructor() {}
}

function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

export { Bimusica };
