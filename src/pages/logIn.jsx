import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const characters = [
    { id: 1, name: 'Alice', account: 'A123', pin: '1111', Balance: (Math.random()*1000000) + 50000 },
    { id: 2, name: 'Bob', account: 'B456', pin: '2222', Balance:(Math.random()*1000000) + 50000},
    { id: 3, name: 'Charlie', account: 'C789', pin: '3333', Balance:(Math.random()*1000000) + 50000 },
    { id: 4, name: 'Diana', account: 'D012', pin: '4444', Balance: (Math.random()*1000000) + 50000 },
    { id: 5, name: 'Eve', account: 'E345', pin: '5555', Balance: (Math.random()*1000000) + 50000 },
  ];

  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const handleRandomSelect = () => {
    const random = characters[Math.floor(Math.random() * characters.length)];
    setSelectedCharacter(random);
  };

  const handleLogin = () => {
    if (selectedCharacter) {
      navigate('/dashboard', { state: { user: selectedCharacter } });
    } else {
      alert('Please select a character first!');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Welcome to Habo Berlin ATM System</h2>

      {selectedCharacter ? (
        <div style={{ margin: '10px 0', padding: '10px', border: '1px solid gray' }}>
          <p><strong>Selected:</strong> {selectedCharacter.name}</p>
          <p><strong>Account:</strong> {selectedCharacter.account}</p>
        </div>
      ) : (
        <p>No character selected.</p>
      )}

      <button onClick={handleRandomSelect} style={{ marginRight: '10px' }}>
        🎲 Random Character
      </button>

      <button onClick={handleLogin}>
        🚀 Log In
      </button>
    </div>
  );
}

export default Login;
