import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import "./index.css";

const AddLessonForm = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        video_url: "",
        content: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const url = `http://localhost:3000/courses/${courseId}/lessons`
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookie.get("jwt_token")}`,
            },
            body: JSON.stringify(formData),
        }


        const response = await fetch(url, options)


        const data = await response.json();

        if (response.ok) {
            alert("Lesson created successfully");
            navigate(`/instructor/dashboard/courses/${courseId}/lessons`);
        } else {
            alert(data.message || "Failed to create lesson");
        }

    };

    return (
        <div className="add-lesson-page">
            <form className="add-lesson-form" onSubmit={handleSubmit}>
                <h2 className="form-title">Add New Lesson</h2>

                <label htmlFor="title">Lesson Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Enter lesson title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="video_url">Video URL</label>
                <input
                    type="url"
                    id="video_url"
                    name="video_url"
                    placeholder="https://example.com/video.mp4"
                    value={formData.video_url}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="content">Content</label>
                <textarea
                    id="content"
                    name="content"
                    placeholder="Write lesson description..."
                    rows="5"
                    value={formData.content}
                    onChange={handleChange}
                    required
                />

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Submitting..." : "Create Lesson"}
                </button>
            </form>
        </div>
    );
};

export default AddLessonForm;
