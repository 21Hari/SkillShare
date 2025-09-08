import { FaHome } from "react-icons/fa";
import { IoBookSharp } from "react-icons/io5";

import { Link, useNavigate } from 'react-router-dom'
import Cookie from 'js-cookie'

import './index.css';

const InstructorHeader = () => {
    const navigate = useNavigate()

    const handlingLogout = () => {
        Cookie.remove("jwt_token")

        navigate("/login")
    }

    return (
        <div>
            <div className="student-header">
                <h1 className="student-log">SkillShare</h1>
                <div className="student-nav">
                    <Link to="/instructor/dashboard" className="nav-link"><p className="student-nav-element">Home</p></Link>
                    <Link to="/instructor/dashboard/add-course" className="nav-link"><p className="student-nav-element">Add Courses</p></Link>

                </div>
                <div className="student-icons">
                    <Link to="/instructor/dashboard" className="nav-link-icons"><FaHome className="student-icon" /></Link>
                    <Link to="/instructor/dashboard/add-course" className="nav-link-icons student-icon-myprogress"><IoBookSharp className="student-icon" /></Link>

                </div>
                <button className="student-logout-button" onClick={handlingLogout}>Logout</button>
            </div>
        </div>
    )
}

export default InstructorHeader;