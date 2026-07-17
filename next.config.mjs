/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Garante as variáveis PÚBLICAS do Supabase também no bundle do servidor
  // (Server Components force-dynamic). São chaves públicas (anon/URL).
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  experimental: {
    // Uploads de foto no admin trafegam como data URL num Server Action.
    serverActions: { bodySizeLimit: "8mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
