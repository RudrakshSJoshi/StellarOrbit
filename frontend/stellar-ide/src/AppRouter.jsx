// ====================================================================
// UPDATE: src/AppRouter.jsx (update the import section at the top)
// ====================================================================

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { FileSystemProvider } from './contexts/FileSystemContext';
import { BlockchainProvider } from './contexts/BlockchainContext';
import { EditorProvider } from './contexts/EditorContext';
import App from './App';
import BackendCodePage from './pages/BackendCodePage';
import AccountsPage from './pages/AccountsPage';
import DeployPage from './pages/DeployPage';
import InteractPage from './pages/InteractPage';
import ExplorerPage from './pages/ExplorerPage';
import APIDebugTester from './components/debug/APIDebugTester';
import TransactionsPage from './pages/TransactionsPage';
// Create the router configuration
const createRoutes = () => [
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
    },
    {
      path: '/accounts',
      element: <AccountsPage />
    },
    {
      path: '/deploy',
      element: <DeployPage />
    },
    {
      path: '/interact',
      element: <InteractPage />
    },
    {
      path: '/explorer',
      element: <ExplorerPage />
    },
    {
      path: '/debug',
      element: <APIDebugTester />
    },
    {
        path: '/transactions',
        element: <TransactionsPage />
    }
  ];

const AppRouter = () => {
  // First, create a router with the routes
  const router = createBrowserRouter(createRoutes());

  // Then wrap the RouterProvider with all your context providers
  return (
    <ThemeProvider>
      <FileSystemProvider>
        <BlockchainProvider>
          <EditorProvider>
            <RouterProvider router={router} />
          </EditorProvider>
        </BlockchainProvider>
      </FileSystemProvider>
    </ThemeProvider>
  );
};

export default AppRouter;