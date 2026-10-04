import { useEffect, useState } from "react";

export function JsonLd({ data }: { data: unknown[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready || data.length === 0) return null;
  return (
    <>
      {data.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
