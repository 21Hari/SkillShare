// StudentProgress.jsx
import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import './index.css'


const StudentProgress = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        gettingProgressData();
    }, []);

    const gettingProgressData = async () => {
        try {
            const url = "http://localhost:3000/my-courses"; // ✅ your backend API
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${Cookie.get("jwt_token")}`,
                },
            };

            const response = await fetch(url, options);
            if (!response.ok) throw new Error("Failed to fetch");

            const result = await response.json();
            const coursesData = result.data || [];

            setCourses(
                coursesData.map((c) => ({
                    id: c.id,
                    name: c.title,
                    progress: c.progress,
                    completedLessons: c.completedLessons,
                    totalLessons: c.totalLessons,
                }))
            );
        } catch (error) {
            console.error("Error fetching progress:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (courses.length === 0) return <p>No courses available</p>;

    return (
        <div className="progress-container">
            <h2>My Courses Progress</h2>
            <div className="course-grid">
                {courses.map((course) => (
                    <div key={course.id} className="course-card">
                        <h3>{course.name}</h3>
                        <div className="circle">
                            <span>{course.progress}%</span>
                        </div>
                        <p>
                            {course.completedLessons}/{course.totalLessons} Lessons
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentProgress;
