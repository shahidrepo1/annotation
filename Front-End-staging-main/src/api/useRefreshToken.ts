import { refreshUrl } from "./apiConstants";
import { useUser } from "../store/useUser";
import axios from "axios";
import type { UserDetailType } from "./useLogin.types";

export const useRefreshToken = () => {
  const { refreshToken } = useUser();

  async function refresh() {
    return await axios.post<UserDetailType>(
      refreshUrl,
      {
        refreshToken: refreshToken || "",
      },
      {
        withCredentials: true,
      }
    );
  }

  return refresh;
};
