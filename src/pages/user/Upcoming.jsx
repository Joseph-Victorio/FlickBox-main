// pages/user/Upcoming.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const API_KEY = '8f74ba3476a16e78682cadadd1456462';
const UPCOMING_URL = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&region=US&page=1`;

const Upcoming = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(UPCOMING_URL);
        const data = await response.json();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming = data.results
          .filter(m => m.release_date && new Date(m.release_date) > today)
          .filter(m => m.original_language === 'en')
          .sort((a, b) => new Date(a.release_date) - new Date(b.release_date))
          .slice(0, 12); // Limit to 12 movies
        
        setMovies(upcoming);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, []);

  const formatDate = dateStr => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Upcoming Movies
          </h1>
          <p className="mt-2 text-gray-400">Discover what's coming soon to theaters</p>
        </header>

        {movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map(movie => (
              <div 
                key={movie.id}
                className="group bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[2/3]">
                  <img
                    src={movie.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : 'https://via.placeholder.com/300x450?text=No+Poster'
                    }
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <FaStar className="mr-1" /> {(movie.vote_average / 2).toFixed(1)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-pink-400 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">{formatDate(movie.release_date)}</p>
                  <button
                    onClick={() => navigate(`/film/${movie.id}`)}
                    className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No upcoming movies found
          </div>
        )}
      </div>
    </div>
  );
};

export default Upcoming;