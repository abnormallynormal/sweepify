"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { doc, getDoc, collection, query, orderBy, limit, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import {
  Camera,
  MapPin,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Target,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface UserData {
  name: string;
  level: string;
  points: number;
  totalwastecollected: number;
  streakDays?: number;
  totalCleanups?: number;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  organizer: string;
  createdAt: any;
}

interface RecentActivity {
  id: string;
  type: "cleanup" | "verification" | "community" | "event";
  location: string;
  points: number;
  time: string;
  description: string;
}

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from Firestore
  const fetchUserData = async () => {
    if (!authUser?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userDocRef = doc(db, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);

      // Calculate total waste collected from cleanups collection
      const cleanupsRef = collection(db, "cleanups");
      const userCleanupsQuery = query(cleanupsRef, where("completedBy", "==", authUser.uid));
      const cleanupsSnapshot = await getDocs(userCleanupsQuery);
      
      const totalCleanups = cleanupsSnapshot.size;
      const totalWasteCollected = totalCleanups; // Each cleanup represents one waste collection

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          name: data.name || "User",
          level: data.level || "Beginner",
          points: data.points || 0,
          totalwastecollected: totalWasteCollected,
          streakDays: data.streakDays || 0,
          totalCleanups: totalCleanups,
        });
      } else {
        // Create default user data if document doesn't exist
        setUserData({
          name: authUser.displayName || "User",
          level: "Beginner",
          points: 0,
          totalwastecollected: totalWasteCollected,
          streakDays: 0,
          totalCleanups: totalCleanups,
        });
      }
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data. Please try again.");
      // Set default data on error
      setUserData({
        name: authUser.displayName || "User",
        level: "Beginner",
        points: 0,
        totalwastecollected: 0,
        streakDays: 0,
        totalCleanups: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch upcoming events from Firebase
  const fetchUpcomingEvents = async () => {
    try {
      const eventsRef = collection(db, "events");
      
      // Fetch all active events
      const eventsQuery = query(
        eventsRef,
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(eventsQuery);
      const allEvents: Event[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allEvents.push({
          id: doc.id,
          title: data.title || "Untitled Event",
          date: data.date,
          time: data.time || "",
          location: data.location || "Unknown Location",
          participants: data.participants || 0,
          maxParticipants: data.maxParticipants || 0,
          organizer: data.organizer || "Anonymous",
          createdAt: data.createdAt,
        });
      });
      
      // Filter for future events only
      const now = new Date();
      const upcoming = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate > now;
      });
      
      // Take only the first 5 upcoming events for dashboard
      setUpcomingEvents(upcoming.slice(0, 5));
    } catch (err) {
      console.error("Error fetching upcoming events:", err);
    }
  };

  // Fetch recent activity from verified cleanups
  const fetchRecentActivity = async () => {
    if (!authUser) return;

    try {
      const activities: RecentActivity[] = [];

      // Fetch verified cleanups
      const cleanupsRef = collection(db, "cleanups");
      const verifiedCleanupsQuery = query(
        cleanupsRef,
        where("status", "==", "verified"),
        orderBy("completedAt", "desc"),
        limit(10)
      );
      
      const verifiedSnapshot = await getDocs(verifiedCleanupsQuery);
      verifiedSnapshot.forEach((doc) => {
        const data = doc.data();
        const completedAt = data.completedAt?.toDate?.() || data.completedAt;
        const timeAgo = formatTimeAgo(completedAt);
        
        activities.push({
          id: doc.id,
          type: "verification",
          location: data.locationName || "Unknown Location",
          points: data.points || 75,
          time: timeAgo,
          description: data.description || "Verified cleanup",
        });
      });

      // Also fetch user's own verified cleanups
      const userVerifiedQuery = query(
        cleanupsRef,
        where("status", "==", "verified"),
        where("completedBy", "==", authUser.uid),
        orderBy("completedAt", "desc"),
        limit(5)
      );
      
      const userVerifiedSnapshot = await getDocs(userVerifiedQuery);
      userVerifiedSnapshot.forEach((doc) => {
        const data = doc.data();
        const completedAt = data.completedAt?.toDate?.() || data.completedAt;
        const timeAgo = formatTimeAgo(completedAt);
        
        activities.push({
          id: doc.id,
          type: "cleanup",
          location: data.locationName || "Unknown Location",
          points: data.points || 75,
          time: timeAgo,
          description: "Your verified cleanup",
        });
      });

      // Sort activities by time and take the most recent 8
      activities.sort((a, b) => {
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
        return timeB.getTime() - timeA.getTime();
      });

      setRecentActivity(activities.slice(0, 8));
    } catch (err) {
      console.error("Error fetching recent activity:", err);
    }
  };

  const formatTimeAgo = (timestamp: any): string => {
    if (!timestamp) return "Unknown time";
    
    try {
      const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      if (diffInHours < 48) return "1 day ago";
      return `${Math.floor(diffInHours / 24)} days ago`;
    } catch (err) {
      return "Unknown time";
    }
  };

  // Determine current level based on points
  const getCurrentLevel = (points: number) => {
    if (points >= 1500) return "Eco Master";
    if (points >= 1000) return "Eco Champion";
    if (points >= 600) return "Eco Warrior";
    if (points >= 300) return "Eco Explorer";
    if (points >= 100) return "Beginner";
    return "Newcomer";
  };

  // Calculate points needed for next level
  const getPointsToNextLevel = () => {
    if (!userData) return 0;
    
    const currentPoints = userData.points;
    const currentLevel = getCurrentLevel(currentPoints);
    
    // Define level thresholds
    const levelThresholds: { [key: string]: number } = {
      "Newcomer": 100,
      "Beginner": 300,
      "Eco Explorer": 600,
      "Eco Warrior": 1000,
      "Eco Champion": 1500,
      "Eco Master": Infinity,
    };

    // Find the next level threshold
    const levels = Object.keys(levelThresholds);
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex === -1 || currentIndex === levels.length - 1) {
      return 0; // Already at max level or unknown level
    }
    
    const nextLevelThreshold = levelThresholds[levels[currentIndex]];
    if (nextLevelThreshold === Infinity) {
      return 0; // Already at max level
    }
    
    return Math.max(0, nextLevelThreshold - currentPoints);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserData(),
        fetchUpcomingEvents(),
        fetchRecentActivity(),
      ]);
      setLoading(false);
    };

    if (authUser) {
      fetchData();
    }
  }, [authUser?.uid]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-green-700">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total Cleanups",
                value: userData?.totalCleanups || 0,
                icon: CheckCircle,
                color: "bg-green-500",
                change: `+${userData?.totalCleanups} this week`,
              },
              {
                title: "Points Earned",
                value: userData?.points || 0,
                icon: Award,
                color: "bg-emerald-500",
                change: `+${userData?.points || 0} this week`,
              },
              {
                title: "Current Streak",
                value: `${userData?.streakDays || 2} days`,
                icon: TrendingUp,
                color: "bg-teal-500",
                change: "Keep it up!",
              },
              {
                title: "Current Level",
                value: getCurrentLevel(userData?.points || 0),
                icon: Target,
                color: "bg-green-600",
                change: getPointsToNextLevel() > 0 ? `${getPointsToNextLevel()} pts to next level` : "Max level reached!",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.color} rounded-xl`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-1">
                  {stat.value}
                </h3>
                <p className="text-green-600 text-sm mb-2">{stat.title}</p>
                <p className="text-xs text-green-500">{stat.change}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 animate-slide-up">
                <h2 className="text-xl font-bold text-green-800 mb-6">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Upload Cleanup",
                      icon: Camera,
                      href: "/upload",
                      color: "bg-green-100 hover:bg-green-200",
                    },
                    {
                      title: "Find Locations",
                      icon: MapPin,
                      href: "/map",
                      color: "bg-emerald-100 hover:bg-emerald-200",
                    },
                    {
                      title: "Join Community",
                      icon: Users,
                      href: "/community",
                      color: "bg-teal-100 hover:bg-teal-200",
                    },
                    {
                      title: "View Achievements",
                      icon: Award,
                      href: "/achievements",
                      color: "bg-green-100 hover:bg-green-200",
                    },
                  ].map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className={`${action.color} p-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 group`}
                    >
                      <action.icon className="h-8 w-8 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-green-700">
                        {action.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-lg animate-slide-up">
                <h2 className="text-xl font-bold text-green-800 mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-green-200 rounded-full">
                            {activity.type === "cleanup" && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            {activity.type === "verification" && (
                              <Award className="h-5 w-5 text-green-600" />
                            )}
                            {activity.type === "community" && (
                              <Users className="h-5 w-5 text-green-600" />
                            )}
                            {activity.type === "event" && (
                              <Calendar className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-green-800">
                              {activity.location}
                            </p>
                            <p className="text-sm text-green-600">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-700">
                            +{activity.points} pts
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-green-600">No recent activity</p>
                      <p className="text-sm text-green-500 mt-1">Start by uploading your first cleanup!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-green-800">
                    Upcoming Events
                  </h2>
                  <Link 
                    href="/community-cleanups"
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-green-800">
                            {event.title}
                          </h3>
                          <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm text-green-600 mb-2">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                        <p className="text-xs text-green-500">
                          {event.participants}/{event.maxParticipants} participants
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-green-600">No upcoming events</p>
                      <p className="text-sm text-green-500 mt-1">Check back later or create one!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
