import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import SellItem from './pages/SellItem';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import 'bootstrap/dist/css/bootstrap.min.css';

// Configure future flags
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function App() {
  return (
    <AuthProvider>
      <Router {...router}>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sell" element={<SellItem />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 