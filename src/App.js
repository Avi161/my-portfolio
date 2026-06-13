import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BlogsListPage from './pages/BlogsListPage';
import BlogPostPage from './pages/BlogPostPage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import './App.css';

// Lazy so the editor (TipTap) never loads for regular visitors.
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));

const Layout = () => (
  <div className="site-container">
    <Header />
    <main className="main-content">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/blog', element: <BlogsListPage /> },
      { path: '/blog/:slug', element: <BlogPostPage /> },
      { path: '/projects', element: <ProjectsPage /> },
      { path: '/contact', element: <ContactPage /> },
      {
        path: '/admin',
        element: (
          <Suspense fallback={null}>
            <AdminPage />
          </Suspense>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
