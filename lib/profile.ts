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
  one_liner:
    "Math-trained software engineer building open-source developer tools, learning ML/AI engineering in public.",
  bio: [
    "Hey, I'm Prince — most people call me Nana. I'm a mathematician turned software engineer based in Austin. I love building things that help people think more clearly, whether that's a tool for debugging GPU memory or a platform connecting patients with healthcare.",
    "I studied math through a master's at Oregon State, and that way of thinking stuck with me — I care about understanding systems deeply, not just getting them to run. These days I work in software QA at dynaConnections and spend my evenings building open-source tools in the ML/AI space.",
    "I'm especially drawn to the intersection of low-level systems and machine learning — profiling memory, understanding how models behave under the hood, and making that knowledge accessible. I also co-founded the Akomapa Health Foundation, where I lead the tech behind Nkwapa, a patient management platform for underserved communities back home in Ghana.",
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
