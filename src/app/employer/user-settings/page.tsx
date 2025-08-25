import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '@/drizzle/db';
import { OrganizationUserSettingsTable } from '@/drizzle/schema';
import { NotificationForm } from '@/features/organization/components/notifications-form';
import {
  getCurrentOrganization,
  getCurrentUser,
} from '@/services/clerk/lib/get-current-auth';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export default function EmployerUserSettingsPage() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

async function SuspendedComponent() {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();

  if (!userId || !orgId) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <SuspendedForm userId={userId} organizationId={orgId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedForm({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  const notificationSettings = await getNotificationSettings(
    userId,
    organizationId
  );

  return <NotificationForm notificationSettings={notificationSettings} />;
}

async function getNotificationSettings(userId: string, organizationId: string) {
  return db.query.OrganizationUserSettingsTable.findFirst({
    where: and(
      eq(OrganizationUserSettingsTable.userId, userId),
      eq(OrganizationUserSettingsTable.organizationId, organizationId)
    ),
    columns: {
      newApplicationEmailNotifications: true,
      minimumRating: true,
    },
  });
}
