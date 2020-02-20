import React, { useState } from 'react';
import Header from './Header';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Divider from '@material-ui/core/Divider';

export default function Layout(props) {
  const [ menuOpen, setMenuOpen ] = useState(false);

  return (
    <div>
      <div style={{ position: 'absolute', left: '40px', top: '20px' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={() => setMenuOpen(true)}
          edge="start"
        >
          <MenuIcon />
        </IconButton>
      </div>
      {props.children}
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div style={{ textAlign: 'right', width: '200px' }}>
          <IconButton onClick={() => setMenuOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <Header />
      </Drawer>
    </div>
  );
}
