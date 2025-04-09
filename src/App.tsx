import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MineGame from './components/MineGame'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Mines</h1>
          <p className="app-subtitle">Uncover gems and avoid the mines to win</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<MineGame />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} Mine Game - For demonstration purposes only</p>
            <p className="disclaimer">This game involves simulated gambling mechanics with no real money.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
