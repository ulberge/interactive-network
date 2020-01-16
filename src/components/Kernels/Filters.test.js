import React from 'react';
import ReactDOM from 'react-dom';
import GaborFilters from './Gabor/Filters';
import 'jest-canvas-mock';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<GaborFilters filters={[[[1]]]} />, div);
});

it('renders without crashing with empty list', () => {
  const div = document.createElement('div');
  ReactDOM.render(<GaborFilters filters={[]} />, div);
});

it('renders without crashing with scale', () => {
  const div = document.createElement('div');
  ReactDOM.render(<GaborFilters filters={[[[1]]]} scale={10} />, div);
});
