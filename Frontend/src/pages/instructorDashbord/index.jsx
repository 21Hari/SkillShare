import InstructorHeader from "../../headers/instructorHeaders"
import InstructorHome from "../../Components/Instructor/instructorHome";
import { Link, Outlet } from "react-router-dom";
import AddCourseForm from "../../Components/Instructor/InstructorAddCourse";


const InstructorDashbord = () => {
    return (

        <div>
            <InstructorHeader />
            <Link to='/' element={<InstructorHome />} />
            <Link to='/add-course' element={<AddCourseForm />} />
            <Outlet />
        </div>

    )
}





export default InstructorDashbord