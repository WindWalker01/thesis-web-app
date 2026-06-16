"use client";

import { useAuth } from "@/features/(user)/auth/hooks/useAuth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  PASSWORD_RULES,
  NAME_RULES,
  signUpSchema,
  type SignUpInput,
} from "@/features/(user)/auth/schemas/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";

export function useRegisterForm() {
  const { signUp, signInWithGoogle } = useAuth();

  const [serverError, setServerError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");
  const firstName = watch("firstName", "");
  const middleName = watch("middleName") ?? "";
  const lastName = watch("lastName", "");

  const isMiddleNameValid =
    middleName.length === 0 ||
    (middleName.length >= 2 && middleName.length <= 50);

  const passwordChecklist = [
    {
      label: `At least ${PASSWORD_RULES.minLength} characters`,
      passed: password.length >= PASSWORD_RULES.minLength,
    },
    {
      label: "Contains an uppercase letter",
      passed: PASSWORD_RULES.uppercase.test(password),
    },
    {
      label: "Contains a number",
      passed: PASSWORD_RULES.number.test(password),
    },
  ];

  const confirmPasswordChecklist = [
    {
      label: "Passwords match",
      passed: password.length > 0 && password === confirmPassword,
    },
  ];

  const nameChecklist = [
    {
      label: "First & Last Names must be at least 2 characters",
      passed:
        firstName.length >= NAME_RULES.minLength &&
        lastName.length >= NAME_RULES.minLength &&
        isMiddleNameValid,
    },
    {
      label: "Names can only contain letters",
      passed:
        NAME_RULES.lettersOnly.test(firstName) &&
        NAME_RULES.lettersOnly.test(lastName) &&
        (middleName.length === 0 || NAME_RULES.lettersOnly.test(middleName)),
    },
  ];

  const onSubmit = async (data: SignUpInput) => {
    setServerError(null);

    const { error } = await signUp(data);

    if (error) {
      setServerError(error.message);
      return;
    }

    setPendingEmail(data.email);
  };

  const handleGoogleLogin = async () => {
    setServerError(null);
    setOauthLoading(true);

    try {
      await signInWithGoogle();
    } catch {
      setServerError("Failed to sign in with Google.");
      setOauthLoading(false);
    }
  };

  return {
    serverError,
    setServerError,

    oauthLoading,
    setOauthLoading,

    pendingEmail,

    showPassword,
    setShowPassword,

    showConfirm,
    setShowConfirm,

    register,
    handleSubmit,

    errors,
    isSubmitting,

    onSubmit,
    handleGoogleLogin,

    passwordChecklist,
    confirmPasswordChecklist,
    nameChecklist,
  };
}
