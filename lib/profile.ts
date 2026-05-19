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
    "I studied mathematics through a master's degree at Oregon State University, where I developed the habit of thinking in proofs and abstractions. That training shapes how I approach software: I want to understand why something works, not just that it works.",
    "After grad school I moved into software QA at dynaConnections, where I build test frameworks, write automation, and work across the full stack. On my own time I build open-source tools in the ML/AI space, from GPU memory profilers to RAG evaluation frameworks.",
    "I co-founded the Akomapa Health Foundation, a nonprofit where I serve as CTO building Nkwapa, a patient management platform for underserved communities in Ghana. Everything I build comes back to the same impulse: make careful tools that solve real problems.",
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
