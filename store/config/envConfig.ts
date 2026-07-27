// export const imgUrl = "https://ecommarce-backend-dsoe.onrender.com/";
// export const imgUrl = `${process.env.NEXT_PUBLIC_IMG_URL}`;
// export const imgUrl = "https://renee-gdy9.onrender.com/";
export const imgUrl =
  process.env.NEXT_PUBLIC_IMG_URL || "http://localhost:4000/";

export const url = `${imgUrl}api/v1/`;

// export const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

//console.log(url);

// Email: parvesmosarof32@gmail.com
// Password: 12345678
// export const guestUser = {
//   email: `${process.env.NEXT_PUBLIC_GUEST_USER_EMAIL}`,
//   password: `${process.env.NEXT_PUBLIC_GUEST_USER_PASSWORD}`
// };

// 🔥 WebSocket base URL (auto picks wss:// if https page, ws:// otherwise)
// const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
// export const wsUrl = `${wsProtocol}://${new URL(imgUrl).host}`;

// Function to get the base API URL
export const getBaseUrl = () => url;

// Function to get the image base URL
export const getImageBaseUrl = () => imgUrl;

// Function to get the WebSocket base URL
// export const getWsBaseUrl = () => wsUrl;

// asdf

export const getImageUrl = (imagePath: any) => {
  if (!imagePath || typeof imagePath !== "string") return "";

  // If it's already a full URL, return as-is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Remove trailing slash from base and leading slash from path
  const base = imgUrl.replace(/\/+$/, "");
  const path = imagePath.replace(/^\/+/, "");

  const finalUrl = `${base}/${path}`;
  console.log(finalUrl, "finalUrl");

  return finalUrl;
};

export const zegoConfig = {
  appID: 1156940917,
  appSign: "dafce05b909990264b3b617975709e95d99da4c35b17c347c416c76d28882717",
  serverSecret: "b6258cd3c2ff3668612bece2601d24d6",
};
