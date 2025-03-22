# InfluencerIQ - AI-Powered Influencer Analysis Platform

InfluencerIQ is a modern web application that leverages AI to provide comprehensive analysis of social media influencers. Built with Next.js 14, TypeScript, and powered by Groq's AI models, it offers real-time credibility assessment and performance metrics for influencers across major social platforms.

## Features

- 🤖 **AI-Powered Analysis**: Utilizes Groq's advanced AI models for deep influencer insights
- 📊 **Real-time Analytics**: Comprehensive metrics including credibility scores, engagement rates, and audience analysis
- 📈 **Trend Analysis**: Historical performance tracking and growth metrics visualization
- 🎯 **Multi-Platform Support**: Analysis across major social media platforms (Instagram, YouTube, TikTok, etc.)
- 📱 **Responsive Design**: Fully responsive interface with smooth animations using Framer Motion
- 🔍 **Detailed Metrics**: 
  - Credibility Scoring
  - Audience Authenticity Analysis
  - Content Quality Evaluation
  - Brand Alignment Potential
  - Engagement Metrics

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **AI Integration**: Groq API
- **State Management**: React Hooks
- **Animations**: Framer Motion
- **Styling**: TailwindCSS
- **Charts**: React Circular Progressbar
- **API Routes**: Next.js API Routes

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/influenceiq.git
cd influenceiq
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
GROQ_API_KEY=your_groq_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
npm start
```

## Project Structure

```
influenceiq/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── groq/
│   │   │   └── rankings/
│   │   ├── about/
│   │   ├── rankings/
│   │   ├── trends/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── TrendAnalysis.tsx
│   └── styles/
│       └── globals.css
├── public/
├── package.json
└── tsconfig.json
```

## Key Components

### Analytics Dashboard
- Real-time credibility scoring
- Engagement metrics visualization
- Audience demographics analysis
- Content performance tracking

### Trend Analysis
- Historical performance data
- Growth trajectory visualization
- Engagement rate tracking
- Platform-specific metrics

### Rankings System
- Comparative analysis
- Platform-specific leaderboards
- Niche-based rankings
- Performance trends

## API Integration

The application uses Next.js API routes to handle:
- AI analysis requests via Groq
- Rankings data management
- Historical data tracking
- Real-time updates

## Styling and Design

- Custom TailwindCSS configuration
- Responsive design principles
- Smooth animations with Framer Motion
- Accessible UI components

## Performance Optimization

- Server-side rendering for optimal performance
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Efficient state management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Groq for providing powerful AI capabilities
- TailwindCSS team for the utility-first CSS framework
- Framer Motion for smooth animations

## Contact

Your Name - [@youremail](mailto:your.email@example.com)

Project Link: [https://github.com/yourusername/influenceiq](https://github.com/yourusername/influenceiq)
