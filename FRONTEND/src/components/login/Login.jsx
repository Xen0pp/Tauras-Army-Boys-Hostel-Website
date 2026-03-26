"use client";

import React, { useState } from "react";
import PasswordInput from "../ui/password-input";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RiLoginCircleLine } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { TypewriterEffectSmooth } from "../ui/typewritter-effect";
import { useFormik } from "formik";
import { loginSchema } from "../../validationSchema/authentication";
import { enqueueSnackbar } from "notistack";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import RegistrationRequestSlider from "../registration-request/slider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const canvasRef = useRef(null);

  // Particle animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasDimensions = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);

    const particlesArray = [];
    const numberOfParticles = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.offsetWidth;
        this.y = Math.random() * canvas.offsetHeight;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = `rgba(${152 + Math.random() * 30}, ${41 + Math.random() * 20
          }, ${41 + Math.random() * 20}, ${Math.random() * 0.5 + 0.2})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.offsetWidth) this.x = 0;
        else if (this.x < 0) this.x = canvas.offsetWidth;
        if (this.y > canvas.offsetHeight) this.y = 0;
        else if (this.y < 0) this.y = canvas.offsetHeight;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    const init = () => {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.1 * (1 - distance / 100)
              })`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }

      requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8 h-[100vh] items-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: -1 }}
      ></canvas>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative h-full">
        {/* Left Column - University Info */}
        <div className="relative z-10 order-2 lg:order-1">
          <motion.div
            className="space-y-8 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="text-center lg:text-left"
            >
              <div
                onClick={() => router.push("/")}
                className="inline-block mb-4 cursor-pointer"
              >
                <Image
                  src="/assets/TaurasLogo.jpg"
                  alt="Tauras Army Boys Hostel Logo"
                  width={400}
                  height={400}
                  quality={100}
                  className="w-52 h-40"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 font-orbitron">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-800 to-red-900">
                  Tauras Army Boys Hostel
                </span>
              </h1>
              <h1 className="text-xl md:text-xl lg:text-3xl font-semibold">
                <TypewriterEffectSmooth
                  words={[
                    { text: "Login" },
                    { text: "to" },
                    { text: "your" },
                    { text: "account" },
                  ]}
                />
              </h1>
            </motion.div>

            <RegistrationRequestSlider />
          </motion.div>
        </div>

        {/* Right Column - Login Form */}
        <motion.div
          className="order-2 lg:order-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LoginForm />
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

const LoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();

  const { values, errors, touched, handleSubmit, handleChange } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);

      try {
        await signIn(values.email, values.password);
        enqueueSnackbar("Logged in successfully", {
          variant: "default",
        });
        router.push("/portal");
      } catch (error) {
        console.error("Login error:", error);
        enqueueSnackbar(error.message || "Email or Password wrong", {
          variant: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      enqueueSnackbar("Logged in with Google successfully", {
        variant: "default",
      });
      router.push("/portal");
    } catch (error) {
      console.error("Google login error:", error);
      enqueueSnackbar(error.message || "Google login failed", {
        variant: "error",
      });
    }
  };

  return (
    <div>
      {/* Top description */}
      <div>
        <div className="mt-7">
          <p className="text-sm">Continue with your Email and Password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email field */}
        <Input
          type="email"
          placeholder="Enter Your Email"
          className="mt-5"
          name="email"
          onChange={handleChange}
          value={values.email}
          error={errors.email}
          touched={touched.email}
        />

        {/* Password field */}
        <PasswordInput
          placeholder="Enter Your Password"
          className="mt-5"
          name="password"
          onChange={handleChange}
          value={values.password}
          error={errors.password}
          touched={touched.password}
        />

        {/* Login button */}
        <Button
          id="login-button"
          disabled={isSubmitting}
          type="submit"
          className="mt-5 w-full bg-[--secondary-bg] hover:bg-[--light-bg] hover:text-[--secondary-bg-dark] duration-400 dark:text-[--base-text-dark] dark:hover:text-[--base-text]"
        >
          <span className="mr-2 font-medium">Login</span> <RiLoginCircleLine />
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Sign In Button */}
      <Button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
      >
        <FcGoogle className="mr-2" size={20} />
        <span className="font-medium">Continue with Google</span>
      </Button>

      {/* Sign up links */}
      <div>
        <p className="text-sm mt-3">
          Currently holding the fort in the hostel?{" "}
          <Link
            id="signup"
            href={"/signup"}
            className="text-primary font-semibold dark:hover:text-[--secondary-bg] duration-200"
          >
            Sign Up
          </Link>
        </p>
        <p className="text-sm mt-3">
          An old warrior of these halls?{" "}
          <Link
            id="registration-request"
            href={"/registration-request"}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Apply for Hosteler Registration
          </Link>
        </p>
        <div className="text-xs mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 font-medium mb-1">
            📋 Hosteler Registration Info:
          </p>
          <ul className="text-blue-700 dark:text-blue-400 space-y-1">
            <li>
              • <strong>Auto-Approval:</strong> Complete all fields for instant
              approval
            </li>
            <li>
              • <strong>Required:</strong> Valid Student ID, Graduation Year,
              LinkedIn
            </li>
            <li>
              • <strong>Documents:</strong> Upload CV and proof documents for
              faster processing
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
