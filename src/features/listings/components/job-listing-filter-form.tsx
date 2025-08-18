'use client';

import { LoadingSwap } from '@/components/loading-swap';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useSidebar } from '@/components/ui/sidebar';
import {
    ExperienceLevel,
    experienceLevels,
    JobListingType,
    jobListingTypes,
    LocationRequirement,
    locationRequirements,
} from '@/drizzle/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import z from 'zod';
import {
    formatExperienceLevel,
    formatJobType,
    formatLocationRequirement,
} from '../lib/formatters';
import { StateSelectItems } from './state-select-items';

const ANY_VALUE = 'any';

const jobListingFilterSchema = z.object({
  title: z.string().optional(),
  city: z.string().optional(),
  stateAbbreviation: z.string().or(z.literal(ANY_VALUE)).optional(),
  experienceLevel: z.enum(experienceLevels).or(z.literal(ANY_VALUE)).optional(),
  type: z.enum(jobListingTypes).or(z.literal(ANY_VALUE)).optional(),
  locationRequirement: z
    .enum(locationRequirements)
    .or(z.literal(ANY_VALUE))
    .optional(),
});

export default function JobListingFilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setOpenMobile } = useSidebar();

  const form = useForm({
    resolver: zodResolver(jobListingFilterSchema),
    defaultValues: {
      title: searchParams.get('title') ?? '',
      city: searchParams.get('city') ?? '',
      stateAbbreviation: searchParams.get('state') ?? ANY_VALUE,
      experienceLevel:
        (searchParams.get('experienceLevel') as ExperienceLevel) ?? ANY_VALUE,
      type: (searchParams.get('type') as JobListingType) ?? ANY_VALUE,
      locationRequirement:
        (searchParams.get('locationRequirement') as LocationRequirement) ??
        ANY_VALUE,
    },
  });

  async function onSubmit(values: z.infer<typeof jobListingFilterSchema>) {
    const params = new URLSearchParams();
    if (values.city) params.set('city', values.city);
    if (values.stateAbbreviation && values.stateAbbreviation !== ANY_VALUE)
      params.set('state', values.stateAbbreviation);
    if (values.title) params.set('title', values.title);
    if (values.experienceLevel && values.experienceLevel !== ANY_VALUE)
      params.set('experience', values.experienceLevel);
    if (values.type && values.type !== ANY_VALUE)
      params.set('type', values.type);
    if (values.locationRequirement && values.locationRequirement !== ANY_VALUE)
      params.set('locationRequirement', values.locationRequirement);
    router.push(`/?${params.toString()}`);
    setOpenMobile(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="locationRequirement"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Requirement</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ANY_VALUE}>Any</SelectItem>
                    {locationRequirements.map((lr) => (
                      <SelectItem key={lr} value={lr}>
                        {formatLocationRequirement(lr)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="city"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="stateAbbreviation"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  <StateSelectItems />
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {jobListingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatJobType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="experienceLevel"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {experienceLevels.map((experience) => (
                    <SelectItem key={experience} value={experience}>
                      {formatExperienceLevel(experience)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Filter
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
