import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import StudentDashbord from './pages/studentDashbord';
import StudentHome from './Components/Student/studentHome';
import StudentMyCourse from './Components/Student/StudentMyCourse';
import StudentLessonList from './Components/Student/studentLessonList';
import StudentProgress from './Components/Student/studentProgress';
import InstructorDashboard from './pages/instructorDashbord';
import InstructorHome from './Components/Instructor/instructorHome';
import InstructorLessonList from './Components/Instructor/InstructorLessonList';
import AddLessonForm from './Components/Instructor/InstructorAddLesson';
import AddCourseForm from './Components/Instructor/InstructorAddCourse';
import ProtectedRoute from './Components/protectedRoute';
import NotFound from './pages/notFound';

const App = () => {
  return (
    <Router>
      <Routes>

       
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

       
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/student/dashboard" element={<StudentDashbord />}>
            <Route index element={<StudentHome />} />
            <Route path="mycourse" element={<StudentMyCourse />} />
            <Route path="courses/:courseId/lessons" element={<StudentLessonList />} />
            <Route path="progress" element={<StudentProgress />} />
          </Route>
        </Route>

    
        <Route element={<ProtectedRoute allowedRole="instructor" />}>
          <Route path="/instructor/dashboard" element={<InstructorDashboard />}>
            <Route index element={<InstructorHome />} />
            <Route path="courses/:courseId/lessons" element={<InstructorLessonList />} />
            <Route path="courses/:courseId/add-lesson" element={<AddLessonForm />} />
            <Route path="add-course" element={<AddCourseForm />} />
          </Route>
        </Route>

        {/* Not Found */}
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
