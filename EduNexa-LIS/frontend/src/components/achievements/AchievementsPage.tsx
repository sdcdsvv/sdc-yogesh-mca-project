import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Users, 
  Zap, 
  Crown,
  Medal,
  Shield,
  Filter,
  Search,
  Calendar,
  Share2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import AchievementAPI, { Achievement } from '../../services/achievementAPI';

export const AchievementsPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = async () => {
    try {
      setError(null);
      const [achievementsData, rankData] = await Promise.all([
        AchievementAPI.getAchievements(),
        AchievementAPI.getUserRank()
      ]);
      setAchievements(achievementsData);
      setUserRank(rankData.rank || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load achievements.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-700';
      case 'rare': return 'text-blue-700';
      case 'epic': return 'text-purple-700';
      case 'legendary': return 'text-yellow-700';
      default: return 'text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning': return BookOpen;
      case 'engagement': return Clock;
      case 'performance': return TrendingUp;
      case 'social': return Users;
      case 'special': return Crown;
      default: return Trophy;
    }
  };

  const filteredAchievements = achievements
    .filter(achievement => {
      if (filter === 'unlocked') return achievement.unlocked_at;
      if (filter === 'locked') return !achievement.unlocked_at;
      return true;
    })
    .filter(achievement => {
      if (selectedCategory === 'all') return true;
      return achievement.category === selectedCategory;
    })
    .filter(achievement =>
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPoints = achievements
    .filter(a => a.unlocked_at)
    .reduce((sum, a) => sum + a.points, 0);

  const unlockedCount = achievements.filter(a => a.unlocked_at).length;
  const totalCount = achievements.length;

  const categories = [
    { id: 'all', label: 'All Categories', icon: Trophy },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'engagement', label: 'Engagement', icon: Clock },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'special', label: 'Special', icon: Crown }
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return '—';
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
        <p className="text-gray-600">Track your learning milestones and unlock rewards</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-red-700 font-medium">
            <AlertTriangle className="h-5 w-5" />
            Error loading achievements
          </div>
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchAchievements();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      ) : (
        <>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unlocked</p>
              <p className="text-2xl font-bold text-gray-900">{unlockedCount}/{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round((unlockedCount / totalCount) * 100)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Achievements</p>
              <p className="text-2xl font-bold text-gray-900">{unlockedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Achievements</option>
              <option value="unlocked">Unlocked</option>
              <option value="locked">Locked</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <category.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => {
          const CategoryIcon = getCategoryIcon(achievement.category);
          const isUnlocked = !!achievement.unlocked_at;
          
          return (
            <div
              key={achievement.id}
              className={`relative bg-white rounded-xl shadow-sm border-2 p-6 transition-all duration-200 hover:shadow-md ${
                isUnlocked 
                  ? getRarityColor(achievement.rarity)
                  : 'border-gray-200 bg-gray-50 opacity-75'
              }`}
            >
              {/* Rarity Badge */}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium capitalize ${
                isUnlocked ? getRarityTextColor(achievement.rarity) : 'text-gray-500'
              }`}>
                {achievement.rarity}
              </div>

              {/* Achievement Icon */}
              <div className="text-center mb-4">
                <div className={`text-6xl mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CategoryIcon className={`h-4 w-4 ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium capitalize ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.category}
                  </span>
                </div>
              </div>

              {/* Achievement Info */}
              <div className="text-center mb-4">
                <h3 className={`text-lg font-semibold mb-2 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                  {achievement.title}
                </h3>
                <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                  {achievement.description}
                </p>
              </div>

              {/* Progress Bar (for locked achievements) */}
              {!isUnlocked && achievement.progress && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress.current}/{achievement.progress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(achievement.progress.current / achievement.progress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div className="mb-4">
                <h4 className={`text-sm font-medium mb-2 ${isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                  Requirements:
                </h4>
                <ul className="space-y-1">
                  {achievement.requirements.map((req, index) => (
                    <li key={index} className={`text-xs flex items-center gap-2 ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Medal className={`h-4 w-4 ${isUnlocked ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                    {achievement.points} pts
                  </span>
                </div>

                {isUnlocked ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDate(achievement.unlocked_at!)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Locked</span>
                  </div>
                )}
              </div>

              {/* Share Button (for unlocked achievements) */}
              {isUnlocked && (
                <button className="absolute top-3 left-3 p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
        </>
      )}

    </div>
  );
};