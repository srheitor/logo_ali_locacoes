import { useState, type ImgHTMLAttributes } from 'react';
import { FOTO_FALLBACK } from '@/mocks';

/** Imagem de imóvel com fallback caso a URL falhe (ex.: sem internet na apresentação). */
export function ImovelImage({ src, alt = '', ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  return <img src={failed || !src ? FOTO_FALLBACK : src} alt={alt} loading="lazy" onError={() => setFailed(true)} {...rest} />;
}
