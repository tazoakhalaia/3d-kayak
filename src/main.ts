import {
  DirectionalLight,
  DirectionalLightHelper,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GLTFLoader, Water } from "three/examples/jsm/Addons.js";

class Kayak {
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private renderer?: WebGLRenderer;
  private plane?: Mesh;
  private stats?: Stats;
  private boat?: any;
  private startGameState = false;
  private directlight?: DirectionalLight;

  init() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 30, 130);
    this.camera.lookAt(this.scene.position);
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor("black");
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.append(this.renderer.domElement);
    this.renderScene = this.renderScene.bind(this);
    window.addEventListener("resize", this.onWindowResize.bind(this));
    this.renderScene();
    this.showFPS();
    this.createPlane();
    this.directLight();
    this.createBoat();
  }

  ///Plane
  createPlane() {
    const waterGeometry = new PlaneGeometry(60, 600);

    const textureLoader = new TextureLoader();
    const waterNormals = textureLoader.load(
      "assets/water.jpg",
      (texture) => {
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
      }
    );

    const water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormals,
      alpha: 1.0,
      sunDirection: new Vector3(),
      sunColor: 'aqua',
      waterColor: 'aqua',
      distortionScale: 3.7,
    });

    water.rotation.x = Math.PI * -0.5;
    water.receiveShadow = true;
    this.plane = water;
    this.scene?.add(water);
  }
  ///End Plane

  //create FPS on screen
  showFPS() {
    this.stats = new Stats();
    document.body.append(this.stats.dom);
  }
  ///END FPS

  //DirectLight
  directLight() {
    this.directlight = new DirectionalLight(0xffffff, 10);
    this.directlight.position.set(50, 90, 60);
    this.directlight.castShadow = true;

    this.directlight.shadow.mapSize.width = 2048;
    this.directlight.shadow.mapSize.height = 2048;
    this.directlight.shadow.camera.near = 0.1;
    this.directlight.shadow.camera.far = 1000;
    this.directlight.shadow.camera.left = -100;
    this.directlight.shadow.camera.right = 100;
    this.directlight.shadow.camera.top = 300;
    this.directlight.shadow.camera.bottom = -300;

    const helper = new DirectionalLightHelper(this.directlight, 5);
    this.scene?.add(this.directlight, helper);
  }
  ///End DirectLight

  //Create Boat
  createBoat() {
    const gltLoader = new GLTFLoader();
    gltLoader.load("models/boat.glb", (e) => {
      this.boat = e.scene;
      this.boat.scale.set(10, 10, 10);
      this.boat.position.z = 35;
      this.boat.rotation.y = 33;
      this.boat.rotation.y = MathUtils.degToRad(180);
      this.scene?.add(this.boat);
    });
  }
  //END Create Boat

  /// resize and render
  onWindowResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
  renderScene() {
    this.renderer?.setAnimationLoop(this.renderScene);
    if (this.boat && this.directlight && this.camera) {
      this.boat.position.z -= 0.5;
      this.camera.position.z -= 0.5;
      this.directlight.position.z -= 0.5;
    }
    if (this.scene && this.camera) {
      this.stats?.update();
      this.renderer?.render(this.scene, this.camera);
    }
  }
}

const kayak = new Kayak();
kayak.init();
