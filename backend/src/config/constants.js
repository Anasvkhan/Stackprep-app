// Designations a user can pick during onboarding.
const ROLES = [
  { id: 'frontend', title: 'Frontend Developer', icon: 'web' },
  { id: 'backend', title: 'Backend Developer', icon: 'dns' },
  { id: 'fullstack', title: 'Full Stack Developer', icon: 'layers' },
  { id: 'software-engineer', title: 'Software Engineer', icon: 'code' },
  { id: 'mobile', title: 'Mobile Developer', icon: 'smartphone' },
  { id: 'devops', title: 'DevOps / Cloud Engineer', icon: 'cloud' },
];

const LEVELS = [
  { id: 1, key: 'junior', title: 'Junior', subtitle: '0 - 2 years' },
  { id: 2, key: 'mid', title: 'Mid Level', subtitle: '2 - 5 years' },
  { id: 3, key: 'senior', title: 'Senior', subtitle: '5+ years' },
];

const CATEGORIES = [
  { id: 'system-design', title: 'System Design', order: 1 },
  { id: 'languages', title: 'Languages', order: 2 },
  { id: 'frameworks', title: 'Frameworks', order: 3 },
  { id: 'databases', title: 'Databases', order: 4 },
  { id: 'devops', title: 'DevOps & Cloud', order: 5 },
  { id: 'fundamentals', title: 'CS Fundamentals', order: 6 },
];

const QUESTION_TYPES = ['mcq', 'qa', 'scenario'];

module.exports = { ROLES, LEVELS, CATEGORIES, QUESTION_TYPES };
