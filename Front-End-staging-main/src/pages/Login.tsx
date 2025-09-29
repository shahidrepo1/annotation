import React, { useState } from "react";
import useLogin from "../api/useLogin";
import { UserDetailSchema } from "../api/useLogin.types";
import { useNavigate } from "react-router";
import { useUser } from "../store/useUser";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";

type AxiosErrorData = {
  message?: string;
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const { setUser } = useUser();
  const { mutate, error, isPending, isError } = useLogin();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      email,
      password,
    };
    mutate(data, {
      onSuccess: (data) => {
        UserDetailSchema.parse(data);
        const parsedData = UserDetailSchema.parse(data);
        const refreshToken = parsedData.refreshToken;

        localStorage.setItem("refreshToken", refreshToken);

        setUser(parsedData);

        void navigate("/sr-training");
      },
      onError: (error: unknown) => {
        if (isAxiosError(error)) {
          const message =
            (error.response?.data as AxiosErrorData).message || error.message;
          toast.error(message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unknown error occurred");
        }
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-500 to-fuchsia-500">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-indigo-600 text-center mb-6">
          Login
        </h1>
        {isError && (
          <div className="mb-4 text-red-500 text-sm text-center">
            {isAxiosError(error)
              ? (error.response?.data as { message?: string }).message
              : error instanceof Error
              ? error.message
              : "An unknown error occurred"}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-4 justify-center w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isPending ? (
              <AiOutlineLoading3Quarters className="animate-spin" />
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
