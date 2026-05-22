import orbitxApi from './orbitxApi';

export const getCourses = async () => {
  try {
    const response = await orbitxApi.get('/courses/courses');
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return null;
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await orbitxApi.get(`/courses/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
};

export const submitQuiz = async (courseId, score) => {
  try {
    const response = await orbitxApi.post('/courses/quiz/submit', null, {
      params: {
        course_id: courseId,
        score: score,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return null;
  }
};
