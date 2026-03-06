import { ReportDetailClient } from './ReportDetailClient';

/** Required for static export (S3): pre-render at least one path for this dynamic route */
export function generateStaticParams() {
  return [{ id: 'new' }];
}

export default function ReportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ReportDetailClient reportId={params.id} />;
}
