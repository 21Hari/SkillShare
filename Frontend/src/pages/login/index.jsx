import React, { useState } from "react";
import Cookies from "js-cookie";

import { useNavigate, Link } from "react-router-dom";
import "./index.css";

const Login = () => {
    const [formData, setFormData] = useState({ name: "", password: "" });
    const [errorMsg, setErrorMsg] = useState("");
    const [error, setError] = useState(false);


    const navigate = useNavigate();

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };


    const onSucessEvent = (role, jwtToken) => {
        Cookies.set("jwt_token", jwtToken, { expires: 30 });
        Cookies.set("role", role, { expires: 30 })

        const roleEle = role.toLowerCase();
        if (roleEle === 'student') {
            navigate('/student/dashboard');
        } else {
            navigate('/instructor/dashboard');
        }


    }

    const onFailureEvent = (message) => {
        setError(true);
        setErrorMsg(message);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const Url = "http://localhost:3000/login";
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
                ,
                body: JSON.stringify(formData),
            }
            const response = await fetch(Url, options);
            const data = await response.json();
            if (response.ok) {

                onSucessEvent(data.role, data.token);

            }
            else {
                onFailureEvent(data.message);
            }

        } catch (err) {
            alert(err.message || "Login failed");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>SkillShare Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Username"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {error && <p className="error-message">{errorMsg}</p>}
                    <button type="submit">Login</button>
                    <p className="register-link">
                        Don't have an account?{" "}
                        <Link to="/register" className="link">
                            Register here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
