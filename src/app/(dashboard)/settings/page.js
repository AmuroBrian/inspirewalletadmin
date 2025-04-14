"use client";

import React, { useState, useEffect } from 'react';
import { auth, db } from './../../../../script/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    getAuth,
    onAuthStateChanged,
} from 'firebase/auth';

export default function Settings() {
    const [userData, setUserData] = useState({
        fullName: '',
        email: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Password state
    const [changePassword, setChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [adminInfo, setAdminInfo] = useState(null); // Holds the admin info including 'aid'

    useEffect(() => {
        const authInstance = getAuth();
        const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
            if (user) {
                try {
                    const adminRef = doc(db, "admin", user.uid);
                    const adminSnap = await getDoc(adminRef);

                    if (adminSnap.exists()) {
                        const adminData = adminSnap.data();
                        setAdminInfo(adminData);
                        setUserData({
                            fullName: adminData.fullName || '',
                            email: adminData.email || '',
                        });
                    } else {
                        console.warn("Admin document not found");
                    }
                } catch (error) {
                    console.error("Error fetching admin document:", error);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        setIsEditing(false);
        try {
            const userRef = doc(db, "admin", auth.currentUser.uid);
            await updateDoc(userRef, userData);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        setIsUpdating(true);
        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            alert("Password updated successfully!");

            setChangePassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error("Error updating password:", error);
            alert("Failed to update password. Check your current password.");
        }
        setIsUpdating(false);
    };

    if (loading) return <div className="text-center">Loading...</div>;

    return (
        <div className="flex flex-col items-center justify-center w-full mt-24 ml-28">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">

                {/* Profile Information */}
                <div className="mb-4">
                    <label className="block text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={userData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full bg-gray-200 px-3 py-2 border rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        disabled
                        className="w-full px-3 py-2 border rounded-md bg-gray-200 cursor-not-allowed"
                    />
                </div>

                {changePassword ? (
    <div className="mb-4">
        <label className="block text-gray-700">Current Password</label>
        <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
        />
    </div>
) : (
    <div className="mb-4">
        <label className="block text-gray-700">Current Password</label>
        <input
            type="password"
            value="********"
            disabled
            className="w-full px-3 py-2 border rounded-md bg-gray-200 cursor-not-allowed"
        />
    </div>
)}

        
                {/* Change Password Section */}
                <button
    className="bg-secondaryColor text-blue-700 px-4 py-2 rounded-md w-full flex justify-items-start"
    onClick={() => {
        if (!changePassword) {
            setCurrentPassword('');
        }
        setChangePassword(!changePassword);
    }}
>
    {changePassword ? "Cancel" : "Change Password?"}
</button>



                {changePassword && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-100">
                        
                        <div className="mb-4">
                            <label className="block text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        <button
                            onClick={handlePasswordChange}
                            disabled={isUpdating}
                            className={`px-4 py-2 text-white rounded-md w-full ${isUpdating ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
                                }`}
                        >
                            {isUpdating ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
