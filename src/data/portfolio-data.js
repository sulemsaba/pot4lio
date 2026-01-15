// src/data/portfolio-data.js

/**
 * Portfolio Data Configuration
 * Central source of truth for all portfolio content
 */

// CV/Resume Link
export const cvLink = '/assets/cv/SuleimanMsaba_CV.pdf';

// Projects Portfolio
export const projects = [
  {
    id: 'project-1',
    name: 'Interactive ChatGPT Portfolio',
    description: 'A personal portfolio website mimicking ChatGPT interface with interactive chat and sidecar panels. Built with modern Vue 3 architecture.',
    link: '#',
    techStack: ['Vue 3', 'Tailwind CSS', 'Vite', 'JavaScript'],
    features: [
      'Real-time chat interface',
      'Responsive design for mobile and desktop',
      'Dark/Light theme toggle',
      'Interactive project showcase',
      'Contact form integration'
    ],
    status: 'completed',
    year: 2024
  },
  {
    id: 'project-2',
    name: 'E-commerce Dashboard',
    description: 'Comprehensive admin dashboard for e-commerce analytics with real-time charts, reports, and inventory management.',
    link: '#',
    techStack: ['Vue 3', 'Chart.js', 'Node.js', 'Express', 'MongoDB'],
    features: [
      'Real-time sales analytics',
      'Inventory management system',
      'Customer insights dashboard',
      'Revenue forecasting tools',
      'Export functionality for reports'
    ],
    status: 'completed',
    year: 2024
  },
  {
    id: 'project-3',
    name: 'Banking App Prototype',
    description: 'Secure banking services prototype with user authentication, transaction history, and account management features.',
    link: '#',
    techStack: ['Vue 3', 'Firebase', 'Tailwind CSS', 'Firebase Auth'],
    features: [
      'Secure user authentication',
      'Transaction history tracking',
      'Account balance management',
      'Fund transfer functionality',
      'Security notifications'
    ],
    status: 'in-progress',
    year: 2024
  }
];

// Skills & Technologies
export const skills = [
  {
    category: 'Frontend Development',
    items: [
      { name: 'JavaScript (ES6+)', level: 'advanced' },
      { name: 'Vue 3', level: 'advanced' },
      { name: 'HTML5', level: 'advanced' },
      { name: 'CSS3', level: 'advanced' },
      { name: 'Tailwind CSS', level: 'advanced' },
      { name: 'Responsive Design', level: 'advanced' }
    ]
  },
  {
    category: 'Backend Development',
    items: [
      { name: 'Node.js', level: 'intermediate' },
      { name: 'Express.js', level: 'intermediate' },
      { name: 'REST APIs', level: 'intermediate' },
      { name: 'Python', level: 'intermediate' }
    ]
  },
  {
    category: 'Tools & Technologies',
    items: [
      { name: 'Git & GitHub', level: 'advanced' },
      { name: 'Vite', level: 'advanced' },
      { name: 'Firebase', level: 'intermediate' },
      { name: 'MongoDB', level: 'intermediate' }
    ]
  },
  {
    category: 'Design & UX',
    items: [
      { name: 'UI/UX Principles', level: 'intermediate' },
      { name: 'Figma', level: 'intermediate' },
      { name: 'Accessibility (A11y)', level: 'intermediate' }
    ]
  }
];

