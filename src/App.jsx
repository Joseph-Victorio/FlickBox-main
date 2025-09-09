import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// User Pages
import Home from "./pages/user/Home";
import Films from "./pages/user/Films";
import Reviews from "./pages/user/Reviews";
import Lists from "./pages/user/Lists";
import ListDetail from "./pages/user/ListDetail";
import Profile from "./pages/user/Profile";
import FilmDetail from "./components/FilmDetail";
import Upcoming from "./pages/user/Upcoming";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import ManageReview from "./pages/admin/ManageReviews";
import ManageFilms from "./pages/admin/ManageFilms";
import ManageUsers from "./pages/admin/ManageUsers";

// Public Pages
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";

function AppContent() {
  const location = useLocation();

  // Define routes where navbar should be hidden
  const hideNavbarRoutes = ["/login", "/register", "/admin", "/unauthorized"];

  // Check if current route should hide navbar
  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {!shouldHideNavbar && <Navbar />}

      <div className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/" element={<Home />} />

          {/* User Routes */}
          {/* <Route
            path="/"
            element={
              <ProtectedRoute requiredRole="user">
                <Home />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/films" element={<Films />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute requiredRole="user">
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lists"
            element={
              <ProtectedRoute requiredRole="user">
                <Lists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lists/:id"
            element={
              <ProtectedRoute requiredRole="user">
                <ListDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="user">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Film Detail Route - Updated */}
          <Route
            path="/film/:id"
            element={
              <ProtectedRoute requiredRole="user">
                <FilmDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/moderasi-review"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kelola-film"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageFilms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kelola-user"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-md">
                  <div className="text-9xl font-bold text-blue-500 mb-4">
                    404
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
                  <p className="text-gray-400 mb-6">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                  <a
                    href="/"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    Return Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
