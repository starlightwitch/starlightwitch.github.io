const coverNode = document.getElementById("cover-sketch-div");
const capturer = new CCapture({ format: "png", framerate: 30 });

let dims = {
  w: 800,
  h: 800,
};

let sourceImages = [];
let imageNodes = [];
let noiseSpeed = 0.08;
let noiseStep = 0.0007;
let noiseAmp = 1.4;

let loadedFont;

let poem = [
  "i am the smell of honey",
  "suckle on a summer",
  "eve stroll, the neighborhood",
  "air fragrant",
  "and i am everywhere",
  "breeze, breathe, boys, deep",
  "take me, all in",
  "from the lightness in your step",
  "to the tingles on your skin",
  "the sweetness of me",
  "but for a moment;",
  "a porch swing pendulum",
  "counting the eve’s breezes",
  "of the honey",
  "suckle",
  "bloom",
];

// Define the p5 sketch methods
const sketch = (p) => {
  p.preload = () => {
    p.loadImage("honeys/honey1.png", (img) => {
      sourceImages.push(img);
    });
    p.loadImage("honeys/honey2.png", (img) => {
      sourceImages.push(img);
    });
    p.loadImage("honeys/honey3.png", (img) => {
      sourceImages.push(img);
    });

    p.loadImage("leaves/leaf1.png", (img) => {
      sourceImages.push(img);
      sourceImages.push(img);
    });
    p.loadImage("leaves/leaf2.png", (img) => {
      sourceImages.push(img);
      sourceImages.push(img);
    });
    p.loadImage("leaves/leaf3.png", (img) => {
      sourceImages.push(img);
    });

    p.loadFont(
      "https://use.typekit.net/af/82f7f8/00000000000000007735a9e8/30/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3",
      (font) => {
        loadedFont = font;
        console.log("font loaded");
      }
    );
  };

  p.setup = () => {
    var c = p.createCanvas(dims.w, dims.h);
    p.fill("#cafeff");
    p.noStroke();
    p.textSize(38);
    p.textAlign(p.LEFT, p.CENTER);
    p.textFont(loadedFont);
    p.frameRate(30);
    p.randomSeed(1);
    p.noiseSeed(800);

    p.startMillis = null;

    imageNodes = [];
    for (i = 0; i < 700; i++) {
      imageNodes.push(
        new Leaf(
          p,
          p.random(-dims.w * 0.1, dims.w * 1.1),
          p.random(-dims.h * 0.1, dims.h * 1.1),
          p.random(sourceImages)
        )
      );
    }
  };

  p.draw = () => {
    //capture code
    if (p.frameCount === 1) {
      capturer.start();
      console.log("beginning capture");
    }

    if (p.startMillis == null) {
      p.startMillis = p.millis();
    }

    // calculate t
    var duration = 8000;
    var elapsed = p.millis() - p.startMillis;
    var t = p.map(elapsed, 0, duration, 0, 1);
    console.log(t);

    // end at t=1
    if (t > 1) {
      p.noLoop();
      console.log("finished recording.");
      capturer.stop();
      capturer.save();
      return;
    }

    p.background("#065535");

    imageNodes.forEach((node) => {
      node.show(t);
    });

    p.push();
    p.translate(150, 10);
    poem.forEach((line, i) => {
      if (i == 0 || true) {
        p.fill("#103C4A");
        p.rect(-8, -5, p.textWidth(line) + 16, 45);
        p.fill("#cafeff");
        p.text(line, 0, 0);
        p.translate(0, 40);
      }
    });
  };

  p.windowResized = () => {
    dims = {
      w: coverNode.clientWidth,
      h: coverNode.clientHeight,
    };
    p.resizeCanvas(dims.w, dims.h);
  };
};

// Create the canvas and run the sketch in the html node.
new p5(sketch, coverNode);

class Leaf {
  constructor(p, x, y, img) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.image = img;
  }

  show(t) {
    let p = this.p;
    let noiseVal = p.noise(
      this.x * noiseStep + p.sin(p.TWO_PI * t) * noiseSpeed,
      this.y * noiseStep + p.sin(p.TWO_PI * t) * noiseSpeed
    );
    let scaleFactor = 0.35;
    p.push();
    p.translate(this.x, this.y - (noiseVal - 0.5) * 800);
    p.scale(scaleFactor, -scaleFactor);
    p.rotate(p.TWO_PI * noiseVal * noiseAmp);
    p.image(this.image, this.image.width / -2, 0);
    p.pop();
  }
}
