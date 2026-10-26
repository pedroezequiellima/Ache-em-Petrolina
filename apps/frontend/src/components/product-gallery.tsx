"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { isExternalImage } from "@/lib/format";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-2xl bg-stone-100 text-stone-500">
        <span className="flex flex-col items-center gap-2 text-sm">
          <ImageOff className="size-8" aria-hidden />
          Sem fotos
        </span>
      </div>
    );
  }

  function handleScroll() {
    const track = trackRef.current;
    if (track) setActive(Math.round(track.scrollLeft / track.clientWidth));
  }

  function goTo(index: number) {
    const track = trackRef.current;
    setActive(index);
    track?.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          role="region"
          aria-label="Fotos do produto"
          tabIndex={0}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-2xl bg-stone-100 focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="relative aspect-square w-full shrink-0 snap-center">
              <Image
                src={src}
                unoptimized={isExternalImage(src)}
                alt={`${alt} — foto ${i + 1} de ${images.length}`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                preload={i === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {active + 1}/{images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={active === i ? "true" : undefined}
              className={`relative size-16 overflow-hidden rounded-lg bg-stone-100 ring-2 transition ${
                active === i ? "ring-brand-600" : "opacity-70 ring-transparent hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                unoptimized={isExternalImage(src)}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
