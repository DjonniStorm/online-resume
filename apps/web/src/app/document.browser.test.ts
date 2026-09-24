import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

test('renders a heading in the document', async () => {
  document.body.innerHTML = '<h1>Online Resume</h1>';

  await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Online Resume');
});
