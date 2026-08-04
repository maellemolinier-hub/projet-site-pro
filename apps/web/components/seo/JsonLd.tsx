import Script from "next/script";

interface JsonLdProps {
  id: string;
  data: Record<string, unknown>;
}

export function JsonLd({ id, data }: JsonLdProps) {
  return (
    <Script
      id={`jsonld-${id}`}
      strategy="beforeInteractive"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}