import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import { getDataURL } from '../../js/dataurl';
import jQuery from 'jquery-ajax';
// export for others scripts to use
window.jQuery = jQuery;

const layerIndex = 5;
const neuronIndex = 2;
const strokeWeight = 2;
const mag = 5;
let tryCount = 0;

async function getActs(imgs) {
  return new Promise(resolve => {
    const data = {
      imgs,
      layerIndex,
      neuronIndex
    };
    jQuery.get('http://localhost:5000/acts', data, result => {
      resolve(result);
    });
  });
}

function getSketch() {
  return (p) => {
    let pos = null;
    let vel = null;
    let prevAct = -Infinity;

    async function findNextStart(numTries) {
      const g = p.createGraphics(225, 225);
      const vectors = [];
      const vectorDataURLResults = [];
      const vectorImgResults = [];
      const orig = p.get();
      for (let i = 0; i < numTries; i += 1) {
        const start = new p5.Vector((Math.random() * 175) + 25, (Math.random() * 175) + 25);
        const vector = p5.Vector.random2D();
        vector.setMag(mag * (Math.random() + 0.5));
        vectors.push({ start, vector });

        // generate image with this vector...
        g.background(255);
        g.image(orig, 0, 0);
        g.strokeWeight(strokeWeight);
        g.line(start.x, start.y, start.x + vector.x, start.y + vector.y);
        const updated = g.get();
        vectorImgResults.push(updated);
        const vectorResult = await getDataURL(updated);
        vectorDataURLResults.push(vectorResult);
      }
      const acts = await getActs(vectorDataURLResults);

      // compare acts to previous and themselves to find best
      let bestIndex = -1;
      let bestAct = -Infinity;
      for (let i = 0; i < numTries; i += 1) {
        const act = acts[i].acts;
        if (act > bestAct) {
          bestAct = act;
          bestIndex = i;
        }
      }

      if (bestIndex < 0) {
        return null;
      }

      return {
        pos: vectors[bestIndex].start,
        vel: vectors[bestIndex].vector,
        act: bestAct,
        img: vectorImgResults[bestIndex]
      };
    }

    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }

    async function findNextSegment(numTries) {
      const g = p.createGraphics(225, 225);
      const vectors = [];
      const vectorDataURLResults = [];
      const vectorImgResults = [];
      const orig = p.get();

      const angleRange = Math.PI * 0.25;

      for (let i = 0; i < numTries; i += 1) {
        const angleDelta = getRandomArbitrary(-angleRange, angleRange);
        const vector = vel.copy().rotate(angleDelta);
        vector.setMag(mag * (Math.random() + 0.5));
        vectors.push(vector);

        // generate image with this vector...
        g.background(255);
        g.image(orig, 0, 0);
        g.strokeWeight(strokeWeight);
        g.line(pos.x, pos.y, pos.x + vector.x, pos.y + vector.y);
        const updated = g.get();
        vectorImgResults.push(updated);
        const vectorResult = await getDataURL(updated);
        vectorDataURLResults.push(vectorResult);
      }
      const acts = await getActs(vectorDataURLResults);
      // compare acts to previous and themselves to find best
      let bestIndex = -1;
      let bestAct = -Infinity;
      for (let i = 0; i < numTries; i += 1) {
        const act = acts[i].acts;
        if (act > bestAct) {
          bestAct = act;
          bestIndex = i;
        }
      }

      if (bestIndex < 0) {
        return null;
      }

      return {
        vel: vectors[bestIndex],
        act: bestAct,
        img: vectorImgResults[bestIndex]
      };
    }

    // Loop that fetches activations
    async function animate() {
      if (!pos) {
        console.log('find next line start');
        const nextStart = await findNextStart(10 + (4 * tryCount));
        if (nextStart && nextStart.act > prevAct) {
          tryCount++;
          prevAct = nextStart.act;
          pos = nextStart.pos;
          vel = nextStart.vel;
          pos.add(vel);
          p.image(nextStart.img, 0, 0);
          document.getElementById('actDebug').innerHTML = prevAct;
        }
      }

      if (pos) {
        console.log('find next segment');
        const nextVector = await findNextSegment(20);
        if (nextVector && nextVector.act > prevAct) {
          prevAct = nextVector.act;
          vel = nextVector.vel;
          pos.add(vel);
          p.image(nextVector.img, 0, 0);
          document.getElementById('actDebug').innerHTML = prevAct;
        } else {
          pos = null;
        }
      }

      setTimeout(animate, 0);
    };

    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(225, 225);
      p.noLoop();

      animate();
    };

    // p.draw = () => {}
  };
}

function getEditableSketch() {
  return (p) => {
    let wasPressed = false;

    async function updateActs() {
      const dataURL = p.canvas.toDataURL();
      const acts = await getActs([dataURL]);
      // const act = acts[0].acts[layerIndex][neuronIndex];
      const act = acts[0].acts;
      document.getElementById('actDebug2').innerHTML = act;
    }

    const runInput = () => {
      const px = p.pmouseX;
      const py = p.pmouseY;
      const x = p.mouseX;
      const y = p.mouseY;

      if (p.mouseIsPressed) {
        if (!(x < 0 || y < 0 || px < 0 || py < 0 || x >= p.width || px >= p.width || y >= p.height || py >= p.height)) {
          // if mouse pressed on canvas, record marks and draw to scaled canvas and screen
          p.strokeWeight(strokeWeight);
          p.line(px, py, x, y);
          wasPressed = true;
        }
      } else {
        // at end of press, if it was being pressed trigger change with current state
        if (wasPressed) {
          wasPressed = false;
          // trigger change
          updateActs();
        }
      }
    }

    p.setup = () => {
      p.createCanvas(225, 225);
      p.pixelDensity(1);
      p.background(255);
    };

    p.draw = () => {
      // Gather input and draw until mark ends, then send up new mark
      runInput();
    };
  };
}

const DrawSketchANet = props => {
  const imgRef = useRef(null);
  const imgRef2 = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    // run once
    if (imgRef.current && !pRef.current) {
      pRef.current = new p5(getSketch(), imgRef.current);
      pRef.current = new p5(getEditableSketch(), imgRef2.current);
    }
  }, [props]);

  return (
    <div className="bordered-canvas">
      <div>
        <div ref={imgRef} style={{ display: 'inline-block' }}></div>
        <div ref={imgRef2} style={{ display: 'inline-block' }}></div>
      </div>
      <div>
        <div id="actDebug" style={{ display: 'inline-block' }}></div>
        <span>___</span>
        <div id="actDebug2" style={{ display: 'inline-block' }}></div>
      </div>
      <div id="debug"></div>
      <div id="test"></div>
      <div id="test2"></div>
    </div>
  );
};

export default DrawSketchANet;
