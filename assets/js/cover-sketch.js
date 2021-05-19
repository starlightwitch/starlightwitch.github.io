const coverNode = document.getElementById("cover-sketch-div");

let dims = {
  w: coverNode.clientWidth,
  h: coverNode.clientHeight,
};

let leafImages = [];
let leaves = [];
let titleImgage;

// Define the p5 sketch methods
const sketch = (p) => {
  p.preload = () => {
    p.loadImage("assets/img/leaf1.png", (img) => {
      leafImages.push(img);
    });
    p.loadImage("assets/img/leaf2.png", (img) => {
      leafImages.push(img);
    });
    p.loadImage("assets/img/leaf3.png", (img) => {
      leafImages.push(img);
    });
    p.loadImage("assets/img/leaf4.png", (img) => {
      leafImages.push(img);
    });
    p.loadImage("assets/img/title.png", (img) => {
      titleImage = img;
    });
  };

  p.setup = () => {
    var c = p.createCanvas(dims.w, dims.w * (2 / 3));
    p.leafCols = p.round(p.width / 25);
    p.leafRows = p.round(p.width / 50);

    leaves = [];
    for (i = 0; i < p.leafRows; i++) {
      let currLeafRow = [];
      for (j = 0; j < p.leafCols; j++) {
        currLeafRow.push(p.random(leafImages));
      }
      leaves.push(currLeafRow);
    }
  };

  p.draw = () => {
    p.background("#0e0e0e");

    let leafDx = p.width / (p.leafCols-2);
    let leafDy = p.height / (p.leafRows-2);

    let noiseSpeed = 0.002;
    let noiseStep = 0.03;
    let noiseAmp = 1.4;

    p.push();
    p.translate(-leafDx * 0.5, -leafDy * 0.75);
    for (i = 0; i < p.leafRows; i++) {
      for (j = 0; j < p.leafCols; j++) {
        let noiseVal = p.noise(
          i * noiseStep + p.frameCount * noiseSpeed,
          j * noiseStep + p.frameCount * noiseSpeed
        );
        p.push();
        p.scale(0.3, -0.3);
        p.rotate(p.TWO_PI * noiseVal * noiseAmp);
        p.translate(-leaves[i][j].width * 0.5, 0);
        p.image(leaves[i][j], 0, 0);
        p.pop();
        p.translate(leafDx, 0);
      }
      p.translate(-leafDx * p.leafCols, leafDy);
    }
    p.pop();

    p.push();
    p.imageMode(p.CENTER);
    p.translate(p.width / 2, p.height / 2);
    let titleWidth = p.width * 0.7;
    let titleHeight = (titleWidth / titleImage.width) * titleImage.height;
    p.image(titleImage, 0, 0, titleWidth, titleHeight);
    p.pop();
  };

  p.windowResized = () => {
    dims = {
      w: coverNode.clientWidth,
      h: coverNode.clientHeight,
    };
    console.log(dims);

    p.resizeCanvas(dims.w, dims.h);
  };
};

// Create the canvas and run the sketch in the html node.
new p5(sketch, coverNode);
