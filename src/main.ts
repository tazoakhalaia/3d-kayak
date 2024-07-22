import {
  AmbientLight,
  AnimationMixer,
  CircleGeometry,
  Color,
  LoadingManager,
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
import { FBXLoader, GLTFLoader, Water } from "three/examples/jsm/Addons.js";
import { PalmPositions } from "./constants/palm-positions.constant";
import { UmrellaPositions } from "./constants/umrella-positions.constants";

class Kayak {
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private renderer?: WebGLRenderer;
  private stats?: Stats;
  private boat?: any;
  private fish?: any;
  private startGameState = false;
  private prizes = new Object3D();
  private right3DObjects = new Object3D();
  private umrellaObjects = new Object3D();
  private humanObjects = new Object3D();
  private goldTexute?: Texture;
  private score = document.querySelector("span");
  private startgame = document.querySelector(".startgame");
  private cashout = document.querySelector(".cashout");
  private winScore = document.querySelector(".win-score");
  private winAlert = document.querySelector(".win-alert");
  private winClose = document.querySelector(".win-close");
  private loading = document.querySelector(".loading");
  private scoreDiv = document.querySelector(".score");
  private app = document.querySelector(".app");
  private coins = 0;
  private step = 0;
  private coinStep = 0;
  private maxLoadValue = 0;
  private mixer?: AnimationMixer;
  private mixerArray: AnimationMixer[] = [];
  private loadingManager = new LoadingManager();
  private gltfLoader = new GLTFLoader(this.loadingManager);
  private fxbLoader = new FBXLoader();
  constructor() {
    this.loadingManager.onProgress = (url, loaded, total) => {
      const currentValue = (loaded / total) * 100;
      if (currentValue > this.maxLoadValue) {
        this.maxLoadValue = currentValue;
      }
      if (this.loading) {
        (this.loading as HTMLProgressElement).value = this.maxLoadValue;
        this.loading.setAttribute(
          "data-value",
          `${Math.floor(this.maxLoadValue)}`
        );
        if ((this.loading as HTMLProgressElement).value >= 100) {
          (this.loading as HTMLDivElement).style.display = "none";
          (this.startgame as HTMLDivElement).style.display = "flex";
          (this.scoreDiv as HTMLDivElement).style.display = "flex";
          (this.app as HTMLDivElement).style.display = "block";
        }
      }
    };
  }

  init() {
    this.scene = new Scene();
    this.scene.background = new TextureLoader().load("assets/sky.jpg");
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
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.app?.append(this.renderer.domElement);
    this.renderScene = this.renderScene.bind(this);
    window.addEventListener("resize", this.onWindowResize.bind(this));
    this.goldTexute = new TextureLoader().load("assets/coin.png");
    this.addEventListener();
    this.renderScene();
    this.showFPS();
    this.createSandPlane();
    this.createObjectsOnPlane();
    this.createBeachUmbrella();
    this.createLifeGuardHouse();
    this.createHumanAnimation();
    this.createPlane();
    this.directLight();
    this.createPrizes();
    this.createBoat();
    this.renderFish();
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
      waterNormals: waterNormals,
      waterColor: "aqua",
      distortionScale: 3.7,
    });

    water.rotation.x = Math.PI * -0.5;
    this.scene?.add(water);
  }
  ///End Plane

  ///Create Plane for sand and objects on plane
  createSandPlane() {
    const sandTexture = new TextureLoader().load(
      "assets/sand.jpg",
      (texture) => {
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(10, 320);
      }
    );
    const sandGeometry = new PlaneGeometry(100, 3200);
    const sandMaterial = new MeshBasicMaterial({ map: sandTexture });
    const sandPlane = new Mesh(sandGeometry, sandMaterial);
    sandPlane.rotation.x = Math.PI * -0.5;
    sandPlane.position.x = 90;
    this.scene?.add(sandPlane);
  }

  createObjectsOnPlane() {
    this.gltfLoader.load("models/ship.glb", (e) => {
      const ship = e.scene;
      ship.scale.set(5, 5, 5);
      ship.rotation.y = MathUtils.degToRad(-90);
      ship.position.y = -3;
      this.right3DObjects.position.x = 75;
      ship.position.z = -75;
      ship.name = "ship";
      for (let i = 0; i < 15; i++) {
        this.gltfLoader.load("models/palm.glb", (e) => {
          const palm = e.scene.clone();
          palm.scale.set(6, 6, 6);
          palm.position.z = i * -100;
          palm.position.x = PalmPositions[i];
          this.right3DObjects.add(palm);
        });
      }
      ship.rotation.x = MathUtils.degToRad(-20);
      this.right3DObjects.add(ship);
      this.scene?.add(this.right3DObjects);
    });
  }

  createBeachUmbrella() {
    this.gltfLoader.load("models/umbrella.glb", (e) => {
      for (let i = 0; i < 6; i++) {
        const umrella = e.scene.clone();
        umrella.name = "umbrella";
        umrella.scale.set(40, 40, 40);
        umrella.position.x = UmrellaPositions[i];
        umrella.position.z = -220 - 100 * i;
        this.umrellaObjects.add(umrella);
      }
      this.scene?.add(this.umrellaObjects);
    });
  }

  createLifeGuardHouse() {
    this.gltfLoader.load("models/lifeguard_post.glb", (e) => {
      const lifeguardPost = e.scene;
      lifeguardPost.scale.set(4, 4, 4);
      lifeguardPost.position.x = 70;
      lifeguardPost.position.z = -150;
      lifeguardPost.rotation.y = MathUtils.degToRad(-90);
      this.scene?.add(lifeguardPost);
    });
  }

  createHumanAnimation() {
    for (let i = 0; i < 10; i++) {
      this.fxbLoader.load("models/hand-rise.fbx", (e) => {
        e.scale.set(0.1, 0.1, 0.1);
        e.position.x = 45;
        e.position.z = -150 - 50 * i;
        e.rotation.y = MathUtils.degToRad(-25);
        this.mixer = new AnimationMixer(e);
        this.mixerArray.push(this.mixer);
        const action = this.mixer.clipAction(e.animations[0]);
        action.play();
        this.humanObjects.add(e);
      });
    }
    this.scene?.add(this.humanObjects);
  }
  ///END Create plane for sand objects on plane

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
    this.app?.append(this.stats.dom);
  }
  ///END FPS

  //DirectLight
  directLight() {
    const ambientLight = new AmbientLight("", 5);
    this.scene?.add(ambientLight);
  }
  ///End DirectLight

  //Create Boat
  createBoat() {
    this.gltfLoader.load("models/boat.glb", (e) => {
      this.boat = e.scene;
      this.boat.scale.set(10, 10, 10);
      this.boat.position.z = 35;
      this.boat.rotation.y = MathUtils.degToRad(180);
      this.scene?.add(this.boat);
    });
  }
  //END Create Boat
  ///Render Fish
  renderFish() {
    this.gltfLoader.load("models/fish.glb", (e) => {
      this.fish = e.scene;
      this.fish.scale.set(2, 2, 2);
      this.fish.position.x = 30;
      this.fish.position.z = 35;
      this.fish.position.y = 0;
      this.fish.rotateZ(0);
      this.fish.rotation.y = MathUtils.degToRad(270);
      this.scene?.add(this.fish);
    });
  }
  ///End Render Fish

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
    if (this.mixer) {
      this.mixerArray.forEach((mixer) => mixer.update(0.01));
    }
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
        this.fish.position.z -= 1;
        this.fish.position.x = 30 + 0.2 * Math.sin(this.step);
        this.fish.position.y = 11 * Math.sin(this.step);
        this.fish.rotateZ(0.02 * Math.sin(this.step));
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
    this.fish.position.z = 35;
    this.fish.position.x = 30;
    this.fish.position.y = 0;
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
