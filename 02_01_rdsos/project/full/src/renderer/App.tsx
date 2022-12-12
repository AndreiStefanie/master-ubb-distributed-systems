import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import NetworkList from './features/networks/NetworkList';
import './App.css';

const router = createMemoryRouter([
  {
    path: '/',
    element: <NetworkList />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
