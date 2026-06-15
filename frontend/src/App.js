import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetSent from "./pages/ResetSent";
import Employees from "./pages/Employees";
import LeaveRequests from "./pages/LeaveRequests";
import Assets from "./pages/Assets";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import Notifications from "./pages/Notifications";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store";

function AppContent() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole") || "employee";

  return (
    <>
      {isLoggedIn && <Navbar />}
      <div style={{ display: "flex", paddingTop: isLoggedIn ? "0px" : 0 }}>
        {isLoggedIn && <Sidebar />}
        <div style={{ flex: 1, marginLeft: isLoggedIn ? "280px" : 0, transition: "margin-left 0.3s ease" }}>
          <Routes>
            <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/signup" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute>{userRole === "admin" || userRole === "manager" || userRole === "hr" ? <Employees /> : <Navigate to="/dashboard" />}</ProtectedRoute>} />
            <Route path="/leaves" element={<ProtectedRoute><LeaveRequests /></ProtectedRoute>} />
            <Route path="/assets" element={<ProtectedRoute>{userRole === "admin" || userRole === "manager" ? <Assets /> : <Navigate to="/dashboard" />}</ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute>{userRole === "admin" || userRole === "manager" ? <Reports /> : <Navigate to="/dashboard" />}</ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute>{userRole === "admin" ? <Admin /> : <Navigate to="/dashboard" />}</ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-sent" element={<ResetSent />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </BrowserRouter>
  );
}

export default App;