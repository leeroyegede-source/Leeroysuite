// AI Suite v5.1 - Comprehensive Feature List
// 100+ AI Tools organized by category

export interface FeatureItem {
    id: string;
    label: string;
    category: string;
    description?: string;
    tokenCost?: number;
    isNew?: boolean;
    isPro?: boolean;
}

export const FEATURE_CATEGORIES = [
    // { id: 'core', label: 'Core Tools', icon: 'Sparkles' },
    // { id: 'writing', label: 'Writing', icon: 'PenTool' },
    { id: 'social', label: 'Social Media', icon: 'Share2' },
    // { id: 'marketing', label: 'Marketing', icon: 'TrendingUp' },
    // { id: 'business', label: 'Business', icon: 'Briefcase' },
    // { id: 'development', label: 'Development', icon: 'Code' },
    // { id: 'education', label: 'Education', icon: 'GraduationCap' },
    // { id: 'creative', label: 'Creative', icon: 'Palette' },
    // { id: 'legal', label: 'Legal', icon: 'Shield' },
    // { id: 'seo', label: 'SEO', icon: 'Search' },
    // { id: 'personal', label: 'Personal', icon: 'Heart' },
    // { id: 'agents', label: 'AI Agents', icon: 'Bot' },
] as const;

export const AVAILABLE_FEATURES: FeatureItem[] = [
    // ========== CORE TOOLS ==========
    { id: 'chat', label: 'AI Chat Assistant', category: 'core', tokenCost: 10 },
    { id: 'website', label: 'Website Builder', category: 'core', tokenCost: 100, isNew: true },
    { id: 'image-generator', label: 'Image Generator', category: 'core', tokenCost: 50 },
    { id: 'code', label: 'Code Generator', category: 'core', tokenCost: 15 },
    { id: 'translator', label: 'Translation Hub', category: 'core', tokenCost: 10 },
    { id: 'support-agent', label: 'Live Chat', category: 'core', tokenCost: 10, isNew: true },

    // ========== WRITING ==========
    { id: 'writer', label: 'Content Writer', category: 'writing', tokenCost: 20 },
    { id: 'blog-post', label: 'Blog Post Generator', category: 'writing', tokenCost: 25, isNew: true },
    { id: 'article-writer', label: 'Article Writer', category: 'writing', tokenCost: 25, isNew: true },
    // { id: 'paragraph-generator', label: 'Paragraph Generator', category: 'writing', tokenCost: 10 },
    { id: 'content-improver', label: 'Content Improver', category: 'writing', tokenCost: 15, isNew: true },
    { id: 'summary', label: 'Text Summarizer', category: 'writing', tokenCost: 15 },
    { id: 'headline-generator', label: 'Headline Generator', category: 'writing', tokenCost: 10, isNew: true },
    // { id: 'tagline-creator', label: 'Tagline Creator', category: 'writing', tokenCost: 10, isNew: true },
    // { id: 'product-description', label: 'Product Description', category: 'writing', tokenCost: 15, isNew: true },
    // { id: 'press-release', label: 'Press Release', category: 'writing', tokenCost: 25, isNew: true },
    // { id: 'speech-writer', label: 'Speech Writer', category: 'writing', tokenCost: 30, isNew: true },
    { id: 'poem-generator', label: 'Poem Generator', category: 'writing', tokenCost: 15, isNew: true },
    { id: 'story', label: 'Story Generator', category: 'writing', tokenCost: 25 },
    // { id: 'script-writer', label: 'Script Writer', category: 'writing', tokenCost: 30, isNew: true },
    // { id: 'thesis-statement', label: 'Thesis Statement', category: 'writing', tokenCost: 15, isNew: true },
    // { id: 'ebook-outline', label: 'eBook Outline', category: 'writing', tokenCost: 25, isNew: true },
    { id: 'grammar', label: 'Grammar Check', category: 'writing', tokenCost: 10 },

    // ========== SOCIAL MEDIA ==========
    { id: 'social', label: 'Social Media Suite', category: 'social', tokenCost: 15 },
    { id: 'instagram-caption', label: 'Instagram Caption', category: 'social', tokenCost: 10, isNew: true },
    { id: 'twitter-thread', label: 'Twitter/X Thread', category: 'social', tokenCost: 15, isNew: true },
    { id: 'linkedin-post', label: 'LinkedIn Post', category: 'social', tokenCost: 10, isNew: true },
    // { id: 'facebook-post', label: 'Facebook Post', category: 'social', tokenCost: 10, isNew: true },
    // { id: 'tiktok-script', label: 'TikTok Script', category: 'social', tokenCost: 15, isNew: true },
    { id: 'youtube-description', label: 'YouTube Description', category: 'social', tokenCost: 15, isNew: true },
    { id: 'hashtag-generator', label: 'Hashtag Generator', category: 'social', tokenCost: 5, isNew: true },
    // { id: 'social-bio', label: 'Social Bio Generator', category: 'social', tokenCost: 10, isNew: true },
    // { id: 'viral-ideas', label: 'Viral Post Ideas', category: 'social', tokenCost: 15, isNew: true },
    { id: 'content-calendar', label: 'Content Calendar', category: 'social', tokenCost: 25, isNew: true },
    // { id: 'engagement-reply', label: 'Engagement Replies', category: 'social', tokenCost: 10, isNew: true },
    // { id: 'influencer-outreach', label: 'Influencer Outreach', category: 'social', tokenCost: 15, isNew: true },

    // ========== MARKETING ==========
    { id: 'google-ads', label: 'Google Ads Copy', category: 'marketing', tokenCost: 15, isNew: true },
    { id: 'facebook-ads', label: 'Facebook Ads Copy', category: 'marketing', tokenCost: 15, isNew: true },
    // { id: 'email-campaign', label: 'Email Campaign', category: 'marketing', tokenCost: 20, isNew: true },
    { id: 'email', label: 'Email Assistant', category: 'marketing', tokenCost: 15 },
    // { id: 'landing-page-copy', label: 'Landing Page Copy', category: 'marketing', tokenCost: 25, isNew: true },
    { id: 'sales-pitch', label: 'Sales Pitch', category: 'marketing', tokenCost: 20, isNew: true },
    // { id: 'product-launch', label: 'Product Launch Copy', category: 'marketing', tokenCost: 25, isNew: true },
    // { id: 'brand-voice', label: 'Brand Voice Generator', category: 'marketing', tokenCost: 20, isNew: true },
    // { id: 'value-proposition', label: 'Value Proposition', category: 'marketing', tokenCost: 15, isNew: true },
    // { id: 'testimonial-generator', label: 'Testimonial Generator', category: 'marketing', tokenCost: 15, isNew: true },
    // { id: 'case-study', label: 'Case Study Generator', category: 'marketing', tokenCost: 30, isNew: true },
    { id: 'marketing-plan', label: 'Marketing Plan', category: 'marketing', tokenCost: 35, isNew: true },
    // { id: 'swot-analysis', label: 'SWOT Analysis', category: 'marketing', tokenCost: 25, isNew: true },
    { id: 'competitor-analysis', label: 'Competitor Analysis', category: 'marketing', tokenCost: 30, isNew: true },
    // { id: 'usp-generator', label: 'USP Generator', category: 'marketing', tokenCost: 15, isNew: true },
    // { id: 'cta-generator', label: 'CTA Generator', category: 'marketing', tokenCost: 10, isNew: true },

    // ========== BUSINESS ==========
    { id: 'business-plan', label: 'Business Plan', category: 'business', tokenCost: 50, isNew: true },
    // { id: 'executive-summary', label: 'Executive Summary', category: 'business', tokenCost: 25, isNew: true },
    { id: 'meeting', label: 'Meeting Notes', category: 'business', tokenCost: 20 },
    // { id: 'meeting-agenda', label: 'Meeting Agenda', category: 'business', tokenCost: 15, isNew: true },
    // { id: 'business-proposal', label: 'Business Proposal', category: 'business', tokenCost: 35, isNew: true },
    // { id: 'invoice-template', label: 'Invoice Template', category: 'business', tokenCost: 15, isNew: true },
    { id: 'contract-generator', label: 'Contract Generator', category: 'business', tokenCost: 40, isNew: true, isPro: true },
    // { id: 'nda-generator', label: 'NDA Generator', category: 'business', tokenCost: 30, isNew: true, isPro: true },
    // { id: 'sop-generator', label: 'SOP Generator', category: 'business', tokenCost: 25, isNew: true },
    { id: 'job-description', label: 'Job Description', category: 'business', tokenCost: 20, isNew: true },
    // { id: 'performance-review', label: 'Performance Review', category: 'business', tokenCost: 25, isNew: true },
    // { id: 'okr-generator', label: 'OKR Generator', category: 'business', tokenCost: 20, isNew: true },
    // { id: 'smart-goals', label: 'SMART Goals', category: 'business', tokenCost: 15, isNew: true },
    { id: 'finance', label: 'Finance Helper', category: 'business', tokenCost: 20 },

    // ========== DEVELOPMENT ==========
    { id: 'bug-fix', label: 'Bug Fix Assistant', category: 'development', tokenCost: 20, isNew: true },
    { id: 'code-reviewer', label: 'Code Reviewer', category: 'development', tokenCost: 25, isNew: true },
    // { id: 'code-explainer', label: 'Code Explainer', category: 'development', tokenCost: 15, isNew: true },
    { id: 'api-docs', label: 'API Documentation', category: 'development', tokenCost: 30, isNew: true },
    { id: 'readme-generator', label: 'README Generator', category: 'development', tokenCost: 20, isNew: true },
    // { id: 'changelog-generator', label: 'Changelog Generator', category: 'development', tokenCost: 15, isNew: true },
    // { id: 'commit-message', label: 'Commit Message Generator', category: 'development', tokenCost: 5, isNew: true },
    { id: 'regex-generator', label: 'Regex Generator', category: 'development', tokenCost: 10, isNew: true },
    { id: 'sql', label: 'SQL Query Builder', category: 'development', tokenCost: 15 },
    // { id: 'database-schema', label: 'Database Schema', category: 'development', tokenCost: 25, isNew: true },
    { id: 'unit-test', label: 'Unit Test Generator', category: 'development', tokenCost: 20, isNew: true },
    { id: 'ocr', label: 'OCR Tool', category: 'development', tokenCost: 15 },

    // ========== EDUCATION ==========
    { id: 'quiz', label: 'Quiz Generator', category: 'education', tokenCost: 20 },
    { id: 'lesson-plan', label: 'Lesson Plan', category: 'education', tokenCost: 25, isNew: true },
    { id: 'study-guide', label: 'Study Guide', category: 'education', tokenCost: 20, isNew: true },
    { id: 'flashcard-generator', label: 'Flashcard Generator', category: 'education', tokenCost: 15, isNew: true },
    // { id: 'essay-outline', label: 'Essay Outline', category: 'education', tokenCost: 15, isNew: true },
    // { id: 'research-outline', label: 'Research Paper Outline', category: 'education', tokenCost: 20, isNew: true },
    { id: 'math-solver', label: 'Math Problem Solver', category: 'education', tokenCost: 15, isNew: true },
    // { id: 'science-explainer', label: 'Science Explainer', category: 'education', tokenCost: 15, isNew: true },
    // { id: 'history-summarizer', label: 'History Summarizer', category: 'education', tokenCost: 15, isNew: true },
    // { id: 'language-helper', label: 'Language Learning Helper', category: 'education', tokenCost: 10, isNew: true },
    { id: 'interview', label: 'Interview Prep', category: 'education', tokenCost: 20 },

    // ========== CREATIVE ==========
    { id: 'story-ideas', label: 'Story Idea Generator', category: 'creative', tokenCost: 15, isNew: true },
    { id: 'character-creator', label: 'Character Creator', category: 'creative', tokenCost: 20, isNew: true },
    // { id: 'plot-twist', label: 'Plot Twist Generator', category: 'creative', tokenCost: 15, isNew: true },
    // { id: 'dialogue-writer', label: 'Dialogue Writer', category: 'creative', tokenCost: 15, isNew: true },
    // { id: 'world-building', label: 'World Building Helper', category: 'creative', tokenCost: 25, isNew: true },
    { id: 'song-lyrics', label: 'Song Lyrics Generator', category: 'creative', tokenCost: 20, isNew: true },
    { id: 'joke-generator', label: 'Joke Generator', category: 'creative', tokenCost: 10, isNew: true },
    // { id: 'quote-generator', label: 'Quote Generator', category: 'creative', tokenCost: 10, isNew: true },
    { id: 'name-generator', label: 'Name Generator', category: 'creative', tokenCost: 5, isNew: true },
    // { id: 'brand-name', label: 'Brand Name Generator', category: 'creative', tokenCost: 15, isNew: true },
    { id: 'recipe', label: 'Recipe Generator', category: 'creative', tokenCost: 15 },

    // ========== LEGAL ==========
    { id: 'privacy-policy', label: 'Privacy Policy', category: 'legal', tokenCost: 30, isNew: true, isPro: true },
    { id: 'terms-of-service', label: 'Terms of Service', category: 'legal', tokenCost: 30, isNew: true, isPro: true },
    // { id: 'cookie-policy', label: 'Cookie Policy', category: 'legal', tokenCost: 20, isNew: true },
    // { id: 'gdpr-checker', label: 'GDPR Compliance', category: 'legal', tokenCost: 25, isNew: true, isPro: true },
    // { id: 'legal-summarizer', label: 'Legal Summarizer', category: 'legal', tokenCost: 20, isNew: true },
    // { id: 'contract-clause', label: 'Contract Clause', category: 'legal', tokenCost: 25, isNew: true, isPro: true },
    { id: 'disclaimer-generator', label: 'Disclaimer Generator', category: 'legal', tokenCost: 15, isNew: true },
    { id: 'refund-policy', label: 'Refund Policy', category: 'legal', tokenCost: 15, isNew: true },

    // ========== SEO ==========
    { id: 'meta-description', label: 'Meta Description', category: 'seo', tokenCost: 10, isNew: true },
    // { id: 'title-tag', label: 'Title Tag Generator', category: 'seo', tokenCost: 10, isNew: true },
    { id: 'keyword-research', label: 'Keyword Research', category: 'seo', tokenCost: 20, isNew: true },
    // { id: 'content-brief', label: 'Content Brief', category: 'seo', tokenCost: 25, isNew: true },
    // { id: 'alt-text', label: 'Alt Text Generator', category: 'seo', tokenCost: 5, isNew: true },
    { id: 'schema-markup', label: 'Schema Markup', category: 'seo', tokenCost: 20, isNew: true },
    { id: 'seo-audit', label: 'SEO Audit Checklist', category: 'seo', tokenCost: 30, isNew: true },
    // { id: 'backlink-outreach', label: 'Backlink Outreach', category: 'seo', tokenCost: 15, isNew: true },

    // ========== PERSONAL ==========
    { id: 'journal-prompt', label: 'Journal Prompts', category: 'personal', tokenCost: 10, isNew: true },
    // { id: 'gratitude-list', label: 'Gratitude List', category: 'personal', tokenCost: 5, isNew: true },
    // { id: 'affirmation-generator', label: 'Affirmations', category: 'personal', tokenCost: 5, isNew: true },
    { id: 'goal-setting', label: 'Goal Setting Helper', category: 'personal', tokenCost: 15, isNew: true },
    // { id: 'habit-tracker', label: 'Habit Tracker Ideas', category: 'personal', tokenCost: 10, isNew: true },
    // { id: 'dream-interpreter', label: 'Dream Interpreter', category: 'personal', tokenCost: 15, isNew: true },
    { id: 'motivation-booster', label: 'Motivation Booster', category: 'personal', tokenCost: 10, isNew: true },
    // { id: 'self-reflection', label: 'Self-Reflection', category: 'personal', tokenCost: 10, isNew: true },
    { id: 'sentiment', label: 'Sentiment Analysis', category: 'personal', tokenCost: 15 },
    { id: 'resume', label: 'Resume Builder', category: 'personal', tokenCost: 25 },

    // ========== AI AGENTS ==========
    { id: 'research-agent', label: 'Research Agent', category: 'agents', tokenCost: 100, isNew: true, isPro: true },
    { id: 'writing-agent', label: 'Writing Agent', category: 'agents', tokenCost: 75, isNew: true, isPro: true },
    { id: 'code-agent', label: 'Code Agent', category: 'agents', tokenCost: 100, isNew: true, isPro: true },
    // { id: 'data-agent', label: 'Data Agent', category: 'agents', tokenCost: 80, isNew: true, isPro: true },
    // { id: 'sales-agent', label: 'Sales Agent', category: 'agents', tokenCost: 75, isNew: true, isPro: true },
    { id: 'ai-support-agent', label: 'Support Agent', category: 'agents', tokenCost: 60, isNew: true, isPro: true },
    { id: 'marketing-agent', label: 'Marketing Agent', category: 'agents', tokenCost: 80, isNew: true, isPro: true },
    // { id: 'hr-agent', label: 'HR Agent', category: 'agents', tokenCost: 70, isNew: true, isPro: true },
    // { id: 'legal-agent', label: 'Legal Agent', category: 'agents', tokenCost: 90, isNew: true, isPro: true },
    // { id: 'social-agent', label: 'Social Media Agent', category: 'agents', tokenCost: 70, isNew: true, isPro: true },
];

// Helper functions
export function getFeaturesByCategory(category: string): FeatureItem[] {
    return AVAILABLE_FEATURES.filter(f => f.category === category);
}

export function getFeatureById(id: string): FeatureItem | undefined {
    return AVAILABLE_FEATURES.find(f => f.id === id);
}

export function getNewFeatures(): FeatureItem[] {
    return AVAILABLE_FEATURES.filter(f => f.isNew);
}

export function getProFeatures(): FeatureItem[] {
    return AVAILABLE_FEATURES.filter(f => f.isPro);
}

export function getTotalFeatureCount(): number {
    return AVAILABLE_FEATURES.length;
}

export type FeatureId = typeof AVAILABLE_FEATURES[number]['id'];
