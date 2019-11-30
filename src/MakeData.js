import React, { Component } from 'react';
import p5 from 'p5';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ReplayIcon from '@material-ui/icons/Replay';

import ArrayToImage from './ArrayToImage';

/* global nj */

export default class MakeData extends Component {
  state = {
    generatedImages: []
  }
  h = 45
  w = 45

  componentDidMount() {
    this.sketchToScale = new p5(this.getSketch(1), this.refs.canvasToScale);
    this.sketch = new p5(this.getSketch(4), this.refs.canvas);
  }

  getSketch(scale) {
    const { h, w } = this;

    return (p) => {
      p.setup = () => {
        p.pixelDensity(1);
        p.createCanvas(w * scale, h * scale);
        p.background(255);
      };

      p.draw = () => {
        p.fill(0);
        p.stroke(0);
        p.strokeWeight(scale);

        // Record mouse pressed events within canvas
        const px = p.pmouseX;
        const py = p.pmouseY;
        const x = p.mouseX;
        const y = p.mouseY;
        if (!(x < 0 || y < 0 || px < 0 || py < 0 || x >= p.width || px >= p.width || y >= p.height || py >= p.height)) {
          if (p.mouseIsPressed) {
            // draw line
            p.line(px, py, x, y);
          }
        }
      };
    };
  }

  generateImages() {
    const { h, w } = this;

    const input = this.sketch.get();
    input.resize(w, h);

    const p = this.sketchToScale;

    const dRotation = 0.1;
    const dScale = 0.1;

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
            <Grid key={0} item xs={3} ref="canvas">
              <div ref="canvasToScale" style={{ display: 'none' }}></div>
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
