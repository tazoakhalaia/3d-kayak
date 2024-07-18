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
  private startgame = document.querySelector(".startgame");
  private cashout = document.querySelector(".cashout");
  private winScore = document.querySelector(".win-score");
  private winAlert = document.querySelector(".win-alert");
  private winClose = document.querySelector(".win-close");
  private coins = 0;
  private step = 0;
  private coinStep = 0;
  private gltfLoader = new GLTFLoader();

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
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.append(this.renderer.domElement);
    this.renderScene = this.renderScene.bind(this);
    window.addEventListener("resize", this.onWindowResize.bind(this));
    this.goldTexute = new TextureLoader().load("assets/coin.png");
    this.addEventListener();
    this.renderScene();
    this.showFPS();
    this.createPlane();
    this.directLight();
    this.createPrizes();
    this.createBoat();
  }

  ///Plane
  createPlane() {
    const waterGeometry = new PlaneGeometry(80, 3200);

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
      waterColor: "aqua",
      distortionScale: 3.7,
    });

    water.rotation.x = Math.PI * -0.5;
    water.receiveShadow = true;
    this.plane = water;
    this.scene?.add(water);
  }
  ///End Plane

  ///Show Win Alert
  showWinAlert() {
    if (this.winScore) {
      (this.winAlert as HTMLDivElement).style.display = "flex";
      this.winScore.innerHTML = `${this.coins}`;
    }
  }
  ///End Win Alert

  startAction() {
    this.startGameState = true;
    if (this.startgame) {
      (this.startgame as HTMLDivElement).style.display = "none";
      (this.cashout as HTMLDivElement).style.display = "flex";
    }
  }

  closeAction() {
    this.resert();
    (this.winAlert as HTMLDivElement).style.display = "none";
    (this.startgame as HTMLDivElement).style.display = "flex";
  }

  cashoutAction() {
    this.startGameState = false;
    (this.cashout as HTMLDivElement).style.display = "none";
    this.showWinAlert();
  }

  addEventListener = () => {
    this.startgame?.addEventListener("click", () => this.startAction());
    this.cashout?.addEventListener("click", () => this.cashoutAction());
    this.winClose?.addEventListener("click", () => this.closeAction());
  };
  removeEventListener = () => {
    this.startgame?.removeEventListener("click", () => this.startAction());
    this.cashout?.removeEventListener("click", () => this.cashoutAction());
    this.winClose?.removeEventListener("click", () => this.closeAction());
  };

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
    this.gltfLoader.load("models/boat.glb", (e) => {
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
      this.prizes.children[i].position.z = i * -150;
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
    if (this.boat && this.camera) {
      if (this.startGameState) {
        this.step += 0.04;
        this.coinStep += 0.08;
        for (let i = 0; i < this.prizes.children.length; i++) {
          const coins = this.prizes.children[i];
          coins.position.y = 10 + 1.5 * Math.sin(this.coinStep);
        }
        this.boat.position.z -= 1;
        this.camera.position.z -= 1;
        this.boat.position.x = 1.5 * Math.sin(this.step);
        if (this.boat.position.z <= -1410) {
          this.startGameState = false;
          this.showWinAlert();
          (this.cashout as HTMLDivElement).style.display = "none";
        }
      }
      for (let i = 0; i < this.prizes.children.length; i++) {
        const coin = this.prizes.children[i];
        if (this.boat.position.z - 25 === this.prizes.children[i].position.z) {
          const scale = () => {
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
    this.renderer?.setAnimationLoop(this.renderScene);
  }

  resert = () => {
    this.removeEventListener();
    this.startGameState = false;
    this.boat.position.z = 35;
    for (let i = this.prizes.children.length - 1; i >= 0; i--) {
      this.prizes.remove(this.prizes.children[i]);
    }
    this.createPrizes();
    this.coins = 0;
    if (this.score) {
      this.score.innerHTML = `${this.coins}`;
    }
    if (this.camera) {
      this.camera.position.set(0, 30, 130);
    }
  };
}

const kayak = new Kayak();
kayak.init();
