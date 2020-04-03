import FilterRenderer from './filterRenderer';

function chooseRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default class AttnFilterRenderer {
  constructor(smartCanvas, layerIndex, filterIndex, settings={}) {
    this.settings = {
      goodThreshold: 100,
      ...settings
    };

    this.smartCanvas = smartCanvas;
    this.acts = this.smartCanvas.network.arrs[layerIndex + 1].arr.slice([filterIndex, filterIndex + 1]);
    this.attn = null;
    this.prevAttnMap = new Map();
    this.prevAttnScore = 0;
    this.layerIndex = layerIndex;
    this.filterIndex = filterIndex;
  }

  step() {
    if (!this.attn) {
      this.updateAttn();
      if (!this.attn) {
        // no more attn
        return true;
      }

      // create new renderer based on attention
      const bounds = this.getBounds();
      const getScore = (start, end) => {
        this.smartCanvas.addSegment(start, end, true);
        this.smartCanvas.update(false);
        const score = this.getAttnScore() - this.prevAttnScore;
        this.smartCanvas.restore();
        return score;
      };
      const addSegment = (start, end) => {
        this.smartCanvas.addSegment(start, end);
        this.smartCanvas.update();
        this.prevAttnScore = this.getAttnScore();
        // console.log('attn score:', this.prevAttnScore);
        // this.smartCanvas.pOverlay.clear();
        // this.smartCanvas.pOverlay.stroke(255, 0, 0);
        // this.smartCanvas.pOverlay.strokeWeight(0.5);
        // this.smartCanvas.pOverlay.noFill();
        // this.smartCanvas.pOverlay.rect(bounds[0], bounds[1], bounds[2]-bounds[0], bounds[3]-bounds[1]);
      };
      this.renderer = new FilterRenderer(bounds, getScore, addSegment, this.settings);
    }

    const isStuck = this.renderer.step();
    // if stuck, move to another attn
    if (isStuck) {
      this.attn = null;
    }

    return false;
  }

  getBounds() {
    return this.smartCanvas.getReceptiveField(this.layerIndex, this.attn);
  }

  updateAttn() {
    // pick top location from acts
    let maxAct = -Infinity;
    let locations = [];
    this.acts.tolist()[0].forEach((row, y) => row.forEach((v, x) => {
      // that is below threshold and not already focused on
      if (v < this.settings.goodThreshold && !this.prevAttnMap.has(`${y},${x}`)) {
        if (v > maxAct) {
          locations = [{ x, y }];
          maxAct = v;
        } else if (v === maxAct) {
          locations.push({ x, y });
        }
      }
    }));

    if (locations.length === 0) {
      return;
    }
    this.attn = chooseRandom(locations);
    // mark what we have seen and ignore
    this.markLocationHasHadAttn();

    // set baseline score
    this.prevAttnScore = this.getAttnScore();
    // console.log(`${this.layerIndex}_${this.filterIndex} attn on (${this.attn.x}, ${this.attn.y})`);
  }

  markLocationHasHadAttn() {
    const pad = this.settings.attnPadding;
    for (let y = this.attn.y - pad; y <= this.attn.y + pad; y += 1) {
      for (let x = this.attn.x - pad; x <= this.attn.x + pad; x += 1) {
        this.prevAttnMap.set(`${y},${x}`, 1);
      }
    }
  }

  getAttnScore() {
    return this.acts.get(0, this.attn.y, this.attn.x);
  }
}
