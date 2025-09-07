import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import { FaTrashAlt } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import "./index.css";

const InstructorHome = () => {
    const [instructor, setInstructor] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {
        getInstructorCourses();
    }, []);

    const getInstructorCourses = async () => {
        try {
            const token = Cookie.get("jwt_token");
            const res = await fetch("http://localhost:3000/instructor/dashboard", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setInstructor({
                    name: data.data.name,
                    email: data.data.email,
                    totalCourses: data.data.totalCourses,
                });
                setLoading(false);
                setCourses(data.data.courses);
            } else {
                console.error("Failed to fetch instructor dashboard");
            }
        } catch (e) {
            setLoading(false);
            console.log("Error fetching instructor dashboard:", e);
        }
    };

    const renderLoading = () => (
        <div className="loader-container" data-testid="loader">
            <ClipLoader color="#000000" size={50} />
        </div>
    );

    const courseDeleting = async (courseId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this course?");
        if (!confirmDelete) return;
        const token = Cookie.get("jwt_token");
        const res = await fetch(`http://localhost:3000/courses/${courseId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (res.ok) {
            alert("Course Deleted Successfully");


            setCourses((prev) => prev.filter((c) => c.id !== courseId));
            setInstructor((prev) => ({
                ...prev,
                totalCourses: prev.totalCourses - 1,
            }));

        }
        else {
            alert("Something went wrong")
        }

    }

    const goToLesson = (courseId) => {
        navigate(`/instructor/dashboard/courses/${courseId}/lessons`);
    }


    const renderCourseCard = () => (
        <div className="in-courses-grid">
            {courses.length === 0 ? (
                <div className="in-no-course-container">
                    <p>No courses created yet.</p>
                </div>
            ) : (
                courses.map((course) => (
                    <div className="in-course-card" key={course.id}>
                        <div className="in-course-image-wrapper">
                            <img src={course.image_url} alt={course.title} />
                        </div>
                        <div className="in-course-content">
                            <h2>{course.title}</h2>
                            <p>{course.description}</p>
                            <p className="in-course-date">
                                Created At:{" "}
                                {new Date(course.created_at).toLocaleDateString()}
                            </p>

                            <div className="in-course-actions">
                                <button className="in-view-btn" onClick={() => goToLesson(course.id)}>View Lessons</button>
                                <button className="in-delete-btn" onClick={() => courseDeleting(course.id)}>
                                    <FaTrashAlt className="in-delete-icon" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    if (loading) return renderLoading();

    return (
        <div className="in-dashboard-container">
            <div className="in-instructor-header">
                <h1>Welcome, {instructor?.name}</h1>
            </div>
            <div className="in-dashboard-stats">
                <div className="in-stat-card">
                    <h3>Total Courses</h3>
                    <p>{instructor?.totalCourses || 0}</p>
                </div>
            </div>

            {renderCourseCard()}
        </div>
    );
};

export default InstructorHome;
