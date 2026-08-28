import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-fd-background px-6 py-16 text-fd-foreground">
      <section className="w-full max-w-3xl space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-fd-primary">
            GraphQL learning path
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            GraphQL với Spring Boot
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-fd-muted-foreground">
            Lộ trình học GraphQL tập trung vào xây dựng, kiểm thử và vận hành API
            bằng Spring Boot và Spring for GraphQL.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center rounded-lg bg-fd-primary px-5 py-3 font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Mở tài liệu
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </Link>
          <Link
            href="/docs/bat-dau/khoi-tao-spring-boot"
            className="inline-flex items-center rounded-lg border border-fd-border px-5 py-3 font-medium transition-colors hover:bg-fd-accent"
          >
            Bắt đầu với Spring Boot
          </Link>
        </div>

        <div className="grid gap-4 border-t border-fd-border pt-6 text-sm text-fd-muted-foreground sm:grid-cols-3">
          <div>
            <strong className="block text-fd-foreground">72</strong>
            trang chủ đề
          </div>
          <div>
            <strong className="block text-fd-foreground">11</strong>
            nhóm kiến thức
          </div>
          <div>
            <strong className="block text-fd-foreground">Spring for GraphQL</strong>
            trục nội dung chính
          </div>
        </div>
      </section>
    </main>
  );
}
