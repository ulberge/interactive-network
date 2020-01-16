import React from 'react';
import ReactDOM from 'react-dom';
import GaborFiltersControls from './Gabor/FiltersControls';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <GaborFiltersControls
      numComponents={3}
      lambda={4}
      sigma={1.1}
      windowSize={5}
      bias={1}
      onChange={() => {}}
    />,
  div);
});
