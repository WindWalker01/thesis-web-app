import PostEditorForm from "@/features/(user)/community-post/components/post-editor-form";

type EditPageProps = {
    params: Promise<{
        postId: string;
    }>;
};

export default async function EditCommunityPostPage({ params }: EditPageProps) {
    const { postId } = await params;

    return (
        <div className="w-full min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-4 relative pt-24 pb-16">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Edit Post
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Update your artwork post details.
                    </p>
                </div>

                <PostEditorForm mode="edit" postId={postId} />
            </div>
        </div>
    );
}