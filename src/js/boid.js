// A class for an agent that can be controlled to make a drawing
export default class Boid {
  constructor(diameter=1) {
    this.diameter = diameter;
    this.isDrawing = true;
    this.prevPos = null;
    this.pos = null;
    this.vel = null;
  }

  reset() {
    this.isDrawing = true;
    this.prevPos = null;
    this.pos = null;
    this.vel = null;
  }

  move(pos) {
    this.prevPos = pos.copy();
    this.pos = pos.copy();
  }

  // Update the position and velocity of the boid
  run(vel) {
    this.vel = vel;
    this.prevPos = this.pos.copy();
    this.pos.add(this.vel);
  }

  // Draw the previous path of the boid (run after its update)
  draw(p) {
    if (this.isDrawing) {
      p.push();

      p.stroke(0);
      p.strokeWeight(this.diameter);
      p.noFill();
      p.line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);

      p.pop();
    }
  }

  // For debugging purposes, draw the boid itself and its direction
  drawBoid(p) {
    p.push();
    p.noFill();
    p.strokeWeight(1);
    p.ellipseMode(p.CENTER);

    // Draw "boid" outline
    p.stroke(0, 0, 0, 210);
    p.ellipse(this.pos.x, this.pos.y, this.diameter, this.diameter);

    // Draw velocity
    const length = 0.5 * this.diameter;
    p.stroke(0, 0, 0, 210);
    p.line(this.pos.x, this.pos.y, this.pos.x + (this.vel.x * length), this.pos.y + (this.vel.y * length));

    p.pop();
  }
}
