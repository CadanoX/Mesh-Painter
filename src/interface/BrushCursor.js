// Inspired by Andriy Chemerynskiy https://dev.to/andrewchmr/awesome-animated-cursor-with-react-hooks-5ec3
// 2D mouse cursor, which might replace the current 3D brush indicator

import { useState, useEffect } from 'react';
import { Button, makeStyles, ListItemAvatar, ListItemText } from '@material-ui/core';
import MuiListItem from '@material-ui/core/ListItem';
import { withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  cursor: {
    width: 40,
    height: 40,
    border: '2px solid black',
    borderRadius: '100%',
    position: 'fixed',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: '9999',
    transition: 'all 150ms ease',
    transitionProperty: 'opacity',
  },
  // cursor--hidden {
  //   opacity: 0;
  // }
}));

export default function BrushCursor(props) {
  const classes = useStyles();
  const [position, setPosition] = useState({x: 0, y: 0});

  useEffect(() => {
    addEventListeners();
    return () => removeEventListeners();
  }, []);

  const addEventListeners = () => {
    document.addEventListener("mousemove", onMouseMove);
  };
    
  const removeEventListeners = () => {
    document.removeEventListener("mousemove", onMouseMove);
  };
    
  const onMouseMove = (e) => {
    setPosition({x: e.clientX, y: e.clientY});
  };  

  return (
    <div className={classes.cursor} style={{ left: `${position.x}px`, top: `${position.y}px` }} />
  );
}