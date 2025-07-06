"use client"

import { useState, useEffect } from "react"
import { Users, CheckCircle, X, Eye, MessageCircle, ThumbsUp, Flag, Search, Loader } from "lucide-react"
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, where } from "firebase/firestore"
import { db } from "@/firebase/firebase"

interface CleanupSubmission {
  id: string;
  locationName: string;
  createdBy: string;
  createdAt: any;
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  description: string;
  completionDescription?: string;
  status: string;
  completedAt?: any;
  completedBy?: string;
  points: number;
  verifications: number;
  needsVerification: number;
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedSubmission, setSelectedSubmission] = useState<CleanupSubmission | null>(null)
  const [pendingSubmissions, setPendingSubmissions] = useState<CleanupSubmission[]>([])
  const [verifiedSubmissions, setVerifiedSubmissions] = useState<CleanupSubmission[]>([])
  const [disputedSubmissions, setDisputedSubmissions] = useState<CleanupSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("All Locations")
  const [pointsFilter, setPointsFilter] = useState("All Points")

  // Fetch cleanup submissions from Firestore
  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const cleanupsRef = collection(db, "cleanups")
      
      // Fetch completed submissions (pending verification)
      const completedQuery = query(
        cleanupsRef,
        where("status", "==", "completed"),
        orderBy("completedAt", "desc"),
        limit(50)
      )
      
      // Fetch verified submissions
      const verifiedQuery = query(
        cleanupsRef,
        where("status", "==", "verified"),
        orderBy("completedAt", "desc"),
        limit(20)
      )
      
      // Fetch disputed submissions
      const disputedQuery = query(
        cleanupsRef,
        where("status", "==", "disputed"),
        orderBy("completedAt", "desc"),
        limit(20)
      )
      
      const [completedSnapshot, verifiedSnapshot, disputedSnapshot] = await Promise.all([
        getDocs(completedQuery),
        getDocs(verifiedQuery),
        getDocs(disputedQuery)
      ])
      
      // Process completed submissions
      const completed: CleanupSubmission[] = []
      completedSnapshot.forEach((doc) => {
        const data = doc.data()
        completed.push({
          id: doc.id,
          locationName: data.locationName || "Unknown Location",
          createdBy: data.createdBy || "Anonymous",
          createdAt: data.createdAt,
          beforePhotoUrl: data.beforePhotoUrl || "",
          afterPhotoUrl: data.afterPhotoUrl || "",
          description: data.description || "No description",
          completionDescription: data.completionDescription || "",
          status: data.status,
          completedAt: data.completedAt,
          completedBy: data.completedBy,
          points: Math.floor(Math.random() * 50) + 50, // Random points for demo
          verifications: 0,
      needsVerification: 3,
        })
      })
      
      // Process verified submissions
      const verified: CleanupSubmission[] = []
      verifiedSnapshot.forEach((doc) => {
        const data = doc.data()
        verified.push({
          id: doc.id,
          locationName: data.locationName || "Unknown Location",
          createdBy: data.createdBy || "Anonymous",
          createdAt: data.createdAt,
          beforePhotoUrl: data.beforePhotoUrl || "",
          afterPhotoUrl: data.afterPhotoUrl || "",
          description: data.description || "No description",
          completionDescription: data.completionDescription || "",
          status: data.status,
          completedAt: data.completedAt,
          completedBy: data.completedBy,
          points: Math.floor(Math.random() * 50) + 50,
          verifications: Math.floor(Math.random() * 5) + 1,
      needsVerification: 3,
        })
      })
      
      // Process disputed submissions
      const disputed: CleanupSubmission[] = []
      disputedSnapshot.forEach((doc) => {
        const data = doc.data()
        disputed.push({
          id: doc.id,
          locationName: data.locationName || "Unknown Location",
          createdBy: data.createdBy || "Anonymous",
          createdAt: data.createdAt,
          beforePhotoUrl: data.beforePhotoUrl || "",
          afterPhotoUrl: data.afterPhotoUrl || "",
          description: data.description || "No description",
          completionDescription: data.completionDescription || "",
          status: data.status,
          completedAt: data.completedAt,
          completedBy: data.completedBy,
          points: Math.floor(Math.random() * 50) + 50,
      verifications: 0,
      needsVerification: 3,
        })
      })
      
      setPendingSubmissions(completed)
      setVerifiedSubmissions(verified)
      setDisputedSubmissions(disputed)
    } catch (err: any) {
      console.error("Error fetching submissions:", err)
      setError("Failed to load submissions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date"
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return "Just now"
      if (diffInHours < 24) return `${diffInHours} hours ago`
      if (diffInHours < 48) return "1 day ago"
      return `${Math.floor(diffInHours / 24)} days ago`
    } catch (err) {
      return "Unknown date"
    }
  }

  const handleVerification = async (submissionId: string, isValid: boolean) => {
    try {
      const cleanupDocRef = doc(db, "cleanups", submissionId)
      const newStatus = isValid ? "verified" : "disputed"
      
      await updateDoc(cleanupDocRef, {
        status: newStatus,
        verifiedAt: new Date(),
        verifiedBy: "community", // You can add user ID here if needed
      })
      
    console.log(`Submission ${submissionId} ${isValid ? "approved" : "rejected"}`)
      
      // Refresh the data
      await fetchSubmissions()
      
      // Close the modal
      setSelectedSubmission(null)
    } catch (error: any) {
      console.error("Error updating submission status:", error)
      setError("Failed to update submission status. Please try again.")
    }
  }

  const getCurrentSubmissions = () => {
    switch (activeTab) {
      case "pending":
        return pendingSubmissions
      case "verified":
        return verifiedSubmissions
      case "disputed":
        return disputedSubmissions
      default:
        return []
    }
  }

  // Filter submissions based on current filters
  const getFilteredSubmissions = (submissions: CleanupSubmission[]) => {
    return submissions.filter(submission => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        submission.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (submission.completionDescription && submission.completionDescription.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Location filter
      const matchesLocation = locationFilter === "All Locations" || 
        submission.locationName.toLowerCase().includes(locationFilter.toLowerCase())
      
      // Points filter
      const matchesPoints = (() => {
        switch (pointsFilter) {
          case "0-50 points":
            return submission.points >= 0 && submission.points <= 50
          case "51-100 points":
            return submission.points >= 51 && submission.points <= 100
          case "100+ points":
            return submission.points > 100
          default:
            return true
        }
      })()
      
      return matchesSearch && matchesLocation && matchesPoints
    })
  }

  const currentSubmissions = getCurrentSubmissions()
  const filteredSubmissions = getFilteredSubmissions(currentSubmissions)

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
              <span className="text-2xl font-bold text-green-800">{pendingSubmissions.length}</span>
            </div>
            <h3 className="font-semibold text-green-800">Pending Reviews</h3>
            <p className="text-sm text-green-600">Need attention</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-green-100 p-1 rounded-xl mb-8 animate-fade-in">
          {[
            { id: "pending", label: "Pending Verification", count: pendingSubmissions.length },
            { id: "verified", label: "Verified", count: verifiedSubmissions.length },
            { id: "disputed", label: "Disputed", count: disputedSubmissions.length },
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select 
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option>All Locations</option>
            <option>Parks</option>
            <option>Beaches</option>
            <option>Streets</option>
            <option>Parks</option>
            <option>Beaches</option>
            <option>Streets</option>
            <option>Rivers</option>
            <option>Mountains</option>
          </select>
          <select 
            value={pointsFilter}
            onChange={(e) => setPointsFilter(e.target.value)}
            className="px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option>All Points</option>
            <option>0-50 points</option>
            <option>51-100 points</option>
            <option>100+ points</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-green-600">Loading submissions...</p>
            </div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No submissions found matching your filters.</p>
            <p className="text-gray-400">Try adjusting your search criteria.</p>
          </div>
        ) : (
          /* Submissions Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSubmissions.map((submission, index) => (
            <div
              key={submission.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                      <h3 className="font-bold text-green-800 mb-1">{submission.locationName}</h3>
                      <p className="text-sm text-green-600">by {submission.createdBy}</p>
                      <p className="text-xs text-green-500">{formatDate(submission.completedAt || submission.createdAt)}</p>
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
                        src={submission.beforePhotoUrl || "/placeholder.svg"}
                      alt="Before cleanup"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">After</p>
                    <img
                        src={submission.afterPhotoUrl || "/placeholder.svg"}
                      alt="After cleanup"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                </div>

                  <p className="text-sm text-green-700 mb-4 line-clamp-2">
                    {submission.completionDescription || submission.description}
                  </p>

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
                    {activeTab === "disputed" && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Disputed
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
                      <button 
                        onClick={() => setSelectedSubmission(submission)}
                        className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm"
                      >
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
        )}

        {/* Empty State for Disputed Tab */}
        {activeTab === "disputed" && disputedSubmissions.length === 0 && !loading && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
              <Flag className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">No Disputed Submissions</h3>
            <p className="text-green-600 mb-6">All submissions are currently in good standing.</p>
          </div>
        )}

        {/* Empty State for other tabs */}
        {currentSubmissions.length === 0 && !loading && activeTab !== "disputed" && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              {activeTab === "pending" ? "No Pending Submissions" : "No Verified Submissions"}
            </h3>
            <p className="text-green-600 mb-6">
              {activeTab === "pending" 
                ? "All completed cleanups have been verified." 
                : "No cleanups have been verified yet."
              }
            </p>
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
                    src={selectedSubmission.beforePhotoUrl || "/placeholder.svg"}
                    alt="Before cleanup"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">After Cleanup</h3>
                  <img
                    src={selectedSubmission.afterPhotoUrl || "/placeholder.svg"}
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
                      <span className="font-medium text-green-800">{selectedSubmission.locationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Submitted by:</span>
                      <span className="font-medium text-green-800">{selectedSubmission.createdBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Date:</span>
                      <span className="font-medium text-green-800">{formatDate(selectedSubmission.completedAt || selectedSubmission.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Points Claimed:</span>
                      <span className="font-medium text-green-800">{selectedSubmission.points} points</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Description</h3>
                  <p className="text-green-700 bg-green-50 p-4 rounded-xl">
                    {selectedSubmission.completionDescription || selectedSubmission.description}
                  </p>
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

                {/* Action Buttons - Only show for pending submissions */}
                {activeTab === "pending" && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
