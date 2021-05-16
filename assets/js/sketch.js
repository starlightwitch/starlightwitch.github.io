const node = document.getElementById("sketch-container");

var ads = [];
var fridgeImage;
var fileImage;
var computerImage;
var cloudImage;

var icons = [];
var iconImages = [];
const iconNames = [
  "videoIcon",
  "audioIcon",
  "faceRecIcon",
  "localIcon",
  "cloudIcon",
  "manufacturerIcon",
  "governmentIcon",
  "thirdPartyIcon",
  "advertisementIcon",
  "profilingIcon",
];

var fridge;
var infoGrid;
var effects;
var messageBox;
var cameraCapture;
var audioCapture = "undefined";
var canvas;

var selectedIcon = -1;

function preload() {
  let ad1 = loadImage("assets/img/nesquik.jpeg");
  let ad2 = loadImage("assets/img/grapefruit.jpeg");
  ads = [ad1, ad2];
  fileImage = loadImage("assets/img/data.png");
  computerImage = loadImage("assets/img/computer.png");
  fridgeImage = loadImage("assets/img/fridge.png");
  cloudImage = loadImage("assets/img/cloud.png");

  cameraCapture = createCapture(VIDEO);
  cameraCapture.hide();

  iconNames.forEach((name) => {
    let imgPath = "assets/img/" + name + ".png";
    iconImages.push(loadImage(imgPath));
  });
}

function setup() {
  canvas = createCanvas(node.clientWidth, node.clientHeight);
  canvas.parent(node);
  imageMode(CENTER);
  fridge = new Fridge();
  infoGrid = new InfoGrid();
  effects = new Effects();
  messageBox = new MessageBox();
}

function draw() {
  background(233, 236, 238);
  infoGrid.draw();
  fridge.draw();
  effects.draw();
  icons.forEach((icon) => {
    icon.draw();
  });
  messageBox.draw();
}

function mousePressed() {
  if (audioCapture === "undefined") {
    userStartAudio();
    audioCapture = new p5.AudioIn(node);
    audioCapture.start();
  }

  let mouseVec = createVector(mouseX, mouseY);
  let closestDist = width * height;
  icons.forEach((icon, i) => {
    let currDist = mouseVec.dist(icon.pos);
    if (currDist < closestDist) {
      selectedIcon = i;
      closestDist = currDist;
    }
  });

  selectedIcon = closestDist > width / 8 ? -1 : selectedIcon;
}

