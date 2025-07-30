"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearError, checkAuth } from "../features/auth/authSlice";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!showOtp) {
      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          if (data.otp_required === false) {
            // Admin login
            localStorage.setItem("authToken", data.token);
            toast.success("Login successful");
            await dispatch(checkAuth());
          } else {
            // Non-admin → Proceed to OTP
            toast.info("OTP sent to your email");
            setShowOtp(true);
          }
        } else {
          toast.error(data.error || "Invalid credentials");
        }
      } catch (err) {
        console.error("Login request failed:", err);
        toast.error("Network error. Is your backend running?");
      } finally {
        setLoading(false);
      }
    } else {
      // Submit OTP
      try {
        const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("authToken", data.token);
          toast.success("Login successful");
          await dispatch(checkAuth());
        } else {
          toast.error(data.error || "OTP verification failed");
        }
      } catch (err) {
        console.error("OTP verification failed:", err);
        toast.error("Network error during OTP verification");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Money Transfer</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!showOtp ? (
            <>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block">
            {loading
              ? "Signing in..."
              : showOtp
              ? "Verify OTP"
              : "Sign In"}
          </button>
        </form>

        {!showOtp && (
          <div className="auth-links">
            <p>
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
