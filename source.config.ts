import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import { remarkD2, type RemarkD2Options } from '@vanhiep99w/docs-kit/d2';
import { remarkTerminalSession } from '@vanhiep99w/docs-kit/terminal-session';
import { remarkCodeDiff } from '@vanhiep99w/docs-kit/code-diff';
import { remarkCodeWalkthrough } from '@vanhiep99w/docs-kit/code-walkthrough';
import { remarkProtocolExchange } from '@vanhiep99w/docs-kit/protocol-exchange';
import { remarkSpanWaterfall } from '@vanhiep99w/docs-kit/span-waterfall';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      d2Layout: z.enum(['elk', 'dagre', 'tala']).optional(),
    }),
  },
});

const d2Options: RemarkD2Options = {
  assetsRoot: 'content/assets/d2',
  concurrency: 1,
  // Static by default; the author opts in with fence metadata.
  interactive: false,
};

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      [remarkD2, d2Options],
      remarkTerminalSession,
      remarkCodeDiff,
      remarkCodeWalkthrough,
      remarkProtocolExchange,
      remarkSpanWaterfall,
    ],
  },
});
