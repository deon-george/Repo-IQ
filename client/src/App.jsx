import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Analyzer from './pages/Analyzer';
import './index.css'; // Global styles including background

function App() {
  return (
    <Router>
      {/* Background element for doodle animation */}
      <div className="background"></div>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyzer" element={<Analyzer />} />
      </Routes>
    </Router>
  );
}

export default App;
