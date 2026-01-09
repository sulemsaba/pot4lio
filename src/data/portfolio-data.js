// Mock portfolio responses
const portfolioData = {
  getResponse(question) {
    const q = question.toLowerCase()

    if (q.includes('about')) {
      return "👋 Hi! I'm Alex, a frontend developer specializing in Vue.js, Vite, and modern web design."
    }

    if (q.includes('projects')) {
      return "💻 I've worked on multiple projects including personal portfolios, Vue apps, and web dashboards."
    }

    if (q.includes('skills')) {
      return "🛠 My main skills: Vue.js, JavaScript, HTML, CSS, Vite, Git, and responsive design."
    }

    if (q.includes('contact')) {
      return "📧 You can reach me at alex@example.com or connect via LinkedIn / GitHub."
    }

    return "🤖 Sorry, I don't understand that yet. Ask me about my skills, projects, or experience!"
  }
}

export default portfolioData
