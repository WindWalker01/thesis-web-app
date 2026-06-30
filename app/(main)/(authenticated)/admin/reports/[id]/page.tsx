import ReportDetail from "@/features/admin/review-reports/components/ReportDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminReportDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <ReportDetail reportId={id} />
    </div>
  );
}