import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Join() {
    const { id } = useParams();
    const [username, setUsername] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const navigate = useNavigate();
    
    const handleJoin = () => {
        if (username.trim() === '' || code.trim() === '') return;
        navigate(`/chat/${id}`);
    };
    
    return (
        <div className="text-2xl font-bold text-blue-600">
            <h1>Join</h1>
            <h2>{id}</h2>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} />
            <button onClick={handleJoin}>Join</button>
        </div>
    )
}

export default Join;