import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import "./index.css";

const AddCourseForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image_url: "",
        instructor: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookie.get("jwt_token")}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Course created successfully!");
                navigate("/instructor/dashboard"); 
            } else {
                alert(data.message || "Failed to create course");
            }
        } catch (err) {
            console.error("Error creating course:", err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-course-page">
            <form className="add-course-form" onSubmit={handleSubmit}>
                <h2 className="form-title">Create New Course</h2>

                <label htmlFor="title">Course Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Enter course title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    placeholder="Enter course description..."
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="image_url">Image URL</label>
                <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    placeholder="https://example.com/course.jpg"
                    value={formData.image_url}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="instructor">Instructor Name</label>
                <input
                    type="text"
                    id="instructor"
                    name="instructor"
                    placeholder="Enter instructor name"
                    value={formData.instructor}
                    onChange={handleChange}
                    required
                />

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Creating..." : "Create Course"}
                </button>
            </form>
        </div>
    );
};

export default AddCourseForm;
