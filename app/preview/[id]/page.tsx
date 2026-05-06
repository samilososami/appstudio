import { FullScreenPreview } from '@/app/components/preview/FullScreenPreview';

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FullScreenPreview previewId={id} />;
}
