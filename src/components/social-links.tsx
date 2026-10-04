import { SOCIAL } from "@/lib/social";

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      <a
        href={SOCIAL.instagram.href}
        target="_blank"
        rel="noreferrer"
        className="text-sm underline-offset-4 hover:underline"
      >
        Instagram {SOCIAL.instagram.handle}
      </a>
      <a
        href={SOCIAL.facebook.href}
        target="_blank"
        rel="noreferrer"
        className="text-sm underline-offset-4 hover:underline"
      >
        Facebook
      </a>
    </div>
  );
}
