
import { loginUser, getCurrentUser } from "./services/authService.js";

const testConnection = async () => {
  try {
    const result = await loginUser({
      email: "newuser@example.com",
      password: "Test12345",
    });

    console.log("LOGIN SUCCESS:", result);

    const profile = await getCurrentUser();

    console.log("PROFILE SUCCESS:", profile);

  } catch (error) {
    console.error("API ERROR:", error.message);
  }
};

testConnection();
