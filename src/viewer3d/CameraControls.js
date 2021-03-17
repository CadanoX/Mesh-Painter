import { useRef } from 'react';
import { useThree, useFrame, extend } from 'react-three-fiber';
import { OrbitControls } from './OrbitControls';
extend({ OrbitControls });

export default function CameraControls(props) {
  const { camera, gl: { domElement }} = useThree();
  const controls = useRef();
  useFrame(() => controls.current.update());
  return <orbitControls ref={controls} args={[camera, domElement]} {...props} />
}