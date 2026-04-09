"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { changePasswordAction } from "../server/change-password";
import {
    changePasswordSchema,
    type ChangePasswordSchema,
} from "../schemas/change-pass-schema";

type PasswordFieldKey =
    | "currentPassword"
    | "newPassword"
    | "confirmNewPassword";

export function useChangePasswordForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState<Record<PasswordFieldKey, boolean>>({
        currentPassword: false,
        newPassword: false,
        confirmNewPassword: false,
    });

    const form = useForm<ChangePasswordSchema>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        setIsSubmitting(true);

        try {
            const result = await changePasswordAction(values);

            if (!result.success) {
                if (result.field) {
                    form.setError(result.field, {
                        type: "server",
                        message: result.message,
                    });
                }

                toast.error(result.message);
                return;
            }

            toast.success(result.message);
            form.reset();
        } finally {
            setIsSubmitting(false);
        }
    });

    function toggleShowPassword(field: PasswordFieldKey) {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    }

    return {
        form,
        onSubmit,
        isSubmitting,
        showPassword,
        toggleShowPassword,
    };
}