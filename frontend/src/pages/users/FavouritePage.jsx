import { useEffect, useState } from "react";
import ImageGrid from "../../components/ImageGrid";
import { useSavesHook } from "../../hooks/useSave";
import MainLayout from "../../layouts/MainLayout";
import { useSelector } from "react-redux";
import { BiHeart, BiShare } from "react-icons/bi";
import { Link } from "react-router-dom";
import moment from "moment";
import { FaTimes } from "react-icons/fa";

const FavouritePage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data;
  const { fetchSavesByUserID, userSaves } = useSavesHook();
  const [selectedImage, setSelectedImage] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState(userSaves);
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

  useEffect(() => {
    if (user) {
      fetchSavesByUserID(user);
    }
  }, []);

  useEffect(() => {
    let filtered = userSaves;

    if (searchText) {
      filtered = filtered.filter(
        (post) =>
          post.user_id.email?.toLowerCase().includes(searchText) ||
          post.title?.toLowerCase().includes(searchText?.toLowerCase()) ||
          post.description?.toLowerCase().includes(searchText?.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter((post) => {
        const postDate = moment(post.createdAt).format("YYYY-MM-DD");
        return postDate === selectedDate;
      });
    }

    setFilteredPosts(filtered);
  }, [searchText, selectedDate, userSaves]);

  const approvedPosts = filteredPosts?.filter(
    (post) =>
      post?.post_id?.approve === "approved" &&
      post?.post_id?.status === "active"
  );

  return (
    <MainLayout>
      <h2 className="text-2xl text-center font-bold text-pink-600">
        My Favourite
      </h2>
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
          {approvedPosts?.length === 0 || !approvedPosts
            ? "No record found"
            : approvedPosts?.map((image, index) => (
                <img
                  key={index}
                  src={image.post_id.image}
                  alt={image.post_id.title}
                  className="w-full h-auto object-cover rounded shadow-lg hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => handleImageClick(image)}
                />
              ))}
        </div>

        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
            <div className="bg-white p-6 relative top-0 h-fit w-96">
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
              >
                <FaTimes />
              </button>
              <div className="max-h-full overflow-y-scroll px-4">
                <img
                  src={selectedImage.post_id.image}
                  alt={selectedImage.post_id.title}
                  className="w-full h-auto object-cover rounded"
                />
                <div className="space-y-1 my-4">
                  <div className="flex justify-between">
                    <BiHeart className="text-md text-pink-600" />
                    <BiShare className="text-md text-pink-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Posted by{" "}
                      <Link
                        to={
                          user._id !== selectedImage.user_id._id
                            ? `/profile/${selectedImage.user_id._id}`
                            : "/account"
                        }
                        className="text-pink-600 font-bold"
                      >
                        {selectedImage.user_id.name}
                      </Link>
                    </p>
                    <p className="text-sm text-gray-500">
                      {moment(selectedImage.post_id.createdAt).format(
                        "DD/MM/YY"
                      )}
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-pink-600">
                    {selectedImage.post_id.title}
                  </p>
                  <p className="text-gray-600">
                    {selectedImage.post_id.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </MainLayout>
  );
};

export default FavouritePage;
