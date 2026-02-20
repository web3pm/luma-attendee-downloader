export interface LumaAttendee {
  userId: string;
  profileUrl: string;
  name: string;
  displayNameRaw: string;
  avatarUrl: string | null;
  x: string | null;
  instagram: string | null;
  sourceEventUrl: string;
  downloadedAt: string;
  extra: Record<string, string>;
}

export const SOCIAL_HOST_MAP: Record<
  string,
  keyof Pick<LumaAttendee, "x" | "instagram">
> = {
  "x.com": "x",
  "twitter.com": "x",
  "www.x.com": "x",
  "instagram.com": "instagram",
  "www.instagram.com": "instagram",
};

export function createEmptyAttendee(sourceEventUrl: string): LumaAttendee {
  return {
    userId: "",
    profileUrl: "",
    name: "",
    displayNameRaw: "",
    avatarUrl: null,
    x: null,
    instagram: null,
    sourceEventUrl,
    downloadedAt: new Date().toISOString(),
    extra: {},
  };
}
