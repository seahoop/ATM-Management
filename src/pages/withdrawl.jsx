import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function Withdrawl() {
    const location = useLocation();
    const navigate = useNavigate();

    const back = () => {
        navigate('/dashboard');
    }
    
    return (
        <div>
            <h2>Withdrawl</h2>
            <button onClick={back}>Back</button>
        </div>
    );
}

export default Withdrawl;