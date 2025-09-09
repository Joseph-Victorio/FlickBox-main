// src/components/navbar/DropdownLink.jsx
import { Link } from 'react-router-dom';

export default function DropdownLink({ to, icon: Icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </Link>
  );
}
