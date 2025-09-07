import { useState } from 'react';
import { useNavigate} from 'react-router-dom'

import './index.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student"
    });
    const [error, setError] = useState(false)
    const [errorMsg, setErrorMsg] = useState("");

    const navigate = useNavigate();


    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const Url = "http://localhost:3000/register";
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            }
            const response = await fetch(Url, options);
            if (response.ok) {
                const data = await response.json();
                alert("Registration successful");
                console.log(data);
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: "student"
                })
                navigate('/login');


            } else {
                setError(true);
                const errorData = await response.json();
                setErrorMsg(errorData.message)

            }

        } catch (err) {
            alert(err.message || "Registration failed");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>SkillShare Register</h2>
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
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
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
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                    </select>
                    {error && <p className="error-message">{errorMsg}</p>}
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
