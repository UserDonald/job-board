import {
  ExperienceLevel,
  JobListingStatus,
  JobListingType,
  LocationRequirement,
  WageInterval,
} from '@/drizzle/schema';

export const formatWageInterval = (interval: WageInterval) => {
  switch (interval) {
    case 'hourly':
      return 'Hour';
    case 'yearly':
      return 'Year';
    default:
      throw new Error(`Invalid wage interval: ${interval satisfies never}`);
  }
};

export const formatLocationRequirement = (requirement: LocationRequirement) => {
  switch (requirement) {
    case 'remote':
      return 'Remote';
    case 'in-office':
      return 'In-office';
    case 'hybrid':
      return 'Hybrid';
    default:
      throw new Error(
        `Invalid location requirement: ${requirement satisfies never}`
      );
  }
};

export const formatJobType = (type: JobListingType) => {
  switch (type) {
    case 'full-time':
      return 'Full-time';
    case 'part-time':
      return 'Part-time';
    case 'internship':
      return 'Internship';
    default:
      throw new Error(`Invalid job type: ${type satisfies never}`);
  }
};

export const formatExperienceLevel = (level: ExperienceLevel) => {
  switch (level) {
    case 'junior':
      return 'Junior';
    case 'mid-level':
      return 'Mid-level';
    case 'senior':
      return 'Senior';
    default:
      throw new Error(`Invalid experience level: ${level satisfies never}`);
  }
};

export const formatJobListingStatus = (status: JobListingStatus) => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'published':
      return 'Published';
    case 'delisted':
      return 'Delisted';
    default:
      throw new Error(`Invalid job listing status: ${status satisfies never}`);
  }
};

export function formatWage(wage: number, wageInterval: WageInterval) {
  const wageFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  });

  switch (wageInterval) {
    case 'hourly': {
      return `${wageFormatter.format(wage)} / hr`;
    }
    case 'yearly': {
      return wageFormatter.format(wage);
    }
    default:
      throw new Error(`Unknown wage interval: ${wageInterval satisfies never}`);
  }
}

export function formatJobListingLocation({
  stateAbbreviation,
  city,
}: {
  stateAbbreviation: string | null;
  city: string | null;
}) {
  if (stateAbbreviation == null && city == null) return 'None';

  const locationParts = [];
  if (city != null) locationParts.push(city);
  if (stateAbbreviation != null) {
    locationParts.push(stateAbbreviation.toUpperCase());
  }

  return locationParts.join(', ');
}
