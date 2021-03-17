import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useFrame } from 'react-three-fiber';
import useEventListener from '../helpers/useEventListener';
import { parseBufferGeometryToObj } from '../helpers/Exporter';
import { downloadString } from '../helpers/functions';
import Brush from './Brush';

// Define white as "not colored"
const noColor = new THREE.Color(1,1,1);

export default function Model(props) {
  const {
    brushBackside, brushColor, brushSize, brushKeyPressed,
    meshFile, mouseDefault, isExporting, setIsExporting,
    isCheckingPointColors, setIsCheckingPointColors,
    setAllPointsAreColored, setError,
  } = props.store;
  const [brush] = useState(new Brush())
  const [geometry, setGeometry] = useState();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState([0,0,0]);
  const [mouseDown, setMouseDown] = useState(false);

  const raycaster = new THREE.Raycaster();
  const model = useRef();
  const brushMesh = useRef();

  useEventListener('mousedown', (e) => { if (e.target.nodeName === 'CANVAS') setMouseDown(true) });
  useEventListener('mouseup', (e) => { setMouseDown(false) });

  // Check if any vertex color is still white
  const checkAllPointsAreColored = () => {
    const attr = model.current.geometry.attributes;
    const pointColor = new THREE.Color()
    for (let i = 0; i < attr.position.count; i++) {
      pointColor.fromBufferAttribute(attr.color, i);
      if (pointColor.equals(noColor))
        return false;
    }
    return true;
  };

  // Trigger a check from another component
  useEffect(() => {
    if (isCheckingPointColors) {
      setAllPointsAreColored(checkAllPointsAreColored())
      setIsCheckingPointColors(false);
    }
  }, [isCheckingPointColors])
  
  // Trigger export from another component
  useEffect(() => {
    if (isExporting) {
      const objString = parseBufferGeometryToObj(geometry);
      downloadString(objString, meshFile.name);
      setIsExporting(false);
    }
  }, [isExporting])

  // Update brush variables on prop change
  useEffect(() => brush.set({
    // Scale brushSize from [0, 50] to [0, 0.5]
    size: brushSize / 100,
    color: brushColor,
    // Activate brush if it is set as default, or when ctrl is pressed
    enabled: (mouseDefault === "brush" && mouseDown) || brushKeyPressed
  }), [brushSize, brushColor, mouseDefault, mouseDown, brushKeyPressed]);

  // Load mesh when url changes
  useMemo(() =>
    new OBJLoader().load(
      meshFile.url, initGeometry, (error) => { console.log(error); }),
    [meshFile]
  );

  function initGeometry(mesh) {
    if (mesh.children.length === 0) {
      setError("File could not be loaded.");
      return;
    }
    if (!mesh.children[0].isMesh) {
      setError("File does not describe a mesh.");
      return;
    }

    const geo = mesh.children[0].geometry;
    geo.computeBoundingSphere();
    if (isNaN(geo.boundingSphere.radius)) {
      setError("Mesh could not be loaded. (Missing vertex values)");
      return;
    }

    geo.computeVertexNormals()
    setGeometry(geo);

    // Scale mesh so it fits in a 2x2x2 box
    geo.computeBoundingBox()
    const box = geo.boundingBox;
    const dim = [box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z];
    const maxDim = Math.max(...dim);
    setScale(2 / maxDim);
    
    // Position mesh into the center of the scene
    setPosition([
      (-box.min.x -dim[0]/2) * 2/maxDim,
      (-box.min.y -dim[1]/2) * 2/maxDim,
      (-box.min.z -dim[2]/2) * 2/maxDim
    ]);
    
    // Define color array on mesh geometry
    if (!geo.attributes.color) {
      const colors = new Array(geo.attributes.position.array.length).fill(1);
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
  }

  // Render loop
  useFrame((state) => {
    const {mouse, camera} = state;
    // Shoot a ray from the mouse position into the direction of the camera
    raycaster.setFromCamera(mouse, camera);
    updateBrushMesh(camera)
    if (brush.enabled)
      paintPoints();
  })

  function updateBrushMesh(camera) {
    const z = camera.near + 0.01;
    // Calculate angle between camera direction and mouse position
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir)
    const cosAlpha = camDir.dot(raycaster.ray.direction);

    // Project brush onto the near plane
    brushMesh.current.position.copy(raycaster.ray.origin.clone().addScaledVector(raycaster.ray.direction, z / cosAlpha));
    brushMesh.current.lookAt(raycaster.ray.origin);

    // Get distance of the mesh to the camera (only z distance for perspective projection)
    const intersect = raycaster.intersectObject(model.current);
    if (intersect.length > 0)
      brush.distance = intersect[0].distance * cosAlpha;
    
    // Scale brush with distance to the object and brush size
    brushMesh.current.scale.x = 1/brush.distance * brush.size;
    brushMesh.current.scale.y = 1/brush.distance * brush.size;
  }

  function paintPoints() {
    let numPaintedPoints = 0;
    const normal = new THREE.Vector3();
    const point = new THREE.Vector3();
    const attr = model.current.geometry.attributes;
    let cosAlpha = -1;

    // Project the ray into Model Space
    const modelMatrixInverse = model.current.matrix.clone().invert();
    raycaster.ray.applyMatrix4(modelMatrixInverse);

    // Calculate distance between each point and the ray
    for (let i = 0; i < attr.position.count; i++) {
      point.fromBufferAttribute(attr.position, i)
      // Paint point if distance is smaller than brush size
      // Since we are in model space, the distance needs to take the model scale into account
      if (raycaster.ray.distanceToPoint(point) <= brush.size / scale) {
        // Check if vertex normal is facing towards the camera
        if (!brushBackside) {
          normal.fromBufferAttribute(attr.normal, i);
          cosAlpha = raycaster.ray.direction.dot(normal);
        }
        if (cosAlpha < 0) {
          attr.color.setXYZ(i, brush.color.r, brush.color.g, brush.color.b);
          numPaintedPoints++;
        }
      }
    }
    
    // Tell the engine to update point colors
    if (numPaintedPoints > 0)
      attr.color.needsUpdate = true;
  }

  return (
    <group>
      <mesh ref={model} geometry={geometry} scale={[scale,scale,scale]} position={position}>
        <meshStandardMaterial vertexColors />
      </mesh>
      <mesh ref={brushMesh}>
        <ringBufferGeometry args={[0.02, 0.021, 32]} />
        <meshBasicMaterial color={brushColor} />
      </mesh>
    </group>
  )
}