import { BiSearch } from "react-icons/bi";
import Logo from "../components/Logo";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { usePostsHook } from "../hooks/usePosts";

const Header = ({ page }) => {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const user = currentUser?.data;
  return (
    <header className="bg-white text-pink-600 px-8 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link
                to="/"
                className={`hover:underline  hover:font-bold ${
                  page === "home" ? "font-bold underline cursor-default " : ""
                } `}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`hover:underline  hover:font-bold ${
                  page === "about" ? "font-bold underline cursor-default " : ""
                } `}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`hover:underline  hover:font-bold ${
                  page === "contact"
                    ? "font-bold underline cursor-default "
                    : ""
                } `}
              >
                Contact
              </Link>
            </li>
            {user ? (
              ""
            ) : (
              <li>
                <Link
                  to="/signup"
                  className="bg-pink-600 border border0pink-600 text-white p-2 rounded-md hover:bg-white hover:border hover:border-pink-600 hover:text-pink-600"
                >
                  Join with Us
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {user ? (
          <div className="flex items-center justify-center">
            <img
              src={user?.profile_image}
              alt="profile_image"
              className="w-8 h-8 rounded-full object-cover"
            />
            <Link to="/account" className="hover:underline pl-2">
              {user?.name}
            </Link>{" "}
          </div>
        ) : (
          ""
        )}
      </div>
    </header>
  );
};

export default Header;
