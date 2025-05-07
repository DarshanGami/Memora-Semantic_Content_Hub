import React, { useState, useRef, useEffect } from "react";
import ProfileModal from './ProfileModal';

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);
  const [randomEmoji, setRandomEmoji] = useState("👤");
  const [hovered, setHovered] = useState(false);

  // Generate random emoji on component mount
  useEffect(() => {
    const emojis = ["👤", "😊", "😎", "🤓", "🧐", "🤔", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"];
    const randomIndex = Math.floor(Math.random() * emojis.length);
    setRandomEmoji(emojis[randomIndex]);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleProfileClick = () => {
    setOpen(false);
    setShowProfile(true);
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className="fixed top-5 right-8 z-50"
        ref={dropdownRef}
      >
        <button
          className={`w-12 h-12 rounded-full overflow-hidden border-2 shadow-lg flex items-center justify-center text-3xl transition-all duration-300 transform ${
            hovered ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
          } ${
            open 
              ? 'bg-gradient-to-br from-[rgb(13,148,136)] to-teal-400 border-[rgb(13,148,136)] text-white' 
              : 'bg-gradient-to-br from-white to-gray-50 border-teal-200 text-[rgb(13,148,136)] hover:border-[rgb(13,148,136)]'
          }`}
          onClick={() => setOpen((prev) => !prev)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {randomEmoji}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 flex flex-col z-50 border border-teal-100 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-100">
              <h3 className="font-semibold text-[rgb(13,148,136)]">Welcome Back!</h3>
              <p className="text-sm text-teal-600">Manage your account</p>
            </div>
            <button
              onClick={handleProfileClick}
              className="px-4 py-3 text-gray-700 hover:bg-teal-50 transition-all duration-200 flex items-center gap-2 group"
            >
              <span className="text-[rgb(13,148,136)] group-hover:text-teal-600">👤</span>
              Profile
            </button>
            <a
              href="/settings"
              className="px-4 py-3 text-gray-700 hover:bg-teal-50 transition-all duration-200 flex items-center gap-2 group"
            >
              <span className="text-[rgb(13,148,136)] group-hover:text-teal-600">⚙️</span>
              Settings
            </a>
            <a
              href="/logout"
              className="px-4 py-3 text-gray-700 hover:bg-teal-50 transition-all duration-200 flex items-center gap-2 group"
            >
              <span className="text-[rgb(13,148,136)] group-hover:text-teal-600">🚪</span>
              Logout
            </a>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
    </>
  );
}