import { isUserCorrupted } from './safeFallbacks';

/**
 * Validates if a user profile should be rendered
 * @param profile - User profile object
 * @param user - Auth user object (optional)
 * @returns boolean - true if user should be rendered, false if corrupted
 */
export const shouldRenderUser = (profile?: any, user?: any): boolean => {
  // Skip completely corrupted users
  if (isUserCorrupted(profile, user)) {
    console.warn('Skipping corrupted user:', { profile, user });
    return false;
  }

  // Additional validation checks
  if (!profile?.id && !user?.id) {
    console.warn('Skipping user without ID:', { profile, user });
    return false;
  }

  // Skip users with "Unknown User" or null names
  if (!profile?.full_name || profile?.full_name === 'Unknown User' || profile?.full_name === 'null' || profile?.full_name === null) {
    console.warn('Skipping user with Unknown User name:', { profile });
    return false;
  }

  // Skip users with null/undefined usernames
  if (!profile?.username || profile?.username === 'null' || profile?.username === 'undefined') {
    console.warn('Skipping user with null username:', { profile });
    return false;
  }

  // Skip users with empty or whitespace-only names
  if (profile?.full_name && profile.full_name.trim().length === 0) {
    console.warn('Skipping user with empty name:', { profile });
    return false;
  }

  // Skip users with generic placeholder names
  const placeholderNames = ['User', 'Member', 'Test User', 'Demo User', 'Anonymous'];
  if (profile?.full_name && placeholderNames.includes(profile.full_name.trim())) {
    console.warn('Skipping user with placeholder name:', { profile });
    return false;
  }

  // Skip users with no valid name field
  if (profile?.id && !profile?.full_name && !profile?.username) {
    console.warn('Skipping user without name:', { profile });
    return false;
  }

  return true;
};

/**
 * Validates a conversation should be displayed
 * @param conversation - Conversation object with other_user
 * @returns boolean - true if conversation should be displayed
 */
export const shouldRenderConversation = (conversation: any): boolean => {
  if (!conversation?.other_user) {
    console.warn('Skipping conversation without other_user:', conversation);
    return false;
  }

  // Additional check for null/undefined other_user
  if (!conversation.other_user.id) {
    console.warn('Skipping conversation with null other_user ID:', conversation);
    return false;
  }

  return shouldRenderUser(conversation.other_user);
};

/**
 * Filters out corrupted users from an array
 * @param users - Array of user objects
 * @returns Filtered array with only valid users
 */
export const filterValidUsers = (users: any[]): any[] => {
  return users.filter(user => shouldRenderUser(user));
};

/**
 * Filters out corrupted conversations from an array
 * @param conversations - Array of conversation objects
 * @returns Filtered array with only valid conversations
 */
export const filterValidConversations = (conversations: any[]): any[] => {
  return conversations.filter(conv => shouldRenderConversation(conv));
};

/**
 * Validates profile data completeness
 * @param profile - Profile object
 * @returns Object with validation results
 */
export const validateProfileCompleteness = (profile: any): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} => {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!profile?.id) missingFields.push('id');
  if (!profile?.full_name && !profile?.username) missingFields.push('name');
  if (!profile?.email) warnings.push('email');

  // Optional but recommended fields
  if (!profile?.bio) warnings.push('bio');
  if (!profile?.avatar_url) warnings.push('avatar_url');
  if (!profile?.skills_offered?.length && !profile?.skills?.length) warnings.push('skills');

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
};
