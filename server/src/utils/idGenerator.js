/**
 * Generates a challenge ID in the format JH-YYYY-NNNN
 * @param {number} currentCount - The current count of challenges
 * @returns {string} The formatted challenge ID
 */
export const generateChallengeId = (currentCount) => {
  const year = new Date().getFullYear();
  const paddedCount = String(currentCount + 1).padStart(4, '0');
  return `JH-${year}-${paddedCount}`;
};

/**
 * Generates a project ID in the format PRJ-YYYY-NNNN
 * @param {number} currentCount - The current count of projects
 * @returns {string} The formatted project ID
 */
export const generateProjectId = (currentCount) => {
  const year = new Date().getFullYear();
  const paddedCount = String(currentCount + 1).padStart(4, '0');
  return `PRJ-${year}-${paddedCount}`;
};

/**
 * Generates a citizen ID in the format CIT-NNNN
 * @param {number} currentCount - The current count of citizens
 * @returns {string} The formatted citizen ID
 */
export const generateCitizenId = (currentCount) => {
  const paddedCount = String(currentCount + 1).padStart(4, '0');
  return `CIT-${paddedCount}`;
};
