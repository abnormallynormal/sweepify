"use client"

import { useState } from "react"
import { Users, CheckCircle, X, Eye, MessageCircle, ThumbsUp, Flag, Search } from "lucide-react"

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)

  const pendingSubmissions = [
    {
      id: 1,
      user: "Sarah Johnson",
      location: "Central Park Playground",
      submittedDate: "2 hours ago",
      beforeImage: "/placeholder.svg?height=200&width=300",
      afterImage: "/placeholder.svg?height=200&width=300",
      description: "Cleaned up the playground area, removed litter and organized recycling.",
      points: 75,
      verifications: 2,
      needsVerification: 3,
    },
    {
      id: 2,
      user: "Mike Rodriguez",
      location: "Brooklyn Bridge Walkway",
      submittedDate: "5 hours ago",
      beforeImage: "/placeholder.svg?height=200&width=300",
      afterImage: "/placeholder.svg?height=200&width=300",
      description: "Removed tourist litter and food waste from the pedestrian walkway.",
      points: 50,
      verifications: 1,
      needsVerification: 3,
    },
    {
      id: 3,
      user: "Emma Liu",
      location: "Coney Island Beach",
      submittedDate: "1 day ago",
      beforeImage: "/placeholder.svg?height=200&width=300",
      afterImage: "/placeholder.svg?height=200&width=300",
      description: "Beach cleanup focusing on plastic waste and debris after the storm.",
      points: 100,
      verifications: 0,
      needsVerification: 3,
    },
  ]

  const verifiedSubmissions = [
    {
      id: 4,
      user: "Alex Kim",
      location: "Hudson River Trail",
      submittedDate: "2 days ago",
      beforeImage: "/placeholder.svg?height=200&width=300",
      afterImage: "/placeholder.svg?height=200&width=300",
      description: "Trail maintenance and litter removal along the jogging path.",
      points: 60,
      verifications: 5,
      status: "verified",
    },
    {
      id: 5,
      user: "Lisa Chen",
      location: "Washington Square Park",
      submittedDate: "3 days ago",
      beforeImage: "/placeholder.svg?height=200&width=300",
      afterImage: "/placeholder.svg?height=200&width=300",
      description: "Fountain area cleanup and flower bed maintenance.",
      points: 85,
      verifications: 4,
      status: "verified",
    },
  ]

  const handleVerification = (submissionId: number, isValid: boolean) => {
    // Handle verification logic here
    console.log(`Submission ${submissionId} ${isValid ? "approved" : "rejected"}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">127</span>
            </div>
            <h3 className="font-semibold text-green-800">Verifications Made</h3>
            <p className="text-sm text-green-600">This month</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">95%</span>
            </div>
            <h3 className="font-semibold text-green-800">Accuracy Rate</h3>
            <p className="text-sm text-green-600">Community trust</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-2">
              <ThumbsUp className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">340</span>
            </div>
            <h3 className="font-semibold text-green-800">Points Earned</h3>
            <p className="text-sm text-green-600">From verifications</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">12</span>
            </div>
            <h3 className="font-semibold text-green-800">Pending Reviews</h3>
            <p className="text-sm text-green-600">Need attention</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-green-100 p-1 rounded-xl mb-8 animate-fade-in">
          {[
            { id: "pending", label: "Pending Verification", count: pendingSubmissions.length },
            { id: "verified", label: "Recently Verified", count: verifiedSubmissions.length },
            { id: "disputed", label: "Disputed", count: 3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id ? "bg-white text-green-800 shadow-sm" : "text-green-600 hover:text-green-800"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <input
              type="text"
              placeholder="Search submissions..."
              className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option>All Locations</option>
            <option>Parks</option>
            <option>Beaches</option>
            <option>Streets</option>
          </select>
          <select className="px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option>All Points</option>
            <option>0-50 points</option>
            <option>51-100 points</option>
            <option>100+ points</option>
          </select>
        </div>

        {/* Submissions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {(activeTab === "pending" ? pendingSubmissions : verifiedSubmissions).map((submission, index) => (
            <div
              key={submission.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-green-800 mb-1">{submission.location}</h3>
                    <p className="text-sm text-green-600">by {submission.user}</p>
                    <p className="text-xs text-green-500">{submission.submittedDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">+{submission.points}</div>
                    <div className="text-xs text-green-500">points</div>
                  </div>
                </div>

                {/* Before/After Images */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-xs text-green-600 mb-1">Before</p>
                    <img
                      src={submission.beforeImage || "/placeholder.svg"}
                      alt="Before cleanup"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">After</p>
                    <img
                      src={submission.afterImage || "/placeholder.svg"}
                      alt="After cleanup"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                </div>

                <p className="text-sm text-green-700 mb-4 line-clamp-2">{submission.description}</p>

                {/* Verification Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      {submission.verifications}/{submission.needsVerification || "Verified"}
                    </span>
                  </div>
                  {activeTab === "verified" && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Verified
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                {activeTab === "pending" ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                    >
                      Review Details
                    </button>
                    <button className="px-3 py-2 border-2 border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm">
                      View Details
                    </button>
                    <button className="px-3 py-2 border-2 border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for Disputed Tab */}
        {activeTab === "disputed" && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
              <Flag className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">No Disputed Submissions</h3>
            <p className="text-green-600 mb-6">All submissions are currently in good standing.</p>
          </div>
        )}
      </div>

      {/* Detailed Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-800">Review Submission</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-green-400 hover:text-green-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Images */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Before Cleanup</h3>
                  <img
                    src={selectedSubmission.beforeImage || "/placeholder.svg"}
                    alt="Before cleanup"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">After Cleanup</h3>
                  <img
                    src={selectedSubmission.afterImage || "/placeholder.svg"}
                    alt="After cleanup"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Submission Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-600">Location:</span>
                      <span className="font-medium text-green-800">{selectedSubmission.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Submitted by:</span>
                      <span className="font-medium text-green-800">{selectedSubmission.user}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Date:</span>
                      <span className="font-medium text-green-800">{selectedSubmission.submittedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Points Claimed:</span>
                      <span className="font-medium text-green-800">{selectedSubmission.points} points</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Description</h3>
                  <p className="text-green-700 bg-green-50 p-4 rounded-xl">{selectedSubmission.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Verification Checklist</h3>
                  <div className="space-y-2">
                    {[
                      "Clear before and after photos",
                      "Visible improvement in cleanliness",
                      "Appropriate location for cleanup",
                      "Reasonable point claim for effort",
                    ].map((item, index) => (
                      <label key={index} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="rounded border-green-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-green-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => handleVerification(selectedSubmission.id, true)}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Approve (+25 pts)</span>
                  </button>
                  <button
                    onClick={() => handleVerification(selectedSubmission.id, false)}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
