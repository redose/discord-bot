export interface GuildsTable {
  readonly id: string;
  announcementsChannelId: string;
  readonly createdAt: Date;
}

export interface EmergencyAlertsTable {
  readonly id: string;
  targetUserId: string;
  guildId: string;
  channelId: string;
  description?: string;
  createdBy: string;
  closedBy?: string;
  closedAt?: Date;
  readonly createdAt: Date;
}
