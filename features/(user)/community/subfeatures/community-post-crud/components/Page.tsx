import PostEditorForm from "@/features/(user)/community/subfeatures/community-post-crud/components/PostForm";
import { getPostEditorData } from "../server/create-post";

type CreatePostPageProps = {
    postId?: string;
};

export default async function CreatePostPage({
    postId,
}: CreatePostPageProps) {
    const initialData = await getPostEditorData({ postId });

    return (
        <div className="min-h-screen overflow-x-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
            <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
                <div className="mb-8 max-w-2xl">
                    <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Community
                    </span>

                    <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                        Create a post from your registered artwork
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                        Share your protected artwork with the community without duplicating the
                        title and description. Just select the artwork, add an optional caption,
                        and choose who can view it.
                    </p>
                </div>

                <PostEditorForm
                    mode={postId ? "edit" : "create"}
                    postId={postId}
                    initialData={initialData}
                />
            </div>
        </div>
    );
}