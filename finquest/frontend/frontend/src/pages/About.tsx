"use client";

export default function About() {
  // Static team data (image URLs provided directly)
const team = [
  {
    name: "Saumya Shah",
    role: "Full Stack Developer",
    bio: "Passionate about creating dynamic, accessible, and high-performance web applications using React and the latest web technologies",
    photoURL: "/Saumya.jpg", // ✅ Root of public folder
    github: "https://github.com/Saumya10a",
  },
  {
    name: "Nikhil Solanke",
    role: "Full Stack Engineer",
    bio: "Focused on building reliable and scalable finance applications, integrating smart gamification, and designing smooth user experiences.",
    photoURL: "/Nikhil.jpg", // ✅
    github: "https://github.com/Nickhasntlost",
  },
];


  return (
    <div className="space-y-10">
      {/* Cinematic Header */}
      <header className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold gradient-text drop-shadow-lg">
          About Finquest
        </h1>
        <p className="text-lg text-muted-foreground">
          Cinematic, gamified finance education <span className="text-emerald-600 font-bold">for everyone</span>.
        </p>
      </header>

      {/* New Informative Sections */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-2xl shadow-lg flex flex-col gap-4">
          <h2 className="font-bold text-xl text-brand-emerald">Why Finquest?</h2>
          <p className="text-base text-muted-foreground">
            Finquest combines engaging storytelling, gamification, and practical simulations to make financial literacy accessible, fun, and effective for learners at all levels.
          </p>
        </div>
        <div className="glass p-8 rounded-2xl shadow-lg flex flex-col gap-4">
          <h2 className="font-bold text-xl text-brand-gold">What Makes Us Different</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Real-world trading practice in a risk-free environment</li>
            <li>Bite-sized lessons designed for busy schedules</li>
            <li>Instant, cinematic feedback for motivation</li>
            <li>Community-driven challenges and achievements</li>
          </ul>
        </div>
        <div className="glass p-8 rounded-2xl shadow-lg flex flex-col gap-4">
          <h2 className="font-bold text-xl text-brand-emerald">Our Vision</h2>
          <p className="text-base text-muted-foreground">
            To empower a global generation with the confidence and skills to make smart financial decisions, creating lasting impact in their lives and communities.
          </p>
        </div>
      </section>

      {/* Developers Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-brand-emerald">Meet the Developers</h2>
        <div className="flex flex-wrap gap-6 justify-center">
          {team.map((dev) => (
            <div
              key={dev.name}
              className="glass p-6 rounded-xl shadow flex flex-col items-center gap-4 w-full sm:w-80"
              tabIndex={0}
            >
              <img
                src={dev.photoURL}
                alt={dev.name}
                className="w-20 h-20 rounded-full border-2 border-emerald-400 object-cover shadow"
              />
              <h3 className="font-bold text-lg flex items-center gap-2">
                {dev.name}
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-gray-500 hover:text-black"
                  aria-label={`GitHub of ${dev.name}`}
                >
                  {/* GitHub icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .5a12 12 0 0 0-3.794 23.39c.6.113.82-.258.82-.577
                      0-.285-.011-1.04-.016-2.04-3.338.726-4.042-1.416-4.042-1.416
                      -.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729
                      1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.493.997
                      .107-.777.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.93
                      0-1.309.468-2.38 1.236-3.22-.124-.303-.536-1.524.116-3.176 0 0
                      1.008-.322 3.3 1.23a11.47 11.47 0 0 1 6.003 0c2.29-1.552 3.297-1.23
                      3.297-1.23.653 1.653.24 2.874.117 3.176.77.84 1.235 1.911 1.235 3.22
                      0 4.609-2.803 5.625-5.476 5.93.43.37.824 1.101.824 2.221
                      0 1.606-.014 2.898-.014 3.293 0 .32.217.694.826.576A12 12 0 0 0 12 .5z"/>
                  </svg>
                </a>
              </h3>
              <div className="font-semibold text-emerald-700 text-sm">{dev.role}</div>
              <p className="text-xs text-muted-foreground mt-1 text-center">{dev.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Call-to-action */}
      <footer className="text-center space-y-2 pt-8">
        <p className="text-sm text-muted-foreground">
          Questions or feedback? Reach out — we’d love to hear how you want to shape financial learning!
        </p>
      </footer>
    </div>
  );
}
