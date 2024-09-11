import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import {
  signUpFailure,
  signUpStart,
  signUpSuccess,
} from "../app/user/userSlice";
import { app } from "../firebase";
import axios from "../api/axios";

const SignUpPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile_image:
      null ||
      "https://images.vexels.com/content/147101/preview/instagram-profile-button-68a534.png",
  });

  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const storage = getStorage(app);
    if (file) {
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, `profiles/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFilePerc(Math.ceil(progress));
        },
        (error) => {
          console.error("Upload error:", error);
          setFileUploadError(true);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImagePreview(downloadURL);
            setFormData((prevData) => ({
              ...prevData,
              profile_image: downloadURL,
            }));
            setFilePerc(0);
            setFileUploadError(false);
          });
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(signUpStart());
    try {
      const response = await axios.post("/auth/signup", formData);
      const data = response.data;
      dispatch(signUpSuccess(data));
      navigate("/");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErrors(error?.response?.data?.message);
      dispatch(signUpFailure(error?.response?.data?.message));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <MainLayout>
      <div className="w-96 mx-auto shadow-lg">
        <h2 className="text-2xl text-center text-pink-600 font-bold">
          Sign Up
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded p-8 space-y-6"
        >
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="name"
            >
              Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="email"
            >
              Email *
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="password"
            >
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
                required
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
              {loading ? "Loading..." : "Sign Up"}
            </button>
            <span>
              Have an account?{" "}
              <Link to="/signin" className="text-pink-600 hover:underline">
                Sign In
              </Link>
            </span>
          </div>
          {errors && <p className="text-red-500 text-xs">{errors}</p>}
        </form>
      </div>
    </MainLayout>
  );
};

export default SignUpPage;
