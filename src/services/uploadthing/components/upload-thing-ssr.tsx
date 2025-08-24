import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { extractRouterConfig } from 'uploadthing/server';
import { customFileRouter } from '../router';

export function UploadThingSSR() {
  return (
    <Suspense>
      <UTSSR />
    </Suspense>
  );
}

async function UTSSR() {
  await connection();

  return <NextSSRPlugin routerConfig={extractRouterConfig(customFileRouter)} />;
}
