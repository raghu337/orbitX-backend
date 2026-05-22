/**
 * Filters and ranks satellite passes based on visibility criteria.
 */

export const VISIBILITY_STATUS = {
  GOOD: 'Good',
  MEDIUM: 'Medium',
  POOR: 'Poor',
  NONE: 'None'
};

/**
 * Calculates a visibility score based on max elevation and duration.
 */
export const getPassVisibilityStatus = (maxElevation, duration) => {
  if (maxElevation > 60 && duration > 300) return VISIBILITY_STATUS.GOOD;
  if (maxElevation > 30 && duration > 120) return VISIBILITY_STATUS.MEDIUM;
  if (maxElevation > 10) return VISIBILITY_STATUS.POOR;
  return VISIBILITY_STATUS.NONE;
};

/**
 * Validates if a pass meets the user's notification criteria.
 */
export const isValidPassForAlert = (pass, criteria = {}) => {
  const { minElevation = 30, minDuration = 60 } = criteria;
  
  return (
    pass.maxEl >= minElevation &&
    pass.duration >= minDuration
  );
};

/**
 * Converts degree to compass direction.
 */
export const getCompassDirection = (degrees) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};
