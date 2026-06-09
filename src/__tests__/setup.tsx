import '@testing-library/jest-dom'

// Suppress Next.js router / navigation warnings in tests
vi.mock('next/navigation', () => ({
  useRouter:       () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname:     () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Suppress Next.js Image optimization (converts to plain <img> in jsdom)
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    const { fill, sizes, ...imgRest } = rest
    return <img src={src} alt={alt} {...imgRest} />
  },
}))

// Suppress Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  ),
}))
