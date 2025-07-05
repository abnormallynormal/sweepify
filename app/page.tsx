import Link from "next/link"
import { Leaf, Users, MapPin, Award, Camera, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-green-200 rounded-full animate-scale-in">
                <Leaf className="h-16 w-16 text-green-700" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-green-800 mb-6 tracking-tight">Sweepify</h1>
            <p className="text-xl md:text-2xl text-green-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join the movement to clean up our world, one sweep at a time. Connect with your community and make a real
              environmental impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-green-600 text-white rounded-full font-semibold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Cleaning Today
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-green-600 rounded-full font-semibold text-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-green-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold text-green-800 mb-4">How Sweepify Works</h2>
            <p className="text-xl text-green-600 max-w-2xl mx-auto">
              Simple steps to make a big difference in your community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "Capture & Upload",
                description: "Take photos of your cleanup efforts and upload them for AI verification",
              },
              {
                icon: MapPin,
                title: "Discover Locations",
                description: "Find areas in your community that need attention on our interactive map",
              },
              {
                icon: Users,
                title: "Join Community",
                description: "Connect with like-minded individuals and organize group cleanups",
              },
              {
                icon: Award,
                title: "Earn Rewards",
                description: "Track your progress and earn achievements for your environmental impact",
              },
              {
                icon: Heart,
                title: "Verify Others",
                description: "Help verify community cleanups and build trust in our network",
              },
              {
                icon: Leaf,
                title: "Make Impact",
                description: "See the real difference you're making in environmental conservation",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 transform hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-4 bg-green-200 rounded-full mb-6">
                  <feature.icon className="h-8 w-8 text-green-700" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-4">{feature.title}</h3>
                <p className="text-green-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in">Ready to Make a Difference?</h2>
          <p className="text-xl text-green-100 mb-8 animate-slide-up">
            Join thousands of environmental heroes already making an impact
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-white text-green-600 rounded-full font-semibold text-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg animate-scale-in"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  )
}
