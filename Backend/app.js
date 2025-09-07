const express = require('express');
const { open } = require('sqlite');
const path = require('path');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const cors = require('cors')




const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true

}
))
app.use(express.json());

const dbpath = path.join(__dirname, 'mydatabase.db');
console.log(dbpath);

const createTableQuery = `
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL
);
`;

const createCourseTableQuery = `
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    
    instructor_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES user(id) ON DELETE CASCADE
);
`;

const crateLessonTableQuery = `CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
`;

const createEntollmentTableQuery = `
CREATE TABLE IF NOT EXISTS enrollment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    progress TEXT DEFAULT '[]', 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(user_id, course_id)
);
`;

let db = null;

const intializingDBAndServer = async () => {
    try {
        db = await open({
            filename: dbpath,
            driver: sqlite3.Database
        })

        await db.run(createTableQuery);
        await db.run(createCourseTableQuery);
        await db.run(crateLessonTableQuery);
        await db.run(createEntollmentTableQuery);
        console.log('User table ensured to exist');
        await db.exec(`ALTER TABLE courses ADD COLUMN image_url TEXT;`).catch(() => {
            console.log("Column image_url already exists in courses");
        });
        await db.exec(`ALTER TABLE courses ADD COLUMN instructor_name TEXT;`).catch(() => {
            console.log("Column instructor_name already exists in courses");
        });
        await db.exec(`ALTER TABLE lessons ADD COLUMN content TEXT;`).catch(() => {
            console.log(`Column content already exists in lessons`)
        })

        app.listen(3000, () => {
            console.log("Server is running at http://localhost:3000/")
        })

    } catch (e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);

    }

}

/**************UserTable*******************/

app.post('/register', async (request, response) => {
    console.log(`post method callled`)
    try {
        const { name, email, role, password } = request.body
        const hashedPassword = await bcrypt.hash(password, 10);
        const selectUserQuery = `SELECT * FROM user WHERE name = ?`
        const dbUser = await db.get(selectUserQuery, [name]);
        console.log(dbUser);
        if (dbUser === undefined) {
            const createUserQuery = `
        INSERT INTO user (name, password, email, role, created_at)
        VALUES (?, ?, ?, ?, datetime('now'));`
            await db.run(createUserQuery, [name, hashedPassword, email, role]);
            response.status(200).send({
                status: 200,
                message: 'User created successfully'
            })

        } else {
            response.status(400).send({
                status: 400,
                message: "User already exists"
            })


        }

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }

})

