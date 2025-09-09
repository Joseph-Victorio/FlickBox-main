import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import {
  FaFilm,
  FaSearch,
  FaTrash,
  FaArrowLeft,
  FaPlus,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

const API_KEY = "8f74ba3476a16e78682cadadd1456462";

export default function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ----- State hooks -----
  const [list, setList] = useState({films : []});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showConfirm, setShowConfirm] = useState({ show: false, filmId: null });
  const [isSearching, setIsSearching] = useState(false);
  const [popularFilms, setPopularFilms] = useState([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);

  // ----- Fetch list + items -----
  useEffect(() => {
    fetch(`https://flickbox.my.id/api/movie_list_items.php?list_id=${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject("Not found")))
      .then((data) => setList(data))
      .catch(() => setList(null))
      .finally(() => setLoading(false));
  }, [id]);

  // ----- Fetch popular films when modal opens -----
  useEffect(() => {
    const fetchPopularFilms = async () => {
      if (showAddModal && !searchQuery) {
        setIsLoadingPopular(true);
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=1`
          );
          const data = await response.json();
          setPopularFilms(data.results);
        } catch (error) {
          console.error("Failed to fetch popular films:", error);
        } finally {
          setIsLoadingPopular(false);
        }
      }
    };
    fetchPopularFilms();
  }, [showAddModal, searchQuery]);

  // ----- Search handler -----
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // tambah film
  const handleAddFilmToList = useCallback(
    (film) => {
      if (!list || !list.films) return; 

      if (list.films.some((f) => f.tmdb_id === film.id)) return;

      const newFilm = {
        list_id: id, 
        tmdb_id: film.id,
        title: film.title,
        year: film.release_date ? film.release_date.substring(0, 4) : "N/A",
        poster: film.poster_path
          ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
          : "https://via.placeholder.com/300x450?text=No+Image",
        rating: film.vote_average ? (film.vote_average / 2).toFixed(1) : "N/A",
      };


      fetch("https://flickbox.my.id/api/add_movie_list_item.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFilm),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Response from PHP:", data); 
          if (data.success) {
            setList((prev) => ({
              ...prev,
              films: [...prev.films, { ...newFilm, id: data.id || Date.now() }],
            }));
          } else {
            alert(data.error || "Failed to add film");
          }
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          alert("Failed to add film due to network error.");
        });
    },
    [list, id]
  );

  // hapus film
  const handleRemoveFilm = useCallback(
  (tmdb_id) => {
    if (!list || !list.films) return;

    fetch("https://flickbox.my.id/api/delete_movie_list_item.php", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ list_id: id, tmdb_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setList((prev) => ({
            ...prev,
            films: prev.films.filter((f) => f.tmdb_id !== tmdb_id),
          }));
          setShowConfirm({ show: false, filmId: null });
        } else {
          alert(data.error || "Failed to remove film");
        }
      })
      .catch((err) => {
        console.error("Error removing film:", err);
        alert("Failed to remove film due to network error.");
      });
  },
  [list, id]
);

  // ----- Film grid -----
  const filmGrid = useMemo(() => {
    if (!list?.films || list.films.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="bg-gray-800 p-8 rounded-xl max-w-md mx-auto">
            <FaFilm className="text-5xl text-blue-400 mx-auto mb-4 opacity-70" />
            <h3 className="text-xl font-semibold mb-2">Your list is empty</h3>
            <p className="text-gray-400 mb-6">
              Add your favorite films to get started
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 mx-auto"
            >
              <FaPlus /> Add Films
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {list.films.map((film) => (
          <div
            key={film.tmdb_id}
            className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="relative pb-[150%]">
              {film.poster ? (
                <img
                  src={film.poster}
                  alt={film.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                  <FaFilm className="text-4xl text-gray-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-bold truncate">{film.title}</h3>
                {film.rating && film.rating !== "N/A" && (
                  <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                    {film.rating}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() =>
                setShowConfirm({ show: true, filmId: film.tmdb_id })
              }
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ))}
      </div>
    );
  }, [list]);

  // ----- Early returns -----
  if (loading) return <div className="p-4 text-gray-400">Loading...</div>;

  // ----- Main render -----
  return (
    <div className="bg-gray-900 text-white min-h-screen mt-30">
      {/* HERO */}
      <section className="py-12 px-6 bg-gradient-to-r from-blue-900 via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-0 left-0 text-white bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="bg-gray-800 border-2 border-dashed border-blue-500 rounded-full w-24 h-24 flex items-center justify-center mb-4">
              <FaFilm className="text-3xl text-blue-400 opacity-70" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
              {list.name}
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto mt-2 text-lg">
              {list.description || "Your personalized film collection"}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="bg-blue-900 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                {list.films.length} films
              </span>
              <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                Created {new Date(list.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FILM GRID */}
      <section className="max-w-7xl mx-auto py-10 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-blue-400">
              Film Collection
            </h2>
            <p className="text-gray-400">
              {list.films.length} {list.films.length === 1 ? "film" : "films"}{" "}
              in your list
            </p>
          </div>
          <div className="flex gap-3">
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus /> Add Film
            </button>
          </div>
        </div>
        {filmGrid}
      </section>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeIn ">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh]  flex flex-col">
            {/* HEADER */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700 ">
              <h3 className="text-xl font-bold text-blue-400">Add Films</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            {/* SEARCH */}
            <div className="p-4 border-b border-gray-700">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for a movie..."
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* FILM GRID */}
            <div className="p-4 overflow-y-scroll grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-4 ">
              {isSearching && (
                <div className="col-span-full text-center text-gray-400">
                  <FaSpinner className="animate-spin mx-auto mb-2" />
                  Searching...
                </div>
              )}

              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="col-span-full text-center text-gray-400">
                  No results found.
                </div>
              )}

              {!isSearching &&
                (searchQuery ? searchResults : popularFilms).map((film) => (
                  <div
                    key={film.id}
                    className="group bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all flex flex-col md:h-[380px] h-[270px]"
                    onClick={() => handleAddFilmToList(film)}
                  >
                    {/* Poster */}
                    <div className="w-full aspect-[2/3] relative">
                      {film.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                          alt={film.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                          <FaFilm className="text-3xl text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Footer: Title & Rating */}
                    <div className="p-2 bg-black bg-opacity-70 flex justify-between items-center">
                      <h4 className="text-sm font-bold truncate text-white">
                        {film.title}
                      </h4>
                      {film.vote_average && (
                        <span className="text-xs bg-yellow-600 text-black px-1 rounded">
                          {(film.vote_average / 2).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* REMOVE CONFIRMATION MODAL */}
      {showConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <FaTrash className="text-red-500 text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Remove Film</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to remove this film from your list?
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirm({ show: false, filmId: null })}
                  className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveFilm(showConfirm.filmId)}
                  className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2"
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
