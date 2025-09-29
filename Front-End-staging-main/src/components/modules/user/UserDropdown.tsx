import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useLogoutUser } from "../../../api/useLogout";
import { useUser } from "../../../store/useUser";
import axios from "axios";
import { toast } from "react-toastify";

function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { clearUser } = useUser();
  const { mutate: logout } = useLogoutUser();

  // const ref = useClickAway(() => {
  //   setIsOpen(false);
  // });

  const handleLogout = () => {
    logout(undefined, {
      onSuccess() {
        clearUser();
        localStorage.removeItem("refreshToken");
      },
      onError(error: unknown) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.statusText ?? "");
          return;
        } else if (error instanceof Error) {
          toast.error("Server error occurred");
          return;
        }

        toast.error("An error occurred");
      },
    });
  };

  return (
    <div className="relative inline-block text-left">
      <button
        // ref={ref as MutableRefObject<HTMLButtonElement>}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="flex items-center space-x-2 hover:text-indigo-500 text-gray-700 font-medium px-4 py-2 rounded-md focus:outline-none "
      >
        <FaUserCircle className="text-2xl" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
          onClick={() => {
            setIsOpen(false);
          }}
        >
          <div className="py-1">
            <button
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
