import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { firebaseApp } from "../utils/firebaseConfig.js";
import { generateAuthToken } from "../lib/generateToken.js";

export const useAuthStore = create((set) => ({
  authUser: null,
  isLoading: false,
  isUpdatingProfile: false,

  toggleLoading: (value) => {
    set(() => ({ isLoading: value !== undefined ? value : !isLoading }));
  },

  checkAuth: async () => {
    set({ isLoading: true }); // Indicate loading state
    try {
      const access_token = localStorage.getItem("authToken");
      if (!access_token) {
        set({ authUser: null, isLoading: false }); // No token, no user
        return;
      }

      const res = await axiosInstance.get("/auth/check-auth", {
        headers: { access_token },
      });

      set({ authUser: res.data.user, isLoading: false }); // User authenticated
    } catch (error) {
      console.error("Error in checkAuth:", error.message);
      set({ authUser: null, isLoading: false }); // Clear user state on error
    }
  },
  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const access_token = await generateAuthToken(res.data.access_token);
      localStorage.setItem("authToken", access_token);
      set({ authUser: res.data.user });
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },
  logOut: async () => {
    set({ isLoading: true });
    try {
      localStorage.removeItem("authToken");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const access_token = localStorage.getItem("authToken");
      const res = await axiosInstance.put("/auth/update-profile", data, {
        headers: { access_token },
      });
      // set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
