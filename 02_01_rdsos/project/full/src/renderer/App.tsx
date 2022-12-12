import {
  createMemoryRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import styled from '@emotion/styled';
import NetworkList from './features/networks/NetworkList';
import PacketList from './features/sniffer/PacketList';
import NavDrawer from './features/nav/NavDrawer';
import './App.css';

const Main = styled('main')(() => ({
  flexGrow: 1,
  paddingTop: '20px',
}));

const AppLayout = () => (
  <>
    <NavDrawer />
    <Main>
      <Container maxWidth="sm">
        <Outlet />
      </Container>
    </Main>
  </>
);

const router = createMemoryRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route path="/" element={<NetworkList />} />
      <Route path="/sniffer" element={<PacketList />} />
    </Route>
  )
);

export default function App() {
  return (
    <>
      <CssBaseline />
      <RouterProvider router={router} fallbackElement={<CircularProgress />} />
    </>
  );
}
