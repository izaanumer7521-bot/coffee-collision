import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Archives from './pages/Archives.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CreateCup from './pages/CreateCup.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';
import Products from './admin/Products.jsx';
import Categories from './admin/Categories.jsx';
import ImportMenu from './admin/ImportMenu.jsx';
import Flavours from './admin/Flavours.jsx';
import Orders from './admin/Orders.jsx';
import Activity from './admin/Activity.jsx';
import Messages from './admin/Messages.jsx';
import Settings from './admin/Settings.jsx';
import { ScrollProgress } from './hooks/useReveal.jsx';
import { useAuth } from './context/AuthContext.jsx';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Private({ children, admin }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="page-note">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { pathname } = useLocation();
  const inAdmin = pathname.startsWith('/admin');
  return (
    <>
      <ScrollTop />
      {!inAdmin && <ScrollProgress />}
      {!inAdmin && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/archives" element={<Private><Archives /></Private>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<Private><CreateCup /></Private>} />
          <Route path="/admin" element={<Private admin><AdminLayout /></Private>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="import" element={<ImportMenu />} />
            <Route path="categories" element={<Categories />} />
            <Route path="flavours" element={<Flavours />} />
            <Route path="orders" element={<Orders />} />
            <Route path="activity" element={<Activity />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<p className="page-note">Page not found.</p>} />
        </Routes>
      </main>
      {!inAdmin && <Footer />}
    </>
  );
}
