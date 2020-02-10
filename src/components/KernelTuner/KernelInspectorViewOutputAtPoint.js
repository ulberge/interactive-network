import React from 'react';
import PropTypes from 'prop-types';
import KernelInspectorActivationChart from './KernelInspectorActivationChart';
import Array2DViewOverlayList from '../UI/Array2DViewOverlayList';
import nj from 'numjs';

// get indices of kernels with top activations
function selectTopIndices(acts, count) {
  return acts.map((s, i) => [i, s]).sort((a, b) => (a[1] > b[1]) ? -1 : 1).slice(0, count).map(d => d[0]);
}

function getImgArrAtPt(imgArr, pt, pad) {
  const { x, y } = pt;
  const bounds = [ x - pad, y - pad, x + pad + 1, y + pad + 1 ];
  const [ x0, y0, x1, y1 ] = bounds;
  if (x0 < 0 || y0 < 0 || x1 > imgArr[0].length || y1 > imgArr.length) {
    return null;
  }
  const imgArrSlice = nj.array(imgArr).slice([y0, y1], [x0, x1]).tolist();
  return imgArrSlice;
}

const KernelInspectorViewOutputAtPoint = props => {
  let { acts, kernels, count, imgArr, pt } = props;

  if (!acts || !pt || !kernels || kernels.length !== acts.length) {
    return null;
  }

  // select the activations and img data at the selected pt
  const { x, y } = pt;
  let actsAtPt = acts.map(channel => channel[y][x]);
  const pad = (kernels[0].length - 1) / 2;
  const imgArrAtPt = getImgArrAtPt(imgArr, pt, pad);

  // get the indices of the top activations at the given pt
  const top = selectTopIndices(actsAtPt, count);

  // map the top indices to the corresponding activations and kernels
  kernels = top.map(i => kernels[i]);
  actsAtPt = top.map(i => actsAtPt[i]);

  const ptDisplay = `(${pt.x}, ${pt.y})`;

  return (
    <div style={{ width: '200px' }}>
      <div>
        <KernelInspectorActivationChart kernels={kernels} acts={actsAtPt} style={{ margin: '10px auto' }}/>
        <div style={{ margin: '5px 0 25px 0', textAlign: 'center' }}>
          Top activations at {ptDisplay}
        </div>
      </div>
      { imgArrAtPt &&
        <div>
          <Array2DViewOverlayList
            imgArrs={new Array(kernels.length).fill(imgArrAtPt)}
            imgArrsOverlay={kernels}
            scale={4.5}
            overlayOpacity={0.8}
            style={{ margin: '10px auto' }}
          />
          <div style={{ margin: '10px 0', textAlign: 'center' }}>
            Kernel overlays at {ptDisplay}
          </div>
        </div>
      }
    </div>
  );
};

KernelInspectorViewOutputAtPoint.propTypes = {
  acts: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  imgArr: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  pt: PropTypes.object,
  count: PropTypes.number.isRequired,
};

export default KernelInspectorViewOutputAtPoint;
