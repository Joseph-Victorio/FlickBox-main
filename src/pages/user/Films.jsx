import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaStar, 
  FaFilter, 
  FaCalendarAlt,
  FaSortAmountDownAlt,
  FaPlay,
  FaSpinner,
  FaTimes,
  FaExclamationTriangle,
  FaArrowLeft
} from 'react-icons/fa';

const BANNED_WORDS = [
  'sex', 'sexual', 'porn', 'xxx', 'nude', 'naked', 'erotic', 'fetish', 'bdsm',
  'orgasm', 'masturbat', 'genital', 'intercourse', 'blowjob', 'handjob', 'cunnilingus',
  'fellatio', 'sodomy', 'pedophil', 'incest', 'rape', 'rapist', 'molest', 'prostitut',
  'whore', 'slut', 'fuck', 'cock', 'dick', 'pussy', 'cunt', 'clit', 'vagina', 'penis',
  'anal', 'boob', 'tits', 'asshole', 'dildo', 'vibrator', 'orgy', 'bisexual', 'hardcore',
  'explicit', 'xxx', 'pornography', 'hentai', 'ecchi', 'sensual', 'seduce', 'lascivious',
  'lewd', 'salacious', 'obscene', 'vulgar', 'coitus', 'copulation', 'fornication', 'Playboy',
  'Playmate'
];

const containsBannedWords = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BANNED_WORDS.some(word => lowerText.includes(word));
};

