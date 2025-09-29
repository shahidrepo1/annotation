import { useEffect, useState } from "react";

import { useRefreshToken } from "../api/useRefreshToken";
import { useUser } from "../store/useUser";
import { browserStorageKeys } from "../utils/constants";

function useAuthLoader() {
  const { userName, setUser } = useUser();
  const refresh = useRefreshToken();
  const [loading, setLoading] = useState(true);

  const refreshToken =
    localStorage.getItem(browserStorageKeys.refreshToken) ?? "";

  useEffect(() => {
    async function refreshUser() {
      if ((refreshToken && userName) || !refreshToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await refresh();
        setUser(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    refreshUser().catch((error: unknown) => {
      console.log(error);
    });
  }, [refreshToken, userName, setUser, refresh]);

  return { loading, userName };
}

export default useAuthLoader;
