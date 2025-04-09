import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setError('');
      const user = await login();
      if (user) {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome to Mines</h2>
          <p>Sign in to play and manage your funds</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <button 
          className={`google-login-button ${isLoggingIn ? 'loading' : ''}`}
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <div className="button-spinner"></div>
          ) : (
            <>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
                alt="Google Logo" 
                className="google-logo" 
              />
              Sign in with Google
            </>
          )}
        </button>
        
        <div className="login-footer">
          <p>By signing in, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 