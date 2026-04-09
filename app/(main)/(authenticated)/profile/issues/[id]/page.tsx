import IssueDetailPage from "@/features/(user)/profile/(artwork-details)/issue-detail/components/Page";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
    const { id } = await params;

    return <IssueDetailPage id={id} />;
}