import { Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
    const navigate=useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      
      {/* Icon */}
      <svg
        className="w-16 h-16 text-gray-400 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.172 9.172a4 4 0 015.656 0m1.414 1.414a6 6 0 010 8.486M6.343 6.343a8 8 0 0111.314 0"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20h.01"
        />
      </svg>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
        404 - Page Not Found
      </h1>

      {/* Description */}
      <p className="mt-3 text-gray-500 max-w-md">
        Oops! The page you are looking for doesn’t exist or may have been moved.
      </p>

      {/* Back Button */}
      <Button
        onClick={()=>navigate(-1)}
        className="mt-6 inline-block bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg transition"
      >
        Back to Home
      </Button>
    </div>
  );
};

export default NotFoundPage;