import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { app } from "../../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import axios from "../../api/axios";
import {
  updateFailure,
  updateStart,
  updateSuccess,
} from "../../app/user/userSlice";

const SettingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, loading } = useSelector((state) => state.user);
  const user = currentUser?.data;
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name,
    email: user?.email,
    profile_image: user?.profile_image,
    password: "",
  });

  useEffect(() => {
    setImagePreview(user.profile_image);
  }, []);

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
    dispatch(updateStart());
    try {
      const response = await axios.put(`/users/${user._id}`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = response.data;
      dispatch(updateSuccess(data));
      navigate("/account");
    } catch (error) {
      dispatch(updateFailure(error?.response?.data?.message));
      setError(error?.response?.data?.message);
      console.error("Error updating user:", error);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <MainLayout>
      <div className="flex flex-col mx-auto w-96 border">
        <h2 className="text-2xl text-center text-pink-600 font-bold">
          Profile Setting
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded p-8 space-y-6"
        >
          <div>
            <input
              type="file"
              name="profile_image"
              id="profile_image"
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageChange}
              className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
            />
            <label
              htmlFor="profile_image"
              className="shadow appearance-none text-pink-600 rounded p-2 leading-tight focus:outline-none focus:shadow-outline"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="h-32 w-32 object-cover rounded-full mx-auto "
                />
              ) : (
                "Choose an image"
              )}
            </label>
          </div>
          {fileUploadError ? (
            <span className="text-red-700 my-4">
              Error uploading image (image must be less than 2MB)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <div className="relative pt-1 my-4">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-700">{`${filePerc}%`}</span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                <div
                  style={{ width: `${filePerc}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-700"
                ></div>
              </div>
            </div>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image successfully uploaded!</span>
          ) : (
            ""
          )}
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="name"
            >
              name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="name"
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
              Update
            </button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </MainLayout>
  );
};

export default SettingPage;
