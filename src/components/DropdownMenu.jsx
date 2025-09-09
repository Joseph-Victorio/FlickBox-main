// src/components/navbar/DropdownMenu.jsx
export default function DropdownMenu({ children }) {
  return (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
      <div className="py-1">{children}</div>
    </div>
  );
}
