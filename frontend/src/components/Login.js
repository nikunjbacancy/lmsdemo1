import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { STRINGS } from '../constants';
import './Login.css';

const Login = () => {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 [Login Component] Form submitted - Mode: ${isRegistering ? 'REGISTER' : 'LOGIN'}`);
    console.log('👤 Username:', username);
    console.log('🔒 Password length:', password.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      const result = isRegistering 
        ? await register(username, password)
        : await login(username, password);

      console.log('📊 [Login Component] Result:', result);

      if (!result.success) {
        console.warn('⚠️ [Login Component] Operation failed:', result.message);
        setError(result.message);
      } else {
        console.log('✅ [Login Component] Operation successful, clearing form');
        // Clear form on success
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      console.error('❌ [Login Component] Exception caught:', err);
      setError(isRegistering ? 'Registration failed. Please try again.' : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
      console.log('🏁 [Login Component] Form submission completed');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{STRINGS.APP_NAME}</h1>
        <p className="login-subtitle">
          {isRegistering ? 'Create New Account' : STRINGS.LOGIN_TITLE}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">{STRINGS.LOGIN_USERNAME_LABEL}</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={STRINGS.LOGIN_USERNAME_PLACEHOLDER}
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{STRINGS.LOGIN_PASSWORD_LABEL}</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={STRINGS.LOGIN_PASSWORD_PLACEHOLDER}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Please wait...' : isRegistering ? 'Register' : STRINGS.LOGIN_BUTTON}
          </button>

          <div className="auth-toggle">
            <button
              type="button"
              className="toggle-btn"
              onClick={toggleMode}
              disabled={loading}
            >
              {isRegistering
                ? 'Already have an account? Login'
                : 'Need an account? Register'}
            </button>
          </div>

          {!isRegistering && (
            <div className="demo-credentials">
              <p>Note: Demo accounts have been removed. Please register a new account.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
