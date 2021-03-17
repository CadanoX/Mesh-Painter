// Adjusted from the Material UI examples page https://material-ui.com/components/slider/#customized-sliders
import Slider from '@material-ui/core/Slider'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme)=>({
  root: {
    color: '#52af77',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
}));

export default function PrettoSlider (props) {
  const classes = useStyles()
  return (
    <Slider classes={{
        root: classes.root,
        thumb: classes.thumb,
        active: classes.active,
        valueLabel: classes.valueLabel,
        track: classes.track,
        rail: classes.rail,
      }}
      {...props}
    />
  )
}