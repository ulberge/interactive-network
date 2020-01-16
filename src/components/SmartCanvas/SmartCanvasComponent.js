import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { SmartCanvas } from '../../js/smartcanvas';
import ChannelView from './ChannelView';
import { getEmpty2DArray } from '../../js/helpers';

const SmartCanvasComponent = props => {
  const [ channelIds, setChannelIds ] = useState([]);

  const imgRef = useRef(null);
  const pRef = useRef(null);
  const smartCanvasRef = useRef(null);

  useEffect(() => {
    if (!pRef.current) {
      const onChange = channels => setChannelIds(() => {
        const [ w, h ] = props.shape;
        const max = getEmpty2DArray(h, w, -1);
        const channelIds = getEmpty2DArray(h, w, -1);
        channels.forEach((channel, chIndex) => channel.forEach((row, rowIndex) => row.forEach((v, colIndex) => {
          if (v > 0.1 && v > max[rowIndex][colIndex]) {
            max[rowIndex][colIndex] = v;
            channelIds[rowIndex][colIndex] = chIndex;
          }
        })));
        return channelIds;
      });
      smartCanvasRef.current = new SmartCanvas(props.shape, onChange);
      pRef.current = new p5(smartCanvasRef.current.getSketch(), imgRef.current);
    }
  }, [props]);

  return (
    <div>
      <div ref={imgRef}></div>
      <div>
        <ChannelView scale={3} imgArr={channelIds} />
      </div>
    </div>
  );
};

SmartCanvasComponent.propTypes = {
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default SmartCanvasComponent;
