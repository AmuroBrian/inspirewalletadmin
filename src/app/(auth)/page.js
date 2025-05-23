"use client";

import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../../script/firebaseConfig"; // Import Firestore
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore"; // Firestore functions

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    fullName: "",
    email: "",
  });

  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPassword(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAdminLogin = async (adminId) => {
    try {
      // ✅ Fetch the admin's full name
      const adminRef = doc(db, "admin", adminId);
      const adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists()) {
        console.error("Admin document not found!");
        return null;
      }

      const adminData = adminSnap.data();
      const fullName = adminData.fullName || "Unknown Admin"; // Ensure we get a valid name

      // ✅ Generate sessionId (Firestore auto-generated ID)
      const sessionRef = doc(collection(db, "admin", adminId, "admin_history"));
      const sessionId = sessionRef.id;

      // ✅ Store login details in Firestore with full name
      await setDoc(sessionRef, {
        fullName, // Include admin full name
        loginTime: serverTimestamp(),
        logoutTime: null, // Will update on logout
        actions: [],
      });

      // ✅ Store sessionId in localStorage for tracking
      localStorage.setItem("sessionId", sessionId);
      console.log("Session ID stored:", sessionId);

      return sessionId; // Return the sessionId
    } catch (error) {
      console.error("Error recording admin login:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          password
        );
        const user = userCredential.user;
        const aid = user.uid;

        await setDoc(doc(db, "admin", aid), {
          fullName: formData.fullName,
          email: formData.email,
          userName: formData.userName,
          aid: aid,
        });

        alert("Account created successfully!");
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          password
        );
        const user = userCredential.user;
        const aid = user.uid;

        const userDoc = await getDoc(doc(db, "admin", aid));
        if (!userDoc.exists()) {
          alert("You are not authorized to log in.");
          return;
        }

        // ✅ Store adminId in localStorage
        localStorage.setItem("adminId", aid);

        // ✅ Generate sessionId and store it
        const sessionId = await handleAdminLogin(aid);
        if (!sessionId) {
          throw new Error("Failed to create sessionId.");
        }

        console.log("Admin ID stored:", aid);
        console.log("Final sessionId before redirect:", sessionId);

        alert("Logged in successfully!");
        router.push("/main");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    }
  };


  const [userIp, setUserIp] = useState('');
  const [allowed, setAllowed] = useState(false);

  //You can also visit this website to know your accurate IP Address: https://whatismyipaddress.com/#google_vignette
  // useEffect(() => {
  //   const getLocalIP = async () => {
  //     console.log("📡 Attempting to get local IP...");
  //     const pc = new RTCPeerConnection({ iceServers: [] });
  //     pc.createDataChannel(""); // create bogus channel

  //     pc.createOffer().then((offer) => pc.setLocalDescription(offer));

  //     pc.onicecandidate = (event) => {
  //       if (!event || !event.candidate) return;

  //       const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
  //       const ipMatch = ipRegex.exec(event.candidate.candidate);
  //       if (ipMatch) {
  //         console.log("📡 Local WiFi IP Address:", ipMatch[1]);
  //       }

  //       pc.onicecandidate = null;
  //       pc.close();
  //     };
  //   };

  //   const getPublicIP = async () => {
  //     try {
  //       const res = await fetch("https://api64.ipify.org?format=json");
  //       const data = await res.json();
  //       console.log("🌍 Public IP Address:", data.ip);
  //       setUserIp(data.ip);

  //       const allowedIp = "61.28.197.253";
  //       if (data.ip === allowedIp) {
  //         console.log("✅ Access granted. IP matched.");
  //       } else {
  //         alert("❌ Access denied. Your IP address is not allowed to access this site.");
  //         console.warn("❌ Access denied. IP did not match.");
  //         router.push("/denied");
  //       }
  //     } catch (err) {
  //       console.error("IP Fetch failed:", err);
  //       alert("❌ Unable to verify your IP address. Redirecting to denied page.");
  //       router.push("/denied");
  //     }
  //   };

  //   getLocalIP();
  //   getPublicIP();
  // }, [router]);

  // if (allowed === null) {
  //   return <main className="text-center mt-10 text-gray-500">Checking Wi-Fi access...</main>;
  // }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200 overflow-hidden pt-0">
      <div className="relative w-[600px] h-[400px] bg-white rounded-lg overflow-hidden shadow-xl flex">
        {/* Form Section */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isSignUp ? "60%" : "0%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute w-[62%] h-full flex items-center justify-center bg-white p-6"
        >
          <motion.div
            key={isSignUp ? "sign-up" : "sign-in"}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full flex flex-col items-center justify-center"
          >
            {isSignUp ? (
              <SignUpForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                error={error}
                password={password}
              />
            ) : (
              <SignInForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                error={error}
                password={password}
              />
            )}
          </motion.div>
        </motion.div>

        {/* Toggle Button Section */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: isSignUp ? "0%" : "171%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute w-[37%] h-full flex flex-col items-center justify-center bg-gray-300 p-6"
        >
          <p className="mt-4 text-lg text-gray-700 pb-2.5">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-600 transition-all"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

function SignInForm({ formData, handleChange, handleSubmit, error, password }) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Sign In</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          className="mb-3 p-2 border rounded w-56"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="Password"
          className="mb-3 p-2 border rounded w-56"
          required
        />

        <button
          type="submit"
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

function SignUpForm({ formData, handleChange, handleSubmit, error, password }) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="mb-3 p-2 border rounded w-56"
          required
        />

        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          placeholder="Username"
          className="mb-3 p-2 border rounded w-56"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          className="mb-3 p-2 border rounded w-56"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="Password"
          className="mb-3 p-2 border rounded w-56"
          required
        />
        <button
          type="submit"
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
