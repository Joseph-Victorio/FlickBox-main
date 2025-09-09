import { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaTrash, FaSearch, FaArrowLeft, FaComment, } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ModerasiReview = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const APP_BASE_URL = "https://flickbox.my.id/api";

  const navigate = useNavigate()
  fetch(`${APP_BASE_URL}/moderasi_review.php`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success && Array.isArray(data.data)) {
        setReviews(data.data);
      } else {
        setReviews([]);
      }
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching reviews:", err);
      setLoading(false);
    });

  const handleApprove = (id) => {
    fetch(`${APP_BASE_URL}/moderasi_review.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "approved" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews((r) =>
            r.map((rv) => (rv.id === id ? { ...rv, status: "approved" } : rv))
          );
        }
      });
  };

  const handleReject = (id) => {
    fetch(`${APP_BASE_URL}/moderasi_review.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "rejected" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews((r) =>
            r.map((rv) => (rv.id === id ? { ...rv, status: "rejected" } : rv))
          );
        }
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Yakin ingin menghapus review ini?")) return;

    fetch(`${APP_BASE_URL}/moderasi_review.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews((r) => r.filter((rv) => rv.id !== id));
        }
      });
  };

  const filtered = Array.isArray(reviews)
    ? reviews.filter((rv) => {
        const username = (rv.username || "").toLowerCase();
        const movieTitle = (rv.movie_title || "").toLowerCase();
        const reviewText = (rv.review_text || "").toLowerCase();
        const search = searchTerm.toLowerCase();

        return (
          username.includes(search) ||
          movieTitle.includes(search) ||
          reviewText.includes(search)
        );
      })
    : [];

  const getStatusBadge = (status) => {
    const color =
      {
        approved: "bg-green-600",
        rejected: "bg-red-600",
        pending: "bg-yellow-600",
      }[status] || "bg-gray-500";

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white">
    <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center text-blue-400 hover:text-blue-300"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </button>
            <h1 className="md:text-3xl font-bold flex items-center">
              <FaComment className="mr-3 text-blue-400" />
              Moderasi Review
            </h1>
          </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-wide">Moderasi Review</h1>
        <div className="flex items-center bg-gray-700/70 border border-gray-600 rounded-lg px-3 py-2 shadow-sm">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan user, film, atau isi..."
            className="ml-2 bg-transparent outline-none text-sm placeholder-gray-400 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 mt-8 text-center">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 mt-8 text-center">
          Tidak ada review ditemukan.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((review) => (
            <div
              key={review.id}
              className="bg-gray-800/70 p-5 rounded-xl border border-gray-700 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <p>
                    <span className="font-semibold">{review.username}</span>{" "}
                    menulis tentang{" "}
                    <span className="italic">"{review.movie_title}"</span>
                  </p>
                  <p className="mt-2 text-gray-300">"{review.review_text}"</p>
                  <div className="mt-2">{getStatusBadge(review.status)}</div>
                </div>

                <div className="flex space-x-2 mt-3 md:mt-0">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-sm rounded-md transition"
                    >
                      <FaCheck />{" "}
                      <span className="hidden sm:inline">Approve</span>
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(review.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-sm rounded-md transition"
                    >
                      <FaTimes />{" "}
                      <span className="hidden sm:inline">Reject</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-sm rounded-md transition"
                  >
                    <FaTrash /> <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerasiReview;
