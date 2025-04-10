import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className=" min-w-[300px] mx-auto bg-blue-600 dark:bg-slate-900 text-white dark:text-gray-200 p-6 w-full border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold dark:text-white">Weste Food Org</h2>
          <p className="text-sm mt-1 dark:text-gray-400">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>

        <ul className="flex space-x-6 mb-4 md:mb-0">
          <li>
            <Link to="/" className="hover:underline dark:text-gray-300">
              Home
            </Link>
          </li>
          <li>
            <Link to="/donate" className="hover:underline dark:text-gray-300">
              Donate
            </Link>
          </li>
          <li>
            <Link to="/track" className="hover:underline dark:text-gray-300">
              Track
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:underline dark:text-gray-300">
              Contact
            </Link>
          </li>
        </ul>

        <div className="flex space-x-4">
          <a href="#" className="hover:text-gray-300 dark:hover:text-gray-500">
            <FaFacebook size={20} />
          </a>
          <a href="#" className="hover:text-gray-300 dark:hover:text-gray-500">
            <FaTwitter size={20} />
          </a>
          <a href="#" className="hover:text-gray-300 dark:hover:text-gray-500">
            <FaInstagram size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
