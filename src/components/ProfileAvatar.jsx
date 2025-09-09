// src/components/navbar/ProfileAvatar.jsx
import { FaUserCircle } from 'react-icons/fa';

export default function ProfileAvatar({ onClick }) {
  return (
    <button onClick={onClick} className="text-2xl text-gray-600 hover:text-gray-800">
      <FaUserCircle />
    </button>
  );
}
