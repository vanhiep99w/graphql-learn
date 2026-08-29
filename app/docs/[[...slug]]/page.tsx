import { source } from '@/lib/source';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import type { TableOfContents } from 'fumadocs-core/toc';
import type { ComponentType } from 'react';
import type { MDXComponents } from 'mdx/types';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';

type MDXPageData = {
  body: ComponentType<{ components?: MDXComponents }>;
  toc?: TableOfContents;
  full?: boolean;
};

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const pageData = page.data as typeof page.data & MDXPageData;
  const MDXContent = pageData.body;

  // Keep the article wide; global.css supplies the same compact gutter as a
  // fallback for layout internals that are not exposed through this prop.
  return (
    <DocsPage
      toc={pageData.toc}
      full={pageData.full}
      className="max-w-none px-3 md:px-5"
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
