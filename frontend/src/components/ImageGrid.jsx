import { useEffect, useState } from "react";
import { BiHeart, BiSearch, BiShare } from "react-icons/bi";
import { FaHeart, FaRegHeart, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import moment from "moment";
import { useSelector } from "react-redux";
import axios from "../api/axios";
import { useSavesHook } from "../hooks/useSave";

const ImageGrid = ({ posts }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data;
  const { fetchSavesByUserID, userSaves } = useSavesHook();
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const handleImageClick = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  };

  const approvedPosts = filteredPosts?.filter(
    (post) => post?.approve === "approved" && post?.status === "active"
  );

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/saves",
        {
          user_id: user?._id,
          post_id: selectedImage?._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      console.log(response);
      fetchSavesByUserID(user);
    } catch (error) {
      console.error(error);
    }
  };

  const isPostSaved = (postId) => {
    return userSaves?.some((save) => save?.post_id?._id === postId);
  };

  useEffect(() => {
    if (user) {
      fetchSavesByUserID(user);
    }
  }, [user]);

  useEffect(() => {
    let filtered = posts;

    if (searchText) {
      filtered = filtered.filter(
        (post) =>
          post.user_id?.email.toLowerCase().includes(searchText) ||
          post.title.toLowerCase().includes(searchText.toLowerCase()) ||
          post.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter((post) => {
        const postDate = moment(post.createdAt).format("YYYY-MM-DD");
        return postDate === selectedDate;
      });
    }

    setFilteredPosts(filtered);
  }, [searchText, selectedDate, posts]);
  return (
    <>
      <div className="w-full flex px-4 mt-4 space-x-8">
        <input
          type="text"
          placeholder="Search image..."
          className="px-4 py-2 rounded border border-pink-600 focus:border-pink-800 w-96"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded w-60 px-4 py-2 border-pink-600 focus:border-pink-800"
        />
      </div>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 p-4">
        {approvedPosts === 0
          ? "Not record found"
          : approvedPosts.map((image, index) => (
              <img
                key={index}
                src={image.image}
                alt={image.title}
                className="w-full h-auto object-cover rounded shadow-lg hover:scale-105 transition-transform cursor-pointer"
                onClick={() => handleImageClick(image)}
              />
            ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 relative top-0 h-fit w-96">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
            >
              <FaTimes />
            </button>
            <div className="max-h-full overflow-y-scroll px-4">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-auto object-cover rounded"
              />
              <div className="space-y-1 my-4">
                <div className="flex justify-between">
                  {isPostSaved(selectedImage?._id) ? (
                    <FaHeart className="text-pink-600" onClick={handleSave} />
                  ) : (
                    <FaRegHeart
                      className="text-pink-600"
                      onClick={handleSave}
                    />
                  )}
                  <BiShare className="text-md text-pink-600" />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Posted by{" "}
                    <Link
                      to={
                        user?._id !== selectedImage?.user_id?._id
                          ? `/profile/${selectedImage?.user_id?._id}`
                          : "/account"
                      }
                      className="text-pink-600 font-bold"
                    >
                      {selectedImage.user_id.name}
                    </Link>
                  </p>
                  <p className="text-sm text-gray-500">
                    {moment(selectedImage.createdAt).format("DD/MM/YY")}
                  </p>
                </div>

                <p className="text-2xl font-bold text-pink-600">
                  {selectedImage.title}
                </p>
                <p className="text-gray-600">{selectedImage.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGrid;
