"use client"

import { useState, useEffect } from "react"
import { Award, Trophy, Target, TrendingUp, Star, Loader2 } from "lucide-react"
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { useAuth } from "@/hooks/use-auth"

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState("achievements")
  const { user } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const stats = userData ? {
    totalPoints: userData.totalPoints || 0,
    totalCleanups: userData.totalCleanups || 0,
    streakDays: userData.streakDays || 0,
    achievementsUnlocked: userData.achievementsUnlocked || 0,
    totalAchievements: userData.totalAchievements || 0,
    rank: userData.rank || "Newcomer",
    nextRank: userData.nextRank || "Beginner",
    pointsToNextRank: userData.pointsToNextLevel || 0,
  } : {
    totalPoints: 0,
    totalCleanups: 0,
    streakDays: 0,
    achievementsUnlocked: 0,
    totalAchievements: 0,
    rank: "Newcomer",
    nextRank: "Beginner",
    pointsToNextRank: 100,
  }

  const achievements = userData?.achievements || [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first cleanup",
      icon: "🌱",
      points: 50,
      unlocked: false,
      progress: 0,
      category: "milestone",
    },
    {
      id: 2,
      title: "Eco Warrior",
      description: "Complete 10 cleanups",
      icon: "⚔️",
      points: 200,
      unlocked: false,
      progress: 0,
      category: "milestone",
    },
    {
      id: 3,
      title: "Community Leader",
      description: "Organize 5 community cleanups",
      icon: "👑",
      points: 500,
      unlocked: false,
      progress: 0,
      category: "leadership",
    },
    {
      id: 4,
      title: "Streak Master",
      description: "Maintain a 30-day cleanup streak",
      icon: "🔥",
      points: 300,
      unlocked: false,
      progress: 0,
      category: "consistency",
    },
    {
      id: 5,
      title: "Verification Expert",
      description: "Verify 100 community cleanups",
      icon: "✅",
      points: 250,
      unlocked: false,
      progress: 0,
      category: "community",
    },
    {
      id: 6,
      title: "Beach Guardian",
      description: "Complete 20 beach cleanups",
      icon: "🏖️",
      points: 400,
      unlocked: false,
      progress: 0,
      category: "location",
    },
  ]

  const rewards = [
    {
      id: 1,
      title: "Eco-Friendly Water Bottle",
      description: "Sustainable stainless steel water bottle",
      points: 500,
      claimed: true,
      image: "🍶",
    },
    {
      id: 2,
      title: "Sweepify T-Shirt",
      description: "Official Sweepify organic cotton t-shirt",
      points: 750,
      claimed: false,
      available: true,
      image: "👕",
    },
    {
      id: 3,
      title: "Tree Planting Kit",
      description: "Plant your own tree with this starter kit",
      points: 1000,
      claimed: false,
      available: true,
      image: "🌳",
    },
    {
      id: 4,
      title: "Eco Hero Badge",
      description: "Physical badge recognizing your contribution",
      points: 1500,
      claimed: false,
      available: false,
      image: "🏅",
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "milestone":
        return "bg-green-100 text-green-700"
      case "leadership":
        return "bg-purple-100 text-purple-700"
      case "consistency":
        return "bg-orange-100 text-orange-700"
      case "community":
        return "bg-blue-100 text-blue-700"
      case "location":
        return "bg-teal-100 text-teal-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Function to determine current level based on points
  const getCurrentLevel = (points: number) => {
    if (points >= 1500) return "Eco Master"
    if (points >= 1000) return "Eco Champion"
    if (points >= 600) return "Eco Warrior"
    if (points >= 300) return "Eco Explorer"
    if (points >= 100) return "Beginner"
    return "Newcomer"
  }

  // Function to calculate points needed for next level
  const getPointsToNextLevel = (points: number) => {
    const currentLevel = getCurrentLevel(points)
    
    const levelThresholds: { [key: string]: number } = {
      "Newcomer": 100,
      "Beginner": 300,
      "Eco Explorer": 600,
      "Eco Warrior": 1000,
      "Eco Champion": 1500,
      "Eco Master": Infinity,
    }

    const levels = Object.keys(levelThresholds)
    const currentIndex = levels.indexOf(currentLevel)
    
    if (currentIndex === -1 || currentIndex === levels.length - 1) {
      return 0
    }
    
    const nextLevelThreshold = levelThresholds[levels[currentIndex]]
    if (nextLevelThreshold === Infinity) {
      return 0
    }
    
    return Math.max(0, nextLevelThreshold - points)
  }

  // Function to fetch user data and calculate achievements
  const fetchUserData = async () => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch user document
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        setError("User data not found")
        setLoading(false)
        return
      }

      const userDataFromFirestore = userDoc.data()
      
      // Fetch user's cleanups
      const cleanupsQuery = query(
        collection(db, "cleanups"),
        where("completedBy", "==", user.uid),
        orderBy("completedAt", "desc")
      )
      const cleanupsSnapshot = await getDocs(cleanupsQuery)
      const userCleanups = cleanupsSnapshot.docs.map(doc => doc.data())
      
      // Calculate real stats
      const totalPoints = userDataFromFirestore.points || 0
      const totalCleanups = userCleanups.length
      const streakDays = userDataFromFirestore.streakDays || 0
      
      // Calculate achievements based on real data
      const calculatedAchievements = [
        {
          id: 1,
          title: "First Steps",
          description: "Complete your first cleanup",
          icon: "🌱",
          points: 50,
          unlocked: totalCleanups >= 1,
          unlockedDate: totalCleanups >= 1 ? userCleanups[userCleanups.length - 1]?.completedAt?.toDate?.()?.toISOString()?.split('T')[0] : null,
          progress: Math.min(100, (totalCleanups / 1) * 100),
          category: "milestone",
        },
        {
          id: 2,
          title: "Eco Warrior",
          description: "Complete 10 cleanups",
          icon: "⚔️",
          points: 200,
          unlocked: totalCleanups >= 10,
          unlockedDate: totalCleanups >= 10 ? userCleanups[userCleanups.length - 10]?.completedAt?.toDate?.()?.toISOString()?.split('T')[0] : null,
          progress: Math.min(100, (totalCleanups / 10) * 100),
          category: "milestone",
        },
        {
          id: 3,
          title: "Community Leader",
          description: "Organize 5 community cleanups",
          icon: "👑",
          points: 500,
          unlocked: false, // This would need additional logic for community events
          progress: 0,
          category: "leadership",
        },
        {
          id: 4,
          title: "Streak Master",
          description: "Maintain a 30-day cleanup streak",
          icon: "🔥",
          points: 300,
          unlocked: streakDays >= 30,
          unlockedDate: streakDays >= 30 ? new Date().toISOString().split('T')[0] : null,
          progress: Math.min(100, (streakDays / 30) * 100),
          category: "consistency",
        },
        {
          id: 5,
          title: "Verification Expert",
          description: "Verify 100 community cleanups",
          icon: "✅",
          points: 250,
          unlocked: false, // This would need verification count logic
          progress: 0,
          category: "community",
        },
        {
          id: 6,
          title: "Beach Guardian",
          description: "Complete 20 beach cleanups",
          icon: "🏖️",
          points: 400,
          unlocked: totalCleanups >= 20,
          unlockedDate: totalCleanups >= 20 ? userCleanups[userCleanups.length - 20]?.completedAt?.toDate?.()?.toISOString()?.split('T')[0] : null,
          progress: Math.min(100, (totalCleanups / 20) * 100),
          category: "location",
        },
      ]

      const achievementsUnlocked = calculatedAchievements.filter(a => a.unlocked).length
      
      setUserData({
        ...userDataFromFirestore,
        totalPoints,
        totalCleanups,
        streakDays,
        achievementsUnlocked,
        totalAchievements: calculatedAchievements.length,
        rank: getCurrentLevel(totalPoints),
        nextRank: getCurrentLevel(totalPoints + getPointsToNextLevel(totalPoints)),
        pointsToNextLevel: getPointsToNextLevel(totalPoints),
        achievements: calculatedAchievements
      })

    } catch (err: any) {
      console.error("Error fetching user data:", err)
      setError("Failed to load user data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [user?.uid])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-green-600">Loading achievements...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Main Content - Only show when not loading */}
        {!loading && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="h-8 w-8" />
                  <span className="text-2xl font-bold">{stats.totalPoints}</span>
                </div>
                <h3 className="font-semibold mb-1">Total Points</h3>
                <p className="text-green-100 text-sm">Lifetime earned</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center justify-between mb-4">
                  <Target className="h-8 w-8 text-green-600" />
                  <span className="text-2xl font-bold text-green-800">{stats.totalCleanups}</span>
                </div>
                <h3 className="font-semibold text-green-800 mb-1">Cleanups</h3>
                <p className="text-green-600 text-sm">Completed</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <span className="text-2xl font-bold text-green-800">{stats.streakDays}</span>
                </div>
                <h3 className="font-semibold text-green-800 mb-1">Day Streak</h3>
                <p className="text-green-600 text-sm">Current</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center justify-between mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                  <span className="text-2xl font-bold text-green-800">
                    {stats.achievementsUnlocked}/{stats.totalAchievements}
                  </span>
                </div>
                <h3 className="font-semibold text-green-800 mb-1">Achievements</h3>
                <p className="text-green-600 text-sm">Unlocked</p>
              </div>
            </div>

            {/* Rank Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-green-800">Current Rank</h2>
                  <p className="text-green-600">Progress to next level</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-800">{stats.rank}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-600">Progress to {stats.nextRank}</span>
                  <span className="text-green-600">{stats.pointsToNextRank} points needed</span>
                </div>
                <div className="w-full bg-green-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (stats.totalPoints / (stats.totalPoints + stats.pointsToNextRank)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-green-100 p-1 rounded-xl mb-8 animate-fade-in">
              {[
                { id: "achievements", label: "Achievements" },
                { id: "rewards", label: "Rewards" },
                { id: "history", label: "History" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id ? "bg-white text-green-800 shadow-sm" : "text-green-600 hover:text-green-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement: any, index: number) => (
                  <div
                    key={achievement.id}
                    className={`rounded-2xl p-6 shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in ${
                      achievement.unlocked ? "bg-white hover:shadow-xl" : "bg-gray-50 opacity-75"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`text-3xl ${achievement.unlocked ? "" : "grayscale"}`}>
                          {achievement.unlocked ? achievement.icon : "🔒"}
                        </div>
                        <div>
                          <h3 className={`font-bold ${achievement.unlocked ? "text-green-800" : "text-gray-600"}`}>
                            {achievement.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}
                          >
                            {achievement.category}
                          </span>
                        </div>
                      </div>
                      {achievement.unlocked && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">+{achievement.points}</div>
                          <div className="text-xs text-green-500">points</div>
                        </div>
                      )}
                    </div>

                    <p className={`text-sm mb-4 ${achievement.unlocked ? "text-green-700" : "text-gray-500"}`}>
                      {achievement.description}
                    </p>

                    {achievement.unlocked ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600">
                          Unlocked {new Date(achievement.unlockedDate!).toLocaleDateString()}
                        </span>
                        <div className="flex items-center text-green-600">
                          <Star className="h-4 w-4 fill-current" />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-600">{achievement.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === "rewards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward, index) => (
                  <div
                    key={reward.id}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-3">{reward.image}</div>
                      <h3 className="font-bold text-green-800 mb-2">{reward.title}</h3>
                      <p className="text-sm text-green-600 mb-4">{reward.description}</p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-green-700">{reward.points} points</span>
                      </div>
                      {reward.claimed && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Claimed
                        </span>
                      )}
                    </div>

                    <button
                      disabled={reward.claimed || !reward.available}
                      className={`w-full py-3 rounded-xl font-medium transition-colors ${
                        reward.claimed
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : reward.available
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {reward.claimed ? "Already Claimed" : reward.available ? "Claim Reward" : "Not Enough Points"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
                <h2 className="text-xl font-bold text-green-800 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {[
                    { date: "2024-03-10", action: "Achievement Unlocked", detail: "Beach Guardian", points: 400 },
                    { date: "2024-03-08", action: "Cleanup Completed", detail: "Central Park East", points: 75 },
                    { date: "2024-03-05", action: "Reward Claimed", detail: "Eco-Friendly Water Bottle", points: -500 },
                    { date: "2024-03-01", action: "Achievement Unlocked", detail: "Eco Warrior", points: 200 },
                    { date: "2024-02-28", action: "Community Verification", detail: "Brooklyn Bridge Cleanup", points: 25 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-green-800">{item.action}</p>
                          <p className="text-sm text-green-600">{item.detail}</p>
                          <p className="text-xs text-green-500">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${item.points > 0 ? "text-green-600" : "text-red-600"}`}>
                        {item.points > 0 ? "+" : ""}
                        {item.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
