import ElegantCarousel from "@/components/ui/elegant-carousel";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero: Elegant Carousel */}
      <ElegantCarousel />

      {/* About Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-6">
            About St. Pete AI
          </h2>
          <p className="text-lg leading-relaxed text-gray-600 max-w-2xl mx-auto">
            We are a community of AI practitioners, researchers, and enthusiasts
            based in St. Petersburg, Florida. Our mission is to foster learning,
            collaboration, and innovation in artificial intelligence through
            regular meetups, workshops, and speaker events.
          </p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-12 text-center">
            Upcoming Events
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="text-sm font-medium text-indigo-500 uppercase tracking-wider mb-2">
                March 2026
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Monthly AI Meetup
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Join us for our next monthly gathering featuring lightning talks
                and networking with the local AI community.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="text-sm font-medium text-violet-500 uppercase tracking-wider mb-2">
                March 2026
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                LLM Workshop
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Hands-on workshop covering prompt engineering, RAG patterns,
                and building AI-powered applications.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="text-sm font-medium text-cyan-500 uppercase tracking-wider mb-2">
                April 2026
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Speaker Night
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Industry experts share insights on the latest developments in
                machine learning and artificial intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light tracking-tight mb-6">
            Join the Community
          </h2>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            Whether you&apos;re an AI researcher, a developer building with LLMs,
            or just curious about machine learning — there&apos;s a place for you
            at St. Pete AI.
          </p>
          <a
            href="https://www.meetup.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-colors"
          >
            Get Involved
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-950 text-gray-500 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} St. Pete AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
