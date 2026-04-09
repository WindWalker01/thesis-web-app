"use client";

import { Eye, EyeOff } from "lucide-react";
import { useChangePasswordForm } from "../hooks/useChangePasswordForm";

export default function ChangePasswordForm() {
    const {
        form,
        onSubmit,
        isSubmitting,
        showPassword,
        toggleShowPassword,
    } = useChangePasswordForm();

    const {
        register,
        formState: { errors },
    } = form;

    const fields = [
        {
            key: "currentPassword" as const,
            label: "Current Password",
        },
        {
            key: "newPassword" as const,
            label: "New Password",
        },
        {
            key: "confirmNewPassword" as const,
            label: "Confirm New Password",
        },
    ];

    return (
        <form onSubmit={onSubmit} className="p-6 space-y-4 max-w-lg">
            {fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                        {field.label}
                    </label>

                    <div className="relative">
                        <input
                            type={showPassword[field.key] ? "text" : "password"}
                            placeholder="••••••••••"
                            {...register(field.key)}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />

                        <button
                            type="button"
                            onClick={() => toggleShowPassword(field.key)}
                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword[field.key] ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {errors[field.key] && (
                        <p className="text-xs text-red-500">
                            {errors[field.key]?.message}
                        </p>
                    )}
                </div>
            ))}

            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
                {isSubmitting ? "Updating..." : "Update Password"}
            </button>
        </form>
    );
}