import {useNavigate, useLocation} from "react-router-dom";
import {useEffect} from "react";

function Balance() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user;

    useEffect(() => {
        if(!user) {
            navigate('/')
        }
    }, [user, navigate]);

    if(!user) return null;

    const handleBack= () => {
        navigate('/dashboard', {state: {user}});
    };

    return (
        <div>
            <h2>Balance</h2>
            <button onClick={handleBack} style={{marginTop: '20px'}}> Back to Dashboard</button>
        </div>
    );
}

export default Balance;