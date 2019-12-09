export default class Boid {
  constructor(p, bounds, maxLines) {
    this.p = p;
    this.remainingLines = maxLines;
    this.bounds = bounds;
    this.maxSpeed = 0.5;
    this.maxAcc = 0.5;
    this.pos = null;
    this.vel = null;
    this.reset();
  }

  reset() {
    if (this.remainingLines <= 0) {
      this.dead = true;
      return;
    }

    if (Math.random() > 0.5) { // side wall
      if (Math.random() > 0.5) { // left wall
        this.pos = this.p.createVector(0, Math.random() * this.bounds[1]);
      } else { // right wall
        this.pos = this.p.createVector(this.bounds[0] - 0.01, Math.random() * this.bounds[1]);
      }
    } else { // top/bottom walls
      if (Math.random() > 0.5) { // top wall
        this.pos = this.p.createVector(Math.random() * this.bounds[0], 0);
      } else { // bottom wall
        this.pos = this.p.createVector(Math.random() * this.bounds[0], this.bounds[1] - 0.01);
      }
    }

    const center = this.p.createVector(this.bounds[0] / 2, this.bounds[1] / 2);
    const vectorSomewhatToCenter = center.sub(this.pos).rotate((Math.PI / 2 * Math.random()) - Math.PI / 4);
    this.vel = vectorSomewhatToCenter.normalize().mult(this.maxSpeed);

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
    p.push();
    p.scale(p._scale);
    p.stroke(0, 0, 0);
    p.strokeWeight(1);
    p.noFill();
    p.line(this.pos.x, this.pos.y, this.pos.x + (0.25 * this.vel.x), this.pos.y + (0.25 * this.vel.y));
    p.pop();
  }

  drawVector(p, vec) {
    p.push();
    p.scale(p._scale);
    p.stroke(0, 0, 255, 150);
    p.strokeWeight(3 / p._scale);
    p.noFill();
    const length = 10;
    p.line(this.pos.x, this.pos.y, this.pos.x + (vec.x * length), this.pos.y + (vec.y * length));
    p.pop();
  }

  run(force) {
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

    // apply dominant gradient as acceleration
    if (force) {
      const acc = force.copy().limit(this.maxAcc);
      this.vel.add(acc).limit(this.maxSpeed);
    }
  }
}
