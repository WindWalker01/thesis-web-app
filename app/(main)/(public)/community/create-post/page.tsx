import PostEditorForm from "@/features/(user)/community-post/components/post-editor-form";

export default function CreateCommunityPostPage() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <div className="max-w-3xl mx-auto px-4 relative pt-24 pb-16">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Create Post
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Share your artwork with the community.
                    </p>
                </div>

                <PostEditorForm mode="create" />
            </div>
        </div>
    );
}