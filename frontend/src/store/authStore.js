import { create } from "zustand";
import axiosClient from "../api/axiosClient";

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  loading: false,
  login: async (payload) => {
    set({ loading: true });
    const data = await axiosClient.post("/auth/login", payload);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user, token: data.token, loading: false });
    return data.user;
  },
  register: async (payload) => {
    const data = await axiosClient.post("/auth/register", payload);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
    return data.user;
  },
  fetchMe: async () => {
    if (!get().token) return null;
    const data = await axiosClient.get("/auth/me");
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user });
    return data.user;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  }
}));
