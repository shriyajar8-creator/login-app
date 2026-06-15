
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    console.log("BUTTON WORKING");

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await api.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      if (response.data.success) {
        alert(response.data.message);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userRole", response.data.user.role || "employee");

        setName("");
        setEmail("");
        setPassword("");

        navigate("/dashboard");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Server Error");
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
          width: "400px",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#4dc4ff",
            marginBottom: "20px",
          }}
        >
          Create Account
        </h1>

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "6px",
            border: "1px solid #cccccc",
            boxSizing: "border-box",
          }}
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={() => setShowPassword(!showPassword)}
          style={{
            marginBottom: "15px",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          {showPassword ? "Hide Password" : "Show Password"}
        </button>

        <button
          onClick={handleSignup}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#4dd5ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Signup
        </button>

        <p style={{ textAlign: "center", marginTop: "14px", color: "#475569" }}>
          Already have an account?{' '}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#007bff", cursor: "pointer", fontWeight: 700 }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
