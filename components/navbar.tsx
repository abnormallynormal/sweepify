"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Leaf, Home, Camera, MapPin, Users, Award, Calendar, Menu, X, User } from "lucide-react"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Upload", href: "/upload", icon: Camera },
    { name: "Map", href: "/map", icon: MapPin },
    { name: "Community", href: "/community", icon: Users },
    { name: "Events", href: "/community-cleanups", icon: Calendar },
    { name: "Achievements", href: "/achievements", icon: Award },
  ]

  const isActive = (href: string) => pathname === href

  // Don't show navbar on landing, login, and signup pages
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return null
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50 shadow-sm">
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

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-green-800">Alex Johnson</p>
                <p className="text-xs text-green-600">2,340 points</p>
              </div>
              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-green-700" />
              </div>
            </div>

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
                <div>
                  <p className="font-medium text-green-800">Alex Johnson</p>
                  <p className="text-sm text-green-600">2,340 points • Eco Warrior</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
