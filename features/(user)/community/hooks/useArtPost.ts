"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deletePost } from "../subfeatures/community-post-crud/server/delete-post";

type UseArtPostParams = {
  postId: string;
  onDeleted?: (postId: string) => void;
};

export function useArtPost({ postId, onDeleted }: UseArtPostParams) {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeletePost() {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      const result = await deletePost({ postId });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setDeleteModalOpen(false);
      onDeleted?.(postId);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the post.";

      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  function openDeleteModal() {
    if (isDeleting) return;
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (isDeleting) return;
    setDeleteModalOpen(false);
  }

  return {
    deleteModalOpen,
    setDeleteModalOpen,
    isDeleting,
    handleDeletePost,
    openDeleteModal,
    closeDeleteModal,
  };
}