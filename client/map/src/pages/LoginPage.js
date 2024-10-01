import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';

function LoginPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    async function BusinessLogin(){
        try{
            await signInWithEmailAndPassword(getAuth(), email, password);
            navigate("/create");
        }catch (e) {
            setError(e.message);
        }
    }

    return(
        <>
            <>
                <form>
                    <h1>Login</h1>
                    {error && <p className="error">{error}</p>}
                    <label>
                        Email:
                        <input
                            type="email"
                            placeholder="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </label>
                    <label>
                        Password:
                        <input
                            type="password"
                            placeholder="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </label>
                </form>

                <button onClick={BusinessLogin}>Login</button>
                <br></br>
                <Link to="/signup">Don't have an account? Create One Here</Link>


            </>
        </>
    );
}

export default LoginPage;