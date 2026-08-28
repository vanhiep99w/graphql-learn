import { docs } from '@/.source';
import { loader, type VirtualFile } from 'fumadocs-core/source';

const generatedSource = docs.toFumadocsSource();

// fumadocs-mdx@11.x returns `Source.files` as a function, while
// fumadocs-core@15.x expects an array and calls `.map()` on it.
const generatedFiles = generatedSource.files;
const files =
  typeof generatedFiles === 'function'
    ? (generatedFiles as unknown as () => VirtualFile[])()
    : (generatedFiles as unknown as VirtualFile[]);

export const source = loader({
  baseUrl: '/docs',
  source: { files },
});
