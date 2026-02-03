import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useUiStore } from '../store/useUiStore';
import { useTwinStore } from '../store/useTwinStore';

const Humanoid = ({ tint, opacity = 1 }: { tint: string; opacity?: number }) => (
  <group>
    <mesh position={[0, 1.4, 0]}>
      <sphereGeometry args={[0.25, 32, 32]} />
      <meshStandardMaterial color={tint} opacity={opacity} transparent />
    </mesh>
    <mesh position={[0, 0.8, 0]}>
      <capsuleGeometry args={[0.25, 0.6, 8, 16]} />
      <meshStandardMaterial color={tint} opacity={opacity} transparent />
    </mesh>
    <mesh position={[-0.35, 0.9, 0]}>
      <capsuleGeometry args={[0.1, 0.45, 8, 16]} />
      <meshStandardMaterial color={tint} opacity={opacity} transparent />
    </mesh>
    <mesh position={[0.35, 0.9, 0]}>
      <capsuleGeometry args={[0.1, 0.45, 8, 16]} />
      <meshStandardMaterial color={tint} opacity={opacity} transparent />
    </mesh>
    <mesh position={[-0.15, 0.15, 0]}>
      <capsuleGeometry args={[0.12, 0.6, 8, 16]} />
      <meshStandardMaterial color={tint} opacity={opacity} transparent />
    </mesh>
    <mesh position={[0.15, 0.15, 0]}>
      <capsuleGeometry args={[0.12, 0.6, 8, 16]} />
      <meshStandardMaterial color={tint} opacity={opacity} transparent />
    </mesh>
  </group>
);

const TwinStage = () => {
  const overlay = useUiStore((state) => state.overlay);
  const setEvidenceFocus = useUiStore((state) => state.setEvidenceFocus);
  const twin = useTwinStore();
  const [ghost, setGhost] = useState(false);

  const stageLabel = useMemo(() => {
    const items = [];
    if (overlay.eeg) items.push('EEG');
    if (overlay.emg) items.push('EMG');
    if (overlay.force) items.push('Force');
    if (overlay.phase) items.push('Phase');
    return items.join(' + ') || 'Base';
  }, [overlay]);

  return (
    <div className="twin-stage">
      <div className="stage-label">{stageLabel} Overlay</div>
      <Canvas
        camera={{ position: [1.5, 1.8, 2.6], fov: 45 }}
        onPointerDown={(event) => {
          if (event.shiftKey) {
            setGhost((prev) => !prev);
          }
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[2, 4, 3]} intensity={0.9} />
        <Suspense fallback={null}>
          <group
            position={[0, 0, 0]}
            rotation={[0, twin.posture[0], twin.posture[2]]}
            onClick={() => setEvidenceFocus('Stage: Left Arm')}
          >
            <Humanoid tint="#6df0ff" />
          </group>
          {ghost && (
            <group position={[0.05, 0, -0.05]} rotation={[0, 0.15, 0]}>
              <Humanoid tint="#ffffff" opacity={0.35} />
            </group>
          )}
        </Suspense>
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
};

export default TwinStage;
