export const profile = {
  name: "Prince Agyei Tuffour",
  mark: "nana",
  role: "Software & QA Engineer",
  location: "Austin, TX",
  email: "prince.agyei.tuffour@gmail.com",
  social: {
    github: "https://github.com/nanaagyei",
    linkedin: "https://linkedin.com/in/prince-agyei-tuffour",
  },
  one_liner: "Open source · ML · Math · Software engineering",
  bio: [
    "Hey, I’m Prince, though most people call me Nana. By day I’m a software QA engineer in Austin. By night I build open-source tools for ML, and I run the tech for a health nonprofit back home in Ghana.",
    "Lately I’m deep in GPU memory, ML systems, and the quiet art of proving that software works. Off the clock: soccer, tennis, pickleball, chess, and a bass guitar that is slowly forgiving me.",
  ],
  interests: [
    "GPU memory",
    "ML systems",
    "Evals & testing",
    "Open source",
    "Health tech for Ghana",
    "Learning by building",
  ],
  experience: [
    {
      company: "dynaConnections",
      role: "Software QA Engineer",
      start: "2025-03",
      end: null,
      bullets: [
        "Design and implement test automation frameworks for enterprise web applications",
        "Write end-to-end, integration, and unit tests across the full stack",
        "Collaborate with development teams to identify, reproduce, and resolve defects",
      ],
    },
    {
      company: "Akomapa Health Foundation",
      role: "CTO & Co-founder",
      start: "2024-01",
      end: null,
      bullets: [
        "Architect and build Nkwapa, a patient management platform for underserved communities in Ghana",
        "Lead technical strategy and infrastructure decisions for the nonprofit",
        "Coordinate with healthcare workers to translate clinical workflows into software",
      ],
    },
    {
      company: "Cita Marketplace",
      role: "Software Engineer Intern",
      start: "2023-06",
      end: "2023-09",
      bullets: [
        "Built features for a marketplace connecting local vendors with customers",
        "Developed RESTful API endpoints and integrated third-party services",
        "Participated in code reviews and agile development practices",
      ],
    },
  ],
  education: [
    {
      school: "Oregon State University",
      degree: "M.S. Mathematics",
      year: "2023",
    },
    {
      school: "KNUST, Ghana",
      degree: "B.S. Mathematics",
      year: "2020",
    },
  ],
} as const;
