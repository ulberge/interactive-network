import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { Link } from 'react-router-dom';

const linkStyle = {
  color: '#000'
};

export default function Header() {
  return (
    <MenuList>
      <MenuItem><Link to="/kernels" style={linkStyle}>Kernels</Link></MenuItem>
      <MenuItem><Link to="/smartcanvas" style={linkStyle}>Canvas</Link></MenuItem>
    </MenuList>
  );
};
