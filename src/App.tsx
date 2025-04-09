import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MineGame from './components/MineGame'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Mines</h1>
          <p className="app-subtitle">Uncover gems and avoid the mines to win real money</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<MineGame />} />
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
    </Router>
  )
}

export default App
