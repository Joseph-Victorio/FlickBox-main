// src/pages/admin/ManageFilms.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFilm,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaFilter,
  FaArrowLeft,
  FaSync,
  FaTimes,
  FaYoutube,
  FaCalendarAlt,
  FaList,
  FaImage,
  FaVideo,
} from "react-icons/fa";

const API_KEY = "8f74ba3476a16e78682cadadd1456462";
const APP_BASE_URL = "https://flickbox.my.id/api";
const ManageFilms = () => {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [filteredFilms, setFilteredFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filmsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [editingFilm, setEditingFilm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [allGenres, setAllGenres] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Initialize new film data structure
  const initialFilmData = {
    title: "",
    release_date: "",
    overview: "",
    status: "pending",
    poster_path: "",
    trailer_url: "",
    genre_ids: [],
    vote_average: 0,
    popularity: 0,
  };

  const [newFilmData, setNewFilmData] = useState({ ...initialFilmData });

  
  useEffect(() => {
    fetch(`${APP_BASE_URL}/films.php`)
      .then((res) => res.json())
      .then((data) => setFilms(data))
      .catch((err) => console.error(err));
  }, []);
 
  const fetchFilms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${APP_BASE_URL}/films.php`);
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Invalid data format:", data);
        setFilms([]);
        setFilteredFilms([]);
        return;
      }

      const genreResponse = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
      );
      const genreData = await genreResponse.json();
      setAllGenres(genreData.genres);

      const filmsWithStatus = data.map((film) => ({
        ...film,
        status: film.status || "pending", 
        trailer_url: film.trailer_url || null, 
      }));

      setFilms(filmsWithStatus);
      setFilteredFilms(filmsWithStatus);
    } catch (error) {
      console.error("Error fetching films:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, [currentPage]);

  // Apply filters
  useEffect(() => {
    let result = [...films];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((film) =>
        film.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((film) => film.status === statusFilter);
    }

    // Apply year filter
    if (yearFilter) {
      result = result.filter(
        (film) => film.release_date && film.release_date.startsWith(yearFilter)
      );
    }

    setFilteredFilms(result);
  }, [films, searchTerm, statusFilter, yearFilter]);

  // Handle status change
  const handleStatusChange = (id, status) => {
    const updatedFilms = films.map((film) =>
      film.id === id ? { ...film, status } : film
    );
    setFilms(updatedFilms);

    fetch(`${APP_BASE_URL}/films.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Status updated:", data);
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        setFilms(films);
      });
  };

  // Handle film deletion
  const handleDeleteFilm = (id) => {
    if (!window.confirm("Are you sure you want to delete this film?")) return;
    fetch(`${APP_BASE_URL}/films.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${id}`,
    })
      .then((res) => res.json())
      .then(() => {
        setFilms(films.filter((f) => f.id !== id));
      });
  };

  // Validate film form
  const validateForm = (filmData) => {
    const errors = {};

    if (!filmData.title.trim()) errors.title = "Title is required";
    if (!filmData.release_date)
      errors.release_date = "Release date is required";
    if (!filmData.poster_path) errors.poster_path = "Poster URL is required";
    if (!filmData.genre_ids.length)
      errors.genre_ids = "At least one genre is required";

    return errors;
  };

  // Handle adding new film
  const handleAddFilm = () => {
    const errors = validateForm(newFilmData);
      setFormErrors(errors);
     if (Object.keys(errors).length > 0) return;

    fetch(`${APP_BASE_URL}/films.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newFilmData,
        genre_ids: Array.isArray(newFilmData.genre_ids)
          ? newFilmData.genre_ids
          : [newFilmData.genre_ids],
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewFilmData({ ...initialFilmData });
        setShowFormModal(false);
        setFormErrors({});
        return fetch(`${APP_BASE_URL}/films.php`).then((res) => res.json());
      })
      .then((data) => setFilms(data));
  };

  // Handle editing film
  const handleEditFilm = () => {
    const errors = validateForm(editingFilm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    fetch(`${APP_BASE_URL}/films.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editingFilm,
        genre_ids: Array.isArray(editingFilm.genre_ids)
          ? editingFilm.genre_ids
          : [editingFilm.genre_ids],
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setEditingFilm(null);
        setShowFormModal(false);
        setFormErrors({});
        return fetch(`${APP_BASE_URL}/films.php`).then((res) => res.json());
      })
      .then((data) => setFilms(data));
  };

  // Open form for adding new film
  const openAddFilmForm = () => {
    setNewFilmData({ ...initialFilmData });
    setEditingFilm(null);
    setShowFormModal(true);
    setFormErrors({});
  };

  // Open form for editing film
  const openEditFilmForm = (film) => {
    setEditingFilm(film);
    setNewFilmData({ ...initialFilmData });
    setShowFormModal(true);
    setFormErrors({});
  };

  // Close form modal
  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingFilm(null);
    setFormErrors({});
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (editingFilm) {
      setEditingFilm({ ...editingFilm, [name]: value });
    } else {
      setNewFilmData({ ...newFilmData, [name]: value });
    }
  };

  // Handle genre selection
  const handleGenreChange = (genreId) => {
    const currentFilm = editingFilm || newFilmData;
    const currentGenres = [...currentFilm.genre_ids];
    const index = currentGenres.indexOf(genreId);

    if (index > -1) {
      currentGenres.splice(index, 1);
    } else {
      currentGenres.push(genreId);
    }

    if (editingFilm) {
      setEditingFilm({ ...editingFilm, genre_ids: currentGenres });
    } else {
      setNewFilmData({ ...newFilmData, genre_ids: currentGenres });
    }
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (url) => {
    if (!url) return "";
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[7].length === 11 ? match[7] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : "";
  };

  // Pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredFilms.length / filmsPerPage);
  const currentFilms = filteredFilms.slice(
    (currentPage - 1) * filmsPerPage,
    currentPage * filmsPerPage
  );

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get genre names by IDs
  const getGenreNames = (genreIds) => {
    if (!Array.isArray(genreIds)) return "";
    return genreIds
      .map((id) => {
        const genre = allGenres.find((g) => g.id === id);
        return genre ? genre.name : "Unknown";
      })
      .join(", ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center text-blue-400 hover:text-blue-300"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold flex items-center">
            <FaFilm className="mr-3 text-blue-400" />
            Film Management
          </h1>
          <button
            onClick={fetchFilms}
            className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            <FaSync className="mr-2" /> Refresh
          </button>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
                  <FaSearch className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search films..."
                    className="ml-2 bg-transparent outline-none w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="ml-3 flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
              >
                <FaFilter className="mr-2" />
                Filters{" "}
                {showFilters ? (
                  <FaChevronUp className="ml-2" />
                ) : (
                  <FaChevronDown className="ml-2" />
                )}
              </button>
            </div>

            <button
              onClick={openAddFilmForm}
              className="flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg w-full md:w-auto mt-4 md:mt-0 justify-center"
            >
              <FaPlus className="mr-2" /> Add New Film
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">Status</label>
                <select
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Release Year</label>
                <input
                  type="number"
                  placeholder="Enter year"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  min="1900"
                  max="2100"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">
                  Results: {filteredFilms.length}
                </label>
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setYearFilter("");
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Film Form Modal */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingFilm ? "Edit Film" : "Add New Film"}
                </h2>
                <button
                  onClick={closeFormModal}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div>
                    {/* Basic Info */}
                    <div className="mb-6">
                      <h3 className="flex items-center text-lg font-semibold mb-4 pb-2 border-b border-gray-700">
                        <FaFilm className="mr-2 text-blue-400" />
                        Film Information
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 mb-2">
                            Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                            value={editingFilm?.title || newFilmData.title}
                            onChange={handleInputChange}
                            placeholder="Enter film title"
                          />
                          {formErrors.title && (
                            <p className="text-red-400 text-sm mt-1">
                              {formErrors.title}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-400 mb-2">
                            Release Date *
                          </label>
                          <input
                            type="date"
                            name="release_date"
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                            value={
                              editingFilm?.release_date ||
                              newFilmData.release_date
                            }
                            onChange={handleInputChange}
                          />
                          {formErrors.release_date && (
                            <p className="text-red-400 text-sm mt-1">
                              {formErrors.release_date}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-400 mb-2">
                            Overview
                          </label>
                          <textarea
                            name="overview"
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg min-h-[120px]"
                            value={
                              editingFilm?.overview || newFilmData.overview
                            }
                            onChange={handleInputChange}
                            placeholder="Enter film description"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Media */}
                    <div className="mb-6">
                      <h3 className="flex items-center text-lg font-semibold mb-4 pb-2 border-b border-gray-700">
                        <FaVideo className="mr-2 text-blue-400" />
                        Media
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 mb-2">
                            Poster URL *
                          </label>
                          <input
                            type="text"
                            name="poster_path"
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                            value={
                              editingFilm?.poster_path ||
                              newFilmData.poster_path
                            }
                            onChange={handleInputChange}
                            placeholder="https://image.tmdb.org/t/p/w500/..."
                          />
                          {formErrors.poster_path && (
                            <p className="text-red-400 text-sm mt-1">
                              {formErrors.poster_path}
                            </p>
                          )}

                          {(editingFilm?.poster_path ||
                            newFilmData.poster_path) && (
                            <div className="mt-3 w-32 h-48 bg-gray-700 rounded-lg overflow-hidden">
                              <img
                                src={
                                  editingFilm?.poster_path ||
                                  newFilmData.poster_path
                                }
                                alt="Poster preview"
                                className="w-full h-full object-cover"
                                onError={(e) =>
                                  (e.target.src =
                                    "https://via.placeholder.com/300x450?text=No+Image")
                                }
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-400 mb-2">
                            Trailer URL (YouTube)
                          </label>
                          <input
                            type="text"
                            name="trailer_url"
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                            value={
                              editingFilm?.trailer_url ||
                              newFilmData.trailer_url
                            }
                            onChange={handleInputChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                          />

                          {editingFilm?.trailer_url ||
                          newFilmData.trailer_url ? (
                            <div className="mt-3">
                              <a
                                href={
                                  editingFilm?.trailer_url ||
                                  newFilmData.trailer_url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-400 hover:text-blue-300"
                              >
                                <FaYoutube className="mr-2 text-red-500" />
                                Watch Trailer
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    {/* Genres */}
                    <div className="mb-6">
                      <h3 className="flex items-center text-lg font-semibold mb-4 pb-2 border-b border-gray-700">
                        <FaList className="mr-2 text-blue-400" />
                        Genres *
                      </h3>

                      {formErrors.genre_ids && (
                        <p className="text-red-400 text-sm mb-2">
                          {formErrors.genre_ids}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {allGenres.map((genre) => (
                          <div key={genre.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`genre-${genre.id}`}
                              checked={(
                                editingFilm?.genre_ids ||
                                newFilmData.genre_ids ||
                                []
                              ).includes(genre.id)}
                              onChange={() => handleGenreChange(genre.id)}
                              className="mr-2 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`genre-${genre.id}`}
                              className="text-gray-300"
                            >
                              {genre.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mb-6">
                      <h3 className="flex items-center text-lg font-semibold mb-4 pb-2 border-b border-gray-700">
                        <FaFilter className="mr-2 text-blue-400" />
                        Status
                      </h3>

                      <div>
                        <select
                          name="status"
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                          value={editingFilm?.status || newFilmData.status}
                          onChange={handleInputChange}
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closeFormModal}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingFilm ? handleEditFilm : handleAddFilm}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    {editingFilm ? "Update Film" : "Add Film"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Film Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-750">
                <tr>
                  <th className="p-4 text-left">Film</th>
                  <th className="p-4 text-left">Release Date</th>
                  <th className="p-4 text-left">Genres</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentFilms.length > 0 ? (
                  currentFilms.map((film) => (
                    <tr
                      key={film.id}
                      className="border-b border-gray-700 hover:bg-gray-750/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          {film.poster_path ? (
                            <img
                              src={`${film.poster_path}`}
                              alt={film.title}
                              className="w-12 h-16 object-cover rounded mr-3"
                              onError={(e) =>
                                (e.target.src =
                                  "https://via.placeholder.com/92x138?text=No+Image")
                              }
                            />
                          ) : (
                            <div className="bg-gray-700 border border-gray-600 w-12 h-16 rounded mr-3 flex items-center justify-center">
                              <FaFilm className="text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{film.title}</div>
                            <div className="text-sm text-gray-400">
                              {film.trailer_url && (
                                <a
                                  href={`${film.trailer_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block mt-1 group relative"
                                >
                                  <div className="flex items-center text-blue-400 hover:text-blue-300">
                                    <FaYoutube className="mr-1 text-red-500" />
                                    <span>Watch Trailer</span>
                                  </div>
                                  {/* Trailer preview on hover */}
                                  <div className="hidden group-hover:block absolute z-50 mt-2 w-56 h-32 bg-black border border-gray-600 rounded-lg overflow-hidden shadow-xl">
                                    <img
                                      src={getYouTubeThumbnail(
                                        film.trailer_url ||
                                          "/placeholder-poster.jpg"
                                      )}
                                      alt="Trailer preview"
                                      className="w-full h-full object-cover"
                                      onError={(e) =>
                                        (e.target.parentElement.style.display =
                                          "none")
                                      }
                                    />
                                  </div>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{formatDate(film.release_date)}</td>
                      <td className="p-4">
                        <div className="text-sm max-w-xs">
                          {getGenreNames(film.genre_ids)}
                        </div>
                      </td>

                      <td className="p-4">
                        <select
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            film.status === "approved"
                              ? "bg-green-900/50 text-green-400"
                              : film.status === "pending"
                              ? "bg-yellow-900/50 text-yellow-400"
                              : "bg-red-900/50 text-red-400"
                          }`}
                          value={film.status}
                          onChange={(e) =>
                            handleStatusChange(film.id, e.target.value)
                          }
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditFilmForm(film)}
                            className="p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg text-blue-400"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteFilm(film.id)}
                            className="p-2 bg-red-900/30 hover:bg-red-900/50 rounded-lg text-red-400"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      <div className="text-4xl mb-4">🎬</div>
                      <h3 className="text-xl font-semibold mb-2">
                        No films found
                      </h3>
                      <p>Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {"<"}
              </button>

              {/* Always show first page */}
              <button
                key={1}
                className={`w-10 h-10 rounded-lg transition-colors ${
                  currentPage === 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
                onClick={() => paginate(1)}
              >
                1
              </button>

              {/* Show ellipsis if needed */}
              {currentPage > 3 && totalPages > 3 && (
                <span className="px-2 text-gray-400">...</span>
              )}

              {/* Middle pages */}
              {Array.from({ length: Math.min(5, totalPages - 2) }).map(
                (_, idx) => {
                  let pageNum;
                  if (currentPage <= 3) {
                    pageNum = idx + 2;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = currentPage - 2 + idx;
                  }

                  // Only show pages between 2 and totalPages-1
                  if (pageNum > 1 && pageNum < totalPages) {
                    return (
                      <button
                        key={pageNum}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-white"
                        }`}
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                }
              )}

              {/* Show ellipsis if needed */}
              {currentPage < totalPages - 2 && totalPages > 3 && (
                <span className="px-2 text-gray-400">...</span>
              )}

              {totalPages > 1 && (
                <button
                  key={totalPages}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                  onClick={() => paginate(totalPages)}
                >
                  {totalPages}
                </button>
              )}

              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {">"}
              </button>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-900/30 text-green-400 mr-4">
                <FaFilm />
              </div>
              <div>
                <h3 className="text-lg font-bold">Total Films</h3>
                <p className="text-3xl font-bold mt-1">{films.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-900/30 text-blue-400 mr-4">
                <FaStar />
              </div>
              <div>
                <h3 className="text-lg font-bold">Approved Films</h3>
                <p className="text-3xl font-bold mt-1">
                  {films.filter((f) => f.status === "approved").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-yellow-900/30 text-yellow-400 mr-4">
                <FaFilter />
              </div>
              <div>
                <h3 className="text-lg font-bold">Pending Approval</h3>
                <p className="text-3xl font-bold mt-1">
                  {films.filter((f) => f.status === "pending").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageFilms;
