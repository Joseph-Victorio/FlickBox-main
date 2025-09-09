import { FaEdit, FaTrash, FaStar, FaEllipsisV } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ListCard({ list, showOptionsMenu, setShowOptionsMenu, openEditModal, setDeleteListId, formatDate }) {
  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-1 flex flex-col justify-between border border-gray-700">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowOptionsMenu(showOptionsMenu === list.id ? null : list.id)}
          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
        >
          <FaEllipsisV />
        </button>
        {showOptionsMenu === list.id && (
          <div className="absolute right-0 mt-1 w-40 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700">
            <button
              onClick={() => openEditModal(list)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
            >
              <FaEdit className="mr-2 text-blue-400" /> Edit List
            </button>
            <button
              onClick={() => setDeleteListId(list.id)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center text-red-400"
            >
              <FaTrash className="mr-2" /> Delete List
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-blue-300">{list.name}</h3>
          <span className="bg-blue-900/50 text-xs px-2 py-1 rounded-full">
            {list.films.length} {list.films.length === 1 ? "film" : "films"}
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          {list.description || "No description provided."}
        </p>

        {list.films.length > 0 ? (
          <div className="mt-2">
            <div className="flex -space-x-3 mb-3">
              {list.films.slice(0, 5).map((film) => (
                <img
                  key={film.id}
                  src={film.poster}
                  alt={film.title}
                  className="w-10 h-14 rounded object-cover border-2 border-gray-700 shadow"
                />
              ))}
              {list.films.length > 5 && (
                <div className="w-10 h-14 rounded bg-gray-700 border-2 border-gray-700 flex items-center justify-center text-xs">
                  +{list.films.length - 5}
                </div>
              )}
            </div>

            <ul className="text-xs text-gray-400 space-y-1 max-h-32 overflow-y-auto pr-2">
              {list.films.map((film) => (
                <li key={film.id} className="flex justify-between items-center py-1 border-b border-gray-800 last:border-0">
                  <span className="truncate">{film.title} ({film.year})</span>
                  <div className="flex items-center text-yellow-400 text-xs">
                    <FaStar className="mr-1" /> {film.rating}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-4 text-center my-4">
            <p className="text-gray-400 text-sm">No films added yet</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="text-gray-500 text-xs">Created: {formatDate(list.created)}</div>
        <Link to={`/lists/${list.id}`} className="text-blue-400 hover:text-blue-300 flex items-center">
          View Details <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
}
