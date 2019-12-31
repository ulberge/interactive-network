import Boid from './boid';
import p5 from 'p5';

it('correctly updates boid on run with no limit encountered', () => {
  const boid = new Boid(1);
  boid.pos = new p5.Vector(1, 1);
  boid.vel = new p5.Vector(0, 0);
  boid.maxSpeed = 10;
  boid.maxAcc = 10;

  const force = new p5.Vector(-1, 1);
  boid.run(force);

  expect(boid.vel.x).toBe(-1);
  expect(boid.vel.y).toBe(1);
  expect(boid.pos.x).toBe(0);
  expect(boid.pos.y).toBe(2);
});

it('correctly updates boid on run with acc limit encountered', () => {
  const boid = new Boid(1);
  boid.pos = new p5.Vector(1, 1);
  boid.vel = new p5.Vector(0, 0);
  boid.maxSpeed = 10;
  boid.maxAcc = Math.sqrt(2);

  const force = new p5.Vector(-10, 10);
  boid.run(force);

  expect(boid.vel.x).toBe(-1);
  expect(boid.vel.y).toBe(1);
  expect(boid.pos.x).toBe(0);
  expect(boid.pos.y).toBe(2);
});

it('correctly updates boid on run with vel limit encountered', () => {
  const boid = new Boid(1);
  boid.pos = new p5.Vector(1, 1);
  boid.vel = new p5.Vector(0, 0);
  boid.maxSpeed = Math.sqrt(2);
  boid.maxAcc = 10;

  const force = new p5.Vector(-10, 10);
  boid.run(force);

  expect(boid.vel.x).toBe(-1);
  expect(boid.vel.y).toBe(1);
  expect(boid.pos.x).toBe(0);
  expect(boid.pos.y).toBe(2);
});

it('correctly updates boid on run with initial vel', () => {
  const boid = new Boid(1);
  boid.pos = new p5.Vector(1, 1);
  boid.vel = new p5.Vector(1, 1);
  boid.maxSpeed = 10;
  boid.maxAcc = 10;

  const force = new p5.Vector(-1, 1);
  boid.run(force);

  expect(boid.vel.x).toBe(0);
  expect(boid.vel.y).toBe(2);
  expect(boid.pos.x).toBe(1);
  expect(boid.pos.y).toBe(3);
});

it('correctly updates boid on run with initial vel and limits', () => {
  const boid = new Boid(1);
  boid.pos = new p5.Vector(2, 2);
  boid.vel = new p5.Vector(1, 1);
  boid.maxSpeed = 2 * Math.sqrt(2);
  boid.maxAcc = Math.sqrt(2);
  const force = new p5.Vector(10, 10);

  const round2 = val => Math.round(val * 100) / 100;

  boid.run(force);
  expect(boid.vel.x).toBe(2);
  expect(boid.vel.y).toBe(2);
  expect(boid.pos.x).toBe(4);
  expect(boid.pos.y).toBe(4);

  boid.run(force);
  expect(round2(boid.vel.x)).toBe(2);
  expect(round2(boid.vel.y)).toBe(2);
  expect(round2(boid.pos.x)).toBe(6);
  expect(round2(boid.pos.y)).toBe(6);
});
