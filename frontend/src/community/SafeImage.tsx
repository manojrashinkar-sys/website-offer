import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /**
   * Render inside a <figure> with this class. The wrapper is removed along
   * with the image when the file is missing — otherwise an aspect-ratio box
   * would be left behind as an empty grey rectangle, which looks more broken
   * than having no picture at all.
   */
  figureClassName?: string;
}

/**
 * An image that removes itself if the file is not there.
 *
 * The site is a single-page app behind a catch-all rewrite, so a missing
 * image does not 404 — the server answers with index.html and a 200, and the
 * browser fails to decode HTML as an image. Either way the load fails, and
 * without this the card would show a broken-image icon.
 *
 * That makes the picture slots genuinely optional: the path can be committed
 * before the file exists, and the moment the file is added it appears with no
 * code change at all.
 */
export default function SafeImage({
  src, alt, width, height, className, figureClassName,
}: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  const img = (
    <img
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );

  return figureClassName ? <figure className={figureClassName}>{img}</figure> : img;
}
