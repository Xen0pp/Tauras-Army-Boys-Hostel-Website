"use client";
import { motion } from "framer-motion";
import Image from "next/image";

import { SendHorizontal, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePost, useGetPosts } from "../../hooks/tanstack/usePosts";
import { useGetRoles, useGetUserInfo } from "../../hooks/tanstack/useAlumni";
import { useFormik } from "formik";
import * as Yup from "yup";
import { enqueueSnackbar } from "notistack";
import EventList from "./EventList";
import PostCard from "./PostCard";
import PostBox from "./PostBox";
import ImageSlider from "./ImageSlider";

const Home = () => {
  const { user } = useAuth();
  const { data: posts, isLoading } = useGetPosts();
  const { mutateAsync } = useCreatePost();

  return (
    <div className="container mx-auto xl:space-y-0 grid grid-cols-12 gap-5 py-8 pt-0 px-4 relative h-[85vh]">
      {/* Left Side: Posts Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="col-span-12 xl:col-span-3 dark:bg-[--sidebar-bg-dark] rounded-lg h-full flex flex-col"
      >
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Posts
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stay connected with the latest updates from the community
          </p>
        </div>

        {/* New Post Input - Only for logged in users */}
        {user && <PostBox />}

        {/* Posts List */}
        <div className="space-y-6 overflow-y-auto flex-1 pr-2 scrollbar-hide">
          {posts?.results?.map((post) => (
            <PostCard post={post} key={post?.id} />
          ))}
        </div>
      </motion.div>

      {/* Center: Image Slider */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`col-span-12 ${user ? "xl:col-span-6" : "xl:col-span-9"} h-full`}
      >
        <ImageSlider />
      </motion.div>

      {/* Right Side: Events Section - Only for logged in users */}
      {user && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="col-span-12 xl:col-span-3 bg-white dark:bg-[--sidebar-bg-dark] p-6 rounded-lg shadow-md h-full overflow-hidden flex flex-col"
        >
          <div className="overflow-y-auto flex-1 pr-2 scrollbar-hide">
            <EventList />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
