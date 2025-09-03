import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Typewriter } from "react-simple-typewriter";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { loginUser } from "../features/authSlice";

const Login = () => {
  const { loading, user, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill the required field");
    }
    try {
      dispatch(loginUser(formData));
      toast.success("Login successfully!!");
      navigate("/");
    } catch (error) {
      toast.error(error || "Login failed");
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white px-4">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-4 items-center text-center mb-10"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug md:leading-tight lg:leading-snug max-w-lg lg:max-w-lg">
          Unlock Your Team's Knowledge
        </h1>

        {/* ✅ Typewriter effect */}
        <p className="text-gray-400 text-sm md:text-base">
          <Typewriter
            words={[
              "Collaborate with AI-powered research assistant",
              "Login securely to access your knowledge hub",
              "Boost your team's productivity with AI",
            ]}
            loop={true}
            cursor
            cursorStyle="|"
            typeSpeed={60}
            deleteSpeed={40}
            delaySpeed={2000}
          />
        </p>
      </motion.div>

      {/* Login Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="border border-gray-700 gap-6 flex flex-col rounded-xl p-6 sm:p-8 md:p-10 w-full max-w-md shadow-lg"
      >
        {/* Login Title */}
        <h2 className="text-xl font-semibold text-center mb-2">Login</h2>

        {/* Email Field */}
        <motion.div
          whileFocus={{ scale: 1.02 }}
          className="flex flex-col gap-2"
        >
          <label htmlFor="email" className="text-sm md:text-base">
            Email
          </label>
          <input
            name="email"
            onChange={handleChange}
            value={formData.email}
            className="border border-gray-700 outline-none px-4 py-2 rounded-md bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-white"
            type="email"
            id="email"
            placeholder="johndoe@gmail.com"
          />
        </motion.div>

        {/* Password Field */}
        <motion.div
          whileFocus={{ scale: 1.02 }}
          className="flex flex-col gap-2"
        >
          <label htmlFor="password" className="text-sm md:text-base">
            Password
          </label>
          <input
            onChange={handleChange}
            value={formData.password}
            name="password"
            className="border border-gray-700 outline-none px-4 py-2 rounded-md bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-white"
            type="password"
            id="password"
            placeholder="********"
          />
        </motion.div>

        {/* Login Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={loading}
          className={`${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-white hover:bg-gray-200"
          } w-full duration-300 text-black font-bold px-4 py-2 rounded-md transition`}
        >
          {loading ? (
            <motion.div
              className="flex items-center justify-center gap-2"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </motion.div>
          ) : (
            "Log in"
          )}
        </motion.button>

        {/* Register Link */}
        <p className="text-center text-gray-400 text-sm md:text-base">
          Don&apos;t have an account?{" "}
          <Link className="text-white hover:underline" to="/register">
            Register
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default Login;
