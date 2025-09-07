import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { ClipLoader } from 'react-spinners';

import './index.css';

const StudentHome = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enroll, setEnrolled] = useState(false)

    useEffect(() => { gettingCourses() }, [])

    const gettingCourses = async () => {
        const Url = "http://localhost:3000/courses";
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${Cookie.get("jwt_token")}`,
            },

        }

        const response = await fetch(Url, options);
        if (response.ok === true) {
            const data = await response.json();
            //console.log(data);

            const formattedData = data.data.map(eachValue => ({
                id: eachValue.id,
                title: eachValue.title,
                description: eachValue.description,
                imageUrl: eachValue.image_url,
                instructorName: eachValue.instructor_name,
                createdAt: eachValue.
                    created_at


            }))
            //console.log(formattedData)
            setLoading(false)
            setCourses(formattedData);

        } else {
            alert("Error fetching courses");
        }


    }

    const handlingEnrollment = async (courseId) => {
        const Url = `http://localhost:3000/courses/${courseId}/enroll`
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookie.get("jwt_token")}`,
            }
        }

        const response = await fetch(Url, options)

        if (response.ok) {
            alert("Enrollment successful")
            setEnrolled(true)

        } else {
            alert("Enrollment failed")


        }

    }
    //console.log(courses)
    const renderCourseDetails = () => (
        <ul className="st-course-card-container">{
            courses.map(each_course => (
                <li key={each_course.id} className="st-course-item">

                    <div className="st-course-card">
                        <div className="st-course-image">
                            <img src={each_course.imageUrl} alt={each_course.title} />
                        </div>
                        <div className="st-course-content">
                            <h3 className="st-course-title">{each_course.title}</h3>
                            <p className="st-course-description">{each_course.description}</p>
                            <div className="st-course-footer">
                                <span className="st-instructor">By {each_course.
                                    instructorName}</span>
                                <span className="st-created-at">{each_course.createdAt}</span>
                            </div>
                            <div>
                                <button className="st-course-button" onClick={() => handlingEnrollment(each_course.id)} disabled={enroll}>{enroll ? "Enrolled" : "Enroll"}</button>
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
export default StudentHome
