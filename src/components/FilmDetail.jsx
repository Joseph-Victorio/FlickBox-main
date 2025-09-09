// src/pages/FilmDetail.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaStar, FaHeart, FaPlay, FaArrowLeft, FaTimes } from "react-icons/fa";
import MovieCard from "../components/MovieCard";
import { fetchFilmDetails } from "../api/tmdb";

const FilmDetail = () => {
  const { id } = useParams();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarFilms, setSimilarFilms] = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch film details
        const filmData = await fetchFilmDetails(id);
        if (!filmData) throw new Error('Film not found');
        setFilm(filmData);

        // Fetch similar films
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/similar?api_key=8f74ba3476a16e78682cadadd1456462&language=en-US&page=1`
        );
        const data = await response.json();
        
        // Filter films released in 2000 or later
        const filteredResults = data.results.filter(movie => {
          if (movie.release_date) {
            const year = parseInt(movie.release_date.substring(0, 4));
            return year >= 2000;
          }
          return false; // Exclude movies without release date
        });
        
        // Take first 3 from filtered results
        const similar = filteredResults.slice(0, 3).map(movie => ({
          id: movie.id,
          title: movie.title,
          rating: (movie.vote_average / 2).toFixed(1),
          year: movie.release_date?.substring(0, 4) || 'N/A',
          poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450?text=No+Image',
        }));
        setSimilarFilms(similar);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full text-blue-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-white">Loading film details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-xl">
          <h2 className="text-2xl text-white mb-4">Error Loading Film</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <Link to="/films" className="text-blue-400 hover:text-blue-300">
            <FaArrowLeft className="inline mr-2" /> Back to Films
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white py-12 px-4">
      {/* Trailer Modal */}
      {showTrailer && film?.trailerId && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl relative">
            <button
              className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300"
              onClick={() => setShowTrailer(false)}
            >
              <FaTimes />
            </button>
            <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
              <iframe
                src={`https://www.youtube.com/embed/${film.trailerId}?autoplay=1`}
                title={`${film.title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <Link 
          to="/films" 
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Films
        </Link>

        {/* Film Details Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Column - Poster */}
            <div className="lg:w-2/5 p-6 bg-gray-900">
              <div className="sticky top-6">
                <img
                  src={film.poster}
                  alt={film.title}
                  className="w-full h-auto rounded-xl shadow-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                  }}
                />
                <div className="mt-6 flex gap-3">
                  <button 
                    className={`bg-blue-600 text-white font-medium py-3 px-6 rounded-lg flex-1 flex items-center justify-center ${
                      film.trailerId 
                        ? 'hover:bg-blue-700' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => film.trailerId && setShowTrailer(true)}
                    disabled={!film.trailerId}
                  >
                    <FaPlay className="mr-2" /> 
                    {film.trailerId ? 'Watch Trailer' : 'No Trailer'}
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <FaHeart className="text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Column - Details */}
            <div className="lg:w-3/5 p-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{film.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center bg-blue-900/30 px-3 py-1 rounded-full">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-medium">{film.rating}/5.0</span>
                </div>
                <span className="text-gray-400">{film.year}</span>
                <span className="text-gray-400">{film.duration}</span>
              </div>
              
              <p className="text-gray-300 mb-8 text-lg">{film.description || film.overview}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-xl font-bold mb-3 text-blue-400">Director</h2>
                  <p className="text-white">{film.director}</p>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mb-3 text-blue-400">Cast</h2>
                  <p className="text-white">{film.cast?.join(", ") || "N/A"}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h2 className="text-xl font-bold mb-3 text-blue-400">Genre</h2>
                  <div className="flex flex-wrap gap-2">
                    {film.genre.map((g, idx) => (
                      <span 
                        key={idx} 
                        className="bg-gray-700 px-4 py-2 rounded-full"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
                  Similar Films
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similarFilms.map(film => (
                    <Link 
                      to={`/films/${film.id}`} 
                      key={film.id}
                      className="block"
                    >
                      <div className="bg-gray-700/50 rounded-xl overflow-hidden transition-transform hover:scale-105">
                        <img 
                          src={film.poster} 
                          alt={film.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                          <h3 className="font-bold truncate">{film.title}</h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm">{film.year}</span>
                            <div className="flex items-center text-yellow-400">
                              <FaStar className="mr-1" /> {film.rating}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmDetail;