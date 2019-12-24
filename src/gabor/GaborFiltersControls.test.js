import React from 'react';
import ReactDOM from 'react-dom';
import GaborFiltersControls from './GaborFiltersControls';

const filterConfig = {
  numComponents: 3,
  lambda: 4,
  gamma: 2,
  sigma: 1.1,
  windowSize: 5
};

it('renders without crashing', () => {
  const div = document.createElement('div');
  const filterConfig = {

  }
  ReactDOM.render(
    <GaborFiltersControls
      numComponents={3}
      lambda={4}
      gamma={2}
      sigma={1.1}
      windowSize={5}
      bias={1}
      onChange={() => {}}
    />,
  div);
});
