export const portfolioData = {
  name: '[Your Name]',
  title: '[Your Title]',
  bio: 'Passionate developer specializing in [Your Specialties].',
  
  sections: [
    {
      id: 'about',
      title: 'About Me',
      keywords: ['about', 'who are you', 'bio', 'background', 'introduction'],
      content: `I'm a passionate developer with expertise in modern web technologies. I enjoy creating intuitive user experiences and solving complex problems with clean, efficient code. My background includes [Your Background Details].`
    },
    {
      id: 'skills',
      title: 'Skills',
      keywords: ['skills', 'technologies', 'tools', 'stack', 'what do you know'],
      content: `**Frontend:** Vue.js, React, JavaScript, TypeScript, HTML5, CSS3\n**Backend:** Node.js, Python, Express\n**Databases:** MongoDB, PostgreSQL\n**Tools:** Git, Docker, AWS, Figma\n**Other:** Responsive Design, UI/UX, Agile/Scrum`
    },
    {
      id: 'projects',
      title: 'Projects',
      keywords: ['projects', 'portfolio', 'work', 'showcase', 'what have you built'],
      content: `### **Project 1: [Project Name]**
      - Description: [Brief project description]
      - Technologies: Vue.js, Node.js, MongoDB
      - Features: [Key features]
      - Link: [Live demo or GitHub URL]
      
      ### **Project 2: [Project Name]**
      - Description: [Brief project description]
      - Technologies: React, Express, PostgreSQL
      - Features: [Key features]
      - Link: [Live demo or GitHub URL]
      
      ### **Project 3: [Project Name]**
      - Description: [Brief project description]
      - Technologies: [Technologies used]
      - Features: [Key features]
      - Link: [Live demo or GitHub URL]`
    },
    {
      id: 'experience',
      title: 'Experience',
      keywords: ['experience', 'work history', 'jobs', 'career', 'employment'],
      content: `### **Senior Developer** at [Company Name] (2020-Present)
      - Led development of customer-facing applications using Vue.js
      - Implemented CI/CD pipelines reducing deployment time by 40%
      - Mentored 3 junior developers on best practices
      
      ### **Frontend Developer** at [Company Name] (2018-2020)
      - Developed responsive web applications using React and TypeScript
      - Collaborated with UX designers to implement user-centric features
      - Optimized application performance improving load times by 30%`
    },
    {
      id: 'contact',
      title: 'Contact',
      keywords: ['contact', 'email', 'get in touch', 'hire', 'connect', 'social'],
      content: `Feel free to reach out for collaborations, opportunities, or just to chat!
      
      **Email:** [your.email@example.com]
      **LinkedIn:** [linkedin.com/in/yourprofile]
      **GitHub:** [github.com/yourusername]
      **Twitter:** [twitter.com/yourhandle]
      
      I typically respond within 24 hours.`
    },
    {
      id: 'help',
      title: 'Help',
      keywords: ['help', 'commands', 'what can you do', 'options', 'menu'],
      content: `I can tell you about:
      - **About me**: My background and interests
      - **Skills**: Technologies and tools I work with
      - **Projects**: My portfolio projects with details
      - **Experience**: My professional work history
      - **Contact**: How to get in touch with me
      
      Just ask about any of these topics, or type "help" anytime!`
    }
  ],
  
  greetings: [
    "Hello! I'm [Your Name]'s portfolio assistant. How can I help you today?",
    "Hi there! Ask me about my skills, projects, experience, or contact information.",
    "Welcome to my interactive portfolio! What would you like to know about me?"
  ],
  
  defaultResponses: [
    "I'm not sure about that. Try asking about my skills, projects, or experience!",
    "Could you rephrase that? I can tell you about my background, skills, projects, or contact info.",
    "I'm here to help you learn about my portfolio. Try asking about specific sections like 'projects' or 'experience'."
  ]
};

// Bot response logic
export const getBotResponse = (userMessage) => {
  const message = userMessage.toLowerCase().trim();
  const { sections, defaultResponses, greetings } = portfolioData;
  
  // Check for greetings
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Check for help
  if (message.includes('help')) {
    return sections.find(s => s.id === 'help').content;
  }
  
  // Check for section keywords
  for (const section of sections) {
    for (const keyword of section.keywords) {
      if (message.includes(keyword)) {
        return section.content;
      }
    }
  }
  
  // Default random response
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};