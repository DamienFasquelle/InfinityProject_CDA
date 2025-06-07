
import React from 'react';
import { Image } from 'react-bootstrap';
import { getInitials, getAvatarColor } from '../utils/userHelpers';

const Avatar = ({ username, photo, size = 50 }) => {
  
  if (photo) {
    return (
      <Image
        src={photo}
        alt={`${username} avatar`}
        roundedCircle
        style={{ width: size, height: size, objectFit: 'cover' }}
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: getAvatarColor(username),
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        color: 'white',
        fontSize: size / 2.5,
        userSelect: 'none',
      }}
    >
      {getInitials(username)}
    </div>
  );
};

export default Avatar;
