// A class for an agent that can be controlled to make a drawing
export default class Boid {
  constructor(diameter=1) {
    this.diameter = diameter;
    this.isDrawing = false;
    this.prevPos = null;
    this.pos = null;
    this.vel = null;
  }

  reset() {
    this.isDrawing = false;
    this.prevPos = null;
    this.pos = null;
    this.vel = null;
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
