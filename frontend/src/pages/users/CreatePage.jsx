import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useSelector } from "react-redux";
import axios from "../../api/axios";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../firebase";
import { useNavigate } from "react-router-dom";

const CreatePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({
    user_id: user?._id,
    title: "",
    description: "",
    image: null,
  });

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
      const storageRef = ref(storage, `posts/${fileName}`);
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
              image: downloadURL,
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
    try {
      await axios.post("/posts", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      setLoading(false);
      navigate("/account");
    } catch (error) {
      setError(error?.response?.data?.message);
      console.error("Error updating user:", error);
    }
  };
  return (
    <MainLayout>
      <div className="w-96 mx-auto shadow-lg">
        <h2 className="text-2xl text-center text-pink-600 font-bold">
          Create Posts
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded p-8 space-y-6"
        >
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="title"
            >
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>

          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="image"
            >
              Image
            </label>
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
                  className="h-auto w-40 object-cover mx-auto "
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
              htmlFor="status"
            >
              Status
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-pink-600 border border-pink-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:border hover:border-pink-600 hover:text-pink-600 hover:bg-white"
            >
              Submit
            </button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </MainLayout>
  );
};

export default CreatePage;
