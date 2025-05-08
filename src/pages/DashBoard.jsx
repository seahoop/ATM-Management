import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  useEffect(() => {
    if (!user) {
      // If no user was passed (e.g., refresh), redirect to login
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleBack = () => {
    navigate('/');
  };

  const handleBalance = () => {
    navigate('/balance', {state: { user }});
  }

  const handleDeposit = () => {
    navigate('/deposit');
  }

  const handleWithdrawl = () => {
    navigate('/withdrawl');
  }
  return (
    <div style={{ padding: '20px' }}>
      <h2>Welcome, {user.name}!</h2>
      <p><strong>Account Number:</strong> {user.account}</p>
      <button onClick={handleBalance}>Balance</button>
      <button onClick={handleDeposit}>Deposit</button>
      <button onClick={handleWithdrawl}>Withdrawl</button>
      <button onClick={handleBack} style={{marginTop: '20px'}}> Back to Login</button>
    </div>
  );
}

export default Dashboard;
