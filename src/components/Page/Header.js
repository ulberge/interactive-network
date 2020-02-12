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
      <MenuItem><NavLink to="/tuner" activeStyle={activeStyle} style={linkStyle}>Kernel Tuner</NavLink></MenuItem>
      <MenuItem><NavLink to="/builder" activeStyle={activeStyle} style={linkStyle}>Network Builder</NavLink></MenuItem>
    </MenuList>
  );
};
