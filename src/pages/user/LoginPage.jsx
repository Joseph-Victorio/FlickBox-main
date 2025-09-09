import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate input
    if (!email || !password) {
      setError("Email and password cannot be empty.");
      setLoading(false);
      return;
    }

    // Check for invalid characters
    const invalidChars = /[^a-zA-Z0-9@.]/;
    if (invalidChars.test(email) || invalidChars.test(password)) {
      setError("Invalid characters in email or password.");
      setLoading(false);
      return;
    }

    // Simulate login delay
    setTimeout(() => {
      let role = null;

      if (email === "admin@flickbox.com" && password === "admin123") {
        role = "admin";
      } else if (email === "user@flickbox.com" && password === "user123") {
        role = "user";
      }

      if (role) {
        localStorage.setItem("token", "dummytoken");
        localStorage.setItem("role", role);

        navigate(role === "admin" ? "/admin/dashboard" : "/");
      } else {
        setError("Invalid email or password.");
      }

      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="bg-[#1a1a1a] bg-opacity-90 p-8 rounded-2xl shadow-lg w-full max-w-md relative">
        <button
          onClick={() => navigate(-1)} // Navigate back
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes />
        </button>
        <h1 className="text-3xl font-bold text-white mb-6 text-center">FlickBox Login</h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#121212] text-white border border-[#333] focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#121212] text-white border border-[#333] focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center mt-4">
            <a href="/register" className="text-gray-400 hover:underline">
              Don’t have an account? Register
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