app.post('/login', async (request, response) => {
    try {
        const { name, password } = request.body;
        const selectUserQuery = `SELECT * FROM user WHERE name = ?`
        const dbUser = await db.get(selectUserQuery, [name]);
        if (dbUser === undefined) {
            response.status(400).send({
                status: 400,
                message: "Invalid user"
            })
        } else {
            const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
            if (isPasswordMatched === true) {

                const payload = { id: dbUser.id, name: dbUser.name, role: dbUser.role }
                jsonwebtoken = jwt.sign(payload, "jdhfkjhdsfsjkdkfsldfk")
                console.log(jsonwebtoken)
                response.status(200).send({
                    status: 200,
                    message: "Login success!",
                    token: jsonwebtoken,
                    role: dbUser.role.toLowerCase()
                })
            } else {
                response.status(400).send({
                    status: 400,
                    message: "Invalid password"
                })
            }
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }
})

//autorization middleware//
const autorization = (request, response, next) => {
    const authHeader = request.headers['authorization']
    if (authHeader === undefined) {
        return response.status(400).send({
            status: 400,
            message: "Invalid JWT Token Error"
        })

    } else {
        const jwtToken = authHeader.split(" ")[1]
        if (jwtToken === undefined) {
            return response.status(400).send({
                status: 400,
                message: "JWT Token is missing"
            })

        } else {
            jwt.verify(jwtToken, "jdhfkjhdsfsjkdkfsldfk", (error, payload) => {
                if (error) {
                    return response.status(400).send({
                        status: 400,
                        message: "Invalid JWT Token"
                    })
                }
                if (payload.role !== 'student' && payload.role !== 'instructor') {
                    return response.status(401).send({
                        status: 401,
                        message: "Unauthorized"
                    });
                }

                request.user = payload;
                next();

            })
        }
    }
}


// getting student/instutor name//
app.get('/user', autorization, async (request, response) => {
    try {
        const { id } = request.user;
        const getUserQuery = `SELECT id, name, email, role, created_at FROM user WHERE id = ?;`
        const user = await db.get(getUserQuery, [id]);
        response.status(200).send({
            status: 200,
            data: user
        })
    } catch (e) {

        response.status(400).send({
            status: 400,
            message: "Invalid user"
        })
    }


})

app.get('/instructor/dashboard', autorization, async (req, res) => {
    try {
        const { id, role } = req.user;
        if (role !== 'instructor') {
            return res.status(403).send({ status: 403, message: "Only instructors allowed" });
        }

        // Instructor details
        const instructor = await db.get(
            `SELECT id, name, email, role FROM user WHERE id=?`,
            [id]
        );

        // Instructor's courses
        const courses = await db.all(
            `SELECT id, title, description, image_url, created_at, updated_at 
             FROM courses 
             WHERE instructor_id=?`,
            [id]
        );

        res.status(200).send({
            status: 200,
            data: {
                ...instructor,
                totalCourses: courses.length,
                courses: courses
            }
        });
    } catch (e) {
        console.log(e.message);
        res.status(500).send({ status: 500, message: "Internal Server Error" });
    }
});


/***************coursesTable****************/

// getting all the courses//
app.get('/courses', autorization, async (request, response) => {
    try {
        const getCoursesQuery = `SELECT courses.id, courses.title, courses.image_url,courses.description, user.name AS instructor_name, courses.created_at
        FROM courses
        JOIN user ON courses.instructor_id = user.id;`
        const courses = await db.all(getCoursesQuery);
        response.status(200).send({
            status: 200,
            data: courses
        })

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }
})

//getting a specific course//
app.get('/courses/:courseId', autorization, async (request, response) => {
    try {
        const { courseId } = request.params;
        const getCoursesQuery = `SELECT courses.id, courses.title, courses.description,courses.image_url, user.name AS instructor_name, courses.created_at
        FROM courses
        JOIN user ON courses.instructor_id = user.id WHERE courses.id = ?;`
        const courses = await db.get(getCoursesQuery, [courseId]);
        response.status(200).send({
            status: 200,
            data: courses
        })

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }
})

//instructor creating a course//
app.post('/courses', autorization, async (request, response) => {
    try {
        const { title, description, image_url, instructor } = request.body;
        const { id, role } = request.user;
        if (role !== 'instructor') {
            return response.status(403).send({
                status: 403,
                message: "Only instructors can create courses"
            });
        }
        const createCourseQuery = `
        INSERT INTO courses (title, description, instructor_id,instructor_name, image_url)
        VALUES (?, ?, ?,?, ?);`
        const result = await db.run(createCourseQuery, [title, description, id, instructor, image_url]);
        const courseId = result.lastID;
        response.status(200).send({
            status: 200,
            message: "Course created successfully",
            courseId: courseId
        })

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }
})

//instructor updating a course//
app.put('/courses/:courseId', autorization, async (request, response) => {
    try {
        const { courseId } = request.params;
        const { title, description } = request.body;
        const { id, role } = request.user;
        if (role !== 'instructor') {
            return response.status(403).send({
                status: 403,
                message: "Only instructors can update courses"
            });
        }
        const getCourseQuery = `SELECT * FROM courses WHERE id = ?;`
        const course = await db.get(getCourseQuery, [courseId]);
        if (course === undefined) {
            return response.status(404).send({
                status: 404,
                message: "Course not found"
            });
        }
        if (course.instructor_id !== id) {
            return response.status(403).send({
                status: 403,
                message: "You can only update your own courses"
            });
        }
        const updateCourseQuery = `
        UPDATE courses
        SET title = ?, description = ?, updated_at = datetime('now')
        WHERE id = ?;`
        await db.run(updateCourseQuery, [title, description, courseId]);
        response.status(200).send({
            status: 200,
            message: "Course updated successfully"
        })

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }
})

//instructor Deleting a course//
app.delete('/courses/:courseId', autorization, async (request, response) => {
    try {
        const { courseId } = request.params;
        const { id, role } = request.user;
        if (role !== 'instructor') {
            return response.status(403).send({
                status: 403,
                message: "Only instructors can delete courses"
            });
        }
        const getCourseQuery = `SELECT * FROM courses WHERE id = ?;`
        const course = await db.get(getCourseQuery, [courseId]);
        if (course === undefined) {
            return response.status(404).send({
                status: 404,
                message: "Course not found"
            });
        }
        if (course.instructor_id !== id) {
            return response.status(403).send({
                status: 403,
                message: "You can only delete your own courses"
            });
        }
        const deleteCourseQuery = `DELETE FROM courses WHERE id = ?;`
        await db.run(deleteCourseQuery, [courseId]);
        response.status(200).send({
            status: 200,
            message: "Course deleted successfully"
        })

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }
})

/**************EnrollementTable*************/

//enrollment of a course//
app.post('/courses/:courseId/enroll', autorization, async (request, response) => {
    try {
        const { courseId } = request.params;
        const { id, role } = request.user;

        // Only students can enroll
        if (role !== 'student') {
            return response.status(403).send({
                status: 403,
                message: "Only students can enroll in courses"
            });
        }

        // Check if course exists
        const getCourseQuery = `SELECT * FROM courses WHERE id = ?;`;
        const course = await db.get(getCourseQuery, [courseId]);
        if (!course) {
            return response.status(404).send({
                status: 404,
                message: "Course not found"
            });
        }

        // Check if student is already enrolled
        const existingEnrollment = await db.get(
            `SELECT * FROM enrollment WHERE user_id = ? AND course_id = ?`,
            [id, courseId]
        );

        if (existingEnrollment) {
            return response.status(400).send({
                status: 400,
                message: "You are already enrolled in this course"
            });
        }

        // Enroll student with default progress
        const enrollQuery = `
            INSERT INTO enrollment (user_id, course_id, progress)
            VALUES (?, ?, ?);
        `;
        await db.run(enrollQuery, [id, courseId, JSON.stringify([])]);

        return response.status(200).send({
            status: 200,
            message: "Enrollment successful"
        });

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500).send({
            status: 500,
            message: "Internal Server Error"
        });
    }
});


