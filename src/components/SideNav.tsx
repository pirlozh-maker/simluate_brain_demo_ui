import { NavLink } from 'react-router-dom';
import { useUiStore } from '../store/useUiStore';

const buildNav = [
  { label: 'Cockpit', path: '/build/cockpit' },
  { label: 'Canvas', path: '/build/canvas' },
  { label: 'Foundry', path: '/build/foundry' },
  { label: 'Bench', path: '/build/bench' },
  { label: 'Compare', path: '/build/compare' },
  { label: 'Lab', path: '/build/lab' },
  { label: 'Memory', path: '/build/memory' },
  { label: 'Settings', path: '/build/settings' },
];

const liveNav = [
  { label: 'Live Twin', path: '/live/twin' },
  { label: 'Capture', path: '/live/capture' },
  { label: 'Coach', path: '/live/coach' },
  { label: 'Memory', path: '/live/memory' },
  { label: 'Settings', path: '/live/settings' },
];

const SideNav = () => {
  const mode = useUiStore((state) => state.mode);
  const items = mode === 'BUILD' ? buildNav : liveNav;

  return (
    <aside className="side-nav">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="nav-icon" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

export default SideNav;
