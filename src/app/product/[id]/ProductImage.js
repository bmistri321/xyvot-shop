import Image from "next/image";

export default function ProductImage({ src, alt }) {
  return (
    <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/60">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-300">
          <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )}
    </div>
  );
}
