import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GradientBackground from './components/GradientBackground';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Browse from './pages/Browse';
import PostItem from './pages/PostItem';
import ItemDetail from './pages/ItemDetail';
import MyPosts from './pages/MyPosts';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="app-container">
      {/* 1. Full-screen Interactive Aurora Gradient Canvas (Z-Index -1) */}
      <GradientBackground />

      {/* 2. Floating iOS-Style Glass Dock Navbar */}
      <Navbar />

      {/* 3. Global Toast Notifications Container */}
      <Toast />

      {/* 4. Page Content Routes */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route
            path="/post"
            element={
              <ProtectedRoute>
                <PostItem />
              </ProtectedRoute>
            }
          />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route
            path="/my-posts"
            element={
              <ProtectedRoute>
                <MyPosts />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
