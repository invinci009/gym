import {
  GymSettings,
  GymMember,
  AttendanceSession,
  DailyAttendance,
  PointTransaction,
  Reward,
  RewardRedemption,
  AuditLog,
} from '../types';
import {
  INITIAL_GYM_SETTINGS,
  INITIAL_MEMBERS,
  INITIAL_REWARDS,
  INITIAL_ATTENDANCE,
  INITIAL_TRANSACTIONS,
  INITIAL_REDEMPTIONS,
  INITIAL_AUDIT_LOGS,
} from './data';

export {
  INITIAL_GYM_SETTINGS,
  INITIAL_MEMBERS,
  INITIAL_REWARDS,
  INITIAL_ATTENDANCE,
  INITIAL_TRANSACTIONS,
  INITIAL_REDEMPTIONS,
  INITIAL_AUDIT_LOGS,
};

// Safe server-only fs & path access that won't break Turbopack/browser bundles
function getNodeFs() {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return eval('require')('fs');
    } catch {
      return null;
    }
  }
  return null;
}

function getNodePath() {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return eval('require')('path');
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * In-memory state store with disk persistence fallback (.data/gym-store.json)
 */
class InMemoryStore {
  settings: GymSettings = { ...INITIAL_GYM_SETTINGS };
  members: GymMember[] = [...INITIAL_MEMBERS];
  attendance: AttendanceSession[] = [...INITIAL_ATTENDANCE];
  dailyAttendance: DailyAttendance[] = [];
  transactions: PointTransaction[] = [...INITIAL_TRANSACTIONS];
  rewards: Reward[] = [...INITIAL_REWARDS];
  redemptions: RewardRedemption[] = [...INITIAL_REDEMPTIONS];
  auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

  private storageFile: string | null = null;

  constructor() {
    const nodePath = getNodePath();
    if (nodePath) {
      this.storageFile = nodePath.resolve(process.cwd(), '.data', 'gym-store.json');
      this.loadFromDisk();
    }
  }

  loadFromDisk(): void {
    try {
      const nodeFs = getNodeFs();
      if (nodeFs && this.storageFile && nodeFs.existsSync(this.storageFile)) {
        const raw = nodeFs.readFileSync(this.storageFile, 'utf8');
        const data = JSON.parse(raw);
        if (data.settings) this.settings = data.settings;
        if (Array.isArray(data.members)) this.members = data.members;
        if (Array.isArray(data.attendance)) this.attendance = data.attendance;
        if (Array.isArray(data.transactions)) this.transactions = data.transactions;
        if (Array.isArray(data.rewards)) this.rewards = data.rewards;
        if (Array.isArray(data.redemptions)) this.redemptions = data.redemptions;
        if (Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;
      }
    } catch {
      // fallback to initial in-memory defaults
    }
  }

  persist(): void {
    try {
      const nodeFs = getNodeFs();
      const nodePath = getNodePath();
      if (nodeFs && nodePath && this.storageFile) {
        const dir = nodePath.dirname(this.storageFile);
        if (!nodeFs.existsSync(dir)) {
          nodeFs.mkdirSync(dir, { recursive: true });
        }
        const data = {
          settings: this.settings,
          members: this.members,
          attendance: this.attendance,
          transactions: this.transactions,
          rewards: this.rewards,
          redemptions: this.redemptions,
          auditLogs: this.auditLogs,
        };
        nodeFs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch {
      // ignore
    }
  }

  // Helper getters
  getMember(uidOrEmail: string): GymMember | undefined {
    return this.members.find((m) => m.uid === uidOrEmail || m.email.toLowerCase() === uidOrEmail.toLowerCase());
  }

  getActiveSession(memberId: string): AttendanceSession | undefined {
    return this.attendance.find((a) => a.memberId === memberId && a.status === 'checked_in');
  }

  getMemberHistory(memberId: string): AttendanceSession[] {
    return this.attendance
      .filter((a) => a.memberId === memberId)
      .sort((a, b) => new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime());
  }

  getMemberTransactions(memberId: string): PointTransaction[] {
    return this.transactions
      .filter((t) => t.memberId === memberId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getMemberRedemptions(memberId: string): RewardRedemption[] {
    return this.redemptions
      .filter((r) => r.memberId === memberId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Global singleton instance preserved across HMR in Next.js Turbopack dev
const globalForStore = globalThis as unknown as { gymStore?: InMemoryStore };

export const gymStore =
  globalForStore.gymStore && typeof (globalForStore.gymStore as any).persist === 'function'
    ? globalForStore.gymStore
    : (globalForStore.gymStore = new InMemoryStore());
