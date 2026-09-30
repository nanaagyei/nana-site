export type BookSpine = "terracotta" | "moss" | "ochre" | "ink";

export type ReadingBook = {
  title: string;
  author: string;
  href: string;
  cover: string;
  spine: BookSpine;
};

const reading: ReadingBook[] = [
  {
    title: "Deep Learning",
    author: "Ian Goodfellow, Yoshua Bengio & Aaron Courville",
    href: "https://www.deeplearningbook.org",
    cover: "/images/books/deep-learning.jpg",
    spine: "ink",
  },
  {
    title: "AI Engineering",
    author: "Chip Huyen",
    href: "https://www.oreilly.com/library/view/ai-engineering/9781098166298/",
    cover: "/images/books/ai-engineering.jpg",
    spine: "terracotta",
  },
  {
    title: "Designing Machine Learning Systems",
    author: "Chip Huyen",
    href: "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/",
    cover: "/images/books/designing-ml-systems.jpg",
    spine: "moss",
  },
  {
    title: "Linear Algebra and Learning from Data",
    author: "Gilbert Strang",
    href: "https://math.mit.edu/~gs/learningfromdata/",
    cover: "/images/books/strang-linear-algebra.jpg",
    spine: "ochre",
  },
  {
    title: "Red Rising",
    author: "Pierce Brown",
    href: "https://www.pierce-brown.com/red-rising-1",
    cover: "https://m.media-amazon.com/images/I/81bbaOYIagL._SL1500_.jpg",
    spine: "terracotta",
  },
];

const previouslyRead: ReadingBook[] = [
  {
    title: "Metamorphosis",
    author: "Franz Kafka",
    href: "https://www.goodreads.com/book/show/485894.The_Metamorphosis",
    cover: "https://m.media-amazon.com/images/I/61UqU-pWVnL._SY522_.jpg",
    spine: "ink",
  },
  {
    title: "The Poppy War",
    author: "R. F. Kuang",
    href: "https://www.goodreads.com/book/show/32718027-the-poppy-war",
    cover: "https://m.media-amazon.com/images/I/81Paw38NSVL._SY522_.jpg",
    spine: "terracotta",
  },
  {
    title: "The Burnout Society",
    author: "Byung-Chul Han",
    href: "https://www.goodreads.com/book/show/23281948-the-burnout-society",
    cover:
      "https://m.media-amazon.com/images/I/416+KS-UMSL._SY445_SX342_FMwebp_.jpg",
    spine: "moss",
  },
  {
    title: "Beyond Good and Evil",
    author: "Friedrich Nietzsche",
    href: "https://www.goodreads.com/book/show/10820.Beyond_Good_and_Evil",
    cover: "https://m.media-amazon.com/images/I/81p5YYw2DcL._SY522_.jpg",
    spine: "ochre",
  },
  {
    title: "Fairy Tale",
    author: "Stephen King",
    href: "https://www.goodreads.com/book/show/58784475-fairy-tale",
    cover: "https://m.media-amazon.com/images/I/51ECRZXoGyL._SY445_SX342_FMwebp_.jpg",
    spine: "ink",
  },
  {
    title: "Holly",
    author: "Stephen King",
    href: "https://www.goodreads.com/book/show/61431434-holly",
    cover: "https://m.media-amazon.com/images/I/81jNkDHgEyL._SY522_.jpg",
    spine: "terracotta",
  },
];

export const NOW = {
  updated: "September 2026",
  reading,
  previouslyRead,
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

export type LearningItem = (typeof NOW.learning)[number];
