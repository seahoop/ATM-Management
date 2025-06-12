import {useNavigate, useLocation} from "react-router-dom";
function StockMarket() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user;

    if (!user) {
        return <div>No user data available.</div>;
    }

    const handleBack = () => {
        navigate('/dashboard', {state: {user}});
    };

    return (
        <div>
            <h1>Stock Market</h1>
            <button onClick={handleBack} style={{marginTop: '20px'}}>Back to Dashboard</button>
        </div>
    );
}

export default StockMarket;