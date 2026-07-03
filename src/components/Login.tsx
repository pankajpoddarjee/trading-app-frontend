import React, { useState } from "react";
import {
  TrendingUp,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";// ✅ Sirf yeh line add

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"client" | "broker" | "admin">("client");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser({ email, password }); // ✅ API call

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">

        {/* LEFT PANEL */}
        <div className="brand-panel">
          <div className="brand-logo">
            <TrendingUp size={32} />
            <h2>Suryashakti</h2>
          </div>

          <div>
            <h1>
              Trade smarter <br />
              <span>Grow faster 🚀</span>
            </h1>
            <p>
              Institutional-grade trading platform with real-time insights,
              lightning-fast execution, and powerful analytics.
            </p>
          </div>

          <div className="stats">
            <div>
              <h3>10K+</h3>
              <span>Users</span>
            </div>
            <div>
              <h3>₹500Cr+</h3>
              <span>Volume</span>
            </div>
            <div>
              <h3>99.9%</h3>
              <span>Uptime</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="form-panel">
          <h3>Welcome Back 👋</h3>
          <p className="sub">Login to continue trading</p>

          <div className="role-tabs">
            {["client", "broker", "admin"].map((r) => (
              <button
                key={r}
                className={role === r ? "active" : ""}
                onClick={() => setRole(r as any)}
              >
                {r}
              </button>
            ))}
          </div>

          {error && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "13px",
                marginBottom: "12px",
                background: "rgba(239,68,68,0.1)",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <Lock size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button className="btn-login" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    style={{ width: "16px", height: "16px" }}
                  ></span>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="extra">
            <span>Forgot password?</span>
            <span>Create account</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;