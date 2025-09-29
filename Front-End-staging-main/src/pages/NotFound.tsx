import { useNavigate } from "react-router";
import { FaExclamationCircle } from "react-icons/fa";

const PageNotFound = () => {
  const navigate = useNavigate();

  const goHome = () => {
    void navigate("/sr-training");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <div className="max-w-md p-6 bg-white rounded-2xl shadow-xl">
        <FaExclamationCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold mt-4">Page Not Found</h1>
        <p className="text-gray-600 mt-2">
          The page you are looking for doesn’t exist or has been moved.
        </p>
        <button
          onClick={goHome}
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-xl hover:bg-blue-600 transition"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;
