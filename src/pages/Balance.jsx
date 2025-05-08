import {useNavigate, useLocation} from "react-router-dom";

function Balance() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user;

    if (!user) {
        return <div>No user data available.</div>;
    }

    const handleBack= () => {
        navigate('/dashboard', {state: {user}});
    };

    return (
        <div>
            <h2>Balance</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Account:</strong> {user.account}</p>
            <p><strong>Balance:</strong> ${user.Balance.toFixed(2)}</p>
            <button onClick={handleBack} style={{marginTop: '20px'}}> Back to Dashboard</button>
        </div>
    );
}

export default Balance;