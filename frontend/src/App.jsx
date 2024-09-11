import { Route, Routes, BrowserRouter } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import AccountPage from "./pages/users/AccountPage";
import FavouritePage from "./pages/users/FavouritePage";
import CreatePage from "./pages/users/CreatePage";
import SettingPage from "./pages/users/SettingPage";
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import PostsPage from "./pages/admin/PostsPage";
import CreatePostPage from "./pages/admin/CreatePostPage";
import RequestPostsPage from "./pages/admin/RequestPostsPage";
import UnapprovedPostsPage from "./pages/admin/UnapprovedPostsPage";
import ProfilePage from "./pages/ProfilePage";
import ContactsPage from "./pages/admin/ContactsPage";
import { PrivateRoute, PrivateAdminRoute } from "./components/PrivateRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/*" element={<NotFoundPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/account" element={<AccountPage />} />
          <Route path="/setting" element={<SettingPage />} />
          <Route path="/favourite" element={<FavouritePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/create-post" element={<CreatePage />} />
        </Route>
        <Route element={<PrivateAdminRoute />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/posts" element={<PostsPage />} />
          <Route path="/admin/request-posts" element={<RequestPostsPage />} />
          <Route
            path="/admin/unapproved-posts"
            element={<UnapprovedPostsPage />}
          />
          <Route path="/admin/create-post" element={<CreatePostPage />} />
          <Route path="/admin/contacts" element={<ContactsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
