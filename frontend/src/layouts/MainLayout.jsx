import Header from "./Header";
import Footer from "./Footer";

const MainLayout = ({ children, page }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header page={page} />
      <main className="flex-grow container mx-auto p-4">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
