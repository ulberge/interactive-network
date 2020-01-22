import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { NavLink } from 'react-router-dom';

const linkStyle = {
  color: '#212121',
  textDecoration: 'none'
};

const activeStyle = {
  color: '#000',
  fontWeight: 'bold'
};

export default function Header() {
  return (
    <MenuList>
      <MenuItem><NavLink to="/kernels" activeStyle={activeStyle} style={linkStyle}>Kernels</NavLink></MenuItem>
      <MenuItem><NavLink to="/smartcanvas" activeStyle={activeStyle} style={linkStyle}>Canvas</NavLink></MenuItem>
      <MenuItem><NavLink to="/draw" activeStyle={activeStyle} style={linkStyle}>Draw</NavLink></MenuItem>
    </MenuList>
  );
};
