import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <MainLayout>
      <div className="w-full max-w-md mx-auto text-center space-y-4">
        <img
          src="https://static-00.iconduck.com/assets.00/404-page-not-found-illustration-1024x499-muqmchqg.png"
          alt="404 Not Found"
          className="w-full h-auto"
        />
        <p className="text-4xl text-pink-600 font-bold">Oops! Page Not Found</p>
        <p className="text-lg text-gray-600">
          The page you are looking for might have been moved or deleted.
        </p>
        <p className="text-lg text-gray-600">
          Click here to return to the{" "}
          <Link to="/" className="text-pink-600 font-bold hover:underline">
            Picture Pink
          </Link>
          .
        </p>
      </div>
    </MainLayout>
  );
};

export default NotFoundPage;
