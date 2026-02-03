import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import TopBar from '../components/TopBar';
import SideNav from '../components/SideNav';
import { useUiStore } from '../store/useUiStore';

const Layout = () => {
  const isDrawerOpen = useUiStore((state) => state.isEvidenceOpen);
  const setMode = useUiStore((state) => state.setMode);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/live')) {
      setMode('LIVE');
    } else {
      setMode('BUILD');
    }
  }, [location.pathname, setMode]);

  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-body">
        <SideNav />
        <main className={`app-content ${isDrawerOpen ? 'drawer-open' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
