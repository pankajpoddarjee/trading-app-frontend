import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./Layout/AdminLayout";
import { User, Edit2, Key, Save, X, Sparkles } from "lucide-react";
import { updateProfile, changePassword } from "../api/api";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setFormData({ username: parsed.username || "", email: parsed.email || "" });
    } else {
      navigate("/login");
    }
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await updateProfile(formData);
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setIsLoading(false);
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to change password" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <AdminLayout>
        <div className="loading-text">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="profile-container-dash">
        {/* Welcome Banner */}
        <div className="profile-welcome-banner">
          <div className="profile-welcome-content">
            <div className="profile-welcome-icon">
              <Sparkles size={18} style={{ color: "#fcd34d" }} />
              <span className="profile-welcome-label">Profile Settings</span>
            </div>
            <h1 className="profile-welcome-title">Manage Your Account</h1>
            <p className="profile-welcome-sub">
              View and manage your personal information and security settings
            </p>
          </div>
        </div>

        {message && (
          <div className={`profile-msg ${message.type}`}>{message.text}</div>
        )}

        <div className="profile-grid-dash">
          {/* Left Sidebar */}
          <div className="profile-card-dash">
            <div className="profile-avatar-dash">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <h3 className="profile-name-dash">{user?.username}</h3>
            <p className="profile-email-dash">{user?.email}</p>
            <div className="profile-divider-dash"></div>
            <div className="profile-stats-dash">
              <div className="profile-stat-dash">
                <span className="profile-stat-label-dash">Member Since</span>
                <span className="profile-stat-value-dash">Jan 2026</span>
              </div>
              <div className="profile-stat-dash">
                <span className="profile-stat-label-dash">Balance</span>
                <span className="profile-stat-value-dash">₹{user?.balance?.toLocaleString() || "0"}</span>
              </div>
            </div>

            <div className="profile-nav-dash">
              <button
                className={`profile-nav-item-dash ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <User size={18} /> Personal Info
              </button>
              <button
                className={`profile-nav-item-dash ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <Key size={18} /> Security
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="profile-content-dash">
            {activeTab === "profile" && (
              <div className="profile-card-content-dash">
                <div className="profile-card-header-dash">
                  <h3 className="profile-card-title-dash">Personal Information</h3>
                  {!isEditing && (
                    <button className="profile-edit-btn-dash" onClick={() => setIsEditing(true)}>
                      <Edit2 size={16} /> Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleProfileUpdate}>
                  <div className="profile-form-dash">
                    <div className="profile-form-group-dash">
                      <label className="profile-form-label-dash">Full Name</label>
                      <input
                        type="text"
                        className="profile-form-input-dash"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="profile-form-group-dash">
                      <label className="profile-form-label-dash">Email Address</label>
                      <input
                        type="email"
                        className="profile-form-input-dash"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="profile-actions-dash">
                      <button type="submit" className="profile-btn-save-dash" disabled={isLoading}>
                        {isLoading ? "Saving..." : <><Save size={16} /> Save Changes</>}
                      </button>
                      <button
                        type="button"
                        className="profile-btn-cancel-dash"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ username: user.username, email: user.email });
                        }}
                      >
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div className="profile-card-content-dash">
                <div className="profile-card-header-dash">
                  <h3 className="profile-card-title-dash">Change Password</h3>
                </div>

                <form onSubmit={handlePasswordChange}>
                  <div className="profile-form-dash">
                    <div className="profile-form-group-dash">
                      <label className="profile-form-label-dash">Current Password</label>
                      <input
                        type="password"
                        className="profile-form-input-dash"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="profile-form-group-dash">
                      <label className="profile-form-label-dash">New Password</label>
                      <input
                        type="password"
                        className="profile-form-input-dash"
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="profile-form-group-dash">
                      <label className="profile-form-label-dash">Confirm New Password</label>
                      <input
                        type="password"
                        className="profile-form-input-dash"
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-actions-dash">
                    <button type="submit" className="profile-btn-save-dash" disabled={isLoading}>
                      {isLoading ? "Updating..." : <><Key size={16} /> Update Password</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Profile;