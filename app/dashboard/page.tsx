"use client"

import { useState } from "react"
import Link from "next/link"
import { Camera, MapPin, Users, Award, TrendingUp, Calendar, Target, CheckCircle } from "lucide-react"

export default function DashboardPage() {
  const [user] = useState({
    name: "Alex Johnson",
    level: "Eco Warrior",
    totalCleanups: 47,
    pointsEarned: 2340,
    streakDays: 12,
  })

  const recentActivity = [
    { id: 1, type: "cleanup", location: "Central Park", points: 50, time: "2 hours ago" },
    { id: 2, type: "verification", location: "Beach Cleanup", points: 25, time: "1 day ago" },
    { id: 3, type: "community", location: "River Trail", points: 75, time: "3 days ago" },
  ]

  const upcomingEvents = [
    { id: 1, title: "Beach Cleanup Drive", date: "Tomorrow", participants: 23 },
    { id: 2, title: "Park Restoration", date: "This Weekend", participants: 15 },
    { id: 3, title: "River Trail Cleanup", date: "Next Week", participants: 8 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Cleanups",
              value: user.totalCleanups,
              icon: CheckCircle,
              color: "bg-green-500",
              change: "+3 this week",
            },
            {
              title: "Points Earned",
              value: user.pointsEarned,
              icon: Award,
              color: "bg-emerald-500",
              change: "+150 this week",
            },
            {
              title: "Current Streak",
              value: `${user.streakDays} days`,
              icon: TrendingUp,
              color: "bg-teal-500",
              change: "Keep it up!",
            },
            {
              title: "Current Level",
              value: user.level,
              icon: Target,
              color: "bg-green-600",
              change: "340 pts to next",
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
              <h3 className="text-2xl font-bold text-green-800 mb-1">{stat.value}</h3>
              <p className="text-green-600 text-sm mb-2">{stat.title}</p>
              <p className="text-xs text-green-500">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 animate-slide-up">
              <h2 className="text-xl font-bold text-green-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "Upload Cleanup", icon: Camera, href: "/upload", color: "bg-green-100 hover:bg-green-200" },
                  { title: "Find Locations", icon: MapPin, href: "/map", color: "bg-emerald-100 hover:bg-emerald-200" },
                  { title: "Join Community", icon: Users, href: "/community", color: "bg-teal-100 hover:bg-teal-200" },
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
                    <p className="text-sm font-medium text-green-700">{action.title}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg animate-slide-up">
              <h2 className="text-xl font-bold text-green-800 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-200 rounded-full">
                        {activity.type === "cleanup" && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {activity.type === "verification" && <Award className="h-5 w-5 text-green-600" />}
                        {activity.type === "community" && <Users className="h-5 w-5 text-green-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-green-800">{activity.location}</p>
                        <p className="text-sm text-green-600">{activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-700">+{activity.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg animate-fade-in">
              <h2 className="text-xl font-bold text-green-800 mb-6">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                  >
                    <h3 className="font-semibold text-green-800 mb-2">{event.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-green-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-green-600">
                        <Users className="h-4 w-4 mr-1" />
                        {event.participants} joined
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/community-cleanups"
                className="block w-full mt-4 py-3 bg-green-600 text-white text-center rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                View All Events
              </Link>
            </div>

            {/* Progress Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg animate-scale-in">
              <h2 className="text-xl font-bold mb-4">This Week's Goal</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>3 of 5 cleanups</span>
                  <span>60%</span>
                </div>
                <div className="w-full bg-green-400 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: "60%" }}></div>
                </div>
              </div>
              <p className="text-green-100 text-sm">
                You're doing great! Just 2 more cleanups to reach your weekly goal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