function mouseDragged() {
  if (selectedIcon >= 0) {
    icons[selectedIcon].setPos(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (selectedIcon > -1) {
    icons[selectedIcon].checkPos();
  }
  selectedIcon = -1;
}

function windowResized() {
  resizeCanvas(node.clientWidth, node.clientHeight);
  fridge.resize();
  infoGrid.resize();
  effects.resize();
  messageBox.resize();
  icons.forEach((icon) => {
    icon.resize();
  });
}

// classes for custom objects
class Fridge {
  constructor() {
    this.dims = null;
    this.pos = null;
    this.resize();
  }

  resize() {
    let fridgeScale = height / fridgeImage.height;
    this.dims = createVector(fridgeImage.width, fridgeImage.height).mult(
      fridgeScale
    );
    this.pos = createVector(width / 4, height - this.dims.y / 2);
  }

  pointWithin(x, y) {
    let xSpread = this.dims.x * 0.5;
    let ySpread = this.dims.y * 0.5;

    return (
      x > this.pos.x - xSpread &&
      x < this.pos.x + xSpread &&
      y > this.pos.y - ySpread &&
      y < this.pos.y + ySpread
    );
  }

  draw() {
    image(fridgeImage, this.pos.x, this.pos.y, this.dims.x, this.dims.y);
  }
}

class Icon {
  constructor(iconImage, name, x = width / 2, y = height / 2) {
    this.iconImage = iconImage;
    this.name = name;
    this.pos = createVector(x, y);
    this.size = min(width / 8, 80);
    this.active = false;
  }

  resize() {
    this.size = min(width / 8, 80);
  }

  draw() {
    image(this.iconImage, this.pos.x, this.pos.y, this.size, this.size);
  }

  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }

  checkPos() {
    if (fridge.pointWithin(this.pos.x, this.pos.y)) {
      if (!this.active) {
        effects.toggle(this.name);
      }
      this.active = true;
    } else {
      if (this.active) {
        effects.toggle(this.name);
      }
      this.active = false;
    }
  }
}

class InfoGrid {
  constructor() {
    this.headers = [
      ["Sensor\nData\nCollection", "Video", "Audio", "Face Recognition"],
      ["Data\nStorage", "Local", "Cloud"],
      [
        "Personal\nData\nShared\nWith",
        "Manufacturer",
        "Government",
        "Third Parties",
      ],
      ["Personal\nData\nUse", "Advertisements", "Profiling"],
    ];
    this.descriptions = [
      [
        "",
        "Turn video recording on or off.",
        "Turn audio recording on or off.",
        "Turn face recognition on or off.",
      ],
      ["", "Store data only on\nthe local network.", "Store data in the cloud."],
      [
        "",
        "Share data with device\nmanufacturer.",
        "Share data with government.",
        "Share data with third parties.",
      ],
      [
        "",
        "Turn on or off advertisements.",
        "Turn on or off profiling.\nThis will turn off personalised\nfeatures.",
      ],
    ];

    this.pos = null;
    this.cellWidth = null;
    this.cellHeight = null;

    this.resize();
  }

  resize() {
    this.pos = createVector(width * 0.5, 0);
    this.cellWidth = (width - this.pos.x) / 4;
    this.cellHeight = height / 4;
    this.placeIcons();
  }

  placeIcons() {
    let iconIndex = 0;
    let iconX = this.pos.x + this.cellWidth * 1.5;
    let iconY = this.cellHeight * 0.6;
    icons = [];

    for (let row = 0; row < this.headers.length; row++) {
      for (let i = 0; i < this.headers[row].length; i++) {
        if (this.descriptions[row][i] === "") {
          continue;
        }

        icons.push(
          new Icon(iconImages[iconIndex], iconNames[iconIndex], iconX, iconY)
        );
        iconIndex++;
        iconX += this.cellWidth;
      }
      iconY += this.cellHeight;
      iconX = this.pos.x + this.cellWidth * 1.5;
    }
  }

  draw() {
    let headerPadding = 20;

    push();
    translate(this.pos.x, this.pos.y);

    for (let row = 0; row < this.headers.length; row++) {
      let currRow = this.headers[row];
      push();
      for (let i = 0; i < currRow.length; i++) {
        // box
        noFill();
        stroke(0);
        rect(0, 0, this.cellWidth, this.cellHeight);
        // text
        fill(0);
        noStroke();
        // header
        textSize(this.cellHeight / 8);
        text(this.headers[row][i], headerPadding / 2, headerPadding);
        // description
        textSize(this.cellHeight / 14);
        text(this.descriptions[row][i], headerPadding / 2, headerPadding * 2);

        translate(this.cellWidth, 0);
      }
      pop();
      translate(0, this.cellHeight);
    }
    pop();
  }
}

class Effects {
  constructor() {
    this.video = false;
    this.audio = false;
    this.faceRec = false;
    this.localNetwork = false;
    this.cloudNetwork = false;
    this.manufacturerLink = false;
    this.governmentLink = false;
    this.thirdPartyLink = false;
    this.advertisements = false;
    this.profilingMessage = false;
    this.currentAd = random(ads);
    this.lastAudioLevel = 0;
    this.gutterWidth = ((width / 2) - fridge.dims.x) / 2;
    this.leftX = this.gutterWidth / 2;
    this.rightX = (width * 0.5) - (this.gutterWidth * 0.5);
  }

  resize() {
    this.video = false;
    this.audio = false;
    this.faceRec = false;
    this.localNetwork = false;
    this.cloudNetwork = false;
    this.manufacturerLink = false;
    this.governmentLink = false;
    this.thirdPartyLink = false;
    this.advertisements = false;
    this.profilingMessage = false;
    this.gutterWidth = ((width / 2) - fridge.dims.x) / 2;
    this.leftX = this.gutterWidth / 2;
    this.rightX = (width * 0.5) - (this.gutterWidth * 0.5);
  }

  linkLine(x1, y1, x2, y2) {
    let segNumb = 6;
    let p1Vec = createVector(x1, y1);
    let p2Vec = createVector(x2, y2);
    let segVec = p5.Vector.sub(p2Vec, p1Vec).div(segNumb * 1.5);
    let frameOffsetVec = p5.Vector.mult(segVec, (frameCount % 100) * 0.02);
    let segStart = p1Vec.copy().add(frameOffsetVec);
    let segEnd = segStart.copy().add(segVec);

    if (frameCount % 100 > 50) {
      line(p1Vec.x, p1Vec.y, segStart.x - segVec.x, segStart.y - segVec.y);
    }

    for (let i = 0; i < segNumb - 2; i++) {
      // ellipse(segStart.x, segStart.y, 30, 30);
      line(segStart.x, segStart.y, segEnd.x, segEnd.y);
      segStart.add(segVec);
      segStart.add(segVec);
      segEnd.add(segVec);
      segEnd.add(segVec);
    }

    segEnd.sub(segVec);
    if (frameCount % 100 < 50) {
      line(p2Vec.x, p2Vec.y, segEnd.x, segEnd.y);
    }
  }

  draw() {
    let imageSize = fridge.dims.x / 3;
    if (this.video) {
      push()
      translate(fridge.pos.x, fridge.pos.y - fridge.dims.y * 0.335);

      scale(-1, 1);
      image(
        cameraCapture,
        0, 0,
        fridge.dims.x,
        fridge.dims.x * 0.7
      );
      pop();
    }

    if (this.audio) {
      let barWidth = fridge.dims.x * 0.05;
      let topY = fridge.pos.y - fridge.dims.y * 0.16;
      let bottomY = topY + fridge.dims.y * 0.5;
      let leftX = fridge.pos.x + fridge.dims.x / 2 - barWidth;

      rect(leftX, topY, barWidth, bottomY - topY);

      let level = min(audioCapture.getLevel() * 35, 1);
      level = lerp(this.lastAudioLevel, level, 0.2);
      this.lastAudioLevel = level;
      let leveledY = lerp(bottomY, topY, level);

      push();
      fill(255, 0, 0);
      rect(leftX, leveledY, barWidth, bottomY - leveledY);
      pop();
    }

    if (this.faceRec && this.video) {
      push();
      translate(fridge.pos.x, fridge.pos.y - fridge.dims.y * 0.36);
      stroke(0, 255, 0);
      noFill();
      strokeWeight(2);

      let length = fridge.dims.x / 4;

      beginShape();
      vertex(-0.6 * length, 0.3 * length);
      vertex(-0.6 * length, -0.4 * length);
      vertex(-0.2 * length, -0.6 * length);
      vertex(0.2 * length, -0.6 * length);
      vertex(0.6 * length, -0.4 * length);
      vertex(0.6 * length, 0.3 * length);
      vertex(0.3 * length, 0.8 * length);
      vertex(0 * length, 1 * length);
      vertex(-0.3 * length, 0.8 * length);
      endShape(CLOSE);

      // left eye
      beginShape();
      vertex(-0.25 * length, -0.075 * length);
      vertex(-0.35 * length, -0.05 * length);
      vertex(-0.25 * length, -0.025 * length);
      vertex(-0.15 * length, -0.05 * length);
      endShape(CLOSE);

      // right eye
      beginShape();
      vertex(0.25 * length, -0.075 * length);
      vertex(0.35 * length, -0.05 * length);
      vertex(0.25 * length, -0.025 * length);
      vertex(0.15 * length, -0.05 * length);
      endShape(CLOSE);

      // mouth
      beginShape();
      vertex(-0.1 * length, 0.4 * length);
      vertex(0.1 * length, 0.4 * length);
      vertex(0.3 * length, 0.35 * length);
      vertex(0.1 * length, 0.5 * length);
      vertex(-0.1 * length, 0.5 * length);
      vertex(-0.3 * length, 0.35 * length);
      endShape(CLOSE);
      pop();
    }

    if (this.cloudNetwork || this.localNetwork) {
      image(
        computerImage,
        this.rightX,
        fridge.pos.y,
        imageSize,
        imageSize
      );

      this.linkLine(
        fridge.pos.x + fridge.dims.x * 0.5,
        fridge.pos.y,
        this.rightX - (imageSize * 0.3),
        fridge.pos.y
      );
    }

    if (this.localNetwork) {
      image(
        computerImage,
        this.rightX,
        fridge.pos.y + (fridge.dims.y * 0.25),
        imageSize,
        imageSize
      );

      this.linkLine(
        this.rightX + (imageSize * 0.25),
        fridge.pos.y + imageSize * 0.1,
        this.rightX + (imageSize * 0.25),
        fridge.pos.y + (fridge.dims.y * 0.25) - imageSize * 0.25
      );

      this.linkLine(
        this.rightX - (imageSize * 0.25),
        fridge.pos.y + (fridge.dims.y * 0.25) - imageSize * 0.25,
        this.rightX - (imageSize * 0.25),
        fridge.pos.y + imageSize * 0.1
      );
    }

    if (this.cloudNetwork) {
      image(
        cloudImage,
        this.rightX,
        fridge.pos.y - (fridge.dims.y * 0.25),
        imageSize * 0.9,
        imageSize * 0.9
      );

      this.linkLine(
        this.rightX + (imageSize * 0.25),
        fridge.pos.y - imageSize * 0.25,
        this.rightX + (imageSize * 0.25),
        fridge.pos.y - (fridge.dims.y * 0.25) + (imageSize * 0.25)
      );

      this.linkLine(
        this.rightX - (imageSize * 0.25),
        fridge.pos.y - (fridge.dims.y * 0.25) + (imageSize * 0.25),
        this.rightX - (imageSize * 0.25),
        fridge.pos.y - imageSize * 0.25
      );
    }

    if (this.manufacturerLink || this.governmentLink || this.thirdPartyLink) {
      image(
        fileImage,
        this.leftX,
        fridge.pos.y,
        imageSize,
        imageSize
      );

      this.linkLine(
        fridge.pos.x - fridge.dims.x * 0.5,
        fridge.pos.y,
        this.leftX + (imageSize * 0.3),
        fridge.pos.y,
      );
    }

    if (this.manufacturerLink) {
      let iconX = this.gutterWidth / 3;

      this.linkLine(
        this.leftX,
        fridge.pos.y + imageSize * 0.26,
        iconX,
        fridge.pos.y + fridge.dims.y * 0.25,
      );

      image(
        iconImages[5],
        iconX,
        fridge.pos.y + fridge.dims.y * 0.25,
        imageSize,
        imageSize
      );
    }

    if (this.governmentLink) {
      let iconX = this.gutterWidth * 2 / 3;

      this.linkLine(
        this.leftX,
        fridge.pos.y + imageSize * 0.26,
        iconX,
        fridge.pos.y + fridge.dims.y * 0.25,
      );

      image(
        iconImages[6],
        iconX,
        fridge.pos.y + fridge.dims.y * 0.25,
        imageSize,
        imageSize
      );
    }

    if (this.thirdPartyLink) {
      this.linkLine(
        this.leftX, fridge.pos.y - imageSize * 0.2,
        this.leftX,
        fridge.pos.y - fridge.dims.y * 0.25,
      );

      image(
        iconImages[7],
        this.leftX,
        fridge.pos.y - fridge.dims.y * 0.25,
        imageSize,
        imageSize
      );
    }

    if (this.advertisements) {
      image(
        this.currentAd,
        fridge.pos.x,
        fridge.pos.y + fridge.dims.y * 0.13,
        fridge.dims.x * 0.88,
        fridge.dims.y * 0.6
      );
    }
  }

  toggle(name) {
    switch (name) {
      case "videoIcon":
        if (this.video) {
          this.video = false;
          messageBox.setMessage("Video off.");
        } else {
          this.video = true;
          messageBox.setMessage("Video on.");
        }
        break;
      case "audioIcon":
        if (this.audio) {
          this.audio = false;
          messageBox.setMessage("Audio off.");
        } else {
          this.audio = true;
          messageBox.setMessage("Audio on.");
        }
        break;
      case "faceRecIcon":
        if (this.faceRec) {
          this.faceRec = false;
          messageBox.setMessage("Face recognition off.");
        } else {
          this.faceRec = true;
          messageBox.setMessage("Face recognition on.");
        }
        break;
      case "localIcon":
        if (this.localNetwork) {
          this.localNetwork = false;
          messageBox.setMessage("Local Network off.");
        } else {
          this.localNetwork = true;
          messageBox.setMessage("Local Network on.");
        }
        break;
      case "cloudIcon":
        if (this.cloudNetwork) {
          this.cloudNetwork = false;
          messageBox.setMessage("Cloud Storage off.");
        } else {
          this.cloudNetwork = true;
          messageBox.setMessage("Cloud Storage on.");
        }
        break;
      case "manufacturerIcon":
        if (this.manufacturerLink) {
          this.manufacturerLink = false;
          messageBox.setMessage("Data sharing with\nmanufacturer off.");
        } else {
          this.manufacturerLink = true;
          messageBox.setMessage("Data sharing with\nmanufacturer on.");
        }
        break;
      case "governmentIcon":
        if (this.governmentLink) {
          this.governmentLink = false;
          messageBox.setMessage("Data sharing with\ngovernment off.");
        } else {
          this.governmentLink = true;
          messageBox.setMessage("Data sharing with\ngovernment on.");
        }
        break;
      case "thirdPartyIcon":
        if (this.thirdPartyLink) {
          this.thirdPartyLink = false;
          messageBox.setMessage("Data sharing with\nthird parties off.");
        } else {
          this.thirdPartyLink = true;
          messageBox.setMessage("Data sharing with\nthird parties on.");
        }
        break;
      case "advertisementIcon":
        if (this.advertisements) {
          this.advertisements = false;
          messageBox.setMessage("Advertisements off.");
        } else {
          this.advertisements = true;
          this.currentAd = random(ads);
          messageBox.setMessage("Advertisements on.");
        }
        break;
      case "profilingIcon":
        if (this.profilingMessage) {
          this.profilingMessage = false;
          messageBox.setMessage("Profiling off.");
        } else {
          this.profilingMessage = true;
          messageBox.setMessage("Profiling on.");
        }
    }
  }
}

class MessageBox {
  constructor() {
    this.message = "";
    this.halfMessageWidth = 0;
    this.messageFrames = 0;
    this.pos = null;
    this.resize();
  }

  resize() {
    this.pos = fridge.pos.copy();
  }

  draw() {
    if (this.message !== "") {
      push();
      textSize(height / 30);
      textAlign(CENTER);
      let yFactor = this.message.includes("\n") ? 28 / 30 : 29 / 30
      text(this.message, this.pos.x, height * yFactor);
      pop();

      if (this.messageFrames >= 90) {
        this.message = "";
        this.messageFrames = 0;
      } else {
        this.messageFrames++;
      }
    }
  }

  setMessage(message) {
    this.messageFrames = 0;
    this.message = message;
    this.halfMessageWidth = textWidth(this.message) * 0.5;
  }
}
