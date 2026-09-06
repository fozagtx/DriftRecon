export const config = {
  tensormux: {
    baseUrl: "https://api.tensormux.com",
    model: "glm-4-7-flash",
  },
  neatlogs: {
    endpoint: "https://api.neatlogs.com/v1/traces",
  },
} as const;
