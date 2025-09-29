import { create } from "zustand";
import { UserStateType } from "./useUser.types";
import { UserDetailType } from "../api/useLogin.types";

const initialUserState: UserDetailType = {
  accessToken: "",
  profileId: 0,
  profilePic: "",
  refreshToken: localStorage.getItem("refreshToken") ?? "",
  userEmail: "",
  userName: "",
  userType: "user",
  uuid: 0,
};

export const useUser = create<UserStateType>()((set) => ({
  ...initialUserState,
  setUser(user) {
    set(user);
  },
  updateAccessToken(accessToken) {
    set({ accessToken });
  },
  clearUser() {
    set(initialUserState);
  },
}));
