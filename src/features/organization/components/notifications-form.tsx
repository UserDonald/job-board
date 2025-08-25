'use client';

import { LoadingSwap } from '@/components/loading-swap';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { OrganizationUserSettingsTable } from '@/drizzle/schema';
import { RatingIcons } from '@/features/applications/components/rating-icons';
import { RATING_OPTIONS } from '@/features/applications/data/constants';
import { organizationUserSettingsSchema } from '@/features/organization/actions/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { updateOrganizationUserSettings } from '../actions/actions';

const ANY_VALUE = 'any';

export function NotificationForm({
  notificationSettings,
}: {
  notificationSettings?: Pick<
    typeof OrganizationUserSettingsTable.$inferSelect,
    'newApplicationEmailNotifications' | 'minimumRating'
  >;
}) {
  const form = useForm({
    resolver: zodResolver(organizationUserSettingsSchema),
    defaultValues: notificationSettings ?? {
      newApplicationEmailNotifications: false,
      minimumRating: null,
    },
  });

  async function onSubmit(
    data: z.infer<typeof organizationUserSettingsSchema>
  ) {
    const result = await updateOrganizationUserSettings(data);

    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }
  }

  const newApplicationEmailNotifications = form.watch(
    'newApplicationEmailNotifications'
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="border rounded-lg p-4 shadow-sm space-y-6">
          <FormField
            control={form.control}
            name="newApplicationEmailNotifications"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Daily Email Notifications</FormLabel>
                    <FormDescription>
                      Receive summary emails of all new job listing
                      applications.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          {newApplicationEmailNotifications && (
            <FormField
              control={form.control}
              name="minimumRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Rating</FormLabel>
                  <FormDescription>
                    Only send you notifications for applications that have a
                    rating of at least this number.
                  </FormDescription>
                  <FormControl>
                    <Select
                      value={field.value ? field.value.toString() : ANY_VALUE}
                      onValueChange={(value) => {
                        field.onChange(
                          value === ANY_VALUE ? null : Number(value)
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue asChild>
                          {field.value == null ? (
                            <span>Any Rating</span>
                          ) : (
                            <RatingIcons
                              className="text-inherit"
                              rating={field.value}
                            />
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ANY_VALUE}>Any Rating</SelectItem>
                        {RATING_OPTIONS.filter((rating) => rating !== null).map(
                          (rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              <RatingIcons
                                className="text-inherit"
                                rating={rating}
                              />
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Only receive notifications for candidates that meet or
                    exceed this rating. Candidates 3-5 stars should meet all job
                    requirements and are likely a good fit for the role.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Save Notification Settings
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
