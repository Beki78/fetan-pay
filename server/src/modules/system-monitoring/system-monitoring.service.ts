import { Injectable } from '@nestjs/common';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

interface SystemMetrics {
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
    cpuUsage: NodeJS.CpuUsage;
  };
}

@Injectable()
export class SystemMonitoringService {
  private previousCpuUsage: NodeJS.CpuUsage | null = null;
  private previousCpuTime: number | null = null;

  /**
   * Get comprehensive system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const cpuUsage = await this.getCpuUsage();
    const memory = this.getMemoryMetrics();
    const disk = await this.getDiskMetrics();
    const network = this.getNetworkMetrics();
    const system = this.getSystemInfo();
    const process = this.getProcessMetrics();

    return {
      cpu: {
        model: os.cpus()[0]?.model || 'Unknown',
        cores: os.cpus().length,
        usage: cpuUsage,
        loadAverage: os.loadavg(),
      },
      memory,
      disk,
      network,
      system,
      process,
    };
  }

  /**
   * Calculate CPU usage percentage
   */
  private async getCpuUsage(): Promise<number> {
    const currentCpuUsage = process.cpuUsage();
    const currentTime = Date.now();

    if (this.previousCpuUsage && this.previousCpuTime) {
      const userDiff = currentCpuUsage.user - this.previousCpuUsage.user;
      const systemDiff = currentCpuUsage.system - this.previousCpuUsage.system;
      const timeDiff = (currentTime - this.previousCpuTime) * 1000; // Convert to microseconds

      const totalCpuTime = userDiff + systemDiff;
      const cpuUsage = (totalCpuTime / timeDiff) * 100;

      this.previousCpuUsage = currentCpuUsage;
      this.previousCpuTime = currentTime;

      return Math.min(100, Math.max(0, cpuUsage));
    }

    this.previousCpuUsage = currentCpuUsage;
    this.previousCpuTime = currentTime;

    // Wait a bit and calculate again for accurate reading
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.getCpuUsage();
  }

  /**
   * Get memory metrics
   */
  private getMemoryMetrics() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const percentage = (usedMemory / totalMemory) * 100;

    return {
      total: totalMemory,
      free: freeMemory,
      used: usedMemory,
      percentage: Math.round(percentage * 100) / 100,
    };
  }

  /**
   * Get disk metrics (for root partition)
   * Note: For accurate disk metrics on Windows, consider using a package like 'node-disk-info'
   */
  private async getDiskMetrics() {
    try {
      // For Unix-like systems, we can try to read from /proc/mounts or use exec
      // For now, we'll provide a basic implementation
      // On Windows, this would require additional packages

      if (process.platform === 'win32') {
        // Windows doesn't have easy access to disk stats without additional packages
        // Return placeholder values
        return {
          total: 0,
          free: 0,
          used: 0,
          percentage: 0,
        };
      }

      // For Linux/Unix, try to get disk stats using exec
      // This is a simplified version - for production, consider using a library
      const execAsync = promisify(exec);

      try {
        const { stdout } = await execAsync(
          "df -k / | tail -1 | awk '{print $2,$3,$4}'",
        );
        const parts = stdout.trim().split(/\s+/);
        const total = Number(parts[0]);
        const used = Number(parts[1]);
        const free = Number(parts[2]);

        const totalBytes = total * 1024;
        const usedBytes = used * 1024;
        const freeBytes = free * 1024;
        const percentage = (usedBytes / totalBytes) * 100;

        return {
          total: totalBytes,
          free: freeBytes,
          used: usedBytes,
          percentage: Math.round(percentage * 100) / 100,
        };
      } catch {
        // Fallback if exec fails
        return {
          total: 0,
          free: 0,
          used: 0,
          percentage: 0,
        };
      }
    } catch {
      // Fallback if anything fails
      return {
        total: 0,
        free: 0,
        used: 0,
        percentage: 0,
      };
    }
  }

  /**
   * Get network interface information
   */
  private getNetworkMetrics() {
    const interfaces = os.networkInterfaces();
    const networkInterfaces: Array<{
      name: string;
      address: string;
      netmask: string;
      mac: string;
    }> = [];

    for (const [name, addresses] of Object.entries(interfaces)) {
      if (!addresses) continue;

      for (const addr of addresses) {
        if (addr.family === 'IPv4' && !addr.internal) {
          networkInterfaces.push({
            name,
            address: addr.address,
            netmask: addr.netmask,
            mac: addr.mac,
          });
        }
      }
    }

    return {
      interfaces: networkInterfaces,
    };
  }

  /**
   * Get system information
   */
  private getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      nodeVersion: process.version,
      processUptime: process.uptime(),
    };
  }

  /**
   * Get process metrics
   */
  private getProcessMetrics() {
    return {
      pid: process.pid,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format seconds to human readable format
   */
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}
