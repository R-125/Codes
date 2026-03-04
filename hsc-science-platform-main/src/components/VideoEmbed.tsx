'use client';
import { extractYouTubeId } from '@/lib/subjects';

interface Props {
  url: string;
  embedCode?: string | null;
  title: string;
}

export default function VideoEmbed({ url, embedCode, title }: Props) {
  if (embedCode) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden"
        dangerouslySetInnerHTML={{ __html: embedCode }} />
    );
  }

  const ytId = extractYouTubeId(url);
  if (ytId) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden">
      <iframe src={url} title={title} className="w-full h-full" allowFullScreen />
    </div>
  );
}