const Films = () => {
  const API_KEY = '8f74ba3476a16e78682cadadd1456462';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('rating');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [films, setFilms] = useState([]);
  const [filteredFilms, setFilteredFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filmsPerPage] = useState(8);
  const [error, setError] = useState(null);
  const [allGenres, setAllGenres] = useState(['all']);
  const [totalFilms, setTotalFilms] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
        );
        const data = await response.json();
        const genres = data.genres.map(genre => genre.name);
        setAllGenres(['all', ...genres]);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
        setError('Failed to load genres. Using default list.');
        setAllGenres([
          'all', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
          'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
          'Music', 'Mystery', 'Romance', 'Science Fiction', 'TV Movie',
          'Thriller', 'War', 'Western'
        ]);
      }
    };
    
    fetchGenres();
  }, []);

  const fetchFilms = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      
      if (isSearching && searchQuery) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=${currentPage}&primary_release_date.gte=2000-01-01`;
      } else {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${currentPage}&primary_release_date.gte=2000-01-01`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      setTotalFilms(data.total_results);
      
      const genreResponse = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
      );
      const genreData = await genreResponse.json();
      const genreMap = genreData.genres.reduce((map, genre) => {
        map[genre.id] = genre.name;
        return map;
      }, {});
      
      const filmsData = await Promise.all(data.results.map(async (movie) => {
        if (containsBannedWords(movie.title) || containsBannedWords(movie.overview)) {
          return null;
        }
        
        const releaseYear = movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : 0;
        if (releaseYear < 2000) {
          return null;
        }
        
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&append_to_response=credits`
        );
        const details = await detailsResponse.json();
        
        if (containsBannedWords(details.overview)) {
          return null;
        }
        
        const director = details.credits.crew.find(
          person => person.job === "Director"
        )?.name || "Unknown";
        
        const runtime = details.runtime;
        const hours = Math.floor(runtime / 60);
        const minutes = runtime % 60;
        const duration = runtime ? `${hours}h ${minutes}m` : 'N/A';
        
        return {
          id: movie.id,
          title: movie.title,
          year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
          rating: movie.vote_average.toFixed(1),
          poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450?text=No+Poster',
          genre: movie.genre_ids.map(id => genreMap[id] || 'Unknown'),
          director,
          duration,
          description: details.overview || 'No description available.',
          adult: movie.adult
        };
      }));
      
      const validFilms = filmsData.filter(film => film !== null);
      setFilms(validFilms);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch films:', err);
      setError('Failed to load films. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, isSearching, searchQuery]);

  useEffect(() => {
    fetchFilms();
  }, [fetchFilms]);

  useEffect(() => {
    if (films.length === 0) return;
    
    let result = [...films];
    
    if (selectedGenre !== 'all') {
      result = result.filter(film => 
        film.genre.includes(selectedGenre)
      );
    }
    
    result.sort((a, b) => {
      if (sortOption === 'rating') return b.rating - a.rating;
      if (sortOption === 'year') return b.year - a.year;
      if (sortOption === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
    
    setFilteredFilms(result);
  }, [films, selectedGenre, sortOption]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        setIsSearching(true);
        setCurrentPage(1);
      } else {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const currentFilms = filteredFilms.slice(0, filmsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const resetSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white min-h-screen">
      <div className="relative py-20 px-6 bg-gradient-to-r from-blue-900/40 to-purple-900/30">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            {isSearching ? 'Search Results' : 'Discover Films (2000+)'}
          </h1>
          <p className="text-gray-300 text-center max-w-2xl mx-auto mb-8">
            {isSearching 
              ? `Searching for "${searchQuery}" in films from 2000 onwards` 
              : 'Explore modern films from the year 2000 onwards'}
          </p>
          
          <div className="relative w-full max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search by title, director, or genre..."
              className="w-full bg-gray-800/90 text-white pl-12 pr-10 py-3 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                onClick={resetSearch}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                className="bg-transparent text-white focus:outline-none focus:ring-0"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                {allGenres.map(genre => (
                  <option key={genre} value={genre} className="bg-gray-800">
                    {genre === 'all' ? 'All Genres' : genre}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2">
              <FaSortAmountDownAlt className="text-gray-400 mr-2" />
              <select
                className="bg-transparent text-white focus:outline-none focus:ring-0"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="rating" className="bg-gray-800">Highest Rating</option>
                <option value="year" className="bg-gray-800">Newest</option>
                <option value="title" className="bg-gray-800">A–Z</option>
              </select>
            </div>
          </div>
          
          <div className="text-gray-300 text-sm">
            Showing {filteredFilms.length} of {totalFilms.toLocaleString()} {isSearching ? 'matching' : ''} films
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: filmsPerPage }).map((_, index) => (
              <div key={index} className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-64 bg-gray-700 rounded-t-xl"></div>
                <div className="p-4">
                  <div className="h-5 w-3/4 bg-gray-700 rounded mb-3"></div>
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-gray-700 rounded"></div>
                    <div className="h-4 w-16 bg-gray-700 rounded"></div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="h-5 w-16 bg-gray-700 rounded-full"></div>
                    <div className="h-5 w-16 bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))
          ) : currentFilms.length > 0 ? (
            currentFilms.map((film) => (
              <div 
                key={film.id} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus:outline-none"
              >
                <Link to={`/film/${film.id}`} className="block">
                  <div className="relative">
                    <img
                      src={film.poster}
                      alt={film.title}
                      className="w-full h-64 object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                      <h3 className="text-lg font-bold truncate">{film.title}</h3>
                    </div>
                    <div className="absolute top-3 right-3 bg-yellow-500 text-gray-900 font-bold text-sm px-2 py-1 rounded flex items-center">
                      <FaStar className="mr-1" /> {film.rating}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {film.year}
                    </div>
                  </div>
                </Link>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg truncate mr-2">{film.title}</h3>
                  </div>
                  
                  <div className="flex justify-between text-gray-400 text-sm mb-3">
                    <span>{film.duration}</span>
                    <span className="truncate max-w-[100px]">{film.director}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {film.genre.slice(0, 3).map((g, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-700/60 text-gray-300 text-xs px-2 py-1 rounded-full"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    to={`/film/${film.id}`}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <FaPlay className="text-sm" /> View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center col-span-full py-12">
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">No films found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {isSearching
                  ? "No films match your search. Try different keywords."
                  : "No films available. Please try again later."}
              </p>
              <button 
                className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={resetSearch}
              >
                Reset Search
              </button>
            </div>
          )}
        </div>

        {totalFilms > filmsPerPage && (
          <div className="flex justify-center mt-10">
            <div className="flex items-center gap-2">
              <button 
                className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  currentPage === 1 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {"<"}
              </button>
              
              {Array.from({ length: Math.min(5, Math.ceil(totalFilms / filmsPerPage)) }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    className={`w-10 h-10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                    onClick={() => paginate(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {Math.ceil(totalFilms / filmsPerPage) > 5 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              
              <button 
                className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  currentPage === Math.ceil(totalFilms / filmsPerPage) 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(totalFilms / filmsPerPage)}
              >
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 mt-6">
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-700 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Get Personalized Recommendations</h2>
              <p className="text-gray-300 max-w-xl">
                Sign up to receive customized movie suggestions based on your preferences.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-gray-800/80 text-white px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-r-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 px-6 border-t border-gray-800 mt-10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p className="mb-2">© 2023 Film Explorer. All rights reserved.</p>
          <p className="text-sm">
            Showing {currentFilms.length} films • Page {currentPage} of {Math.ceil(totalFilms / filmsPerPage)}
          </p>
          <div className="mt-2 flex justify-center items-center text-xs">
            <span className="mr-2">Data provided by</span>
            <img 
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
              alt="TMDB Logo" 
              className="h-4"
            />
          </div>
          <div className="mt-2 text-green-400 text-sm">
            <FaExclamationTriangle className="inline mr-1" />
            Showing only films released in 2000 or later
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Films;