interface Project {
  slug: string;
  title: string;
  description: string;
  date: string;
  substackUrl?: string;
  substackTitle?: string;
  thumbnail: string;
  ogImage?: string;
  featured?: boolean;
  status: string;
}

export function getActiveProjects(projects: Project[]): Project[] {
  return projects
    .filter((p) => p.status === 'live')
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Short date for card meta: "FEB 27" */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate();
  return `${month} ${day}`;
}
