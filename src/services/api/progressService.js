import orbitxApi from './orbitxApi';

export const getUserProgress = async (userId) => {
  try {
    const response = await orbitxApi.get(`/progress/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching progress:', error);
    return null;
  }
};

export const updateProgress = async (courseId, percentage, score) => {
  try {
    const response = await orbitxApi.post('/progress/update', {
      course_id: courseId,
      progress_percentage: percentage,
      score: score,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating progress:', error);
    return null;
  }
};
