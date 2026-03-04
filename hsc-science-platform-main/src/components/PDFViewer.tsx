'use client';

interface Props {
  url: string;
  title: string;
}

export default function PDFViewer({ url, title }: Props) {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-white/10" style={{ height: '600px' }}>
      <iframe
        src={`${url}#toolbar=1`}
        title={title}
        className="w-full h-full"
        loading="lazy"
      />
    </div>
  );
}
