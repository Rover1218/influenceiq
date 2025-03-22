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
                className="mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
            >
                <h1 className="text-3xl font-bold text-gray-800">About InfluencerIQ</h1>
                <p className="text-gray-600 mt-2">Discover the power of AI-driven influencer analysis</p>
            </motion.div>

            <motion.div
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7 }}
            >
                <div className="p-6">
                    <motion.section
                        className="mb-8"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className="text-xl font-bold text-blue-700 mb-3">Our Mission</h2>
                        <motion.p
                            className="text-gray-700 leading-relaxed"
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
                            className="text-xl font-bold text-blue-700 mb-3"
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
                                    className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                                    variants={itemVariants}
                                    whileHover={{
                                        y: -5,
                                        boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
                                    }}
                                >
                                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mb-3">
                                        {item.step}
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm">{item.desc}</p>
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
                            className="text-xl font-bold text-blue-700 mb-3"
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
                                    className="flex items-start"
                                    custom={i}
                                    variants={listItemVariants}
                                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <span className="font-medium text-gray-800">{item.title}</span>
                                        <p className="text-gray-600 text-sm">{item.desc}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.section>

                    <motion.section
                        className="mb-8"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.5 }}
                    >
                        <h2 className="text-xl font-bold text-blue-700 mb-3">Our Technology</h2>
                        <p className="text-gray-700 leading-relaxed">
                            InfluencerIQ is powered by state-of-the-art AI models from Groq that analyze vast amounts of data
                            across social media platforms. Our technology examines content patterns, audience interactions,
                            engagement metrics, and overall influence to provide comprehensive assessments that help brands
                            make informed decisions about their influencer marketing strategies.
                        </p>
                    </motion.section>

                    <motion.section
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.6 }}
                    >
                        <h2 className="text-xl font-bold text-blue-700 mb-3">Get Started Today</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Whether you're a brand looking to partner with the right influencers or a marketing agency seeking
                            data-driven insights for your clients, InfluencerIQ provides the tools you need to make smart decisions
                            in the complex world of influencer marketing.
                        </p>
                        <div className="mt-4">
                            <motion.a
                                href="/"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md transition-colors"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Start Analyzing Influencers
                            </motion.a>
                        </div>
                    </motion.section>
                </div>
            </motion.div>
        </motion.div>
    );
}