// get all the courses a student is enrolled in WITH progress
app.get('/my-courses', autorization, async (request, response) => {
    try {
        const { id, role } = request.user;

        if (role !== 'student') {
            return response.status(403).send({
                status: 403,
                message: "Only students can view their courses"
            });
        }

        // Fetch courses the student is enrolled in
        const getEnrolledCoursesQuery = `
      SELECT 
        courses.id, 
        courses.title, 
        courses.description, 
        user.name AS instructor_name, 
        courses.created_at, 
        courses.image_url,
        enrollment.progress
      FROM enrollment
      JOIN courses ON enrollment.course_id = courses.id
      JOIN user ON courses.instructor_id = user.id
      WHERE enrollment.user_id = ?;
    `;

        const courses = await db.all(getEnrolledCoursesQuery, [id]);

        // Now calculate progress for each course
        const courseProgress = await Promise.all(
            courses.map(async (course) => {
                // total lessons in this course
                const lessonsCountRow = await db.get(
                    `SELECT COUNT(*) as total FROM lessons WHERE course_id = ?`,
                    [course.id]
                );
                const totalLessons = lessonsCountRow.total || 0;

                // completed lessons from enrollment.progress (stored as JSON array of lessonIds)
                const completedLessons = JSON.parse(course.progress || "[]").length;

                const progressPercent = totalLessons > 0
                    ? Math.round((completedLessons / totalLessons) * 100)
                    : 0;

                return {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    instructor_name: course.instructor_name,
                    created_at: course.created_at,
                    image_url: course.image_url,
                    completedLessons,
                    totalLessons,
                    progress: progressPercent
                };
            })
        );

        response.status(200).send({
            status: 200,
            data: courseProgress
        });

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500).send({
            status: 500,
            message: "Internal Server Error"
        });
    }
});


