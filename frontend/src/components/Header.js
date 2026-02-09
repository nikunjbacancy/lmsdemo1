import { useAuth } from '../contexts/AuthContext';
import { STRINGS } from '../constants';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <div>
          <h1>{STRINGS.APP_NAME}</h1>
          <p className="subtitle">{STRINGS.APP_SUBTITLE}</p>
        </div>
        <div className="user-section">
          <span className="welcome-text">
            {STRINGS.HEADER_WELCOME} <strong>{currentUser}</strong>
          </span>
          <button onClick={logout} className="logout-btn">
            {STRINGS.LOGOUT_BUTTON}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
