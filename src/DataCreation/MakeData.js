import React, { Component } from 'react';
import p5 from 'p5';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ReplayIcon from '@material-ui/icons/Replay';

import ArrayToImage from './ArrayToImage';

import { evalLayers } from './neuralNetwork';

/* global nj */

export default class MakeData extends Component {
  state = {
    generatedImages: []
  }

  componentDidMount() {
    this.sketchToScale = new p5(this.getPassiveSketch([45, 45], 1), this.refs.canvasToScale);
    this.sketch = new p5(this.getSketch([45, 45], 4), this.refs.canvas);
    this.sketchActs = [
      new p5(this.getPassiveSketch([7, 7], 4), this.refs.outputs),
      new p5(this.getPassiveSketch([7, 7], 4), this.refs.outputs),
      new p5(this.getPassiveSketch([7, 7], 4), this.refs.outputs),
      new p5(this.getPassiveSketch([7, 7], 4), this.refs.outputs),
      new p5(this.getPassiveSketch([1, 1], 4), this.refs.outputs),
      new p5(this.getPassiveSketch([1, 1], 4), this.refs.outputs),
    ];
  }

  format(imgArr, size) {
    const gray = [];
    for (let i = 0; i < imgArr.length; i += 4) {
      gray.push(1 - (imgArr[i] / 255));
    }
    const gray_f = nj.array(gray).reshape(size[0], size[1]);
    return gray_f.tolist();
  }

  getPassiveSketch(size, scale) {
    const [ h, w ] = size;
    return (p) => {
      p.setup = () => {
        p.pixelDensity(1);
        p.createCanvas(w * scale, h * scale);
        p.background(255);
        p.noLoop();
      };

      p.draw = () => {};
    };
  }

  getSketch(size, scale) {
    const [ h, w ] = size;
    let pressed = false;

    return (p) => {
      p.setup = () => {
        p.pixelDensity(1);
        p.createCanvas(w * scale, h * scale);
        p.background(255);
      };

      p.draw = () => {
        p.fill(0);
        p.stroke(0);
        // p.strokeWeight(1);
        p.strokeWeight(scale);

        // Record mouse pressed events within canvas
        const px = p.pmouseX;
        const py = p.pmouseY;
        const x = p.mouseX;
        const y = p.mouseY;
        if (!(x < 0 || y < 0 || px < 0 || py < 0 || x >= p.width || px >= p.width || y >= p.height || py >= p.height)) {
          if (p.mouseIsPressed) {
            pressed = true;
            // draw line
            p.line(px, py, x, y);
          } else {
            if (pressed) {
              // pressed = false;
              // const currBig = p.get();
              // currBig.resize(this.sketchToScale.width, this.sketchToScale.height);
              // this.sketchToScale.image(currBig, 0, 0);
              // this.sketchToScale.loadPixels();
              // const curr = this.sketchToScale.pixels;
              // const curr_f = this.format(curr, [h, w]);
              // const output = evalLayers(curr_f, this.props.layers);
              // console.log('input', curr_f);

              // let index = 0;
              // output.forEach((layer, layerIndex) => {
              //   layer.forEach((neuron, neuronIndex) => {
              //     this.drawNeuron(output[layerIndex][neuronIndex], this.sketchActs[index]);
              //     index += 1;
              //   });
              // });
            }
          }
        }
      };
    };
  }

  drawNeuron(acts, p) {
    // normalize across arrays
    let max = -Infinity;
    let min = Infinity;
    acts.flat().forEach(v => {
      if (v > max) {
        max = v;
      }
      if (v < min) {
        min = v;
      }
    });

    const normalize = (v, max, min) => {
      return (v - min) / (max - min);
    };
    let actsNorm = acts;
    console.log('acts', acts);
    if (max !== min) {
      actsNorm = acts.map(row => row.map(v => normalize(v, max, min)));
      // console.log('actsNorm', actsNorm);
    }

    actsNorm.forEach((row, y) => row.forEach((v, x) => {
      p.push();
      p.fill(v * 255);
      p.noStroke();
      p.rect(x * 4, y * 4, 4, 4);
      p.pop();
    }));
  }

  generateImages() {
    const [ h, w ] = [45, 45];

    const input = this.sketch.get();
    input.resize(w, h);

    const p = this.sketchToScale;

    // const dRotation = 0.0003;
    // const dScale = 0.0003;
    const dRotation = 0;
    const dScale = 0;

    const imgs = [];
    for (let scale = -1; scale <= 1; scale += 1) {
      for (let rotation = -1; rotation <= 1; rotation += 1) {
        const paddingX = (p.width - (p.width * (1 + (scale * dScale)))) / 2;
        const paddingY = (p.height - (p.height * (1 + (scale * dScale)))) / 2;

        p.background(255);
        p.push();
        p.translate(p.width / 2, p.height / 2);
        p.rotate(rotation * dRotation * Math.PI);
        p.scale(1 + (scale * dScale));
        p.translate(-p.width / 2, -p.height / 2);
        p.image(input, paddingX, paddingY);
        p.pop();

        p.loadPixels();
        const imgArr = p.pixels;
        const gray = [];
        for (let i = 0; i < imgArr.length; i += 4) {
          gray.push(1 - (imgArr[i] / 255));
        }
        const gray_f = nj.array(gray).reshape(h, w);
        const imgArr_f = gray_f.tolist();
        imgs.push(imgArr_f);
      }
    }

    this.setState({ generatedImages: imgs });
  }

  addImages(label) {
    const { generatedImages } = this.state;
    const { addImages } = this.props;

    if (generatedImages.length > 0) {
      addImages(generatedImages, label);

      this.setState({ generatedImages: [] });
    }
  }

  clearImage() {
    this.sketch.clear();
    this.sketch.background(255);
  }

  render() {
    const { generatedImages } = this.state;
    return (
      <Grid container spacing={2} justify="center" style={{ marginTop: '20px' }} className="makeData">
        <Grid key={2} item xs={12} style={{ display: 'flex', margin: '0 10px' }} >
          <Grid container spacing={2} justify="center">
            <Grid key={0} item xs={9} ref="canvas">
              <div ref="canvasToScale" style={{ display: 'none' }}></div>
              <div ref="outputs" className="outputs" style={{ display: 'none' }}></div>
            </Grid>
            <Grid key={1} item xs={1} style={{ marginTop: '10px' }}>
              <Grid container spacing={2} direction="column" alignItems="center" justify="center">
                <IconButton aria-label="generate batch" onClick={() => this.generateImages()}>
                  <ReplayIcon />
                </IconButton>
                <IconButton aria-label="clear" onClick={() => this.clearImage()}>
                  <ClearIcon />
                </IconButton>
              </Grid>
            </Grid>
            <Grid key={2} item xs={6} style={{ textAlign: 'left' }} >
              { generatedImages ? generatedImages.map((img, i) => (<ArrayToImage key={i} imgArr={img} />)) : null }
              { generatedImages && generatedImages.length > 0 ? (
                <div>
                  <IconButton aria-label="add positive" onClick={() => this.addImages(1)}>
                    <ThumbUpIcon />
                  </IconButton>
                  <IconButton aria-label="add negative" onClick={() => this.addImages(0)}>
                    <ThumbDownIcon />
                  </IconButton>
                </div>
                ) : null }
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
