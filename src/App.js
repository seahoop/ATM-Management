import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/logIn';
import Dashboard from './pages/dashBoard';
import Deposit from './pages/deposit';
import Withdrawl from './pages/withdrawl';
import Balance from './pages/balance'


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/deposit" element={<Deposit />}/>
        <Route path="/withdrawl" element={<Withdrawl />}/>
        <Route path="/balance" element={<Balance/>}/>
      </Routes>
    </Router>
  );
}

export default App;
