import { FaHeart, FaStar } from "react-icons/fa";

export default function FilmCard({ film, onToggleFavorite }) {
  return (
    <div className="relative group">
      <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden relative">
        <img
          src={film.poster}
          alt={film.title}
          className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <div>
            <h3 className="font-bold text-white">{film.title}</h3>
            <div className="flex justify-between items-center text-xs text-gray-300">
              <span>{film.year}</span>
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1" /> {film.rating}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => onToggleFavorite(film)}
        className="absolute top-2 right-2 p-2 bg-gray-900/70 rounded-full text-red-500 hover:text-red-400 transition-colors"
      >
        <FaHeart />
      </button>
    </div>
  );
}
