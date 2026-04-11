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
import { signupSchema } from "../../validationSchema/authentication";
import { enqueueSnackbar } from "notistack";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import RegistrationRequestSlider from "../registration-request/slider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const canvasRef = useRef(null);

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
        this.color = `rgba(${124 + Math.random() * 50}, ${58 + Math.random() * 50
          }, ${237 + Math.random() * 18}, ${Math.random() * 0.5 + 0.2})`;
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
                  src="/assets/Picture.png"
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
                    { text: "Connect" },
                    { text: "with" },
                    { text: "Tauras" },
                    { text: "Army" },
                    { text: "Boys" },
                    { text: "Hostel!" },
                  ]}
                />
              </h1>
            </motion.div>

            <RegistrationRequestSlider />
          </motion.div>
        </div>

        <motion.div
          className="order-2 lg:order-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SignUpForm />
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;

const SignUpForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();

  const { values, errors, touched, handleSubmit, handleChange } = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signupSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);

      try {
        await signUp(values.email, values.password, {
          firstName: values.firstName,
          lastName: values.lastName,
        });
        enqueueSnackbar("Account created successfully", {
          variant: "default",
        });
        router.push("/portal");
      } catch (error) {
        console.error("Signup error:", error);
        enqueueSnackbar(error.message || "Failed to create account", {
          variant: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      enqueueSnackbar("Account created with Google successfully", {
        variant: "default",
      });
      router.push("/portal");
    } catch (error) {
      console.error("Google signup error:", error);
      enqueueSnackbar(error.message || "Google signup failed", {
        variant: "error",
      });
    }
  };

  return (
    <div>
      <div>
        <div className="mt-7">
          <p className="text-sm">
            Please enter your details to create your account
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Enter Your First Name"
          className="mt-5"
          name="firstName"
          onChange={handleChange}
          value={values.firstName}
          touched={touched?.firstName}
          error={errors?.firstName}
        />

        <Input
          type="text"
          placeholder="Enter Your Last Name"
          className="mt-5"
          name="lastName"
          onChange={handleChange}
          value={values.lastName}
          touched={touched?.lastName}
          error={errors?.lastName}
        />

        <Input
          type="email"
          placeholder="Enter Your Email"
          className="mt-5"
          name="email"
          onChange={handleChange}
          value={values.email}
          touched={touched?.email}
          error={errors?.email}
        />

        <PasswordInput
          placeholder="Enter Your Password"
          className="mt-5"
          name="password"
          onChange={handleChange}
          value={values.password}
          touched={touched?.password}
          error={errors?.password}
        />

        <PasswordInput
          placeholder="Confirm Password"
          className="mt-5"
          name="confirmPassword"
          onChange={handleChange}
          value={values.confirmPassword}
          touched={touched?.confirmPassword}
          error={errors?.confirmPassword}
        />

        <Button
          id="create-account"
          disabled={isSubmitting}
          type="submit"
          className="mt-5 w-full bg-[--secondary-bg] hover:bg-[--light-bg] hover:text-[--secondary-bg-dark] duration-400 dark:text-[--base-text-dark] dark:hover:text-[--base-text]"
        >
          <span className="mr-2 font-medium">Create Account</span>
          <RiLoginCircleLine />
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

      {/* Google Sign Up Button */}
      <Button
        type="button"
        onClick={handleGoogleSignup}
        className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
      >
        <FcGoogle className="mr-2" size={20} />
        <span className="font-medium">Continue with Google</span>
      </Button>

      <div>
        <p className="text-sm mt-1">
          Already have an account?{" "}
          <Link
            href={"/login"}
            className="text-primary font-semibold dark:hover:text-[--secondary-bg] duration-200"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
