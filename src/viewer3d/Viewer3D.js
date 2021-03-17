import { Suspense } from 'react';
import { Canvas } from 'react-three-fiber';
import { Loader } from "@react-three/drei";
import useEventListener from '../helpers/useEventListener';
import CameraControls from './CameraControls';
import Model from './Model';

export default function Viewer3D(props) {
  // Retrieve the uplifted state
  const { store } = props;
  useEventListener('contextmenu', (e) => { if (e.target.nodeName === 'CANVAS') e.preventDefault() });

  return (
    <>
      <Canvas camera={{ position: [0, 0.2, 2.5], near: 0.01 }}>
        <CameraControls enabled={store.mouseDefault === "camera"} rotateSpeed={0.5} />
        <ambientLight intensity={0.2} />
        <pointLight intensity={0.5} position={[-10, -10, -10]} />
        <spotLight intensity={0.5} position={[10, 10, 10]} angle={0.15} />
        <Suspense fallback={null} >
          <Model store={store} url={store.meshFile.url}/>
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}