import { baseApi } from "../redux/api";

export interface SystemMetrics {
  cpu: {
    model: string;
    cores: number;
    usage: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  disk: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  network: {
    interfaces: Array<{
      name: string;
      address: string;
      netmask: string;
      mac: string;
    }>;
  };
  system: {
    platform: string;
    arch: string;
    hostname: string;
    uptime: number;
    nodeVersion: string;
    processUptime: number;
  };
  process: {
    pid: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    cpuUsage: {
      user: number;
      system: number;
    };
  };
  formatted: {
    memory: {
      total: string;
      free: string;
      used: string;
      percentage: string;
    };
    disk: {
      total: string;
      free: string;
      used: string;
      percentage: string;
    };
    system: {
      platform: string;
      arch: string;
      hostname: string;
      uptime: string;
      nodeVersion: string;
      processUptime: string;
    };
    process: {
      pid: number;
      memoryUsage: {
        rss: string;
        heapTotal: string;
        heapUsed: string;
        external: string;
      };
    };
  };
}

export const systemMonitoringApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemMetrics: builder.query<SystemMetrics, void>({
      query: () => "/system-monitoring/metrics",
      providesTags: [{ type: "Merchant", id: "SYSTEM_METRICS" }],
    }),
  }),
});

export const { useGetSystemMetricsQuery } = systemMonitoringApi;

