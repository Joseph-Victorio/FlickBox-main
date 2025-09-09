import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaFilm,
  FaFolderOpen,
  FaSearch,
  FaTrash,
  FaEdit,
  FaStar,
  FaEllipsisV,
  FaTimes,
  FaHeart,
  FaSpinner,
} from "react-icons/fa";

// API functions
const API_KEY = "8f74ba3476a16e78682cadadd1456462";

export const searchFilms = async (query) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json();
    return data.results.map((film) => ({
      id: film.id,
      title: film.title,
      year: film.release_date?.substring(0, 4) || "N/A",
      poster: film.poster_path
        ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
        : "https://via.placeholder.com/300x450?text=No+Image",
      rating: film.vote_average.toFixed(1),
    }));
  } catch (err) {
    console.error("Failed to search films:", err);
    return [];
  }
};

export const fetchFilmDetails = async (id) => {
  try {
    // Fetch movie details
    const detailsResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos`
    );
    const details = await detailsResponse.json();

    // Get director
    const director =
      details.credits.crew.find((person) => person.job === "Director")?.name ||
      "Unknown";

    // Get top 3 cast
    const cast = details.credits.cast.slice(0, 3).map((person) => person.name);

    // Format duration
    const runtime = details.runtime;
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    const duration = runtime ? `${hours}h ${minutes}m` : "N/A";

    // Find YouTube trailer
    const trailer = details.videos?.results?.find(
      (video) => video.site === "YouTube" && video.type === "Trailer"
    );

    return {
      id: details.id,
      title: details.title,
      rating: details.vote_average.toFixed(1),
      year: details.release_date?.substring(0, 4) || "N/A",
      poster: details.poster_path
        ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
        : "https://via.placeholder.com/300x450?text=No+Image",
      backdrop: details.backdrop_path
        ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
        : "https://via.placeholder.com/1920x1080?text=No+Image",
      overview: details.overview || "No description available.",
      genre: details.genres.map((genre) => genre.name),
      cast,
      director,
      duration,
      trailerId: trailer?.key || null, // YouTube video ID
    };
  } catch (err) {
    console.error("Failed to fetch film details:", err);
    return null;
  }
};

export default function Lists() {
  const [favorites, setFavorites] = useState([]);
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFilms, setSelectedFilms] = useState([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [filmToRemove, setFilmToRemove] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(null);
  const [deleteListId, setDeleteListId] = useState(null);
  const [activeTab, setActiveTab] = useState("favorites");
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("user_id")
      ? Number(localStorage.getItem("user_id"))
      : null
  );

  useEffect(() => {
    const fetchFavoritesFromAPI = async () => {
      try {
        const response = await fetch(
          `https://flickbox.my.id/api/favorites.php?user_id=${currentUserId}`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setFavorites(data);
        } else {
          console.error("Invalid favorites response", data);
          setFavorites([]);
        }
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setFavorites([]);
      }
    };

    fetchFavoritesFromAPI();
  }, []);

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchFilms(query);
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleAddFilm = (film) => {
    if (!selectedFilms.some((f) => f.id === film.id)) {
      setSelectedFilms([...selectedFilms, film]);
    }
  };

  const handleRemoveFilm = (filmId) => {
    setSelectedFilms(selectedFilms.filter((f) => f.id !== filmId));
  };

  const handleAddList = async () => {
    if (!newListName.trim()) {
      alert("List name cannot be empty.");
      return;
    }

    const payload = {
      user_id: currentUserId,
      name: newListName.trim(),
      description: newListDescription.trim(),
      films: selectedFilms.map((f) => ({
        id: f.id || f.tmdb_id,
        title: f.title || f.movie_title,
        year: f.year || f.release_year || "",
        poster: f.poster,
        rating: f.rating || 0,
      })),
    };

    try {
      const res = await fetch("https://flickbox.my.id/api/movie_lists.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setLists([{ ...payload, id: data.list_id }, ...lists]);
        resetModal();
        alert("List created successfully!");
      } else {
        alert(data.error || "Failed to create list");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating list");
    }
  };

  const handleUpdateList = async () => {
    if (!newListName.trim()) {
      alert("List name cannot be empty.");
      return;
    }

    const payload = {
      id: editingListId,
      name: newListName.trim(),
      description: newListDescription.trim(),
      films: selectedFilms,
    };

    try {
      const res = await fetch("https://flickbox.my.id/api/movie_lists.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setLists(
          lists.map((list) =>
            list.id === editingListId ? { ...list, ...payload } : list
          )
        );
        resetModal();
        alert("List updated successfully!");
      } else {
        alert(data.error || "Failed to update list");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating list");
    }
  };

  const handleDeleteList = async (listIdToDelete) => {

    try {
      const response = await fetch(
        `https://flickbox.my.id/api/movie_lists.php?id=${listIdToDelete}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (response.status == 200) {
        setLists((prevLists) =>
          prevLists.filter((list) => list.id !== listIdToDelete)
        );

        setShowOptionsMenu(null);
        setDeleteListId(null);
        resetModal();
      } else {
        console.error(result.error || "Failed to delete list");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await fetch(
          `https://flickbox.my.id/api/movie_lists.php?user_id=${currentUserId}`
        );
        const data = await res.json();
        if (res.ok) {
          setLists(data);
        } else {
          console.error(data.error || "Failed to fetch lists");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchLists();
  }, [currentUserId]);

  const resetModal = () => {
    setNewListName("");
    setNewListDescription("");
    setSelectedFilms([]);
    setSearchQuery("");
    setSearchResults([]);
    setShowCreateModal(false);
    setEditingListId(null);
  };

  const openEditModal = (list) => {
    setNewListName(list.name);
    setNewListDescription(list.description || "");
    setSelectedFilms(list.films);
    setEditingListId(list.id);
    setShowCreateModal(true);
    setShowOptionsMenu(null);
  };

  const confirmRemoveFilm = (film) => {
    setFilmToRemove(film);
    setShowRemoveConfirm(true);
  };

  const handleConfirmRemove = () => {
    handleRemoveFilm(filmToRemove.id);
    setShowRemoveConfirm(false);
    setFilmToRemove(null);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleFavorite = (film) => {
    if (favorites.some((f) => f.id === film.id)) {
      setFavorites(favorites.filter((f) => f.id !== film.id));
    } else {
      setFavorites([...favorites, film]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* HERO */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <FaFilm className="text-3xl text-blue-300" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Your Movie Collections
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Manage your favorite films and create custom lists for different
            moods and occasions.
          </p>
        </div>
      </section>

      {/* TABS */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-4 py-2 font-medium text-sm flex items-center ${
              activeTab === "favorites"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaHeart className="mr-2" /> Favorites ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab("lists")}
            className={`px-4 py-2 font-medium text-sm flex items-center ${
              activeTab === "lists"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaFolderOpen className="mr-2" /> My Lists ({lists.length})
          </button>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap justify-between">
          {activeTab === "favorites" ? (
            <div className="flex items-center mb-3 sm:mb-0">
              <span className="text-sm text-gray-300">
                Favorite Films:{" "}
                <span className="font-bold text-purple-300">
                  {favorites.length}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center mb-3 sm:mb-0">
              <span className="text-sm text-gray-300 mr-4">
                Total Lists:{" "}
                <span className="font-bold text-blue-300">{lists.length}</span>
              </span>
              <span className="text-sm text-gray-300">
                Total Films:{" "}
                <span className="font-bold text-purple-300">
                  {lists.reduce((total, list) => total + list.films.length, 0)}
                </span>
              </span>
            </div>
          )}

          <button
            onClick={() => {
              if (activeTab === "favorites") {
                setSelectedFilms(favorites);
              }
              setShowCreateModal(true);
            }}
            className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-full transition-all"
          >
            <FaPlus className="mr-2" />
            {activeTab === "favorites"
              ? "Create List from Favorites"
              : "Create New List"}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
        {activeTab === "favorites" ? (
          <div>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 ">
                {favorites.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                  >
                    <img
                      src={review.poster}
                      alt=""
                      className="w-50 h-50 object-contain"
                    />
                    <h3 className="text-lg font-semibold text-blue-300">
                      {review.movie_title}
                    </h3>
                    <p className="text-gray-400 mt-1">{review.review_text}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      Reviewed on{" "}
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-10 max-w-lg mx-auto border border-gray-700">
                  <FaHeart className="text-6xl mx-auto mb-4 text-red-400" />
                  <h3 className="text-xl font-bold text-gray-200 mb-2">
                    No Favorite Films Yet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    You haven't added any films to your favorites. Click the
                    heart icon on any film to add it here.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Existing Lists */}
            {lists.length > 0 ? (
              lists.map((list) => (
                <div
                  key={list.id}
                  className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-1 flex flex-col justify-between border border-gray-700"
                >
                  {/* Options Menu */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() =>
                        setShowOptionsMenu(
                          showOptionsMenu === list.id ? null : list.id
                        )
                      }
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
                          onClick={()=>setDeleteListId(list.id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center text-red-400"
                        >
                          <FaTrash className="mr-2" /> Delete List
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-blue-300">
                        {list.name}
                      </h3>
                      <span className="bg-blue-900/50 text-xs px-2 py-1 rounded-full">
                        {list.films.length}{" "}
                        {list.films.length === 1 ? "film" : "films"}
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
                            <li
                              key={film.id}
                              className="flex justify-between items-center py-1 border-b border-gray-800 last:border-0"
                            >
                              <span className="truncate">{film.title}</span>
                              <div className="flex items-center text-yellow-400 text-xs">
                                <FaStar className="mr-1" /> {film.rating}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center my-4">
                        <p className="text-gray-400 text-sm">
                          No films added yet
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center text-sm">
                    <div className="text-gray-500 text-xs">
                      Created: {formatDate(list.created_at)}
                    </div>
                    <Link
                      to={`/lists/${list.id}`}
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      View Details <span className="ml-1">→</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 px-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-10 max-w-lg mx-auto border border-gray-700">
                  <FaFolderOpen className="text-6xl mx-auto mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold text-gray-200 mb-2">
                    Your Lists Are Empty
                  </h3>
                  <p className="text-gray-400 mb-6">
                    You haven't created any movie lists yet. Start by creating
                    your first list to organize your favorite films.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-3 rounded-full transition-all flex items-center mx-auto"
                  >
                    <FaPlus className="mr-2" />
                    Create Your First List
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* CREATE/EDIT MODAL */}
      {showCreateModal && (
        <div
          onClick={() => {
            resetModal();
            setShowCreateModal(false);
          }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-400">
                {editingListId ? "Edit List" : "Create New List"}
              </h2>
              <button
                onClick={() => {
                  resetModal();
                  setShowCreateModal(false);
                }}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-1">
                    List Name
                  </label>
                  <input
                    type="text"
                    placeholder="My Awesome Movie List"
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your list (optional)"
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 min-h-[120px]"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-1">
                    Search Films
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute top-3 left-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search films to add..."
                      className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Search Results */}
                {searchLoading ? (
                  <div className="flex justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-blue-400" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">
                      Search Results
                    </h3>
                    <div className="max-h-48 overflow-y-auto bg-gray-800/50 rounded-lg p-2 space-y-2 border border-gray-700">
                      {searchResults.map((film) => (
                        <div
                          key={film.id}
                          className="flex justify-between items-center p-2 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-all"
                        >
                          <div className="flex items-center">
                            <img
                              src={film.poster}
                              alt={film.title}
                              className="w-12 h-16 rounded object-cover mr-3"
                            />
                            <div>
                              <div className="font-medium">{film.title}</div>
                              <div className="text-xs text-gray-400"></div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddFilm(film)}
                            className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-4 text-gray-400">
                    No films found
                  </div>
                ) : null}

                {/* Selected Films */}
                {selectedFilms.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">
                      Selected Films ({selectedFilms.length})
                    </h3>
                    <div className="max-h-48 overflow-y-auto bg-gray-800/50 rounded-lg p-2 space-y-2 border border-gray-700">
                      {selectedFilms.map((film) => (
                        <div
                          key={film.id}
                          className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg"
                        >
                          <div className="flex items-center">
                            <img
                              src={film.poster}
                              alt={film.title}
                              className="w-12 h-16 rounded object-cover mr-3"
                            />
                            <div>
                              <div className="font-medium">
                                {film.movie_title || film.title}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => confirmRemoveFilm(film)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-500/10"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  resetModal();
                  setShowCreateModal(false);
                }}
                className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingListId ? handleUpdateList : handleAddList}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all"
              >
                {editingListId ? "Save Changes" : "Create List"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Film Confirmation Modal */}
      {showRemoveConfirm && (
        <div
          onClick={() => setShowRemoveConfirm(false)}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700"
          >
            <h2 className="text-xl font-bold text-red-400 mb-4">Remove Film</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-semibold">{filmToRemove.title}</span> from
              this list?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete List Confirmation Modal */}
      {deleteListId && (
        <div
          onClick={() => setDeleteListId(null)}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700"
          >
            <h2 className="text-xl font-bold text-red-400 mb-4">Delete List</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this list? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteListId(null)}
                className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={()=>handleDeleteList(deleteListId)}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
