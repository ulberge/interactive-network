import React, { Component } from 'react';

import ArrayToImage from './ArrayToImage';
import IconButton from '@material-ui/core/IconButton';
import ReplayIcon from '@material-ui/icons/Replay';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';

export default class Corpus extends Component {
  count = 10

  state = {
    start: Math.floor(Math.random() * this.props.imgs.length)
  }

  addNegativeImages() {
    const { imgs, addImages } = this.props;
    let { start } = this.state;
    addImages(imgs.slice(start, start + this.count), 0);

    this.newStart();
  }

  newStart() {
    const { imgs } = this.props;
    this.setState({ start: Math.floor(Math.random() * (imgs.length - this.count)) });
  }

  render() {
    const { imgs } = this.props;
    let { start } = this.state;

    if (start === null) {
      start = Math.floor(Math.random() * (imgs.length - this.count));
    }
    // randomly fetch some number
    // allow remove items
    // add to negative examples button

    return (
      <div className="corpus">
        { (start !== null) && imgs && imgs.length > 0 ? imgs.slice(start, start + this.count).map((img, i) => (<ArrayToImage key={i} imgArr={img} />)) : null }
        <IconButton aria-label="fetch new batch" onClick={() => this.newStart()}>
          <ReplayIcon />
        </IconButton>
        <IconButton aria-label="add negative" onClick={() => this.addNegativeImages()}>
          <ThumbDownIcon />
        </IconButton>
      </div>
    );
  }
}