//get students entrolled in a specific course(instructor only)//
app.get('/courses/:courseId/students', autorization, async (request, response) => {
    try {
        const { courseId } = request.params
        const { id, role } = request.user
        if (role !== 'instructor') {
            return response.status(403).send({
                status: 403,
                message: "Only instructors can view enrolled students"
            })
        }

        const courseQuery = `SELECT * FROM courses WHERE id=? AND instructor_id=?`
        const course = await db.get(courseQuery, [courseId, id])
        if (course === undefined) {
            return response.status(404).send({
                status: 404,
                message: "Course not found or you are not the instructor"
            })
        } else {
            const getStudentsQuery = `
                SELECT user.id, user.name, user.email, enrollment.progress, enrollment.created_at
                FROM enrollment 
                JOIN user on enrollment.user_id = user.id
                WHERE enrollment.course_id = ?;
            `;
            const students = await db.all(getStudentsQuery, [courseId])
            response.status(200).send({
                status: 200,
                data: students
            })

        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }
})

//mark lesson as complete//
app.post('/courses/:courseId/lessons/:lessonId/complete', autorization, async (request, response) => {
    try {
        const { courseId, lessonId } = request.params;
        const { id, role } = request.user;
        if (role !== 'student') {
            return response.status(403).send({
                status: 403,
                message: "Only students can mark lessons as complete"
            });
        }

        // Check if enrollment exists
        const enrollmentQuery = `SELECT * FROM enrollment WHERE user_id = ? AND course_id = ?;`;
        const enrollment = await db.get(enrollmentQuery, [id, courseId]);
        if (!enrollment) {
            return response.status(400).send({
                status: 400,
                message: "You are not enrolled in this course"
            });
        }

        // Check if lesson exists
        const lessonQuery = `SELECT * FROM lessons WHERE id = ? AND course_id = ?;`;
        const lesson = await db.get(lessonQuery, [lessonId, courseId]);
        if (!lesson) {
            return response.status(404).send({
                status: 404,
                message: "Lesson not found in this course"
            });
        }

        // Update progress
        let progress = JSON.parse(enrollment.progress);
        if (!progress.includes(lessonId)) {
            progress.push(lessonId);
            const updateProgressQuery = `
                UPDATE enrollment
                SET progress = ?
                WHERE user_id = ? AND course_id = ?;
            `;
            await db.run(updateProgressQuery, [JSON.stringify(progress), id, courseId]);
        }

        return response.status(200).send({
            status: 200,
            message: "Lesson marked as complete"
        });

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }
})

/************LessonsTable*************/
//create a lesson(instructor only)//
app.post('/courses/:courseId/lessons', autorization, async (request, response) => {
    try {
        const { courseId } = request.params;
        const { title, video_url, content } = request.body;
        const { id, role } = request.user;
        if (role !== 'instructor') {
            return response.status(403).send({
                status: 403,
                message: "Only instructors can create lessons"
            });
        }
        const getCourseQuery = `SELECT * FROM courses WHERE id = ?;`
        const course = await db.get(getCourseQuery, [courseId]);
        if (course === undefined) {
            return response.status(404).send({
                status: 404,
                message: "Course not found"
            });
        }
        if (course.instructor_id !== id) {
            return response.status(403).send({
                status: 403,
                message: "You can only add lessons to your own courses"
            });
        }
        const createLessonQuery = `
        INSERT INTO lessons (course_id, title, video_url, content)
        VALUES (?, ?, ?,?);`
        const result = await db.run(createLessonQuery, [courseId, title, video_url, content]);
        const lessonId = result.lastID;
        response.status(200).send({
            status: 200,
            message: "Lesson created successfully",
            lessonId: lessonId
        })

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }
})

// get all lessons of a course//
app.get('/courses/:courseId/lessons', autorization, async (request, response) => {
    try {
        const { courseId } = request.params;
        const { id, role } = request.user;

        if (role !== 'student' && role !== 'instructor') {
            return response.status(403).send({
                status: 403,
                message: "Only students and instructors can view lessons"
            });
        }

        const course = await db.get(`SELECT * FROM courses WHERE id = ?;`, [courseId]);
        if (!course) {
            return response.status(404).send({
                status: 404,
                message: "Course not found"
            });
        }

        let completedLessons = [];
        //Checking student and entrollement//
        if (role === 'student') {
            const enrollment = await db.get(
                `SELECT * FROM enrollment WHERE user_id = ? AND course_id = ?;`,
                [id, courseId]
            );

            if (!enrollment) {
                return response.status(403).send({
                    status: 403,
                    message: "You are not enrolled in this course"
                });
            }

            completedLessons = JSON.parse(enrollment.progress || "[]");
        }

        // Get all lessons
        const lessons = await db.all(`SELECT * FROM lessons WHERE course_id = ?;`, [courseId]);

        // Attach completed flag
        const lessonsWithCompletion = lessons.map(lesson => ({
            ...lesson,
            completed: completedLessons.includes(lesson.id)  // ✅ true/false
        }));

        response.status(200).send({
            status: 200,
            data: lessonsWithCompletion
        });

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500).send({
            status: 500,
            message: "Internal Server Error"
        });
    }
});


