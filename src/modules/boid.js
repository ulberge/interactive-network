// A class for an agent that can be controlled to make a drawing
export default class Boid {
  constructor(pos, vel, diameter) {
    this.maxSpeed = 2;
    this.maxAcc = 1;
    // this.maxAcc = ((Math.random() * 2) ** 4) + 0.1;
    this.pos = pos;
    this.vel = vel;
    this.diameter = diameter;
    this.isDrawing = false;
  }

  reset() {
    this.isDrawing = false;
  }

  // Update the position and velocity of the boid
  run(force) {
    const acc = force.copy().limit(this.maxAcc);
    this.vel.add(acc).limit(this.maxSpeed);

    // update position
    this.pos.add(this.vel);
  }

  // Draw the previous path of the boid (run after its update)
  draw(p) {
    if (this.isDrawing) {
      p.push();

      p.stroke(0, 0, 0);
      p.strokeWeight(this.diameter);
      p.noFill();
      p.line(this.pos.x, this.pos.y, this.pos.x - this.vel.x, this.pos.y - this.vel.y);

      p.pop();
    }
  }

  // For debugging purposes, draw the boid itself and its direction
  drawBoid(p) {
    p.push();
    p.noFill();
    p.strokeWeight(0.5);
    p.ellipseMode(p.CENTER);

    // Draw "boid" outline
    p.stroke(0, 0, 0, 150);
    p.ellipse(this.pos.x, this.pos.y, 5, 5);

    // Draw pencil tip
    p.stroke(255, 0, 0, 150);
    p.ellipse(this.pos.x, this.pos.y, this.diameter, this.diameter);

    // Draw velocity
    const length = 10;
    p.stroke(0, 255, 0, 150);
    p.line(this.pos.x, this.pos.y, this.pos.x + (this.vel.x * length), this.pos.y + (this.vel.y * length));

    p.pop();
  }
}
