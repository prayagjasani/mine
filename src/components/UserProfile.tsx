import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  const userInitial = currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : '?';

  return (
    <div className="user-profile">
      <div 
        className="user-avatar"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {currentUser.photoURL ? (
          <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
        ) : (
          <div className="avatar-placeholder">{userInitial}</div>
        )}
      </div>

      {isDropdownOpen && (
        <div className="profile-dropdown">
          <div className="profile-info">
            <div className="user-name">{currentUser.displayName}</div>
            <div className="user-email">{currentUser.email}</div>
          </div>
          <div className="dropdown-divider"></div>
          <button 
            className="logout-button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 