//update a lesson(instructor only)//
app.put('/courses/:courseId/lessons/:lessonId', autorization, async (request, response) => {
    try {
        const { courseId, lessonId } = request.params;
        const { title, video_url, content } = request.body;
        const { id, role } = request.user;
        if (role !== 'instructor') {
            return response.status(403).send({
                status: 403,
                message: "Only instructors can update lessons"
            });
        }
        const getCourseQuery = `SELECT * FROM courses WHERE id = ?;`
        const course = await db.get(getCourseQuery, [courseId]);
        if (course === undefined) {
            return response.status(404).send({
                status: 404,
                message: "Course not found"
            });
        }
        if (course.instructor_id !== id) {
            return response.status(403).send({
                status: 403,
                message: "You can only update lessons in your own courses"
            });
        }
        const getLessonQuery = `SELECT * FROM lessons WHERE id = ? AND course_id = ?;`
        const lesson = await db.get(getLessonQuery, [lessonId, courseId]);
        if (lesson === undefined) {
            return response.status(404).send({
                status: 404,
                message: "Lesson not found in this course"
            });
        }
        const updateLessonQuery = `
        UPDATE lessons
        SET title = ?, video_url = ?, content = ?
        WHERE id = ? AND course_id = ?;`
        await db.run(updateLessonQuery, [title, video_url, lessonId, courseId, content]);
        response.status(200).send({
            status: 200,
            message: "Lesson updated successfully"
        })

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }
})

//delete a lesson(instructor only)//
app.delete('/courses/:courseId/lessons/:lessonId', autorization, async (request, response) => {
    try {
        const { courseId, lessonId } = request.params;
        const { id, role } = request.user;
        if (role !== 'instructor') {
            return response.status(403).send({
                status: 403,
                message: "Only instructors can delete lessons"
            });
        }
        const getCourseQuery = `SELECT * FROM courses WHERE id = ?;`
        const course = await db.get(getCourseQuery, [courseId]);
        if (course === undefined) {
            return response.status(404).send({
                status: 404,
                message: "Course not found"
            });
        }
        if (course.instructor_id !== id) {
            return response.status(403).send({
                status: 403,
                message: "You can only delete lessons in your own courses"
            });
        }
        const getLessonQuery = `SELECT * FROM lessons WHERE id = ? AND course_id = ?;`
        const lesson = await db.get(getLessonQuery, [lessonId, courseId]);
        if (lesson === undefined) {
            return response.status(404).send({
                status: 404,
                message: "Lesson not found in this course"
            });
        }
        const deleteLessonQuery = `DELETE FROM lessons WHERE id = ? AND course_id = ?;`
        await db.run(deleteLessonQuery, [lessonId, courseId]);
        response.status(200).send({
            status: 200,
            message: "Lesson deleted successfully"
        })

    } catch (e) {
        console.log(`Error: ${e.message}`);
        response.status(500)
        response.send({
            status: 500,
            message: "Internal Server Error"
        })
    }
})

intializingDBAndServer()
