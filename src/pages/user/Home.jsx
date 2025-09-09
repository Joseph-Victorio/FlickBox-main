import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import {
  FaStar,
  FaListUl,
  FaFilm,
  FaUsers,
  FaArrowLeft,
  FaArrowRight,
  FaHeart,
  FaPlay,
  FaPlus,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTimes
} from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MovieCard from "../../components/MovieCard";

// --- Custom Arrows ---
const NextArrow = ({ onClick }) => (
  <div
    onClick={onClick}
    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 bg-opacity-90 hover:bg-blue-600 p-3 rounded-full cursor-pointer transition-all shadow-lg hover:scale-105"
  >
    <FaArrowRight className="text-white text-xl" />
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    onClick={onClick}
    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 bg-opacity-90 hover:bg-blue-600 p-3 rounded-full cursor-pointer transition-all shadow-lg hover:scale-105"
  >
    <FaArrowLeft className="text-white text-xl" />
  </div>
);

// Static testimonials
const testimonials = [
  { 
    name: "Joni", 
    comment: "FlickBox is my go-to place for discovering amazing films! The recommendations are spot on.", 
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5
  },
  { 
    name: "Cio", 
    comment: "I love the list feature! Helps me organize my watchlist easily and share with friends.", 
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4
  },
  { 
    name: "Alex", 
    comment: "The community reviews helped me find hidden gems I would've otherwise missed. Great platform!", 
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    rating: 5
  },
  { 
    name: "Taylor", 
    comment: "As a film student, FlickBox provides the perfect blend of entertainment and education.", 
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5
  },
];

