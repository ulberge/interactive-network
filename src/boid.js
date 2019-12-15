import { choose } from './helpers';

export default class Boid {
  constructor(p, pExact, bounds, maxLines, kernels) {
    this.p = p;
    this.pExact = pExact;
    this.remainingLines = maxLines;
    this.bounds = bounds;
    this.maxSpeed = 1;
    this.maxAcc = ((Math.random() * 2) ** 4) + 0.1;
    this.accForce = 5;
    this.pos = null;
    this.vel = null;
    this.kernels = kernels;

    const totalKernel = [[0,0,0],[0,0,0],[0,0,0]];
    kernels.forEach(kernel => kernel.map((row, y) => row.map((val, x) => totalKernel[y][x] += val)));
    // remove center
    totalKernel[1][1] = 0;
    this.getHighProbStart = () => {
      const startAreaIndex = choose(totalKernel.flat());
      const startAreaX = startAreaIndex % 3;
      const startAreaY = (startAreaIndex - startAreaX) / 3;

      let x;
      let y;
      if (Math.random() < 0.9) {
        if (startAreaX === 0) {
          if (startAreaY === 0) {
            if (Math.random() < 0.5) {
              x = 0;
              y = this.p.random(0, bounds[1] * 0.33);
            } else {
              y = 0;
              x = this.p.random(0, bounds[0] * 0.33);
            }
          }
          if (startAreaY === 1) {
            x = 0;
            y = this.p.random(bounds[1] * 0.33, bounds[1] * 0.67);
          }
          if (startAreaY === 2) {
            if (Math.random() < 0.5) {
              x = 0;
              y = this.p.random(bounds[1] * 0.66, bounds[1]);
            } else {
              y = bounds[1];
              x = this.p.random(0, bounds[0] * 0.33);
            }
          }
        }
        if (startAreaX === 1) {
          if (startAreaY === 0) {
            x = this.p.random(bounds[0] * 0.33, bounds[0] * 0.66);
            y = 0;
          }
          if (startAreaY === 2) {
            x = this.p.random(bounds[0] * 0.33, bounds[0] * 0.66);
            y = bounds[1];
          }
        }
        if (startAreaX === 2) {
          if (startAreaY === 0) {
            if (Math.random() < 0.5) {
              x = bounds[0];
              y = this.p.random(0, bounds[1] * 0.33);
            } else {
              y = 0;
              x = this.p.random(bounds[0] * 0.67, bounds[0]);
            }
          }
          if (startAreaY === 1) {
            x = bounds[0];
            y = this.p.random(bounds[1] * 0.33, bounds[1] * 0.67);
          }
          if (startAreaY === 2) {
            if (Math.random() < 0.5) {
              x = bounds[0];
              y = this.p.random(bounds[1] * 0.66, bounds[1]);
            } else {
              y = bounds[1];
              x = this.p.random(bounds[0] * 0.67, bounds[0]);
            }
          }
        }
      } else {
        x = this.p.random(startAreaX * (bounds[0] / 3), (startAreaX + 1) * (bounds[0] / 3));
        y = this.p.random(startAreaY * (bounds[1] / 3), (startAreaY + 1) * (bounds[1] / 3));
      }
      // console.log(startAreaX, startAreaY, x, y);

      const vec = this.p.createVector(x, y);
      return vec;
    }

    this.reset();
  }

  reset() {
    if (this.remainingLines <= 0) {
      this.dead = true;
      return;
    }

    this.pos = this.getHighProbStart();

    // if (Math.random() > 0.5) { // side wall
    //   if (Math.random() > 0.5) { // left wall
    //     this.pos = this.p.createVector(0, Math.random() * this.bounds[1]);
    //   } else { // right wall
    //     this.pos = this.p.createVector(this.bounds[0] - 0.01, Math.random() * this.bounds[1]);
    //   }
    // } else { // top/bottom walls
    //   if (Math.random() > 0.5) { // top wall
    //     this.pos = this.p.createVector(Math.random() * this.bounds[0], 0);
    //   } else { // bottom wall
    //     this.pos = this.p.createVector(Math.random() * this.bounds[0], this.bounds[1] - 0.01);
    //   }
    // }

    const center = this.p.createVector(this.bounds[0] / 2, this.bounds[1] / 2);
    const vectorSomewhatToCenter = center.sub(this.pos).rotate((Math.PI / 2 * Math.random()) - Math.PI / 4);
    this.vel = vectorSomewhatToCenter.normalize().mult(this.maxSpeed);

    this.isDrawing = false;
    this.remainingLines--;
  }

  drawBoid(p) {
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
    if (this.isDrawing) {
      p.push();
      p.scale(p._scale);
      p.stroke(0, 0, 0);
      p.strokeWeight(0.5);
      p.noFill();
      p.line(this.pos.x, this.pos.y, this.pos.x + this.vel.x, this.pos.y + this.vel.y);
      p.pop();
    }
  }

  drawVector(p, vec) {
    p.push();
    p.scale(p._scale);
    p.stroke(0, 0, 255, 150);
    p.strokeWeight(3 / p._scale);
    p.noFill();
    const length = 3;
    p.line(this.pos.x, this.pos.y, this.pos.x + (vec.x * length), this.pos.y + (vec.y * length));
    p.pop();
  }

  run(force) {
    // draw stroke
    this.drawMark(this.p, this.pos, this.vel);
    this.drawMark(this.pExact, this.pos, this.vel);

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

    // apply dominant gradient as acceleration
    if (force) {
      const acc = force.copy().mult(this.accForce).limit(this.maxAcc);
      this.vel.add(acc).limit(this.maxSpeed);
    }
  }
}
