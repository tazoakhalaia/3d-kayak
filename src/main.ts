import {
  AmbientLight,
  CircleGeometry,
  Color,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  Texture,
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
  private prizes = new Object3D();
  private goldTexute?: Texture;
  private score = document.querySelector("span");
  private coins = 0;

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
    this.goldTexute = new TextureLoader().load("assets/coin.png");
    this.renderScene();
    this.showFPS();
    this.createPlane();
    this.directLight();
    this.createPrizes();
    this.createBoat();
  }

  ///Plane
  createPlane() {
    const waterGeometry = new PlaneGeometry(60, 1600);

    const textureLoader = new TextureLoader();
    const waterNormals = textureLoader.load("assets/water.jpg", (texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
    });

    const water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormals,
      alpha: 1.0,
      sunDirection: new Vector3(),
      sunColor: "aqua",
      waterColor: "aqua",
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
    this.stats.dom.style.position = "absolute";
    this.stats.dom.style.left = "90%";
    document.body.append(this.stats.dom);
  }
  ///END FPS

  //DirectLight
  directLight() {
    const ambientLight = new AmbientLight("", 6);
    this.scene?.add(ambientLight);
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

  ///Create Prizes
  createPrizes() {
    for (let i = 0; i < 10; i++) {
      const prizeGeometry = new CircleGeometry(5);
      const prizeMaterial = new MeshBasicMaterial({ map: this.goldTexute });
      prizeMaterial.color = new Color(0.5, 0.5, 0.5);
      const prizeMesh = new Mesh(prizeGeometry, prizeMaterial);
      this.prizes?.add(prizeMesh);
      this.prizes.children[i].position.z = i * -100;
      this.prizes.children[i].position.y = 10;
      this.scene?.add(this.prizes);
    }
  }
  ///END Create Prizes

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
    if (this.boat && this.camera) {
      this.boat.position.z -= 0.5;
      this.camera.position.z -= 0.5;
      for (let i = 0; i < this.prizes.children.length; i++) {
        const coin = this.prizes.children[i];
        if (this.boat.position.z - 25 === this.prizes.children[i].position.z) {
          const scale = () => {
            coin.position.x += 1;
            coin.position.y += 1;
            coin.scale.x -= 0.025;
            coin.scale.y -= 0.025;
            coin.scale.z -= 0.025;
            if (coin.scale.x <= 0) {
              this.prizes.remove(this.prizes.children[i]);
              return;
            }
            requestAnimationFrame(scale);
          };
          scale();
          this.coins++;
          if (this.score) {
            this.score.innerHTML = `${this.coins}`;
          }
        }
      }
    }
    if (this.scene && this.camera) {
      this.stats?.update();
      this.renderer?.render(this.scene, this.camera);
    }
  }
}

const kayak = new Kayak();
kayak.init();
