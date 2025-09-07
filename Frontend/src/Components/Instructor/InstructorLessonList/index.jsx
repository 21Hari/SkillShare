import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import ReactPlayer from "react-player";
import { ClipLoader } from "react-spinners";

import "./index.css";

const InstructorLessonList = () => {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()


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

            setLessons(formattedData);

            setLoading(false);
        } else {
            alert("Failed to fetch lessons");
        }
    };

    const addNewLesson = () => {

        navigate(`/instructor/dashboard/courses/${courseId}/add-lesson`);

    }

    const renderVideoCard = () => (
        <div className="lessons-page">
            <div className="lessons-header">
                <button className="add-lesson-btn" onClick={addNewLesson}>
                    Add Lesson
                </button>
            </div>

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
                    </div>
                ))}
            </div>
        </div>
    );

    const renderLoading = () => (
        <div className="loader-container" data-testid="loader">
            <ClipLoader color="#000000" loading={true} height="50" width="50" />
        </div>
    )
    return (
        loading ? (renderLoading()) : (renderVideoCard())
    );
};

export default InstructorLessonList;
