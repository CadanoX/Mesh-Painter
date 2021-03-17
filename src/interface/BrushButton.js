import { Button, makeStyles, ListItemAvatar, ListItemText } from '@material-ui/core';
import MuiListItem from '@material-ui/core/ListItem';
import { withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  hotkey: {
    minWidth: 15,
    maxWidth: 15,
    height: 24,
    marginLeft: -5,
    boxShadow: 'inset -1px -1px 2px black, 0 0 2px black',
    pointerEvents: 'none'
  },
  listItemText: {
    color: 'black',
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 0,
  }
}));

const ListItem = withStyles({
  root: {
    "&$selected": {
      boxShadow: 'inset 0 -2px 5px black, inset 0 2px 5px black'
    },
    '&:hover': {
      boxShadow: 'inset 0 -2px 5px black, inset 0 2px 5px black',
    },
  },
  selected: {}
})(MuiListItem);

export default function BrushButton(props) {
  const { hotkey, color, name, onClick, index, selected } = props;
  const classes = useStyles();

  return (
    <ListItem style={{backgroundColor: color}} button selected={selected} onClick={(e) => onClick(e, index)}>
      <ListItemAvatar classes={{root:classes.listItemAvatar}}>
        <Button className={classes.hotkey} style={{backgroundColor: '#EEE'}} variant="contained">
          {hotkey}
        </Button>
      </ListItemAvatar>
      <ListItemText classes={{root:classes.listItemText}} primary={name} />
    </ListItem>
  );
}