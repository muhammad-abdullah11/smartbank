"use client";
import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type FocusEvent,
} from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name as keyof typeof touched]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!validateEmail(value)) error = "Invalid email address";
        break;
      case "password":
        if (!value) error = "Password is required";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const allTouched = { email: true, password: true };
    setTouched(allTouched);

    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setLoading(true);
      setApiError("");
      try {
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setApiError(result.error);
        } else {
          const session = await getSession();
          if (session?.user?.role === "admin") {
            router.push("/dashboard");
          } else {
            router.push("/");
          }
        }
      } catch (error: any) {
        setApiError(error.message || "Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const getInputClass = (field: string) => {
    const base =
      "block w-full py-2 border text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-offset-1 pl-10 pr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";
    if (
      touched[field as keyof typeof touched] &&
      errors[field as keyof typeof errors]
    ) {
      return (
        base +
        " border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500"
      );
    }
    return (
      base +
      " border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
    );
  };

  return (
    <div
      className="w-full h-full overflow-hidden bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-lg rounded-lg"
      role="main"
      aria-label="Login page"
    >
      <div className="relative overflow-hidden rounded-3xl px-8 py-4 mb-6 border border-gray-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 ">
        <div className="absolute -top-16 right-0 h-40 w-40 rounded-full bg-blue-500/10 dark:bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-indigo-500/10 dark:bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-white/10 bg-blue-50 dark:bg-white/10 px-4 py-1.5 backdrop-blur-md">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-700 dark:text-blue-100">
              Trusted Digital Banking
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Smart Bank
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-blue-100 max-w-md mx-auto">
            Secure banking platform for managing loans, payments, and
            transactions with a modern digital experience.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <h1 className="text-center text-lg font-extrabold text-gray-900 dark:text-gray-100">
          Sign in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{" "}
          <a
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </a>
        </p>
      </div>

      <div className="mt-6 mx-auto w-full max-w-md">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("email")}
                placeholder="you@example.com"
              />
            </div>
            {touched.email && errors.email && (
              <p className="mt-0.5 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("password") + " pr-10"}
                placeholder="Enter your password"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {touched.password && errors.password && (
              <p className="mt-0.5 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-1.5 block text-xs text-gray-900 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>

            <div className="text-xs">
              <a
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          {apiError && (
            <p
              className={`text-center text-sm text-red-600 ${apiError.includes("verify your email") ? "cursor-pointer hover:underline font-semibold" : ""}`}
              onClick={() => {
                if (apiError.includes("verify your email")) {
                  router.push(
                    `/verify-email?email=${encodeURIComponent(formData.email)}`,
                  );
                }
              }}
            >
              {apiError}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
