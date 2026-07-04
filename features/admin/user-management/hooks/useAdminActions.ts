"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  suspendUser,
  banUser,
  reactivateUser,
  verifyArtist,
  removeVerification,
  sendPasswordReset,
  deleteUser,
  bulkSuspendUsers,
  bulkBanUsers,
  bulkVerifyUsers,
} from "../server/admin-actions";
import { sendNotification } from "../server/notifications";
import { userManagementKeys } from "./useUserManagement";
import { userDetailKeys } from "./useUserDetail";
import type {
  SuspendPayload,
  BanPayload,
  SendNotificationPayload,
  AdminActionResult,
} from "../types";

export function useAdminActions() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: userManagementKeys.all() });
  };

  const invalidateUser = (userId: string) => {
    queryClient.invalidateQueries({ queryKey: userDetailKeys.detail(userId) });
    invalidateAll();
  };

  const handleSuccess = (result: AdminActionResult) => {
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    return result;
  };

  const handleError = (error: Error) => {
    toast.error(error.message);
    return { success: false as const, message: error.message };
  };

  const suspendMutation = useMutation({
    mutationFn: async (payload: SuspendPayload) => {
      const result = await suspendUser(payload);
      return handleSuccess(result);
    },
    onSuccess: (result, payload) => {
      if (result.success) invalidateUser(payload.user_id);
    },
    onError: (error: Error) => handleError(error),
  });

  const banMutation = useMutation({
    mutationFn: async (payload: BanPayload) => {
      const result = await banUser(payload);
      return handleSuccess(result);
    },
    onSuccess: (result, payload) => {
      if (result.success) invalidateUser(payload.user_id);
    },
    onError: (error: Error) => handleError(error),
  });

  const reactivateMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const result = await reactivateUser(userId, reason);
      return handleSuccess(result);
    },
    onSuccess: (result, { userId }) => {
      if (result.success) invalidateUser(userId);
    },
    onError: (error: Error) => handleError(error),
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const result = await verifyArtist(userId, reason);
      return handleSuccess(result);
    },
    onSuccess: (result, { userId }) => {
      if (result.success) invalidateUser(userId);
    },
    onError: (error: Error) => handleError(error),
  });

  const removeVerificationMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const result = await removeVerification(userId, reason);
      return handleSuccess(result);
    },
    onSuccess: (result, { userId }) => {
      if (result.success) invalidateUser(userId);
    },
    onError: (error: Error) => handleError(error),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await sendPasswordReset(userId);
      return handleSuccess(result);
    },
    onError: (error: Error) => handleError(error),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const result = await deleteUser(userId, reason);
      return handleSuccess(result);
    },
    onSuccess: () => invalidateAll(),
    onError: (error: Error) => handleError(error),
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (payload: SendNotificationPayload) => {
      const result = await sendNotification(payload);
      return handleSuccess(result);
    },
    onSuccess: () => invalidateAll(),
    onError: (error: Error) => handleError(error),
  });

  const bulkSuspendMutation = useMutation({
    mutationFn: async ({ userIds, reason }: { userIds: string[]; reason: string }) => {
      const result = await bulkSuspendUsers(userIds, reason);
      return handleSuccess(result);
    },
    onSuccess: () => invalidateAll(),
    onError: (error: Error) => handleError(error),
  });

  const bulkBanMutation = useMutation({
    mutationFn: async ({ userIds, reason }: { userIds: string[]; reason: string }) => {
      const result = await bulkBanUsers(userIds, reason);
      return handleSuccess(result);
    },
    onSuccess: () => invalidateAll(),
    onError: (error: Error) => handleError(error),
  });

  const bulkVerifyMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const result = await bulkVerifyUsers(userIds);
      return handleSuccess(result);
    },
    onSuccess: () => invalidateAll(),
    onError: (error: Error) => handleError(error),
  });

  return {
    suspend: suspendMutation,
    ban: banMutation,
    reactivate: reactivateMutation,
    verify: verifyMutation,
    removeVerification: removeVerificationMutation,
    resetPassword: resetPasswordMutation,
    deleteUser: deleteUserMutation,
    sendNotification: sendNotificationMutation,
    bulkSuspend: bulkSuspendMutation,
    bulkBan: bulkBanMutation,
    bulkVerify: bulkVerifyMutation,
    isLoading:
      suspendMutation.isPending ||
      banMutation.isPending ||
      reactivateMutation.isPending ||
      verifyMutation.isPending ||
      removeVerificationMutation.isPending ||
      resetPasswordMutation.isPending ||
      deleteUserMutation.isPending ||
      sendNotificationMutation.isPending ||
      bulkSuspendMutation.isPending ||
      bulkBanMutation.isPending ||
      bulkVerifyMutation.isPending,
  };
}