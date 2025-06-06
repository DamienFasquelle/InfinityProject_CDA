const avatarBgColors = [
  '#6c757d', '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6610f2'
];

export const getAvatarColor = (username) => {
  if (!username) return avatarBgColors[0];
  const charCode = username.charCodeAt(0);
  return avatarBgColors[charCode % avatarBgColors.length];
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