// Professional Timeline / Experience
export const timeline = [
  {
    id: 'exp-1',
    year: '2025',
    role: 'Full-stack Developer',
    company: 'Freelance',
    duration: 'Jan 2025 - Present',
    description: 'Building modern web applications for clients, specializing in Vue.js ecosystems and interactive user experiences. Portfolio enhancement and client project delivery.',
    type: 'work',
    highlights: [
      'Delivered 5+ client projects',
      'Specialized in Vue 3 applications',
      'Implemented modern UI/UX patterns'
    ]
  },
  {
    id: 'exp-2',
    year: '2024',
    role: 'Web Developer',
    company: 'Self-Employed',
    duration: 'Mar 2024 - Dec 2024',
    description: 'Built first ChatGPT-style personal portfolio and multiple client projects. Focused on creating interactive web applications with modern JavaScript frameworks.',
    type: 'work',
    highlights: [
      'Created interactive portfolio site',
      'Mastered Vue 3 Composition API',
      'Developed e-commerce solutions'
    ]
  },
  {
    id: 'exp-3',
    year: '2023',
    role: 'Junior Developer',
    company: 'Independent Learning',
    duration: 'Jan 2023 - Feb 2024',
    description: 'Started developing interactive web applications using Vue and JavaScript. Completed multiple online courses and built practice projects.',
    type: 'learning',
    highlights: [
      'Learned Vue.js and modern JavaScript',
      'Built 10+ practice projects',
      'Contributed to open-source'
    ]
  },
  {
    id: 'exp-4',
    year: '2022',
    role: 'Graduate',
    company: 'University',
    duration: 'Graduated 2022',
    description: 'Graduated with Bachelor of Commerce, Banking & Finance. Developed strong analytical and problem-solving skills.',
    type: 'education',
    highlights: [
      'Bachelor of Commerce',
      'Banking & Finance specialization',
      'Strong analytical foundation'
    ]
  }
];

// Contact Information
export const contactInfo = {
  email: 'suleiman@example.com',
  phone: '+255 7XX XXX XXX',
  location: 'Dar es Salaam, Tanzania',
  linkedin: 'https://www.linkedin.com/in/suleiman-msaba',
  github: 'https://github.com/suleimanmsaba',
  twitter: null, // Optional: Add if available
  website: null, // Optional: Add if available
  availability: 'Available for freelance projects'
};

// About Me / Bio
export const bio = {
  short: 'Full-stack developer specializing in Vue.js and modern web technologies. Passionate about creating interactive user experiences.',
  long: `I'm a full-stack developer with a unique background in Banking & Finance, now focusing on building modern web applications. I specialize in Vue.js ecosystems and creating interactive, user-friendly experiences.

My journey into web development began in 2023, and I've since built numerous projects ranging from e-commerce platforms to banking prototypes. I combine analytical thinking from my finance background with creative problem-solving in development.

When I'm not coding, I'm exploring new technologies, contributing to open-source projects, and helping others learn web development.`,
  tagline: 'Building the web, one component at a time.'
};

// Certifications & Achievements (Optional)
export const achievements = [
  {
    id: 'cert-1',
    title: 'Vue.js Mastery',
    issuer: 'Online Learning Platform',
    year: 2023,
    description: 'Advanced Vue.js certification covering Composition API, state management, and performance optimization.'
  },
  {
    id: 'cert-2',
    title: 'Modern JavaScript',
    issuer: 'Online Learning Platform',
    year: 2023,
    description: 'Comprehensive JavaScript certification covering ES6+, async programming, and modern patterns.'
  }
];

// Social Links (for easier management)
export const socialLinks = [
  {
    platform: 'GitHub',
    url: contactInfo.github,
    icon: 'github',
    color: '#333'
  },
  {
    platform: 'LinkedIn',
    url: contactInfo.linkedin,
    icon: 'linkedin',
    color: '#0077b5'
  },
  {
    platform: 'Email',
    url: `mailto:${contactInfo.email}`,
    icon: 'mail',
    color: '#ea4335'
  }
];

// FAQ Data (Optional - for future use)
export const faq = [
  {
    question: 'What technologies do you work with?',
    answer: 'I specialize in Vue.js, JavaScript, Node.js, and modern web technologies. I also work with Firebase, MongoDB, and various CSS frameworks.'
  },
  {
    question: 'Are you available for freelance work?',
    answer: 'Yes! I\'m currently available for freelance projects. Feel free to reach out via email or LinkedIn.'
  },
  {
    question: 'What\'s your development process?',
    answer: 'I follow an agile approach with regular communication, iterative development, and thorough testing. Client satisfaction is my top priority.'
  }
];

// Export default object for convenient importing
export default {
  cvLink,
  projects,
  skills,
  timeline,
  contactInfo,
  bio,
  achievements,
  socialLinks,
  faq
};