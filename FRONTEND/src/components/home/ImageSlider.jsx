"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageSlider = () => {
    const images = [
        {
            src: "/assets/TABH.png",
            alt: "Taurus Army Boys Hostel - Main Gate",
        },
        {
            src: "/assets/Tara_Front.png",
            alt: "Taurus Army Boys Hostel - Tara Front",
        },
        {
            src: "/assets/Tabh3.png",
            alt: "Taurus Army Boys Hostel - Building View",
        },
        {
            src: "/assets/Tara_Side.png",
            alt: "Taurus Army Boys Hostel - Tara Side",
        },
        {
            src: "/assets/Thorat_Aerial.png",
            alt: "Taurus Army Boys Hostel - Thorat Aerial",
        },
        {
            src: "/assets/Tabh2.png",
            alt: "Taurus Army Boys Hostel - Courtyard",
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Auto-rotate images every 4 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, 4000);

        return () => clearInterval(timer);
    }, [currentIndex]);

    const handleNext = () => {
        setDirection(1);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const handleDotClick = (index) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    };

    return (
        <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            {/* Slider Container */}
            <div className="relative w-full h-full">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                        className="absolute w-full h-full"
                    >
                        <Image
                            src={images[currentIndex].src}
                            alt={images[currentIndex].alt}
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

                {/* Previous Button */}
                <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Next image"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Navigation Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`transition-all duration-300 rounded-full ${index === currentIndex
                                ? "w-10 h-3 bg-white"
                                : "w-3 h-3 bg-white/50 hover:bg-white/75"
                                }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-6 right-6 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>
        </div>
    );
};

export default ImageSlider;
