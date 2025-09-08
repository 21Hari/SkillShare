import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { ClipLoader } from 'react-spinners';
import { useNavigate } from "react-router-dom";

import './index.css'



const StudentMyCourse = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()


    useEffect(() => { gettingCourses() }, [])

    const gettingCourses = async () => {
        const Url = "http://localhost:3000/my-courses";
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${Cookie.get("jwt_token")}`,
            },

        }

        const response = await fetch(Url, options);
        if (response.ok === true) {
            const data = await response.json();
            console.log(data);

            const formattedData = data.data.map(eachValue => ({
                id: eachValue.id,
                title: eachValue.title,
                description: eachValue.description,
                imageUrl: eachValue.image_url,
                instructorName: eachValue.instructor_name,
                createdAt: new Date(eachValue.
                    created_at).toLocaleDateString()


            }))
            console.log(formattedData)
            setLoading(false)
            setCourses(formattedData);

        } else {
            alert("Error fetching courses");
        }


    }
    
    // Redirecting from studentMyCourse into studentLesson List// 
    const goToCourse = (courseId) => {
        navigate(`/student/dashboard/courses/${courseId}/lessons`);


    }


    //console.log(courses)
    const renderCourseDetails = () => (
        <ul className="course-card-container">{
            courses.map(each_course => (
                <li key={each_course.id} className="course-item">

                    <div className="course-card">
                        <div className="course-image">
                            <img src={each_course.imageUrl} alt={each_course.title} />
                        </div>
                        <div className="course-content">
                            <h3 className="course-title">{each_course.title}</h3>
                            <p className="course-description">{each_course.description}</p>
                            <div className="course-footer">
                                <span className="instructor">By {each_course.
                                    instructorName}</span>
                                <span className="created-at">{each_course.createdAt}</span>
                            </div>
                            <div>
                                <button className="course-button" onClick={() => { goToCourse(each_course.id) }}>View Lessons</button>
                            </div>
                        </div>
                    </div>

                </li>
            ))
        }
        </ul>
    )

    const renderLoading = () => (
        <div className="loader-container" data-testid="loader">
            <ClipLoader color="#000000" loading={true} height="50" width="50" />
        </div>
    )
    return (
        loading ? (renderLoading()) : (renderCourseDetails())

    )


}



export default StudentMyCourse