import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

function SignUpPage(){
    const [bname, setBname] = useState("");
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    async function BusinessSignup(){
        try{
            if(password===confirm){
                await createUserWithEmailAndPassword(getAuth(), email, password);
                navigate('/find');
            } else{
                setError("Passwords do not match. Please check again")
            }
        }catch (e){
            setError(e.message)
            console.log(Error);
        }
    }

    return(
        <>
            <h1>Sign Up</h1>
            {error && <p className="error">{error}</p>}
            <label>
                Name of Your Business:
                <input
                    type="text"
                    placeholder="Business Name"
                    value={bname}
                    onChange={e => setBname(e.target.value)}
                />
            </label>
            <label>
                <input
                    type="email"
                    placeholder="ex: raveSL@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </label>
            <label>
                Location:
                <input
                    type="text"
                    placeholder="location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                />
            </label>
            <label>
                Create Password:
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </label>
            <label>
                Confirm Password:
                <input
                    type="password"
                    placeholder="confirm password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                />
            </label>
            <button onClick={BusinessSignup}>Create Account</button>
            <p>Already Have a Business Account? <Link to="/login">Login Here.</Link></p>
        </>
);
}
export default SignUpPage;