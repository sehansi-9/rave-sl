import {useEffect, useState} from "react";
import {getAuth, onAuthStateChanged} from "firebase/auth";

function useUser(){
    const[user,setUser] = useState(null);
    const[loading,setLoading] = useState(true); //easy to see if its loading
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(),authUser =>{
            setUser(authUser);
            setLoading(false);
        })
        return unsubscribe; // this unsubscribes the authlistener after the component has unmounted
    }, []);
    return {user,loading};
}
export default useUser;