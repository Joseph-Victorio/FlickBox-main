import React from 'react';
import { FaStar, FaHeart } from 'react-icons/fa';

const MovieCard = ({ 
  film, 
  onWatchlistToggle, 
  onClick, 
  isInWatchlist,
  layout = 'vertical' // 'vertical' or 'horizontal'
}) => {
  const renderVerticalCard = () => (
    <div 
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-2 group cursor-pointer"
      onClick={() => onClick(film)}
    >
      <div className="relative w-full aspect-[2/3]">
        <img
          src={film.poster}
          alt={film.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <button 
          className="absolute top-3 right-3 bg-gray-800 bg-opacity-70 rounded-full p-2 hover:bg-blue-600 transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation();
            onWatchlistToggle(film);
          }}
        >
          <FaHeart className={isInWatchlist ? "text-red-500" : "text-gray-300"} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-medium">
            View Details
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{film.title}</h3>
        <div className="flex justify-between items-center">
          <p className="text-gray-400 text-sm">{film.year}</p>
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span className="text-yellow-400">{film.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHorizontalCard = () => (
    <div 
      className="flex items-center p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={() => onClick(film)}
    >
      <img src={film.poster} alt={film.title} className="w-16 h-16 object-cover rounded-md" />
      <div className="ml-4 flex-grow">
        <h4 className="font-medium">{film.title}</h4>
        <div className="flex items-center text-sm">
          <FaStar className="text-yellow-400 mr-1" />
          <span>{film.rating}</span>
        </div>
      </div>
      <button 
        className="p-2 text-gray-400 hover:text-red-500"
        onClick={(e) => {
          e.stopPropagation();
          onWatchlistToggle(film);
        }}
      >
        <FaHeart className={isInWatchlist ? "text-red-500" : ""} />
      </button>
    </div>
  );

  return layout === 'vertical' ? renderVerticalCard() : renderHorizontalCard();
};

export default MovieCard;