export default function Home() {
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [watchlist, setWatchlist] = useState([]);
  const [popularFilms, setPopularFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [trailerError, setTrailerError] = useState(null);
  const trailerModalRef = useRef(null);
  const trendingSectionRef = useRef(null);

  const API_KEY = "8f74ba3476a16e78682cadadd1456462";

  useEffect(() => {
    document.body.style.overflow = selectedFilm || trailerUrl ? "hidden" : "auto";
  }, [selectedFilm, trailerUrl]);

  // Close trailer modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (trailerModalRef.current && !trailerModalRef.current.contains(event.target)) {
        closeTrailer();
      }
    };
    
    if (trailerUrl) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [trailerUrl]);

  // Fetch popular movies from TMDB
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setLoading(true);
        // Fetch popular movies
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
        );
        const data = await response.json();
        
        // Fetch genre list for mapping IDs to names
        const genreResponse = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
        );
        const genreData = await genreResponse.json();
        const genreMap = genreData.genres.reduce((map, genre) => {
          map[genre.id] = genre.name;
          return map;
        }, {});
        
        // Get details for each movie
        const filmsWithDetails = await Promise.all(
          data.results.slice(0, 8).map(async (movie) => {
            const creditsResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${API_KEY}`
            );
            const creditsData = await creditsResponse.json();
            
            // Get director
            const director = creditsData.crew.find(
              (person) => person.job === "Director"
            )?.name || "Unknown";
            
            // Get top 3 cast
            const cast = creditsData.cast.slice(0, 3).map((person) => person.name);
            
            // Format duration
            const hours = Math.floor(movie.runtime / 60);
            const minutes = movie.runtime % 60;
            const duration = movie.runtime ? `${hours}h ${minutes}m` : "N/A";
            
            return {
              id: movie.id,
              title: movie.title,
              rating: (movie.vote_average / 2).toFixed(1),
              year: movie.release_date?.substring(0, 4) || "N/A",
              poster: movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/300x450?text=No+Image",
              backdrop: movie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                : "https://via.placeholder.com/1920x1080?text=No+Image",
              overview: movie.overview,
              genre: movie.genre_ids.map(id => genreMap[id] || "Unknown"),
              cast,
              director,
              duration,
              isFeatured: Math.random() > 0.5,
            };
          })
        );
        
        setPopularFilms(filmsWithDetails);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies. Using sample data instead.");
        setLoading(false);
        // Fallback to static films
        setPopularFilms([
          {
            id: 1,
            title: "Inception",
            rating: "4.7",
            year: "2010",
            poster: "https://media.themoviedb.org/t/p/original/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
            backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80",
            overview: "A skilled thief is given a chance at redemption if he can successfully perform inception.",
            genre: ["Action", "Sci-Fi", "Thriller"],
            cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
            director: "Christopher Nolan",
            duration: "2h 28m",
            isFeatured: true
          },
          {
            id: 2,
            title: "The Batman",
            rating: "4.3",
            year: "2022",
            poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
            backdrop: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80",
            overview: "Batman faces the Riddler, a serial killer targeting Gotham’s elite.",
            genre: ["Crime", "Mystery", "Action"],
            cast: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano"],
            director: "Matt Reeves",
            duration: "2h 56m"
          },
          {
            id: 3,
            title: "Interstellar",
            rating: "4.8",
            year: "2014",
            poster: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
            backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80",
            overview: "A group of explorers travel through a wormhole in space in an attempt to save humanity.",
            genre: ["Adventure", "Drama", "Sci-Fi"],
            cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
            director: "Christopher Nolan",
            duration: "2h 49m",
            isFeatured: true
          }
        ]);
      }
    };

    fetchPopularMovies();
  }, []);

  const toggleWatchlist = (film) => {
    if (watchlist.some(item => item.id === film.id)) {
      setWatchlist(watchlist.filter(item => item.id !== film.id));
    } else {
      setWatchlist([...watchlist, film]);
    }
  };

  // Fetch trailer for a movie
  const fetchTrailer = async (movieId) => {
    setTrailerLoading(true);
    setTrailerError(null);
    
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
      );
      const data = await response.json();
      
      // Find YouTube trailer
      const trailer = data.results.find(
        video => video.site === "YouTube" && video.type === "Trailer"
      );
      
      if (trailer) {
        setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}`);
      } else {
        setTrailerError("No trailer available for this movie");
      }
    } catch (err) {
      console.error("Error fetching trailer:", err);
      setTrailerError("Failed to load trailer. Please try again later.");
    } finally {
      setTrailerLoading(false);
    }
  };

  // Open trailer modal
  const openTrailer = (film) => {
    fetchTrailer(film.id);
  };

  // Close trailer modal
  const closeTrailer = () => {
    setTrailerUrl(null);
    setTrailerLoading(false);
    setTrailerError(null);
  };

  // Scroll to trending section
  const scrollToTrending = () => {
    if (trendingSectionRef.current) {
      trendingSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />, 
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  const testimonialSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  const filteredFilms = popularFilms.filter(film => {
    if (activeFilter === "all") return true;
    if (activeFilter === "featured") return film.isFeatured;
    return film.genre.includes(activeFilter);
  });

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full text-blue-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-white">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gray-900 text-white w-full min-h-screen overflow-x-hidden pt-24">
      {/* HERO */}
      <section className="relative pb-24 px-6 min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-gray-900/95 to-black/90 z-0"></div>
        {popularFilms.length > 0 && (
          <div className="absolute inset-0 z-0 opacity-30">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${popularFilms[0].backdrop})` }}
            ></div>
          </div>
        )}
        
        <div className="max-w-screen-xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Your Next <span className="text-blue-400">Favorite Film</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mb-8">
              Explore thousands of movies, get personalized recommendations, and join a community of film lovers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={scrollToTrending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all flex items-center justify-center transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <FaPlay className="mr-2" /> Start Exploring
              </button>
            </div>
          </div>
          
          {popularFilms.length > 0 && (
            <div className="relative hidden lg:block">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src={popularFilms[0].poster} 
                  alt={popularFilms[0].title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold">{popularFilms[0].title}</h3>
                  <div className="flex items-center">
                    <div className="text-yellow-400 flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={i < Math.floor(parseFloat(popularFilms[0].rating)) 
                            ? "text-yellow-400" 
                            : "text-gray-600"} 
                        />
                      ))}
                    </div>
                    <span className="ml-2">{popularFilms[0].rating}/5.0</span>
                  </div>
                </div>
                <button 
                  className="absolute top-4 right-4 bg-gray-800 bg-opacity-70 rounded-full p-2 hover:bg-blue-600 transition-colors transform hover:scale-110 focus:outline-none"
                  onClick={() => toggleWatchlist(popularFilms[0])}
                >
                  <FaHeart className={watchlist.some(f => f.id === popularFilms[0].id) ? "text-red-500" : "text-gray-300"} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TRENDING FILMS */}
      <section ref={trendingSectionRef} className="py-16 px-6 bg-gray-900">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-white">Trending Films</h2>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"} transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                onClick={() => setActiveFilter("all")}
              >
                All
              </button>
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === "featured" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"} transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                onClick={() => setActiveFilter("featured")}
              >
                Featured
              </button>
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === "Action" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"} transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                onClick={() => setActiveFilter("Action")}
              >
                Action
              </button>
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === "Sci-Fi" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"} transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                onClick={() => setActiveFilter("Sci-Fi")}
              >
                Sci-Fi
              </button>
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === "Drama" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"} transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                onClick={() => setActiveFilter("Drama")}
              >
                Drama
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="relative">
            <Slider {...settings}>
              {filteredFilms.map((film) => (
                <div key={film.id} className="px-2">
                  <MovieCard 
                    film={film}
                    onWatchlistToggle={toggleWatchlist}
                    onClick={setSelectedFilm}
                    isInWatchlist={watchlist.some(f => f.id === film.id)}
                    onTrailerClick={openTrailer}
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-6 bg-gradient-to-br from-gray-900 to-blue-900/20">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose FlickBox?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our platform is designed for true film enthusiasts with features that enhance your movie discovery experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<FaFilm className="text-3xl" />} 
              title="Smart Recommendations" 
              text="AI-powered suggestions based on your taste and viewing history." 
              color="text-blue-400"
            />
            <FeatureCard 
              icon={<FaStar className="text-3xl" />} 
              title="Community Reviews" 
              text="Read authentic reviews from fellow film lovers before you watch." 
              color="text-yellow-400"
            />
            <FeatureCard 
              icon={<FaListUl className="text-3xl" />} 
              title="Personal Watchlists" 
              text="Create and share custom lists for every mood and occasion." 
              color="text-green-400"
            />
            <FeatureCard 
              icon={<FaUsers className="text-3xl" />} 
              title="Film Club Discussions" 
              text="Join themed clubs and participate in live watch parties." 
              color="text-purple-400"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 bg-gray-900">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Join Our Thriving Community</h2>
              <p className="text-gray-300 mb-8">
                FlickBox has become the go-to platform for film enthusiasts worldwide. Our community continues to grow as we provide the most comprehensive film discovery experience.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <StatBox value="250K+" label="Active Users" icon={<FaUsers />} />
                <StatBox value="1.2M+" label="Reviews" icon={<FaStar />} />
                <StatBox value="85K+" label="Movies" icon={<FaFilm />} />
                <StatBox value="350+" label="Film Clubs" icon={<FaUsers />} />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-blue-500/20 transition-shadow">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Top Rated This Week</h3>
                <div className="space-y-4">
                  {popularFilms.slice(0, 3).map((film) => (
                    <MovieCard 
                      key={film.id}
                      film={film}
                      onWatchlistToggle={toggleWatchlist}
                      onClick={setSelectedFilm}
                      isInWatchlist={watchlist.some(f => f.id === film.id)}
                      layout="horizontal"
                      onTrailerClick={openTrailer}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-900/20 to-gray-900">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">What Our Community Says</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Hear from film enthusiasts who have transformed their viewing experience with FlickBox.
            </p>
          </div>
          
          <div className="relative">
            <Slider {...testimonialSettings}>
              {testimonials.map((t, idx) => (
                <div key={idx} className="px-2">
                  <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-full hover:shadow-blue-500/20 transition-all transform hover:-translate-y-1">
                    <div className="flex items-center mb-4">
                      <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="ml-4">
                        <h4 className="font-bold">{t.name}</h4>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < t.rating ? "text-yellow-400" : "text-gray-600"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 italic mb-4">"{t.comment}"</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 pt-16 pb-8 px-6 border-t border-gray-800">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-blue-500 font-bold text-2xl flex items-center mb-4">
                <FaFilm className="mr-2" />
                FlickBox
              </div>
              <p className="text-gray-400 mb-4">
                The ultimate platform for film enthusiasts to discover, rate, and discuss movies.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:-translate-y-0.5">
                  <FaTwitter size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:-translate-y-0.5">
                  <FaFacebook size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:-translate-y-0.5">
                  <FaInstagram size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:-translate-y-0.5">
                  <FaYoutube size={20} />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:underline">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:underline">Movies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:underline">TV Series</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:underline">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:underline">News</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:underline">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:underline">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:underline">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">
                Subscribe to get the latest film news and recommendations.
              </p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none w-full focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transform hover:-translate-y-0.5 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>© 2023 FlickBox. All rights reserved. Designed with ❤️ for film lovers.</p>
          </div>
        </div>
      </footer>

      {/* MOVIE DETAIL MODAL */}
      {selectedFilm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFilm(null)}
        >
          <div
            className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative flex flex-col lg:flex-row gap-8 max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white text-2xl bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-700 transition-colors transform hover:scale-110 focus:outline-none"
              onClick={() => setSelectedFilm(null)}
            >
              ✕
            </button>
            <div className="lg:w-2/5">
              <div className="sticky top-4">
                <img
                  src={selectedFilm.poster}
                  alt={selectedFilm.title}
                  className="w-full h-auto rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
                />
                <div className="mt-4 flex gap-3">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex-1 flex items-center justify-center transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => openTrailer(selectedFilm)}
                  >
                    <FaPlay className="mr-2" /> Watch Trailer
                  </button>
                  <button 
                    className="bg-gray-800 hover:bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white"
                    onClick={() => toggleWatchlist(selectedFilm)}
                  >
                    <FaHeart className={watchlist.some(f => f.id === selectedFilm.id) ? "text-red-500" : "text-gray-300"} />
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:w-3/5">
              <h3 className="text-3xl font-bold mb-2">{selectedFilm.title}</h3>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center bg-blue-900/30 px-3 py-1 rounded-full">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-medium">{selectedFilm.rating}</span>
                </div>
                <span className="text-gray-400">{selectedFilm.year}</span>
                <span className="text-gray-400">{selectedFilm.duration}</span>
              </div>
              
              <p className="text-gray-300 mb-6">{selectedFilm.overview}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-bold mb-2">Director</h4>
                  <p className="text-gray-400">{selectedFilm.director}</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">Genre</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFilm.genre?.map((g, idx) => (
                      <span key={idx} className="bg-gray-800 px-3 py-1 rounded-full text-sm hover:bg-blue-600 hover:text-white transition-colors">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">Cast</h4>
                  <p className="text-gray-400">{selectedFilm.cast?.join(", ")}</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-xl font-bold mb-4">Similar Films</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {popularFilms
                    .filter(f => f.id !== selectedFilm.id)
                    .slice(0, 3)
                    .map(film => (
                      <MovieCard 
                        key={film.id}
                        film={film}
                        onWatchlistToggle={toggleWatchlist}
                        onClick={setSelectedFilm}
                        isInWatchlist={watchlist.some(f => f.id === film.id)}
                      />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRAILER MODAL */}
      {trailerUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4">
          <div 
            className="w-full max-w-4xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl transform hover:shadow-blue-500/30 transition-shadow"
            ref={trailerModalRef}
          >
            <div className="relative pb-[56.25%] h-0"> {/* 16:9 Aspect Ratio */}
              {trailerLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={trailerUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
            
            <div className="p-4 bg-gray-800">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">
                  {selectedFilm?.title} Trailer
                </h3>
                <button
                  onClick={closeTrailer}
                  className="text-white hover:text-gray-300 transition-colors transform hover:scale-110"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
              
              {trailerError && (
                <div className="mt-2 text-red-400 text-center">
                  {trailerError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const FeatureCard = ({ icon, title, text, color }) => (
  <div className="p-6 bg-gray-800 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all h-full flex flex-col transform hover:-translate-y-1 hover:shadow-lg">
    <div className={`${color} mb-4`}>{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 flex-grow">{text}</p>
  </div>
);

const StatBox = ({ value, label, icon }) => (
  <div className="bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-1">
    <div className="flex items-center mb-3 text-blue-400 text-2xl transform hover:scale-110">
      {icon}
    </div>
    <h4 className="text-white text-2xl font-bold">{value}</h4>
    <p className="text-gray-400">{label}</p>
  </div>
);