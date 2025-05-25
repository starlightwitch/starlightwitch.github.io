let shaderObject;
let seedOffset;
let scrollOffset = 0;

document.getElementById('splash-holder').style.background = 'none';
window.addEventListener('scroll', () => scrollOffset = scrollY);


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  let c = createCanvas(windowWidth, windowHeight, WEBGL);

  //if the canvas loads, make all fullscreen divs transparent
  if (c) {
    let elements = document.getElementsByClassName('fullscreen-div');
    for (let e of elements) {
      e.classList.add('transparent-div');
    }
  }

  // setup shaders
  shaderObject = createShader(vert, frag)
  seedOffset = random(TWO_PI);
}


function draw() {
  background('#bc9eca')

  shader(shaderObject)

  shaderObject.setUniform('u_resolution', [width, height])
  shaderObject.setUniform('u_time', millis() / 1000.0)
  shaderObject.setUniform('u_seed', seedOffset)
  shaderObject.setUniform('u_scroll', scrollOffset)


  rect(0, 0, width, height)

  if (frameCount < 20 && frameCount % 4 == 0) {
    windowResized();
  }
}




// shader code section
let vert = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;
uniform float time;

void main() {

vTexCoord = aTexCoord;

  vec4 pos4 = vec4(aPosition, 1.0);
  pos4.xy =  pos4.xy * 2.0 -1.0;

  gl_Position = pos4;
}
`;

let frag = `

#ifdef GL_ES
precision mediump float;
#endif
// heavily inspired by https://www.shadertoy.com/view/lX2GDR

// sketch uniforms
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_seed;
uniform float u_scroll;

// noise params
#define SPEED 1.0
#define MEAN 0.5
#define VARIANCE 0.7

// design stuff
float speed = 0.15;
vec3 collectivePurple = vec3(0.74, 0.62, 0.79);
vec3 collectiveBlue = vec3(0.259,0.749,0.867);


// noise helper function
float gaussian(float z, float u, float o) {
  return (1.0 / (o * sqrt(2.0 * 3.1415))) *
         exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
}

void main() {
  // prepare coordinates
  float mr = min(u_resolution.x, u_resolution.y);
  vec2 uv = (gl_FragCoord.xy * 1.0 - u_resolution.xy) / mr;

  float currTime = u_time * speed;

  float d = -currTime;
  float a = 0.0 + u_seed / 3.1415;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(u_seed + i - d - a * uv.x);
    d += sin(u_scroll *0.001 + u_seed + uv.y * i + a);
  }
  d += currTime;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);

  float mask = (col.x + col.y + col.z) / 3.0;
  mask = pow(mask, 12.0);

  // add grain
  float t = u_time * float(SPEED);
  float seed = dot(uv, vec2(102.9898, 78.233));
  float noise = fract(sin(seed) * 43758.5453 + t);
  noise = gaussian(noise, float(MEAN), float(VARIANCE) * float(VARIANCE));

  // scroll effects
  // dimness
  float dim = clamp(1.0 - u_scroll *0.001, 0.3, 1.0);
  // hue
  vec3 mixed = mix(collectiveBlue, collectivePurple, clamp(0.0, 1.0, 1.0+ sin(u_scroll * 0.003)));


  gl_FragColor = vec4(mixed * mask * noise * dim, 1.0);
}
  `;