import React from 'react';
import PropTypes from 'prop-types';
import Slider from '@material-ui/core/Slider';

const numComponentsMarks = [1, 2, 3, 4, 5].map(value => ({ value, label: (2 ** value) }));
const NumComponentsSlider = React.memo(function NumComponentsSlider(props) {
  return (
    <div>
      <div>Number of Components</div>
      <Slider
        value={props.numComponents}
        track={false}
        aria-labelledby="number of components"
        marks={numComponentsMarks}
        step={1}
        min={1}
        max={5}
        onChange={(event, value) => props.onChange('numComponents', value)}
      />
    </div>
  )
});
NumComponentsSlider.propTypes = {
  numComponents: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

const LambdaSlider = React.memo(function LambdaSlider(props) {
  return (
    <div>
      <div>Lambda (width)</div>
      <Slider
        value={props.lambda}
        track={false}
        aria-labelledby="lambda"
        valueLabelDisplay="auto"
        marks={[{ value: 1.1, label: '1.1'}, { value: 8, label: '8'}]}
        step={0.1}
        min={1.1}
        max={8}
        onChange={(event, value) => props.onChange('lambda', value)}
      />
    </div>
  )
});
LambdaSlider.propTypes = {
  lambda: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

const GammaSlider = React.memo(function GammaSlider(props) {
  return (
    <div>
      <div>Gamma (length)</div>
      <Slider
        value={props.gamma}
        track={false}
        aria-labelledby="gamma"
        valueLabelDisplay="auto"
        marks={[{ value: 0.1, label: '0.1'}, { value: 4, label: '4'}]}
        step={0.1}
        min={0.1}
        max={4}
        onChange={(event, value) => props.onChange('gamma', value)}
      />
    </div>
  )
});
GammaSlider.propTypes = {
  gamma: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

const SigmaSlider = React.memo(function SigmaSlider(props) {
  return (
    <div>
      <div>Sigma (size of Gaussian)</div>
      <Slider
        value={props.sigma}
        track={false}
        aria-labelledby="sigma"
        valueLabelDisplay="auto"
        marks={[{ value: 0.1, label: '0.1'}, { value: 2, label: '2'}]}
        step={0.1}
        min={0.1}
        max={2}
        onChange={(event, value) => props.onChange('sigma', value)}
      />
    </div>
  )
});
SigmaSlider.propTypes = {
  sigma: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

const WindowSizeSlider = React.memo(function WindowSizeSlider(props) {
  return (
    <div>
      <div>Window Size</div>
      <Slider
        value={props.windowSize}
        track={false}
        aria-labelledby="window size"
        valueLabelDisplay="auto"
        marks={[{ value: 3, label: '3'}, { value: 19, label: '19'}]}
        step={2}
        min={3}
        max={19}
        onChange={(event, value) => props.onChange('windowSize', value)}
      />
    </div>
  )
});
WindowSizeSlider.propTypes = {
  windowSize: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

const BiasSlider = React.memo(function BiasSlider(props) {
  return (
    <div>
      <div>Bias</div>
      <Slider
        value={props.bias}
        track={false}
        aria-labelledby="bias"
        valueLabelDisplay="auto"
        marks={[{ value: -5, label: '-5'}, { value: 5, label: '5'}]}
        step={0.1}
        min={-5}
        max={5}
        onChange={(event, value) => props.onChange('bias', value)}
      />
    </div>
  )
});
BiasSlider.propTypes = {
  bias: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

const GaborFiltersControls = (function GaborFiltersControls(props) {
  return (
    <div style={{ width: '180px' }}>
      <NumComponentsSlider
        numComponents={props.numComponents}
        onChange={props.onChange}
      />
      <WindowSizeSlider
        windowSize={props.windowSize}
        onChange={props.onChange}
      />
      <GammaSlider
        gamma={props.gamma}
        onChange={props.onChange}
      />
      <LambdaSlider
        lambda={props.lambda}
        onChange={props.onChange}
      />
      <SigmaSlider
        sigma={props.sigma}
        onChange={props.onChange}
      />
      <BiasSlider
        bias={props.bias}
        onChange={props.onChange}
      />
    </div>
  );
});

GaborFiltersControls.propTypes = {
  numComponents: PropTypes.number.isRequired,
  lambda: PropTypes.number.isRequired,
  gamma: PropTypes.number.isRequired,
  sigma: PropTypes.number.isRequired,
  windowSize: PropTypes.number.isRequired,
  bias: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default GaborFiltersControls;
