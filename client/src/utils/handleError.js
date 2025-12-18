export const handleError = (error) => {
  let message = "An unknown error occurred.";

  // Backend error (Axios got a response)
  if (error.response) {
    message =
      error.response.data?.message ||
      error.response.data?.error ||
      error.response.statusText ||
      message;
  }

  // No response (server down / network error)
  else if (error.request) {
    message = "No response from server. Please check your network.";
  }

  // Something else triggered an error
  else {
    message = error.message || message;
  }

  return new Error(message); // ⬅ IMPORTANT
};
