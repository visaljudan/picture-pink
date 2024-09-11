import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../app/user/userSlice";
import axios from "../api/axios";

const SignInPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const user = currentUser?.data;
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signInStart());
    try {
      const response = await axios.post("/auth/signin", formData);
      const data = response.data;
      dispatch(signInSuccess(data));
      if (data.data?.role === "User") {
        navigate("/");
      } else {
        navigate("/admin");
      }
    } catch (error) {
      setErrors(error?.response?.data?.message);
      dispatch(signInFailure(error?.response?.data?.message));
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <MainLayout>
      <div className="w-96 mx-auto shadow-lg">
        <h2 className="text-2xl text-center text-pink-600 font-bold">
          Sign In
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded p-8 space-y-6"
        >
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="username"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label
              className="block text-pink-600 text-md font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-pink-600 border border-pink-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:border hover:border-pink-600 hover:text-pink-600 hover:bg-white"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
            {loading ? (
              ""
            ) : (
              <span>
                Don't have an account?{" "}
                <Link to="/signup" className="text-pink-600 hover:underline">
                  Sign Up
                </Link>
              </span>
            )}
          </div>
          {errors && <p className="text-red-500 text-xs">{errors}</p>}
        </form>
      </div>
    </MainLayout>
  );
};

export default SignInPage;
