import { defineWebExtConfig } from 'wxt';
import { globSync } from 'glob';

const chromeExecutable = globSync('./chrome/**/chrome.exe')[0];

if (!chromeExecutable) {
  throw new Error('Chrome executable not found');
}

export default defineWebExtConfig({
  binaries: {
    chrome: chromeExecutable,
  },
});
