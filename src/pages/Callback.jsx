import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🌐 Callback page loaded');

    fetch('http://localhost:5000/auth/user', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Not Logged In');
        return res.json();
      })
      .then(user => {
        console.log('✅ Logged in user:', user);
        navigate('/dashboard', { state: { user } });
      })
      .catch(err => {
        console.error(err);
        navigate('/');
      });
  }, [navigate]);

  return <p>Logging in...</p>;
}

export default Callback;
