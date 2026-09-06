export const config = {
  neon: {
    host: "ep-rough-sun-aubvpitb-pooler.c-10.us-east-1.aws.neon.tech",
    database: "neondb",
    role: "neondb_owner",
  },
  tensormux: {
    baseUrl: "https://api.tensormux.com",
    model: "glm-4-7-flash",
  },
  neatlogs: {
    endpoint: "https://api.neatlogs.com/v1/traces",
  },
} as const;
