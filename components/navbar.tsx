"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/firebase/firebase"
import { useAuth } from "@/hooks/use-auth"
import { Leaf, Home, Camera, MapPin, Users, Award, Calendar, Menu, X, User, LogOut, LogIn, UserPlus, ChevronDown, Settings } from "lucide-react"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Upload", href: "/upload", icon: Camera },
    { name: "Map", href: "/map", icon: MapPin },
    { name: "Community", href: "/community", icon: Users },
    { name: "Events", href: "/community-cleanups", icon: Calendar },
    { name: "Achievements", href: "/achievements", icon: Award },
  ]

  const isActive = (href: string) => pathname === href

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Close dropdown when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (!(e.target as Element).closest('.user-dropdown')) {
      setIsUserDropdownOpen(false)
    }
  }

  // Don't show navbar on landing, login, and signup pages
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return null
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-green-800">Sweepify</h1>
              </div>
            </div>
            <div className="text-green-600">Loading...</div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50 shadow-sm" onClick={handleClickOutside}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-green-100 rounded-full">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-green-800">Sweepify</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-green-100 text-green-700 shadow-sm"
                        : "text-green-600 hover:text-green-700 hover:bg-green-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* User Profile / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-green-800">
                      {user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-green-600">Welcome back!</p>
                  </div>
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-green-700" />
                  </div>
                  <ChevronDown className={`h-4 w-4 text-green-600 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-green-100 py-2 z-50 animate-fade-in">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-green-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">
                            {user.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-sm text-green-600">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                      >
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-green-100 pt-1">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false)
                          handleLogout()
                        }}
                        disabled={isLoggingOut}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  href="/login"
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-green-100 animate-fade-in">
            {user ? (
              <>
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                          isActive(item.href)
                            ? "bg-green-100 text-green-700 shadow-sm"
                            : "text-green-600 hover:text-green-700 hover:bg-green-50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}

                  {/* Mobile User Info */}
                  <div className="flex items-center space-x-3 px-4 py-3 mt-4 pt-4 border-t border-green-100">
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-800">
                        {user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-sm text-green-600">Welcome back!</p>
                    </div>
                  </div>

                  {/* Mobile Menu Items */}
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>

                  {/* Mobile Logout Button */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                    disabled={isLoggingOut}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
