"use client"

import type React from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/firebase/firebase"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Leaf, Mail, Lock, User, Calendar, Eye, EyeOff, Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    idDocument: null as File | null,
  })
  const router = useRouter()

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required")
      return false
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (!formData.dateOfBirth) {
      setError("Date of birth is required")
      return false
    }
    if (!formData.idDocument) {
      setError("ID document is required for age verification")
      return false
    }
    
    // Check if user is at least 13 years old
    const today = new Date()
    const birthDate = new Date(formData.dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (age < 13 || (age === 13 && monthDiff < 0) || (age === 13 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      setError("You must be at least 13 years old to create an account")
      return false
    }
    
    return true
  }

  const convertIdDocumentToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const saveUserData = async (userId: string, idDocumentBase64: string) => {
    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth,
        idDocumentBase64,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        points: 0,
        level: 1,
        achievements: [],
        cleanupsCompleted: 0,
        totalWasteCollected: 0,
      }
      
      console.log("Attempting to save user data:", userData)
      console.log("User ID:", userId)
      console.log("Database reference:", db)
      
      await setDoc(doc(db, "users", userId), userData)
      console.log("User data saved successfully to Firestore")
    } catch (error) {
      console.error("Error saving user data to Firestore:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
      console.log("Account created successfully:", user)
      
      // Convert ID document to base64
      let idDocumentBase64 = ""
      if (formData.idDocument) {
        idDocumentBase64 = await convertIdDocumentToBase64(formData.idDocument)
        console.log("ID document converted to base64")
      }
      
      // Save user data to Firestore
      try {
        await saveUserData(user.uid, idDocumentBase64)
        console.log("User data saved to Firestore")
      } catch (firestoreError) {
        console.error("Firestore save failed:", firestoreError)
        // Try a simple test save
        try {
          await setDoc(doc(db, "users", user.uid), {
            email: formData.email.trim(),
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            points: 0,
            createdAt: new Date().toISOString()
          })
          console.log("Simple user data saved successfully")
        } catch (simpleError) {
          console.error("Simple save also failed:", simpleError)
          throw simpleError
        }
      }
      
      setSuccess("Account created successfully! Redirecting to dashboard...")
      
      // Small delay to show success message before redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
      
    } catch (error: any) {
      console.error("Signup error:", error)
      const errorCode = error.code
      let errorMessage = "An error occurred during signup"
      
      switch (errorCode) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists"
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          break
        case "auth/weak-password":
          errorMessage = "Password is too weak. Please choose a stronger password"
          break
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled. Please contact support"
          break
        default:
          errorMessage = error.message || "An error occurred during signup"
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a valid file type (JPG, PNG, or PDF)")
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      
      setError("")
      setFormData({ ...formData, idDocument: file })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-green-200 rounded-full animate-scale-in">
              <Leaf className="h-12 w-12 text-green-700" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-green-800 mb-2">Join Sweepify</h2>
          <p className="text-green-600">Start your environmental impact journey today</p>
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-xl">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-green-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-green-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    disabled={isLoading}
                    className="block w-full pl-10 pr-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-green-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  disabled={isLoading}
                  className="block w-full px-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-green-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-green-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-green-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-green-400" />
                </div>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="idDocument" className="block text-sm font-medium text-green-700 mb-2">
                ID Document (Age Verification)
              </label>
              <div className="relative">
                <input
                  id="idDocument"
                  name="idDocument"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  required
                  disabled={isLoading}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="idDocument"
                  className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:border-green-400 transition-colors bg-white/70 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-600">
                    {formData.idDocument ? formData.idDocument.name : "Upload ID Document"}
                  </span>
                </label>
                <p className="text-xs text-green-500 mt-1">
                  Accepted formats: JPG, PNG, PDF (max 5MB)
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-green-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-green-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  className="block w-full pl-10 pr-12 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-green-400 hover:text-green-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-green-400 hover:text-green-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-green-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-green-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-green-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  className="block w-full pl-10 pr-12 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-green-400 hover:text-green-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-green-400 hover:text-green-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-green-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-green-700 hover:text-green-800 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
