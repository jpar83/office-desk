import { copyFile } from 'node:fs/promises'
await copyFile('dist-portable/index.html', 'dist-portable/OfficeDesk.html')
