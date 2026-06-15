import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState("employee"); // 'employee' or 'admin'

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

       if (response.data.success) {
         alert(response.data.message);

         localStorage.setItem("token", response.data.token);
         localStorage.setItem("isLoggedIn", "true");
         localStorage.setItem("userName", response.data.user.name);
         localStorage.setItem("userEmail", response.data.user.email);
         localStorage.setItem("userRole", response.data.user.role || "employee");

        // Redirect based on login mode and role
        if (loginMode === "admin") {
          if (response.data.user.role === "admin") {
            navigate("/admin");
          } else {
            alert("You are not authorized to access the admin dashboard.");
            // Optionally, redirect to employee dashboard
            navigate("/dashboard");
          }
        } else {
          navigate("/dashboard");
        }
      } else {
        alert(response.data.message);
      }
     } catch (error) {
       console.error("Login error:", error);
       alert(error.response?.data?.message || error.message || "Server Error");
     }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f6f9",
      }}
    >
      <div
        style={{
          width: "350px",
          padding: "30px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        {loginMode === "admin" && (
          <div style={{ backgroundColor: "#fff3cd", padding: "10px", borderRadius: "8px", marginBottom: "20px" }}>
            <strong>Admin Login Section</strong>
          </div>
        )}
        <h1 style={{ textAlign: "center" }}>
          {loginMode === "admin" ? "Admin Login" : "Login"}
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            boxSizing: "border-box",
          }}
        />

        <input
          type={
            showPassword ? "text" : "password"
          }
          placeholder="Enter Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
          }}
        />

        <br />
        <br />

        <button
          onClick={() =>
            setShowPassword(!showPassword)
          }
        >
          {showPassword
            ? "Hide Password"
            : "Show Password"}
        </button>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button
            onClick={() => setLoginMode("employee")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: loginMode === "employee" ? "#4dd5ff" : "#e2e8f0",
              color: loginMode === "employee" ? "white" : "#0f172a",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Login as Employee
          </button>
          <button
            onClick={() => setLoginMode("admin")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: loginMode === "admin" ? "#4dd5ff" : "#e2e8f0",
              color: loginMode === "admin" ? "white" : "#0f172a",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Login as Admin
          </button>
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: "#4dd5ff",
            color: "white",
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loginMode === "admin" ? "Login as Admin" : "Login"}
        </button>

        <p
          onClick={() =>
            navigate("/forgot-password")
          }
          style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#007bff",
            cursor: "pointer",
          }}
        >
          Forgot Password?
        </p>

        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Don’t have an account?{' '}
          <span
            onClick={() => navigate("/signup")}
            style={{ color: "#007bff", cursor: "pointer", fontWeight: 700 }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
