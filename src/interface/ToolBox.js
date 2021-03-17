import { useEffect, useState } from 'react';
import { Paper, Divider, makeStyles, Switch, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@material-ui/core';
import { useHotkeys } from 'react-hotkeys-hook';
import { lightGreen, cyan, purple, amber, pink } from '@material-ui/core/colors';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import MouseIcon from '@material-ui/icons/Mouse';
import useKeyPress from '../helpers/useKeyPress';
import BrushButton from './BrushButton';
import PrettoSlider from './PrettoSlider';

function Brush (hotkey, color, name) {
  return { hotkey, color, name };
}

const brushes = [
  Brush('q', lightGreen[900], 'head'),
  Brush('w', lightGreen[800], 'chest'),
  Brush('e', lightGreen[600], 'abdomen'),
  Brush('r', lightGreen[300], 'pelvis'),
  Brush('a', cyan[900], 'left upper arm'),
  Brush('s', cyan[600], 'left lower arm'),
  Brush('d', cyan[300], 'left hand'),
  Brush('f', amber[900], 'right upper arm'),
  Brush('g', amber[600], 'right lower arm'),
  Brush('h', amber[300], 'right hand'),
  Brush('z', purple[900], 'left upper leg'),
  Brush('x', purple[600], 'left lower leg'),
  Brush('c', purple[300], 'left foot'),
  Brush('v', pink[900], 'right upper leg'),
  Brush('b', pink[600], 'right lower leg'),
  Brush('n', pink[300], 'right foot'),
];
// Store all hotkeys in a comma separated string
const hotkeys = brushes.reduce((string, brush) => string += brush.hotkey + ",", '');

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    overflowY: 'auto'
  },
  listHeading: {
    display: 'block',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  },
  toggleButton: {
    padding: '0 10px 0 10px'
  },
  brushList: {
    overflowY: 'auto'
  }
}));

export default function ToolBox(props) {
  const classes = useStyles();

  // Retrieve the uplifted state
  const {
    brushBackside, setBrushBackside,
    setBrushColor,
    brushSize, setBrushSize,
    brushKeyPressed, setBrushKeyPressed,
    mouseDefault, setMouseDefault
  } = props.store;
  
  const [brushSelected, setBrushSelected] = useState(0);
  const ctrlPressed = useKeyPress('Control');

  // Switch needs to be unfocused (blurred) so that hotkeys continue to function
  const handleBrushBacksideChange = (event) => { event.target.blur(); setBrushBackside(event.target.checked); };
  const handleBrushSizeChange = (_, newValue) => setBrushSize(newValue);
  const handleMouseDefaultChange = (_, newValue) => { if(newValue) setMouseDefault(newValue) };
  const handleBrushChange = (_, i) => setBrushSelected(i);

  // Set color when brush selection changes
  useEffect(() => {
    if (brushes[brushSelected])
      setBrushColor(brushes[brushSelected].color);
  }, [brushSelected]);

  // Switch mouse interactions between brush and camera
  useEffect(() => {
    if (mouseDefault === "camera")
      setMouseDefault("brush");
    else setMouseDefault("camera");
  }, [ctrlPressed]);

  // Activate hotkeys for each brush
  useHotkeys(hotkeys, event => {
    if (!brushKeyPressed) {
      handleBrushChange(null, brushes.findIndex(brush => brush.hotkey === event.key));
      setBrushKeyPressed(true);
    }
  }, {keydown: true}, [brushKeyPressed]);
  useHotkeys(hotkeys, () => setBrushKeyPressed(false), {keyup: true});
  
  return (
    <Paper className={classes.root} elevation={3}>
      <List>
        {/* Switch - Annotate Front & Back */}
        <ListItem>
          <ListItemIcon>
            <FlipToBackIcon />
          </ListItemIcon>
          <ListItemText primary={"Annotate front & back"} />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              checked={brushBackside}
              onClick={handleBrushBacksideChange}
              color="primary"
              name="brushBackside"
            />
          </ListItemSecondaryAction>
        </ListItem>

        {/* Slider - Brush Size */}
        <ListItem>
          <ListItemIcon>
            <FiberManualRecordIcon />
          </ListItemIcon>
          <ListItemText>
            <span>Brush size: {brushSize}</span>
            <PrettoSlider
              value={brushSize}
              step={1}
              min={1}
              max={50}
              onChange={handleBrushSizeChange} />
          </ListItemText>
        </ListItem>

        {/* Toggle - Camera / Brush */}
        <ListItem>
          <ListItemIcon>
            <MouseIcon />
          </ListItemIcon>
          <ListItemText primary={"Control"} secondary={"Hold Ctrl"} />
          <ListItemSecondaryAction>
            <ToggleButtonGroup value={mouseDefault} exclusive onChange={handleMouseDefaultChange}>
              <ToggleButton className={classes.toggleButton} value="camera">
                <span>Camera</span>
              </ToggleButton>
              <ToggleButton className={classes.toggleButton} value="brush">
                <span>Brush</span>
              </ToggleButton>
            </ToggleButtonGroup>
          </ListItemSecondaryAction>
        </ListItem>
        
        <Divider />
      </List>

      {/* Brush List */}
      <span className={classes.listHeading}>Brush list</span>
      <List className={classes.brushList}>
        {brushes.map((brush, i) => {
          return (
            <BrushButton
              key={`brush_${i}`}
              index={i}
              selected={brushSelected === i}
              onClick={handleBrushChange}
              {...brush}
            />
          )
        })}
      </List>
    </Paper>
  );
}