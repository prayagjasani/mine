import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './context/AuthContext'
import MineGame from './components/MineGame'
import Login from './components/Login'
import UserProfile from './components/UserProfile'
import './App.css'

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Mines</h1>
        <p className="app-subtitle">Uncover gems and avoid the mines to win real money</p>
        {currentUser && <UserProfile />}
      </header>
      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MineGame />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Mine Game - Real money transactions enabled</p>
          <p className="disclaimer">This game allows real money transactions through UPI. All transactions are secure and processed by authorized payment gateways.</p>
          <p className="disclaimer">By using this service, you confirm that you are at least 18 years old and comply with all applicable gambling laws in your jurisdiction.</p>
          <p className="terms-link"><a href="#terms">Terms & Conditions</a> | <a href="#privacy">Privacy Policy</a></p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
