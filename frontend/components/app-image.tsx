import NextImage, { type ImageProps } from 'next/image'
import { withBasePathIfInternal } from '@/lib/base-path'

/** next/image with basePath support when unoptimized (plain img src). */
export default function AppImage({ src, ...props }: ImageProps) {
  const resolved = typeof src === 'string' ? withBasePathIfInternal(src) : src
  return <NextImage src={resolved} {...props} />
}
