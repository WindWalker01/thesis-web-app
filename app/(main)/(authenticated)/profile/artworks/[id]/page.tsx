import ArtworkDetailPage from "@/features/(user)/profile/subfeatures/artwork-detail/components/Page";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
    const { id } = await params;

    return <ArtworkDetailPage id={id} />;
}