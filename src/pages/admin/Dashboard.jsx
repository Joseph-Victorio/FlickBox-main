import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaFilm,
  FaUser,
  FaComment,
  FaStar,
  FaChartBar,
  FaEllipsisH,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";

const API_BASE_URL = "https://flickbox.my.id/api";

const DashboardAdmin = () => {
  const [stats, setStats] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("films");
  const [recentActivity, setRecentActivity] = useState([]);

  const username = localStorage.getItem("username");

 const safeJson = (res) =>
  res.text().then((text) => {
    try {
      return JSON.parse(text);
    } catch {
      console.error("Invalid JSON from endpoint:", text);
      return []; 
    }
  });

useEffect(() => {
  Promise.all([
    fetch(`${API_BASE_URL}/get_total_users.php`).then(safeJson),
    fetch(`${API_BASE_URL}/get_total_reviews.php`).then(safeJson),
    fetch(`${API_BASE_URL}/get_total_films.php`).then(safeJson),
    fetch(`${API_BASE_URL}/get_recent_films.php`).then(safeJson),
    fetch(`${API_BASE_URL}/reviews.php`).then(safeJson),
  ])
    .then(([usersData, reviewsData, filmsData, recentFilmsData, reviewsList]) => {
      const activity = (reviewsList || []).map((review) => ({
        name: review.reviewer,
        action: "posted review",
        film: review.movie_title,
        rating: review.rating,
        time: new Date(review.created_at).toLocaleString(),
      }));

      setStats({
        totalUsers: usersData.totalUsers || 0,
        totalFilms: 620000 + (filmsData.totalFilms || 0),
        totalReviews: reviewsData.totalReviews || 0,
        recentFilms: recentFilmsData.recentFilms || [],
        userActivity: activity,
      });
    })
    .catch((err) => console.error(err));
}, []);


  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-800 bg-opacity-80 backdrop-blur-md border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold flex items-center">
              <FaChartBar className="mr-2 text-blue-400" />
              FilmReview Dashboard
            </h1>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2"
              >
                <div className="bg-gray-600 w-9 h-9 rounded-full flex items-center justify-center">
                  <FaUser />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{username}</p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <p className="font-medium">{username}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/admin/settings"
                      className="flex items-center px-4 py-2 hover:bg-gray-750 text-sm"
                    >
                      <FaCog className="mr-3 text-gray-400" />
                      Settings
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center px-4 py-2 hover:bg-gray-750 text-sm"
                    >
                      <FaSignOutAlt className="mr-3 text-gray-400" />
                      Logout
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <p className="text-gray-400">
              Welcome back, here's what's happening today
            </p>
          </div>
          {/* Tombol Add New Film dihapus */}
        </div>

        {/* Quick Stats - sekarang hanya 3 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<FaFilm className="text-2xl" />}
            title="Total Films"
            value={stats.totalFilms}
            color="text-blue-400"
            bgColor="bg-blue-900/30"
          />
          <StatCard
            icon={<FaUser className="text-2xl" />}
            title="Total Users"
            value={stats.totalUsers}
            color="text-green-400"
            bgColor="bg-green-900/30"
          />
          <StatCard
            icon={<FaComment className="text-2xl" />}
            title="Total Reviews"
            value={stats.totalReviews}
            color="text-purple-400"
            bgColor="bg-purple-900/30"
          />
        </div>

        {/* Data Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Film Submissions */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Film Submissions</h2>
              <button className="text-gray-400 hover:text-white">
                <FaEllipsisH />
              </button>
            </div>
            <div className="space-y-4">
              {stats.recentFilms.map((film, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-750/50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center mt-1 gap-2">
                      <img
                        src={film.poster_path}
                        alt=""
                        className="w-15 h-20"
                      />
                      <h3 className="font-medium">{film.name}</h3>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      film.status === "approved"
                        ? "bg-green-900/50 text-green-400"
                        : film.status === "pending"
                        ? "bg-yellow-900/50 text-yellow-400"
                        : "bg-red-900/50 text-red-400"
                    }`}
                  >
                    {film.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">User Distribution</h2>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${
                    activeTab === "films"
                      ? "bg-blue-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => setActiveTab("films")}
                >
                  By Films
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${
                    activeTab === "activity"
                      ? "bg-blue-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => setActiveTab("activity")}
                >
                  Activity
                </button>
              </div>
            </div>

            {activeTab === "films" ? (
              <div className="space-y-4">
                <DistributionItem
                  title="Active Reviewers"
                  value={stats.totalReviews}
                  total={35}
                  color="bg-blue-500"
                />
                <DistributionItem
                  title="Occasional Users"
                  value={stats.totalUsers}
                  total={20}
                  color="bg-purple-500"
                />
                <DistributionItem
                  title="New Users"
                  value={stats.totalUsers}
                  total={stats.totalUsers}
                  color="bg-green-500"
                />
                {/* <DistributionItem
                  title="Inactive Users"
                  value={46}
                  total={100}
                  color="bg-gray-500"
                /> */}
              </div>
            ) : (
              <div className="space-y-4">
                {stats.userActivity.map((activity, index) => (
                  <div key={index} className="p-3 bg-gray-750/50 rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-400">
                        {activity.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                    <p className="mt-1">
                      {activity.action}{" "}
                      {activity.film && (
                        <span className="text-purple-400">
                          "{activity.film}"
                        </span>
                      )}
                      {activity.rating && (
                        <span className="ml-1">
                          with rating:{" "}
                          <span className="text-yellow-400">
                            {activity.rating}/5
                          </span>
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdminNavCard
              title="Kelola Data Film"
              to="/admin/kelola-film"
              description="Manage film database"
              icon={<FaFilm />}
              iconColor="text-blue-400"
            />
            <AdminNavCard
              title="Moderasi Review"
              to="/admin/moderasi-review"
              description="Approve or reject user reviews"
              icon={<FaComment />}
              iconColor="text-purple-400"
            />
            <AdminNavCard
              title="Kelola User"
              to="/admin/kelola-user"
              description="Manage user accounts"
              icon={<FaUser />}
              iconColor="text-green-400"
            />
          </div>
        </div>

        {/* Recent Activity Section */}
        {/* <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 rounded-xl bg-gray-750/50">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{activity.title}</h3>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
                <p className="text-gray-400 mt-1">{activity.message}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/admin/activity-log"
              className="text-blue-400 hover:text-blue-300"
            >
              View all activity →
            </Link>
          </div>
        </div> */}
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-gray-500 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} FilmReview Admin Dashboard • v2.1.0
      </footer>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, growth, color, bgColor }) => (
  <div
    className={`p-5 rounded-2xl border border-gray-700 shadow-lg ${bgColor}`}
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl bg-black/20 ${color}`}>{icon}</div>
      <button className="text-gray-400 hover:text-white">
        <FaEllipsisH />
      </button>
    </div>
    <div className="mt-4">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-sm mt-2 flex items-center">
        {growth && (
          <>
            <span
              className={`${
                growth.startsWith("+") ? "text-green-400" : "text-red-400"
              } flex items-center`}
            >
              {growth.startsWith("+") ? (
                <FaChevronUp size={12} className="mr-1" />
              ) : (
                <FaChevronDown size={12} className="mr-1" />
              )}
              {growth}
            </span>
            <span className="text-gray-500 ml-2">from last week</span>
          </>
        )}
      </p>
    </div>
  </div>
);

// Admin Navigation Card Component
const AdminNavCard = ({ title, to, description, icon, iconColor }) => (
  <Link to={to}>
    <div className="group bg-gray-800/50 hover:bg-gray-750 p-6 rounded-2xl border border-gray-700 shadow-lg transition-all duration-300">
      <div className="flex items-start">
        <div
          className={`p-3 rounded-xl bg-black/20 group-hover:bg-blue-900/30 transition-colors ${iconColor}`}
        >
          {icon}
        </div>
        <div className="ml-4">
          <h2 className="text-lg font-bold group-hover:text-blue-400 transition-colors">
            {title}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <span className="text-xs px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full">
          Manage →
        </span>
      </div>
    </div>
  </Link>
);

// Distribution Item Component
const DistributionItem = ({ title, value, total, color }) => {
  const percentage = Math.round((value / total) * 100);

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-300">{title}</span>
        <span className="text-gray-400">
          {value} users ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
