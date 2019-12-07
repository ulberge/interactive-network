import p5 from 'p5';

export default class Boid {
  constructor(p, bounds) {
    this.p = p;
    this.bounds = bounds;
    this.maxSpeed = 0.5;
    this.maxAcc = 0.5;
    this.pos = null;
    this.vel = null;
    this.reset();
  }

  reset() {
    if (Math.random() > 0.5) { // side wall
      if (Math.random() > 0.5) { // left wall
        this.pos = this.p.createVector(0, Math.random() * this.bounds[1]);
      } else { // right wall
        this.pos = this.p.createVector(this.bounds[0], Math.random() * this.bounds[1]);
      }
    } else { // top/bottom walls
      if (Math.random() > 0.5) { // top wall
        this.pos = this.p.createVector(Math.random() * this.bounds[0], 0);
      } else { // bottom wall
        this.pos = this.p.createVector(Math.random() * this.bounds[0], this.bounds[1]);
      }
    }

    const center = this.p.createVector(this.bounds[0] / 2, this.bounds[1] / 2);
    const vectorSomewhatToCenter = center.sub(this.pos).rotate((Math.PI / 2 * Math.random()) - Math.PI / 4);
    this.vel = vectorSomewhatToCenter.normalize().mult(this.maxSpeed);
  }

  drawBoid(p) {
    p.clear();
    p.push();
    p.scale(p._scale);
    p.stroke(0, 255, 0, 150);
    p.strokeWeight(3 / p._scale);
    p.noFill();
    p.ellipseMode(p.CENTER);
    p.ellipse(this.pos.x, this.pos.y, 2, 2);
    p.stroke(255, 0, 0, 150);
    const length = 4;
    p.line(this.pos.x, this.pos.y, this.pos.x + (this.vel.x * length), this.pos.y + (this.vel.y * length));
    p.pop();
  }

  drawMark(p) {
    p.push();
    p.scale(p._scale);
    p.stroke(0, 0, 0);
    p.strokeWeight(15 / p._scale);
    p.noFill();
    p.line(this.pos.x, this.pos.y, this.pos.x + (0.25 * this.vel.x), this.pos.y + (0.25 * this.vel.y));
    p.pop();
  }

  drawVector(p, vec) {
    p.push();
    p.scale(p._scale);
    p.stroke(0, 0, 255, 150);
    p.strokeWeight(2 / p._scale);
    p.noFill();
    p.line(this.pos.x, this.pos.y, this.pos.x + vec.x, this.pos.y + vec.y);
    p.pop();
  }

  // make array add up to 1
  normalize(arr) {
    let sum = arr.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      return arr.map(v => (1 / arr.length));
    }
    return arr.map(v => (v / sum));
  }

  // choose index from array with probability equal to relative value
  choose(arr) {
    const arr_n = this.normalize(arr);
    const selector = Math.random();
    let cursor = 0;
    for (let i = 0; i < arr_n.length; i += 1) {
      cursor += arr_n[i];
      if (selector <= cursor) {
        return i;
      }
    }
  }

  run(gradients) {
    // draw stroke
    this.drawMark(this.p, this.pos, this.vel);

    // update position
    this.pos.add(this.vel);

    // if position out of bounds, choose new random pos and vel
    if (this.pos.x < 0 || this.pos.y < 0 || this.pos.x >= this.bounds[0] || this.pos.y > this.bounds[1]) {
      if (!this.dieOnNextWall) {
        this.reset();
      } else {
        this.dead = true;
      }
    }

    // get forces
    const gradientVectors = gradients.map((mag, i) => {
      // choose gradient direction that is closer to current velocity
      const vecs = [
        [[0, 1], [0, -1]],
        [[1, 0], [0, -1]],
        [[1, 1], [-1, -1]],
        [[-1, 1], [1, -1]],
      ];
      const gradDirection1 = this.p.createVector(...vecs[i][0]);
      const gradDirection2 = this.p.createVector(...vecs[i][1]);
      let gradientVector;
      if (Math.abs(this.vel.angleBetween(gradDirection1)) < Math.abs(this.vel.angleBetween(gradDirection2))) {
        gradientVector = gradDirection1;
      } else {
        gradientVector = gradDirection2;
      }

      // return that gradient multiplied by its current magnitude
      return gradientVector.normalize().mult(mag);
    });

    // choose vectors to use, must be a better way that does less of an average.
    const avgGradient = this.p.createVector(0, 0);
    gradientVectors.forEach(v => {
      avgGradient.x += v.x;
      avgGradient.y += v.y;
    });

    // apply gradient as acceleration
    const acc = avgGradient.limit(this.maxAcc);
    this.vel.add(acc).limit(this.maxSpeed);
  }
}
