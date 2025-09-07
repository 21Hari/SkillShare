import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cookie from "js-cookie";
import ReactPlayer from "react-player";
import { ClipLoader } from "react-spinners";

import "./index.css";

const StudentLessonList = () => {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState([]);

    useEffect(() => {
        getLessonsContainer();
    }, []);

    const getLessonsContainer = async () => {
        const url = `http://localhost:3000/courses/${courseId}/lessons`;
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${Cookie.get("jwt_token")}`,
            },
        };
        const response = await fetch(url, options);
        if (response.ok) {
            const data = await response.json();
            console.log(data)
            const formattedData = data.data.map((eachValue) => ({
                id: eachValue.id,
                content: eachValue.content,
                courseId: eachValue.course_id,
                title: eachValue.title,
                createdAt: eachValue.created_at,
                videoUrl: eachValue.video_url,
                completed: eachValue.completed

                ,
            }));
            console.log(formattedData)
            console.log(formattedData[0].videoUrl)
            setLessons(formattedData);
            setCompletedLessons(
                formattedData.filter((l) => l.completed === 1).map((l) => l.id)
            );
            setLoading(false);
        } else {
            alert("Failed to fetch lessons");
        }
    };

    const handleComplete = async (lessonId) => {
        try {
            const url = `http://localhost:3000/courses/${courseId}/lessons/${lessonId}/complete`;
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookie.get("jwt_token")}`,
                },
            };

            const response = await fetch(url, options);
            const result = await response.json();

            if (response.ok) {
                setCompletedLessons((prev) => [...prev, lessonId]); // update UI instantly
            } else {
                alert(result.message || "Failed to mark as complete");
            }
        } catch (err) {
            console.error("Error marking lesson complete:", err);
        }
    };

    const renderVideoCard = () => (
        <div className="lessons-container">
            {lessons.map((lesson) => (
                <div key={lesson.id} className="lesson-card">
                    <div className="video-container">
                        <ReactPlayer
                            url={lesson.videoUrl}
                            controls
                            width="100%"
                            height="250px"
                        />
                    </div>
                    <h3 className="lesson-title">{lesson.title}</h3>
                    <p className="lesson-content">{lesson.content}</p>
                    <span className="lesson-date">
                        {new Date(lesson.createdAt).toLocaleDateString()}
                    </span>
                    <button
                        className={`complete-btn ${completedLessons.includes(lesson.id) ? "completed" : ""}`}
                        onClick={() => handleComplete(lesson.id)}
                        disabled={completedLessons.includes(lesson.id)}
                    >
                        {completedLessons.includes(lesson.id) ? "Completed" : "Mark as Complete"}
                    </button>

                </div>
            ))}
        </div>

    )
    const renderLoading = () => (
        <div className="loader-container" data-testid="loader">
            <ClipLoader color="#000000" loading={true} height="50" width="50" />
        </div>
    )
    return (
        loading ? (renderLoading()) : (renderVideoCard())
    );
};

export default StudentLessonList;
