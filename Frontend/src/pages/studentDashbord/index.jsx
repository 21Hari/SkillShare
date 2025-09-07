import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import StudentHeader from "../../headers/studentHeaders";
import './index.css';
import StudentHome from "../../Components/Student/studentHome";
import StudentMyCourse from '../../Components/Student/StudentMyCourse'
import StudentProgress from "../../Components/Student/studentProgress";
import { Link, Outlet } from "react-router-dom";

const StudentDashbord = () => {
    const [studentName, setStudentName] = useState(null);


    useEffect(() => { gettingStudentDetails() }, []);

    const gettingStudentDetails = async () => {
        const Url = "http://localhost:3000/user";
        const token = Cookie.get("jwt_token");
        //console.log(token);//
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        const response = await fetch(Url, options);
        if (response.ok === true) {
            const data = await response.json();
            console.log(data);
            console.log(data.data.name);
            setStudentName(data.data.name);
        }
        else {
            alert("Error fetching user details");
        }

    }



    return (

        <div>
            <StudentHeader />
            <div className="student-dashboard-content">
                <h1 className="student-dashbord-welcome">Welcome, {studentName}</h1>
                <div>

                    <Link to='/' element={<StudentHome />} />
                    <Link to="/mycourse" element={<StudentMyCourse />} />
                    <Link to="progress" element={<StudentProgress />} />

                    <Outlet />

                </div>
            </div>

        </div>

    )
}




export default StudentDashbord;