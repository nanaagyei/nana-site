export const NOW = {
  updated: "September 2026",
  reading: [
    {
      title: "Deep Learning",
      author: "Ian Goodfellow, Yoshua Bengio & Aaron Courville",
      href: "https://www.deeplearningbook.org",
      cover: "/images/books/deep-learning.jpg",
      spine: "ink" as const,
    },
    {
      title: "AI Engineering",
      author: "Chip Huyen",
      href: "https://www.oreilly.com/library/view/ai-engineering/9781098166298/",
      cover: "/images/books/ai-engineering.jpg",
      spine: "terracotta" as const,
    },
    {
      title: "Designing Machine Learning Systems",
      author: "Chip Huyen",
      href: "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/",
      cover: "/images/books/designing-ml-systems.jpg",
      spine: "moss" as const,
    },
    {
      title: "Linear Algebra and Learning from Data",
      author: "Gilbert Strang",
      href: "https://math.mit.edu/~gs/learningfromdata/",
      cover: "/images/books/strang-linear-algebra.jpg",
      spine: "ochre" as const,
    },
  ],
  building: [
    {
      title: "Stormlog",
      description: "GPU memory profiling for PyTorch & TensorFlow",
      href: "/projects/stormlog",
    },
    {
      title: "Nkwapa",
      description: "Offline-first EMR for hypertension and diabetes programs",
      href: "/projects/nkwapa",
    },
    {
      title: "Akomapa Academy",
      description: "Global health education and leadership for student clinicians",
      href: "/projects/akomapa-academy",
    },
  ],
  learning: [
    {
      title: "GPU profiling and CUDA optimization",
      book: "Programming Massively Parallel Processors by Wen-mei Hwu",
      bookHref:
        "https://shop.elsevier.com/books/programming-massively-parallel-processors/hwu/978-0-443-43900-1",
      cover: "/images/books/pmpp.jpg",
      spine: "moss" as const,
    },
    {
      title: "Deep learning fundamentals and theory",
      book: "Deep Learning by Ian Goodfellow, Yoshua Bengio & Aaron Courville",
      bookHref: "https://www.deeplearningbook.org",
      cover: "/images/books/deep-learning.jpg",
      spine: "ink" as const,
    },
    {
      title: "ML systems",
      book: "Introduction to Machine Learning Systems by Vijay Janapa Reddi",
      bookHref:
        "https://mitpress.mit.edu/9780262058889/introduction-to-machine-learning-systems/",
      cover: "/images/books/intro-ml-systems.jpg",
      spine: "terracotta" as const,
    },
    {
      title: "Linear algebra for machine learning",
      book: "Linear Algebra and Learning from Data by Gilbert Strang",
      bookHref: "https://math.mit.edu/~gs/learningfromdata/",
      cover: "/images/books/strang-linear-algebra.jpg",
      spine: "ochre" as const,
    },
  ],
} as const;

export type BookSpine = (typeof NOW.reading)[number]["spine"];
export type ReadingBook = (typeof NOW.reading)[number];
export type LearningItem = (typeof NOW.learning)[number];
