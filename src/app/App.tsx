import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Cockpit from '../pages/build/Cockpit';
import Canvas from '../pages/build/Canvas';
import Foundry from '../pages/build/Foundry';
import Bench from '../pages/build/Bench';
import Compare from '../pages/build/Compare';
import Lab from '../pages/build/Lab';
import Memory from '../pages/build/Memory';
import Settings from '../pages/build/Settings';
import LiveTwin from '../pages/live/LiveTwin';
import Capture from '../pages/live/Capture';
import Coach from '../pages/live/Coach';
import LiveMemory from '../pages/live/Memory';
import LiveSettings from '../pages/live/Settings';
import { startMockBus } from '../mock/eventBus';

const App = () => {
  useEffect(() => {
    const stop = startMockBus();
    return () => stop();
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/build/cockpit" replace />} />
        <Route path="/build/cockpit" element={<Cockpit />} />
        <Route path="/build/canvas" element={<Canvas />} />
        <Route path="/build/foundry" element={<Foundry />} />
        <Route path="/build/bench" element={<Bench />} />
        <Route path="/build/compare" element={<Compare />} />
        <Route path="/build/lab" element={<Lab />} />
        <Route path="/build/memory" element={<Memory />} />
        <Route path="/build/settings" element={<Settings />} />
        <Route path="/live/twin" element={<LiveTwin />} />
        <Route path="/live/capture" element={<Capture />} />
        <Route path="/live/coach" element={<Coach />} />
        <Route path="/live/memory" element={<LiveMemory />} />
        <Route path="/live/settings" element={<LiveSettings />} />
        <Route path="*" element={<Navigate to="/build/cockpit" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
