import { rmSync } from 'node:fs';
// A fresh output prevents withdrawn posts and deleted media surviving a rebuild.
rmSync('_site', { recursive: true, force: true });
