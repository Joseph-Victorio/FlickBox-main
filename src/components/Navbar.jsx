import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaFilm,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaUser,
  FaStar,
  FaBookmark,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef(null);

  // State untuk menyimpan username user
  const username = localStorage.getItem("username");

  // State untuk gambar profil (dapat diganti dengan URL nyata)
  const [profilePicture] = useState(
    "https://randomuser.me/api/portraits/men/1.jpg"
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Tambahkan scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl py-3 border-b border-gray-700"
          : "bg-transparent py-5"
      } `}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <DesktopNav location={location} />

          {/* Right Section */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* username User dan Profile - SELALU ditampilkan */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-500">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-full h-full flex items-center justify-center">
                        <FaUser className="text-white text-sm" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                </div>
                <span className="text-gray-200 text-sm font-medium">
                  {username}
                </span>
              </div>
              <ProfileMenu
                isLoggedIn={isLoggedIn}
                isProfileOpen={isProfileOpen}
                setIsProfileOpen={setIsProfileOpen}
                handleLogout={handleLogout}
                profileRef={profileRef}
                userName={username}
                profilePicture={profilePicture}
              />
            </div>

            {/* Mobile Toggle */}
            <MobileToggle
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <MobileMenu
            isLoggedIn={isLoggedIn}
            handleLogout={handleLogout}
            setIsMenuOpen={setIsMenuOpen}
            userName={username}
            profilePicture={profilePicture}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}

const Logo = () => (
  <div className="flex-shrink-0 mr-6 sm:mr-12">
    <Link to="/" className="flex items-center group">
      <motion.div whileHover={{ rotate: 15 }} className="mr-3">
        <FaFilm className="text-gray-100 text-2xl group-hover:text-blue-400 transition-colors" />
      </motion.div>
      <span className="text-gray-100 text-xl font-bold tracking-tighter group-hover:text-blue-400 transition-colors">
        FLICK<span className="text-blue-400">BOX</span>
      </span>
    </Link>
  </div>
);

const DesktopNav = ({ location }) => {
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/films", label: "Films" },
    { path: "/reviews", label: "Reviews" },
    { path: "/lists", label: "Lists" },
    { path: "/upcoming", label: "Upcoming" },
  ];

  return (
    <div className="hidden lg:flex items-center gap-8">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`px-3 py-2 text-gray-200 hover:text-white transition-colors text-sm font-medium relative group ${
            location.pathname === item.path ? "text-white" : ""
          }`}
        >
          {item.label}
          <motion.span
            className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 ${
              location.pathname === item.path
                ? ""
                : "scale-x-0 group-hover:scale-x-100"
            } transition-transform`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: location.pathname === item.path ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </Link>
      ))}
    </div>
  );
};

const ProfileMenu = ({
  isLoggedIn,
  isProfileOpen,
  setIsProfileOpen,
  handleLogout,
  profileRef,
  profilePicture,
}) => {
  const username = localStorage.getItem('username')
  const email = localStorage.getItem('email')
  return (
    <div className="flex items-center relative" ref={profileRef}>
      <button
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="flex items-center space-x-2 focus:outline-none group"
      >
        <FaChevronDown
          className={`text-gray-400 text-xs transition-transform ${
            isProfileOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            className="absolute right-0 top-full mt-3 w-56 bg-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-700 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isLoggedIn ? (
              <>
                <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-full h-full flex items-center justify-center">
                        <FaUser className="text-white text-sm" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{username}</p>
                  </div>
                </div>

                <div className="py-2">
                  <DropdownLink to="/profile" icon={<FaUser />}>
                    My Profile
                  </DropdownLink>
                  <DropdownLink to="/watchlist" icon={<FaBookmark />}>
                    Watchlist
                  </DropdownLink>
                  <DropdownLink to="/reviews" icon={<FaStar />}>
                    My Reviews
                  </DropdownLink>
                  <DropdownLink to="/settings" icon={<FaCog />}>
                    Settings
                  </DropdownLink>
                </div>

                <div className="px-4 pt-2 pb-3 border-t border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm rounded-md"
                  >
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <DropdownLink to="/login">Login</DropdownLink>
                <DropdownLink to="/register">Register</DropdownLink>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileToggle = ({ isMenuOpen, setIsMenuOpen }) => (
  <button
    onClick={() => setIsMenuOpen(!isMenuOpen)}
    className="md:hidden text-gray-400 hover:text-white focus:outline-none p-2"
    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
  >
    {isMenuOpen ? (
      <FaTimes className="h-6 w-6" />
    ) : (
      <FaBars className="h-6 w-6" />
    )}
  </button>
);

const MobileMenu = ({
  isLoggedIn,
  handleLogout,
  setIsMenuOpen,
  userName,
  profilePicture,
}) => {
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/films", label: "Films" },
    { path: "/reviews", label: "Reviews" },
    { path: "/lists", label: "Lists" },
    { path: "/upcoming", label: "Upcoming" },
  ];

  return (
    <motion.div
      className="md:hidden bg-gray-900 bg-opacity-95 pb-6"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-5 pt-4 space-y-4">
        {/* username User di Mobile */}
        {isLoggedIn && (
          <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-full h-full flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
              )}
            </div>
            <p className="text-white font-medium">{userName}</p>
          </div>
        )}

        <div className="space-y-1">
          {navItems.map((item) => (
            <MobileNavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </MobileNavLink>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-700 space-y-3">
          {isLoggedIn ? (
            <>
              <MobileNavLink
                to="/profile"
                icon={<FaUser />}
                onClick={() => setIsMenuOpen(false)}
              >
                My Profile
              </MobileNavLink>
              <MobileNavLink
                to="/watchlist"
                icon={<FaBookmark />}
                onClick={() => setIsMenuOpen(false)}
              >
                Watchlist
              </MobileNavLink>
              <MobileNavLink
                to="/settings"
                icon={<FaCog />}
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </MobileNavLink>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors text-base"
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </>
          ) : (
            <>
              <MobileNavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                Login
              </MobileNavLink>
              <MobileNavLink
                to="/register"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </MobileNavLink>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MobileNavLink = ({ to, children, onClick, icon }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors text-base"
  >
    {icon && <span className="text-blue-400">{icon}</span>}
    {children}
  </Link>
);

const DropdownLink = ({ to, children, icon }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm"
  >
    {icon && <span className="text-blue-400">{icon}</span>}
    {children}
  </Link>
);
