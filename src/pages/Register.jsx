import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBirthdayCake,
} from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    age: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.username ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.age
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (isNaN(formData.age) || parseInt(formData.age) < 20) {
      setError("You must be at least 20 years old");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("https://flickbox.my.id/api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.status === "success") {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Server error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto bg-gradient-to-r from-blue-600 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <div className="bg-blue-900 rounded-full p-3">
              <FaUser className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Create Your Account</h1>
          <p className="text-blue-200 mt-2">Join our film community today</p>
        </div>

        {success ? (
          <div className="bg-blue-900/30 backdrop-blur-lg rounded-2xl border border-blue-700 shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Registration Successful!
              </h2>
              <p className="text-blue-200">
                Your account has been created successfully. Redirecting to
                login...
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-900/30 backdrop-blur-lg rounded-2xl border border-blue-700 shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-blue-200 mb-2 text-sm font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-blue-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your full name"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-blue-800/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-200 mb-2 text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-blue-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-blue-800/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-200 mb-2 text-sm font-medium">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-blue-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
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
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
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

              <div>
                <label className="block text-blue-200 mb-2 text-sm font-medium">
                  Age
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBirthdayCake className="text-blue-400" />
                  </div>
                  <input
                    type="number"
                    name="age"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={handleChange}
                    min="13"
                    max="120"
                    className="w-full pl-10 pr-4 py-3 bg-blue-800/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-blue-600 rounded bg-blue-800/50"
                  required
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-blue-200"
                >
                  I agree to the{" "}
                  <a href="#" className="text-blue-300 hover:text-blue-100">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-300 hover:text-blue-100">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-semibold transition-all mt-4 ${
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
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-blue-200">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-300 hover:text-blue-100 font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
