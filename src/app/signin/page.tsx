"use client";
import React, { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient';

const Signup = () => {

    useEffect(() => {
        const authentication = async () => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: "affanamir903@gmail.com",
                password: "Comforty807",
            });

            if (error) {
                console.error("Error signing in:", error.message);
            } 
                console.log("User signed in:", data);
                window.document.cookie = `Admin_Auth=${data.session?.access_token}; ` // apply expiration

            // const authStatus = await supabase.auth.getUser(window.document.cookie);
            // console.log(authStatus.data.user);
        }

        authentication();
    }, []);

    return (
        <div>Signup</div>
    )
}
export default Signup;
// every time admin has to login with email and password