import { Link, useNavigate } from "react-router-dom";
import {
  BiHome,
  BiUser,
  BiBook,
  BiBookAdd,
  BiBookContent,
  BiMailSend,
} from "react-icons/bi";
import Logo from "../components/Logo";
import { useDispatch, useSelector } from "react-redux";
import {
  signOutFailure,
  signOutStart,
  signOutSuccess,
} from "../app/user/userSlice";
import { usePostsHook } from "../hooks/usePosts";

const AdminLayout = ({ children, page }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const user = currentUser?.data;
  const { posts } = usePostsHook();

  const pendingPosts = posts.filter(
    (post) => post?.approve === "pending"
  ).length;

  const handleSignOut = async (e) => {
    e.preventDefault();
    dispatch(signOutStart());
    try {
      dispatch(signOutSuccess(user));
      navigate("/");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to sign out";
      dispatch(signOutFailure(errorMessage));
    }
  };

  return (
    <>
      <header className="bg-white text-pink-600 px-8 py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          <p>
            Welcome ,{" "}
            <Link to={"/admin"} className="font-bold">
              {user.name}
            </Link>{" "}
          </p>
          <button onClick={handleSignOut} className="hover:underline pl-2">
            Sign Out
          </button>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 min-h-full px-8 py-4">
          <nav className="space-y-2">
            <Link
              to="/admin/dashboard"
              className={`${
                page === "dashboard" ? "bg-pink-600 text-white" : ""
              } flex items-center p-2 text-black hover:bg-pink-600 hover:text-white rounded`}
            >
              <BiHome className="mr-2" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/admin/users"
              className={`${
                page === "users" ? "bg-pink-600 text-white" : ""
              } flex items-center p-2 text-black hover:bg-pink-600 hover:text-white rounded`}
            >
              <BiUser className="mr-2" />
              <span>Users</span>
            </Link>
            <Link
              to="/admin/posts"
              className={`${
                page === "posts" ? "bg-pink-600 text-white" : ""
              } flex items-center p-2 text-black hover:bg-pink-600 hover:text-white rounded`}
            >
              <BiBook className="mr-2" />
              <span>Posts</span>
            </Link>
            <Link
              to="/admin/request-posts"
              className={`${
                page === "request-posts" ? "bg-pink-600 text-white" : ""
              } flex items-center p-2 text-black hover:bg-pink-600 hover:text-white rounded`}
            >
              <BiBookContent className="mr-2" />
              <span>Request Posts</span>
              {pendingPosts === 0 ? (
                ""
              ) : (
                <span className="bg-pink-600 px-1 text-white ml-2">
                  {pendingPosts}
                </span>
              )}
            </Link>
            <Link
              to="/admin/unapproved-posts"
              className={`${
                page === "unapproved-posts" ? "bg-pink-600 text-white" : ""
              } flex items-center p-2 text-black hover:bg-pink-600 hover:text-white rounded`}
            >
              <BiBookContent className="mr-2" />
              <span>Unapproved Posts</span>
            </Link>
            <Link
              to="/admin/create-post"
              className={`${
                page === "create-post" ? "bg-pink-600 text-white" : ""
              } flex items-center p-2 text-black hover:bg-pink-600 hover:text-white rounded`}
            >
              <BiBookAdd className="mr-2" />
              <span>Create Post</span>
            </Link>
            <Link
              to="/admin/contacts"
              className={`${
                page === "contacts" ? "bg-pink-600 text-white" : ""
              } flex items-center p-2 text-black hover:bg-pink-600 hover:text-white rounded`}
            >
              <BiMailSend className="mr-2" />
              <span>Contacts</span>
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
};

export default AdminLayout;
