import axiosInstance from "../api/axiosInstance";

// Keys recoil-persist stores the selected vessel and master lists under.
const PERSISTED_KEYS = ["vesselCommonViewPersist", "genericPersist"];

/**
 * End the session on the server (it clears the auth cookie), forget what was
 * saved for this user, and go to the login page with a full reload so no
 * in-memory data from the old session survives.
 */
export default async function logout() {
  try {
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    // Already signed out or offline: still leave the app.
    console.error("Logout request failed:", error);
  }
  PERSISTED_KEYS.forEach((key) => {
    try {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    } catch {
      // Storage can be unavailable (private mode); nothing to clear then.
    }
  });
  window.location.replace("/login");
}
