import { Link } from "react-router-dom";
import { FaBars, FaMoon, FaSun, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import { RootState } from "../store/foodStore.js";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/system/theme.js";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const [isLogged, setIsLogged] = useState(false);

  const token = document.cookie.split("token=")[1]?.split(";")[0];
  const userData = token
    ? jwtDecode<UserType>(decodeURIComponent(token))
    : null;

  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => {
    return state.theme.theme;
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove("light", "dark");
    localStorage.setItem("theme", theme);
    htmlElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const checkAuth = () => {
      setIsLogged(document.cookie.includes("token"));
    };

    checkAuth();

    window.addEventListener("cookieRefresh", checkAuth);

    return () => {
      window.removeEventListener("cookieRefresh", checkAuth);
    };
  }, []);

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="fixed w-full top-0 left-0 dark:bg-slate-900 bg-blue-500 p-4 text-white shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Weste Food Org
        </Link>
        <div className="flex items-center md:hidden">
          <button
            className="mr-4 cursor-pointer"
            onClick={() => dispatch(toggleTheme())}
          >
            {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
          </button>
          <div
            className="cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>
        </div>
        <ul
          className={`md:flex md:space-x-4 absolute md:static top-16 left-0 w-full md:w-auto dark:bg-slate-900 bg-blue-500 md:bg-transparent ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <li>
            <Link
              to="/donate"
              className="block px-4 py-2 dark:text-white"
              onClick={handleLinkClick}
            >
              Donate
            </Link>
          </li>
          <li>
            <Link
              to="/track"
              className="block px-4 py-2 dark:text-white"
              onClick={handleLinkClick}
            >
              Track
            </Link>
          </li>
          <li>
            {isLogged ? (
              <Link
                to={
                  userData?.role === "DONOR"
                    ? "/dashboard/user"
                    : userData?.role === "SERVICE"
                    ? "/dashboard/service-worker"
                    : "/dashboard/admin"
                }
                className="block px-4 py-2 dark:text-white"
                onClick={handleLinkClick}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-2 dark:text-white"
                onClick={handleLinkClick}
              >
                Login
              </Link>
            )}
          </li>
          <li className="hidden md:block flex items-center">
            <button
              className="cursor-pointer flex items-center justify-center h-full"
              onClick={() => dispatch(toggleTheme())}
            >
              {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
