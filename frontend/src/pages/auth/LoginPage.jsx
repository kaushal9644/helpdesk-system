import { useState, useEffect } from "react";
import { Shield ,Eye, EyeOff} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


function LoginPage() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async () => {

    try {

      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        }
      );

      console.log(response.data);

      const token = response.data.data.accessToken;
      const role = response.data.data.user.role;
      
    localStorage.setItem(
  "token",
  response.data.data.accessToken
);

localStorage.setItem(
  "role",
  response.data.data.user.role
);

      if (role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/employee-dashboard");
      }

    } catch (error) {
      console.log(error);
      alert("Invalid Credentials");
    }
  };
useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token && role === "ADMIN") {
    navigate("/admin-dashboard");
  } else if (token && role === "EMPLOYEE") {
    navigate("/employee-dashboard");
  }
}, [navigate]);
 
// Baaki aapke imports (useState, handleLogin etc.) yahan rahenge...

return (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');


      .adm-password-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      
      .adm-form-input.password-input {
        padding-right: 42px; /* Icon ke liye jagah chhodne ke liye */
      }

      .adm-password-toggle {
        position: absolute;
        right: 14px;
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: color 0.2s;
      }

      .adm-password-toggle:hover {
        color: #94a3b8;
      }

      .adm-login-root {
        font-family: 'Inter', sans-serif;
        background: #070c18;
        min-height: 100vh;
        color: #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        position: relative;
        overflow: hidden;
      }

      /* Background me ek sundar glow effect ke liye */
      .adm-login-root::before {
        content: '';
        position: absolute;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(7,12,24,0) 70%);
        top: -100px;
        left: -100px;
        z-index: 0;
        pointer-events: none;
      }

      .adm-login-card {
        background: #0a0f1e;
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 24px;
        width: 100%;
        max-width: 400px;
        padding: 40px 32px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        display: flex;
        flex-direction: column;
        gap: 24px;
        z-index: 1;
        position: relative;
        backdrop-filter: blur(10px);
      }

      .adm-form-input {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        color: #e2e8f0;
        padding: 14px 16px;
        border-radius: 12px;
        font-size: 14px;
        outline: none;
        width: 100%;
        transition: all 0.2s;
        font-family: inherit;
      }

      .adm-form-input:focus {
        border-color: rgba(99,102,241,0.5);
        background: rgba(99,102,241,0.05);
        box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
      }
      
      .adm-form-input::placeholder {
        color: #475569;
      }

      .adm-login-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        border: none;
        color: #fff;
        padding: 14px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
        width: 100%;
        box-shadow: 0 4px 14px rgba(99,102,241,0.3);
      }

      .adm-login-btn:hover {
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99,102,241,0.4);
      }

      .adm-login-btn:active {
        transform: scale(0.98);
      }
    `}</style>

    <div className="adm-login-root">
      <div className="adm-login-card">
        
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          {/* Company Logo */}
          <img 
            src="https://kathiawarstores.com/wp-content/uploads/2024/04/New_logo_selected_Final_Main-logo90yers.png" 
            alt="Kathiawar Stores Logo" 
            style={{ height: '60px', objectFit: 'contain', margin: '0 auto', display: 'block', marginBottom: '24px' }} 
          />
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
            Helpdesk Login
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            IT Support Ticket System
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="adm-form-input"
          />

         

          <div className="adm-password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="adm-form-input password-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="adm-password-toggle"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Secure Login Button yahan hoga... */}

          <button onClick={handleLogin} className="adm-login-btn" style={{ marginTop: '8px' }}>
            <Shield size={18} />
            Secure Login
          </button>
        </div>
        <p
  onClick={() =>
    alert("Please contact admin to reset your password")
  }
  className="text-sm text-slate-400 hover:text-cyan-400 cursor-pointer mt-4 text-center transition-colors duration-200"
>
  Forgot Password?
</p>

      </div>
    </div>
  </>
);
}

export default LoginPage;