import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import DrawDebugNextSegmentOption from './DebugNextSegmentOption';

const DrawDebugNextSegmentOptions = props => {
  const { kernels, debugOptions, scale } = props;

  if (!kernels || kernels.length === 0 || !debugOptions || debugOptions.length === 0) {
    return null;
  }

  // sort the next segment options by score
  console.log('scores at debug', debugOptions.map(opt => opt.score));
  const debugOptionsTop = debugOptions.filter(option => !!option.score).sort((a, b) => (a.score > b.score) ? -1 : 1).slice(0, 4);

  return (
    <Grid container spacing={1} style={{ position: 'relative', margin: 'auto' }}>
      { debugOptionsTop.map((option, i) => {
        return (
          <Grid item key={i + '_' + Date.now()}>
            <Grid container alignItems="center" justify="center" spacing={1}>
              <Grid item>
                <DrawDebugNextSegmentOption debugOption={option} kernels={kernels} scale={scale} />
              </Grid>
            </Grid>
          </Grid>
        );
      }) }
    </Grid>
  );
}

DrawDebugNextSegmentOptions.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  debugOptions: PropTypes.arrayOf(PropTypes.object),
  scale: PropTypes.number,
};

export default DrawDebugNextSegmentOptions;
