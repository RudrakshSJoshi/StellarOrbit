// src/AppRouter.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import BackendCodePage from './pages/BackendCodePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/backend-code',
    element: <BackendCodePage />
  },
  {
    path: '/backend-code/:projectName',
    element: <BackendCodePage />
  }
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;