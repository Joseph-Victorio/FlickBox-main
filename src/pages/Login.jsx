import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    fetch("http://flickbox.test/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("username", data.username);
          localStorage.setItem("user_id", data.user_id);
          navigate(data.role === "admin" ? "/admin" : "/");
        } else {
          // alert(data.message);
          setError(data.message);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError("Server error. Please try again.");
        setIsLoading(false);
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    if (!recoveryEmail) {
      setError("Please enter your email");
      return;
    }

    // Simulate sending recovery code
    setIsLoading(true);
    setTimeout(() => {
      setRecoverySent(true);
      setIsLoading(false);
      setError("");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto bg-gradient-to-r from-blue-600 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <div className="bg-blue-900 rounded-full p-3">
              <FaUser className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome to FlickBox</h1>
          <p className="text-blue-200 mt-2">Sign in to continue</p>
        </div>

        {/* Recovery Password Form */}
        {showRecovery ? (
          <div className="bg-blue-900/30 backdrop-blur-lg rounded-2xl border border-blue-700 shadow-xl p-8">
            <button
              onClick={() => setShowRecovery(false)}
              className="flex items-center text-blue-300 hover:text-blue-100 mb-6"
            >
              <FaArrowLeft className="mr-2" /> Back to Login
            </button>

            <h2 className="text-xl font-bold text-white mb-6">
              Reset Password
            </h2>

            <form onSubmit={handleRecoverySubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {recoverySent ? (
                <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg">
                  Recovery code has been sent to your email. Please check your
                  inbox.
                </div>
              ) : (
                <>
                  <p className="text-blue-200">
                    Enter your email and we'll send you a code to reset your
                    password.
                  </p>

                  <div>
                    <label className="block text-blue-200 mb-2 text-sm font-medium">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-blue-400" />
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-blue-800/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-semibold transition-all ${
                      isLoading
                        ? "bg-blue-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      "Send Code"
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        ) : (
          /* Login Form */
          <div className="bg-blue-900/30 backdrop-blur-lg rounded-2xl border border-blue-700 shadow-xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-blue-200 mb-2 text-sm font-medium">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-blue-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-blue-800/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 mb-2 text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-blue-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-blue-800/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-blue-200"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-blue-600 rounded bg-blue-800/50"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-blue-200"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecovery(true)}
                  className="text-sm text-blue-300 hover:text-blue-100"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-semibold transition-all ${
                  isLoading
                    ? "bg-blue-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-blue-200">
              Don't have an account? {/* Replace button with Link */}
              <Link
                to="/register"
                className="text-blue-300 hover:text-blue-100 font-medium"
              >
                Sign up now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
