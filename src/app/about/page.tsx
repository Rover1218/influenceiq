"use client";

import { motion } from "framer-motion";

export default function About() {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    const listItemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.4
            }
        })
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="mb-8 text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
            >
                <h1 className="text-4xl font-bold gradient-text mb-3">About InfluencerIQ</h1>
                <p className="text-gray-600 text-lg">Discover the power of AI-driven influencer analysis</p>
            </motion.div>

            <motion.div
                className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7 }}
            >
                <div className="p-8">
                    <motion.section
                        className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="flex items-center mb-3">
                            <div className="bg-blue-600 p-2 rounded-lg mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-700">Our Mission</h2>
                        </div>
                        <motion.p
                            className="text-gray-700 leading-relaxed text-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            InfluencerIQ was created to bring transparency and data-driven insights to influencer marketing.
                            Our platform leverages cutting-edge artificial intelligence to analyze social media influencers
                            across major platforms, providing brands and marketers with reliable metrics on credibility,
                            audience authenticity, and brand alignment potential.
                        </motion.p>
                    </motion.section>

                    <motion.section
                        className="mb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.h2
                            className="text-2xl font-bold text-blue-700 mb-6"
                            variants={itemVariants}
                        >
                            How It Works
                        </motion.h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    step: 1,
                                    title: "Enter Influencer Name",
                                    desc: "Simply type in the name or handle of any influencer you'd like to analyze."
                                },
                                {
                                    step: 2,
                                    title: "AI Analysis",
                                    desc: "Our advanced AI powered by Groq analyzes the influencer across multiple dimensions."
                                },
                                {
                                    step: 3,
                                    title: "Get Detailed Results",
                                    desc: "Receive comprehensive insights including credibility scores and engagement metrics."
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={item.step}
                                    className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-md card-hover"
                                    variants={itemVariants}
                                    whileHover={{
                                        y: -8,
                                        boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.2), 0 15px 25px -8px rgba(59, 130, 246, 0.15)"
                                    }}
                                >
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center mb-4 font-bold text-lg shadow-lg">
                                        {item.step}
                                    </div>
                                    <h3 className="font-bold text-gray-800 mb-2 text-lg">{item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    <motion.section
                        className="mb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delayChildren: 0.4 }}
                    >
                        <motion.h2
                            className="text-2xl font-bold text-blue-700 mb-6"
                            variants={itemVariants}
                        >
                            Key Features
                        </motion.h2>
                        <ul className="space-y-3">
                            {[
                                {
                                    title: "Credibility Scoring",
                                    desc: "Objective assessment of influencer credibility on a scale of 1-10"
                                },
                                {
                                    title: "Audience Authenticity Analysis",
                                    desc: "Detection of fake followers and assessment of real engagement"
                                },
                                {
                                    title: "Content Quality Evaluation",
                                    desc: "Assessment of production quality, consistency, and audience resonance"
                                },
                                {
                                    title: "Brand Alignment Potential",
                                    desc: "Insights into how well an influencer might represent different brands and industries"
                                },
                                {
                                    title: "Rankings and Comparisons",
                                    desc: "Compare influencers within niches to find the best fit for your campaigns"
                                }
                            ].map((item, i) => (
                                <motion.li
                                    key={i}
                                    className="flex items-start p-4 rounded-lg hover:bg-blue-50 transition-colors"
                                    custom={i}
                                    variants={listItemVariants}
                                    whileHover={{ x: 8, transition: { duration: 0.2 } }}
                                >
                                    <div className="bg-blue-600 p-1.5 rounded-lg mr-3 flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-800 text-lg">{item.title}</span>
                                        <p className="text-gray-600 mt-1">{item.desc}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.section>

                    <motion.section
                        className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center mb-3">
                            <div className="bg-purple-600 p-2 rounded-lg mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-purple-700">Our Technology</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            InfluencerIQ is powered by state-of-the-art AI models from Groq that analyze vast amounts of data
                            across social media platforms. Our technology examines content patterns, audience interactions,
                            engagement metrics, and overall influence to provide comprehensive assessments that help brands
                            make informed decisions about their influencer marketing strategies.
                        </p>
                    </motion.section>

                    <motion.section
                        className="text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 rounded-xl shadow-2xl"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Get Started Today</h2>
                        <p className="text-blue-50 leading-relaxed text-lg mb-6">
                            Whether you're a brand looking to partner with the right influencers or a marketing agency seeking
                            data-driven insights for your clients, InfluencerIQ provides the tools you need to make smart decisions
                            in the complex world of influencer marketing.
                        </p>
                        <motion.a
                            href="/"
                            className="inline-block bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 rounded-full transition-colors shadow-xl"
                            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🚀 Start Analyzing Influencers
                        </motion.a>
                    </motion.section>
                </div>
            </motion.div>
        </motion.div>
    );
}
