import { apiClient, API_ENDPOINTS } from '../config/api';

export interface AchievementProgress {
  current: number;
  total: number;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  rarity: string;
  points: number;
  icon: string;
  requirements: string[];
  progress: AchievementProgress;
  is_unlocked: boolean;
  unlocked_at?: string | null;
}

export interface UserRank {
  rank: number;
  total_users: number;
  total_points: number;
  percentile: number;
}

export class AchievementAPI {
  static async getAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<{ achievements: Achievement[] }>(
      API_ENDPOINTS.ACHIEVEMENTS.BASE
    );
    return response.achievements;
  }

  static async getUserRank(): Promise<UserRank> {
    try {
      const response = await apiClient.get<UserRank>(
        `${API_ENDPOINTS.ACHIEVEMENTS.BASE}/rank`
      );
      return response;
    } catch (error) {
      // Fallback if rank endpoint doesn't exist yet
      console.warn('Rank endpoint not available, using fallback');
      return {
        rank: 0,
        total_users: 0,
        total_points: 0,
        percentile: 0
      };
    }
  }
}

export default AchievementAPI;

