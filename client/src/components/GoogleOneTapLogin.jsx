import React, { useState, useRef, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';

const GoogleOneTapLogin = ({ setNavigateHome }) => {
    const googleButton = useRef(null);

    const [displayType, setDisplayType] = useState('flex');
    const [gBtnDisplay, setGBtnDisplay] = useState('none');

    const handleResponse = async (response) => {
        const token = response.credential;
        const { sub: uid, email, name, picture: photoURL } = jwtDecode(token);
        const username = email.split('@')[0];
        const config = {
            headers: {
                'Content-type': 'application/json',
            },
        };
        await axios
            .post(
                `${import.meta.env.VITE_APP_SERVER_URL}/api/user/googleSignUp`,
                {
                    uid,
                    email,
                    name,
                    photoURL,
                    username,
                },
                config
            )
            .then((result) => {
                const user = result.data.result;
                window.localStorage.setItem(
                    'sketchApp',
                    JSON.stringify({ email: user.email, isSignedIn: true })
                );

                setNavigateHome((prev) => !prev);
            })
            .catch((error) => {
                console.log(error);
                alert('Something went wrong, please try again later.');
            });
    };

    const handleGoogleLogIn = () => {
        try {
            // console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                ux_mode: 'popup',
                callback: handleResponse,
                use_fedcm_for_prompt: false,
            });
            window.google.accounts.id.renderButton(googleButton.current, {
                theme: 'filled_blue',
                size: 'large',
                width: 280,
                text: 'continue_with',
            });
            window.google.accounts.id.prompt((notification) => {
                if (notification.getSkippedReason() === 'tap_outside') {
                    window.google.accounts.id.prompt();
                }
            });
        } catch (error) {
            console.log(error);
            alert('Log In Failed. Please try again');
        }
    };

    useEffect(() => {
        const auth = JSON.parse(window.localStorage.getItem('sketchApp'));
        if (!(auth && auth.isSignedIn)) {
            handleGoogleLogIn();
        }
    }, []);
    return (
        <React.Fragment>
            <button
                className="bg-green-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center"
                style={{
                    display: displayType,
                    width: 'fit-content',
                    marginTop: '1rem',
                }}
                onClick={handleGoogleLogIn}
            >
                <FcGoogle className="mr-2 text-2xl" />
                Login with Google
            </button>
            <div style={{ display: gBtnDisplay }} ref={googleButton}></div>
        </React.Fragment>
    );
};

export default GoogleOneTapLogin;
