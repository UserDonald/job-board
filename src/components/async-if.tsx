import { ReactNode, Suspense } from 'react';

type Props = {
  condition: () => Promise<boolean>;
  children: ReactNode;
  fallback?: ReactNode;
  otherwise?: ReactNode;
};

export function AsyncIf({ condition, children, fallback, otherwise }: Props) {
  return (
    <Suspense fallback={fallback}>
      <SuspendedComponent condition={condition} otherwise={otherwise}>
        {children}
      </SuspendedComponent>
    </Suspense>
  );
}

async function SuspendedComponent({
  condition,
  children,
  otherwise,
}: Omit<Props, 'fallback'>) {
  return (await condition()) ? children : otherwise;
}
