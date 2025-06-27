import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function Withdrawl() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user;

    useEffect(() => {
        if(!user) {
            navigate('/')
        }
    }, [user, navigate]);

    if(!user) return null;

    const back = () => {
        navigate('/dashboard', {state: { user }});
    }
    
    return (
        <div>
            <h2>Withdrawl</h2>
            <button onClick={back}>Back to Dashboard</button>
        </div>
    );
}

export default Withdrawl;