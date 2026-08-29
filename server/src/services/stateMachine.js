export const CHALLENGE_STATUSES = ['Submitted', 'AI Analyzed', 'Under Review', 'Verified', 'Matched', 'Organizations Notified', 'Interested', 'Assigned', 'Collaboration Requested', 'Collaboration Accepted', 'Government Review', 'Resolved', 'Citizen Confirmation', 'Closed', 'Rejected', 'On Hold'];
export const PROJECT_STATUSES = ['Accepted', 'Team Formation', 'Solution Proposal', 'Admin Approval', 'In Progress', 'Prototype/Pilot', 'Implemented', 'Impact Evaluation', 'Closed', 'Discontinued'];

export const CHALLENGE_BADGE_COLORS = {
  'Submitted': '#757575',
  'Under Review': '#1565C0',
  'Verified': '#00695C',
  'Matched': '#6A1B9A',
  'Assigned': '#E65100',
  'Rejected': '#C62828',
  'Closed': '#424242'
};

export const PROJECT_BADGE_COLORS = {
  'Accepted': '#2E7D32',
  'Team Formation': '#00838F',
  'Solution Proposal': '#5E35B1',
  'Admin Approval': '#F9A825',
  'In Progress': '#1976D2',
  'Prototype/Pilot': '#EF6C00',
  'Implemented': '#388E3C',
  'Impact Evaluation': '#6D4C41',
  'Closed': '#424242',
  'Discontinued': '#C62828'
};

/**
 * Checks if a challenge can transition
 */
export const canTransitionChallenge = (fromStatus, toStatus) => {
  const allowed = {
    'Submitted': ['Under Review', 'Rejected'],
    'Under Review': ['Verified', 'Rejected'],
    'Verified': ['Matched', 'Rejected'],
    'Matched': ['Assigned'],
    'Assigned': ['Closed']
  };

  if (allowed[fromStatus]?.includes(toStatus)) {
    return { allowed: true };
  }
  return { allowed: false, reason: `Cannot transition from ${fromStatus} to ${toStatus}` };
};

/**
 * Checks if a project can transition
 */
export const canTransitionProject = (project, fromStatus, toStatus, actor) => {
  if (toStatus === 'Discontinued') {
    if (!project.discontinuedReason) return { allowed: false, reason: 'Reason required to discontinue' };
    return { allowed: true };
  }

  const idxFrom = PROJECT_STATUSES.indexOf(fromStatus);
  const idxTo = PROJECT_STATUSES.indexOf(toStatus);
  
  if (idxTo !== idxFrom + 1) {
     return { allowed: false, reason: 'Must transition sequentially' };
  }

  if (toStatus === 'Admin Approval' && (!project.proposedSolution || !project.expectedOutcome)) {
    return { allowed: false, reason: 'Proposal fields required' };
  }

  return { allowed: true };
};
