import { useEffect, useState, useRef } from 'react';
import { Box, Button, Grid, makeStyles } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import SaveIcon from '@material-ui/icons/Save';
import DescriptionIcon from '@material-ui/icons/Description';
import Viewer3D from './viewer3d/Viewer3D.js'
import ToolBox from './interface/ToolBox.js'
import './App.css';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100vw',
    height: '100vh',
    position: 'absolute'
  },
  gridCell: {
    height: '100%'
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  paper: {
    borderRadius: 10
  }
}));

function MeshFile(url, name = "mesh") { return { url, name }; }

function App() {
  const classes = useStyles();

  // Uplifted state
  const [brushBackside, setBrushBackside] = useState(true);
  const [brushColor, setBrushColor] = useState("");
  const [brushSize, setBrushSize] = useState(15);
  const [brushKeyPressed, setBrushKeyPressed] = useState(false);
  const [mouseDefault, setMouseDefault] = useState("brush");
  const [meshFile, setMeshFile] = useState(MeshFile("assets/male-high-poly.obj", "male-high-poly.obj"));
  const [isExporting, setIsExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isCheckingPointColors, setIsCheckingPointColors] = useState(false);
  const [allPointsAreColored, setAllPointsAreColored] = useState(false);
  const [error, setError] = useState("");

  const store = {
    brushBackside, setBrushBackside,
    brushColor, setBrushColor,
    brushSize, setBrushSize,
    brushKeyPressed, setBrushKeyPressed,
    mouseDefault, setMouseDefault,
    meshFile, setMeshFile,
    isExporting, setIsExporting,
    isCheckingPointColors, setIsCheckingPointColors,
    allPointsAreColored, setAllPointsAreColored,
    error, setError
  };
  
  // Import
  const handleInputFileChanged = (event) => {
    // Check if a file was selected
    if (event.target.files.length > 0)
      // Load file content, create URL, and pass it to the 3d viewer
      setMeshFile(MeshFile(
        URL.createObjectURL(event.target.files[0]),
        event.target.files[0].name
      ));
  };

  // Export
  // Before exporting, check if all vertices are colored
  const handleExportClick = () => setIsCheckingPointColors(true);
  // When point colors were checked, find result in allPointsAreColored
  // If some vertices are not colored, ask if it should export anyways
  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current)
      firstUpdate.current = false;
    else if (!isCheckingPointColors) {
      if (allPointsAreColored) handleExportAccepted();
      else setExportDialogOpen(true);
    }
  }, [isCheckingPointColors, allPointsAreColored]);
  const handleExportCanceled = () => setExportDialogOpen(false);
  const handleExportAccepted = () => { setExportDialogOpen(false); setIsExporting(true); }

  return (
    <div className={classes.root}>
      <CssBaseline />
      
      {/* 3D View & Navigation */}
      <Grid className={classes.root} container>
        <Grid className={classes.gridCell} item xs={9}>
          <Viewer3D className={classes.canvas} store={store} />
        </Grid>
        <Grid className={classes.gridCell} item xs={3}>
          <ToolBox store={store} />
        </Grid>
      </Grid>
      
      {/* Overlay - Import & Export */}
      <Box m={1} position={'absolute'}>
        <Grid container item spacing={1} xs={2}>
          <Grid item xs={12}>
            <input
              accept=".obj"
              hidden
              id="button-import-file"
              type="file"
              onChange={handleInputFileChanged}
            />
            <label htmlFor="button-import-file">
              <Button variant="contained" component="span" color="primary" startIcon={<DescriptionIcon />}>
                Import
              </Button>
            </label>
          </Grid>
          <Grid item xs={12}>
            <Button
              color="primary"
              onClick={handleExportClick}
              disabled={isExporting}
              startIcon={<SaveIcon />}
              variant="contained"
            >
              Export
            </Button>
            {/* Export dialog */}
            <Dialog open={exportDialogOpen} onClose={handleExportCanceled}>
              <DialogTitle>{"Export non-colored vertices?"}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Not all vertices are colored yet.
                  Do you want to export anyways?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleExportCanceled} color="secondary">Cancel</Button>
                <Button onClick={handleExportAccepted} color="primary" variant="contained" autoFocus>Export</Button>
              </DialogActions>
            </Dialog>
            {/* Export loading screen */}
            <Dialog classes={{ paper: classes.paper }} open={isExporting}>
              <Box px={5} py={3}>Preparing for download ...</Box>
            </Dialog>
          </Grid>
        </Grid>
      </Box>

      {/* Error dialog */}
      <Dialog classes={{ paper: classes.paper }} open={error !== ""} onClose={() => setError("")}>
        <Box px={5} py={3}>{error}</Box>
      </Dialog>
    </div>
  );
}

export default App;