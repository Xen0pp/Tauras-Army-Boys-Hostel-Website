"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useGetPosts } from "../../hooks/tanstack/usePosts";
import EventList from "./EventList";
import PostCard from "./PostCard";
import PostBox from "./PostBox";
import ImageSlider from "./ImageSlider";

const Home = () => {
  const { user } = useAuth();
  const { data: posts, isLoading } = useGetPosts();
  const [mobileTab, setMobileTab] = useState("posts");

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          DESKTOP  (lg+): 3-column flex row, full-height panels
          ════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex h-[calc(100vh-4rem)] w-full overflow-hidden">

        {/* Left: Posts */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-[300px] xl:w-[320px] shrink-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Posts</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest updates from the community</p>
          </div>
          {user && (
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <PostBox />
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : posts?.results?.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No posts yet.</p>
            ) : (
              posts?.results?.map((post) => <PostCard post={post} key={post?.id} />)
            )}
          </div>
        </motion.div>

        {/* Center: Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1 min-w-0 overflow-hidden bg-gray-950"
        >
          <ImageSlider />
        </motion.div>

        {/* Right: Events */}
        {user && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-[280px] xl:w-[300px] shrink-0 flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Upcoming Events</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <EventList />
            </div>
          </motion.div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          MOBILE  (<lg): Slider on top + tab switcher below
          ════════════════════════════════════════════════════════ */}
      <div className="flex lg:hidden flex-col w-full">

        {/* Slider — fill the entire screen (minus header) */}
        <div className="w-full h-[calc(100vh-64px)] shrink-0 bg-gray-950 relative">
          <ImageSlider />
        </div>

        {/* Tab bar */}
        {/* Tab bar — sticky */}
        <div className="flex shrink-0 sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          {["posts", ...(user ? ["events"] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${mobileTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 dark:text-gray-400"
                }`}
            >
              {tab === "posts" ? "Posts" : "Events"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-950">
          <AnimatePresence mode="wait">
            {mobileTab === "posts" && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-4"
              >
                {user && <PostBox />}
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : posts?.results?.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No posts yet.</p>
                ) : (
                  posts?.results?.map((post) => <PostCard post={post} key={post?.id} />)
                )}
              </motion.div>
            )}
            {mobileTab === "events" && user && (
              <motion.div
                key="events"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <EventList />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Home;
