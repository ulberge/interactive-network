import React from 'react';
import PropTypes from 'prop-types';
import DrawDebugNewMark from './DebugNewMark';
import DrawDebugNewMarkActs from './DebugNewMarkActs';

const DrawDebugNextSegmentOption = props => {
  const { debugOption, scale, kernels } = props;
  return (
    <div>
      <div>{ !isNaN(debugOption.score) ? debugOption.score.toFixed(4) : null }</div>
      <DrawDebugNewMark debugOption={debugOption} scale={scale} />
      <h4>Acts</h4>
      {/*<DrawDebugNewMarkActs max={debugOption.maxOriginal} ids={debugOption.idsOriginal} scale={scale * 2} kernels={kernels} />*/}
      <DrawDebugNewMarkActs max={debugOption.max} ids={debugOption.ids} scale={scale * 2} kernels={kernels} />
      { debugOption.channelsDebug.map((channelDebug, i) => {
        const { maxPos, idsPos, maxNeg, idsNeg } = channelDebug
        return (
          <div key={i}>
            <h4>+ Change</h4>
            <DrawDebugNewMarkActs max={maxPos} ids={idsPos} scale={scale * 3} kernels={kernels} />
            <h4>- Change</h4>
            <DrawDebugNewMarkActs max={maxNeg} ids={idsNeg} scale={scale * 3} kernels={kernels} />
          </div>
        )
      })}
    </div>
  );
};

DrawDebugNextSegmentOption.propTypes = {
  debugOption: PropTypes.object,
  scale: PropTypes.number,
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
};

export default DrawDebugNextSegmentOption;
