import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminReportDetailPage({ params }: Props) {
  const { id } = await params;
  // Redirect to the main reports management page which uses the drawer-based detail view
  redirect(`/admin/reports?selected=${id}`);
}