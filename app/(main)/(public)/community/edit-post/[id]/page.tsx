import { notFound } from "next/navigation";

import PostEditorForm from "@/features/(user)/community/subfeatures/community-post-crud/components/PostForm";
import { getPostEditorData } from "@/features/(user)/community/subfeatures/community-post-crud/server/create-post";

type EditPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditCommunityPostPage({
    params,
}: EditPageProps) {
    const { id } = await params;
    const initialData = await getPostEditorData({ postId: id });

    if (!initialData.existingPost) {
        notFound();
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
            <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
                <div className="mb-8 max-w-2xl">
                    <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Community
                    </span>

                    <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                        Edit your community post
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                        Update the artwork selection or visibility of your post while keeping your
                        community sharing details accurate and up to date.
                    </p>
                </div>

                <PostEditorForm
                    mode="edit"
                    postId={id}
                    initialData={initialData}
                />
            </div>
        </div>
    );
}