"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    recoveryOtpSchema,
    recoveryPasswordSchema,
    type RecoveryOtpInput,
    type RecoveryPasswordInput,
} from "../schemas/reset-password-schema";

import { useResetPassword } from "../hooks/useResetPassword";

import { ResetPasswordLoading } from "./ResetPasswordLoading";
import { ResetPasswordSuccess } from "./ResetPasswordSuccess";
import { VerifyOtpStep } from "./VerifyOtpStep";
import { SetNewPasswordStep } from "./SetNewPasswordStep";

export default function ResetPasswordPage() {
    const flow = useResetPassword();

    const otpForm = useForm<RecoveryOtpInput>({
        resolver: zodResolver(recoveryOtpSchema),
        defaultValues: { token: "" },
    });

    const passwordForm = useForm<RecoveryPasswordInput>({
        resolver: zodResolver(recoveryPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    if (!flow.isHydrated) {
        return <ResetPasswordLoading />;
    }

    if (flow.isSuccess) {
        return <ResetPasswordSuccess />;
    }

    if (!flow.otpVerified) {
        return (
            <VerifyOtpStep
                email={flow.email}
                serverError={flow.serverError}
                isCheckingOtp={flow.isCheckingOtp}
                form={otpForm}
                onSubmit={flow.verifyOtp}
            />
        );
    }

    return (
        <SetNewPasswordStep
            serverError={flow.serverError}
            isUpdatingPassword={flow.isUpdatingPassword}
            form={passwordForm}
            onSubmit={flow.submitNewPassword}
        />
    );
}