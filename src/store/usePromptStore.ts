import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/cn';

export interface PromptTemplate {
  id: string;
  toolId: string;          // e.g. 'metadata', 'image-to-prompt', 'content-writer'
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isDefault: boolean;
  isEnabled: boolean;
  updatedAt: string;
}

interface PromptStore {
  templates: PromptTemplate[];
  getTemplate: (toolId: string) => PromptTemplate | undefined;
  addTemplate: (t: Omit<PromptTemplate, 'id' | 'updatedAt'>) => void;
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => void;
  deleteTemplate: (id: string) => void;
  resetToDefault: (toolId: string) => void;
}

// ─── Default Prompt Templates ─────────────────────────────────────────────────

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'default-metadata',
    toolId: 'metadata',
    name: 'AI Metadata Generator',
    description: 'Generates SEO-optimized titles, descriptions and keywords with quality scoring for stock images',
    systemPrompt: `You are a professional stock photography metadata expert for Adobe Stock, Shutterstock, iStock, and Freepik.
Analyze the uploaded image carefully and generate high-quality commercial metadata with quality scoring.
CRITICAL KEYWORD RULE: In single-word mode, every keyword MUST be exactly ONE word with NO spaces. Never output "green forest" — output "green" and "forest" as two separate keywords.
SCORING SYSTEM: For each generated field, calculate a quality score 0–100 based on: SEO strength (25pts) + Commercial usability (25pts) + Uniqueness (20pts) + Clarity & readability (20pts) + Stock acceptance probability (10pts).
Always respond with ONLY valid JSON — no extra text, no markdown code blocks, no commentary.`,
    userPromptTemplate: `Target marketplace: {{marketplace}}

## RULES

TITLE:
- Must be a natural human-readable sentence
- Length must strictly follow {{TITLE_LENGTH}}
- Describe subject, action, and context clearly
- Must be SEO optimized for stock marketplaces

DESCRIPTION:
- Length must follow {{DESCRIPTION_LENGTH}}
- 1–2 sentences only
- Must describe real-world commercial usage
- Must be natural and professional

KEYWORDS:
- Generate exactly {{KEYWORD_COUNT}} keywords
- First 10 keywords MUST come from TITLE only
- Must follow {{KEYWORD_STYLE}} format
- No duplicates, no brands, no irrelevant words

SCORING (required for every field):
Assign integer scores 0–100 based on: SEO strength (25) + Commercial usability (25) + Uniqueness (20) + Clarity (20) + Stock acceptance (10)

SPECIAL RULES:
- PNG_MODE = {{PNG_MODE}} → If ON, add "Isolated on transparent background"
- WHITE_BACKGROUND_MODE = {{WHITE_BACKGROUND_MODE}} → If ON, add "Isolated on white background"

OUTPUT FORMAT — Return ONLY valid JSON:
{
  "title": "",
  "title_score": 0,
  "description": "",
  "description_score": 0,
  "keywords": [],
  "keywords_score": 0,
  "overall_score": 0,
  "category": "",
  "commercialIntent": ""
}`,
    isDefault: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-image-to-prompt',
    toolId: 'image-to-prompt',
    name: 'Image to Prompt Generator',
    description: 'Analyzes images and creates platform-specific AI art prompts',
    systemPrompt: `You are an expert AI prompt engineer specializing in creating highly effective prompts for AI image generation platforms.
Analyze images precisely and generate prompts that will recreate the image's style, composition, mood, and key elements.
Return ONLY the prompt text — no explanations, no labels, no preamble.`,
    userPromptTemplate: `You are an expert AI prompt engineer.

Analyze this image and convert it into a high-quality prompt optimized for {{platform}}.

## PLATFORM-SPECIFIC INSTRUCTIONS
{{platformInstructions}}

## RULES
- Must describe: subject, environment, lighting, mood, colors, composition
- Must be highly detailed and specific
- No hallucination — only describe what is visible in the image
- Aspect ratio to use: {{aspectRatio}}

## OUTPUT
Return the structured prompt only — no explanations, no labels.`,
    isDefault: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-content-writer',
    toolId: 'content-writer',
    name: 'AI Content Writer',
    description: 'Generates high-quality content for blogs, scripts, stories, recipes, and more',
    systemPrompt: `You are a professional content writer and creative storyteller with expertise across all content formats.
Write engaging, original, high-quality content that captivates readers and serves the intended purpose.
Match the requested tone, language, and style exactly. Output clean formatted text only.`,
    userPromptTemplate: `You are a professional content writer.

Generate high-quality content based on the following:

Topic: {{topic}}
Content Type: {{contentType}}
Length: approximately {{charCount}} characters
Tone: {{tone}}
Language: {{language}}

## RULES
- Must be structured and readable with proper headings where appropriate
- Must match the selected content type ({{contentType}})
- Must be SEO optimized with natural keyword usage
- Must have a human-like, engaging tone
- No repetition, no filler content
- Start immediately with the content — no meta-commentary
- Write entirely in {{language}}

OUTPUT:
Clean formatted text only`,
    isDefault: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-slogan',
    toolId: 'slogan-generator',
    name: 'AI Slogan Generator',
    description: 'Creates catchy slogans, taglines, and brand messages',
    systemPrompt: `You are a creative branding expert and marketing copywriter specializing in memorable slogans and taglines.
Create concise, impactful, and memorable brand messaging that resonates with target audiences.
Return results as a clean numbered list only — no explanations, no preamble.`,
    userPromptTemplate: `You are a creative branding expert.

Generate high-quality marketing slogans for the following:

Brand Name: {{topic}}
Industry: {{industry}}
Target Audience: {{audience}}
Style/Tone: {{tone}}
Slogan Length: {{outputType}}

## RULES
- Generate exactly {{count}} unique slogans
- Must be catchy, memorable, and professionally crafted
- Must match the brand identity and industry
- No duplicates, no generic phrases like "quality you can trust"
- Each slogan must feel distinctly different from the others
- Incorporate the brand name naturally when it fits

OUTPUT:
Numbered list format only:
1. [slogan]
2. [slogan]
...`,
    isDefault: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-social',
    toolId: 'social-content',
    name: 'Social Media Content Generator',
    description: 'Creates captions, hashtags, and post content for social platforms',
    systemPrompt: `You are a social media marketing expert who creates viral, engaging content for all major platforms.
Tailor your writing to platform-specific best practices and audience expectations.`,
    userPromptTemplate: `Create a {{platform}} post for the following:

Topic: {{topic}}
Brand Voice: {{tone}}
Include hashtags: {{includeHashtags}}
Emoji style: {{emojiStyle}}
Target audience: {{audience}}

Return: Caption text, hashtags (if requested), and a call-to-action.`,
    isDefault: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-color-palette',
    toolId: 'color-palette',
    name: 'AI Color Palette Generator',
    description: 'Generates 3 professional brand color palettes from a concept description',
    systemPrompt: `You are a world-class brand color strategist and visual identity designer with expertise in color theory, brand psychology, and digital design.
You understand how colors evoke emotion, communicate brand values, and perform across digital and print media.
Your palettes are always cohesive, accessible (sufficient contrast), and commercially viable.
Return ONLY valid JSON — no markdown, no explanations, no extra text.`,
    userPromptTemplate: `Generate exactly 3 distinct professional color palettes for the brand concept: "{{concept}}"

Return ONLY valid JSON:
{
  "palettes": [
    {
      "name": "Palette name (2-3 words)",
      "mood": "1-sentence brand mood description",
      "colors": {
        "primary": "#RRGGBB",
        "secondary": "#RRGGBB",
        "accent": "#RRGGBB",
        "background": "#RRGGBB",
        "text": "#RRGGBB"
      }
    }
  ]
}

Rules: Valid 6-digit hex only. Sufficient text/background contrast. Each palette must be distinctly different.`,
    isDefault: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-brand-voice',
    toolId: 'brand-voice',
    name: 'Brand Voice & Slogan Matcher',
    description: 'Creates brand voice, taglines, slogans, hooks, and positioning statements',
    systemPrompt: `You are a world-class brand strategist, copywriter, and marketing consultant who has built brand identities for Fortune 500 companies and successful startups.
You excel at crafting memorable brand voices, compelling taglines, and positioning statements that resonate deeply with target audiences.
Your output is always creative, specific to the brand, and commercially effective.
Return ONLY valid JSON — no markdown, no explanations, no extra text.`,
    userPromptTemplate: `Create a comprehensive brand voice package for:

Brand Name: {{brandName}}
Industry: {{industry}}
Personality: {{personality}}
Target Audience: {{audience}}
Tone: {{tone}}

Return ONLY valid JSON:
{
  "brandVoice": "2-sentence voice & personality description",
  "tagline": "Primary tagline (under 8 words)",
  "slogans": ["slogan 1", "slogan 2", "slogan 3", "slogan 4", "slogan 5"],
  "marketingHooks": ["hook 1", "hook 2", "hook 3"],
  "positioningStatement": "For [audience], [brand] is the [category] that [benefit] because [reason]."
}`,
    isDefault: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-font-pairing',
    toolId: 'font-pairing',
    name: 'AI Font Pairing Assistant',
    description: 'Generates 3 professional Google Font pairing sets for any main font',
    systemPrompt: `You are an expert typographer and UI/UX designer with deep knowledge of Google Fonts, type anatomy, readability principles, and design aesthetics.
You create font pairings that are visually harmonious, functionally excellent, and appropriate for the intended design context.
Your recommendations are always from the Google Fonts library and include practical usage guidance.
Return ONLY valid JSON — no markdown, no explanations, no extra text.`,
    userPromptTemplate: `Generate exactly 3 professional font pairing sets for the main font: "{{mainFont}}"

Return ONLY valid JSON:
{
  "sets": [
    {
      "heading": "{{mainFont}}",
      "subheading": "Google Font name",
      "body": "Google Font name",
      "style": "Design style (e.g., Modern Corporate)",
      "explanation": "1-2 sentences on why these work together and best use cases",
      "score": 90
    }
  ]
}

Rules: Google Fonts only. Each set must have a different design personality. Score 0-100 for harmony.`,
    isDefault: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-ad-copywriter',
    toolId: 'ad-copywriter',
    name: 'Social Media Ad Copywriter',
    description: 'Generates high-converting ad copy variations for all major platforms',
    systemPrompt: `You are a direct-response marketing expert and conversion copywriter with a track record of creating high-ROAS ad campaigns across Facebook, Instagram, TikTok, LinkedIn, Pinterest, and Google Ads.
You understand platform-specific nuances, attention patterns, and buyer psychology deeply.
Every word you write is intentional — designed to stop the scroll, create desire, and drive action.
Return ONLY valid JSON — no markdown, no explanations, no extra text.`,
    userPromptTemplate: `Write 3 high-converting {{platform}} ad copy variations for:

Product: {{productName}}
Offer: {{offer}}
Target Audience: {{audience}}
Platform: {{platform}} (headline max {{charLimit}} chars)
Tone: {{tone}}

Return ONLY valid JSON:
{
  "variations": [
    {
      "headline": "Under {{charLimit}} characters",
      "primaryText": "2-3 compelling sentences",
      "callToAction": "2-4 word action CTA",
      "promoMessage": "1 promotional sentence",
      "discountText": "Discount/offer text or empty string"
    }
  ]
}

Each variation must take a completely different angle. Match {{tone}} tone throughout.`,
    isDefault: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-sales-script',
    toolId: 'sales-script',
    name: 'Shorts & Reels Script Writer',
    description: 'Creates viral short-form video sales scripts for TikTok, Reels, and YouTube Shorts',
    systemPrompt: `You are a viral short-form video content strategist and sales script writer who has created scripts with millions of views across TikTok, Instagram Reels, and YouTube Shorts.
You understand the Hook-Problem-Solution-CTA framework deeply, and you write with the energy and authenticity that resonates on each specific platform.
Your scripts are conversational, punchy, and designed to sell without feeling salesy.
Return ONLY valid JSON — no markdown, no explanations, no extra text.`,
    userPromptTemplate: `Write a {{platform}} sales script for:

Product: {{productName}}
Description: {{description}}
Target Audience: {{audience}}
Video Length: {{videoLength}} seconds (~{{wordCount}} words)

Return ONLY valid JSON:
{
  "variations": [
    {
      "version": "{{platform}}",
      "viralHook": "Alternative ultra-viral hook line",
      "script": {
        "hook": "Scroll-stopping opening (1-2 sentences)",
        "problem": "Relatable problem statement (1-2 sentences)",
        "productIntro": "Natural product introduction (1-2 sentences)",
        "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
        "callToAction": "Urgent CTA (1 sentence)",
        "closingLine": "Memorable closer (1 short sentence)"
      }
    }
  ]
}`,
    isDefault: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
];

// ─── Store ─────────────────────────────────────────────────────────────────────

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      templates: DEFAULT_TEMPLATES,

      getTemplate: (toolId) =>
        get().templates.find(t => t.toolId === toolId && t.isEnabled),

      addTemplate: (t) =>
        set(s => ({
          templates: [
            ...s.templates,
            { ...t, id: generateId(), updatedAt: new Date().toISOString() },
          ],
        })),

      updateTemplate: (id, updates) =>
        set(s => ({
          templates: s.templates.map(t =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTemplate: (id) =>
        set(s => ({ templates: s.templates.filter(t => t.id !== id) })),

      resetToDefault: (toolId) =>
        set(s => {
          const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.toolId === toolId);
          if (!defaultTemplate) return s;
          return {
            templates: s.templates.map(t =>
              t.toolId === toolId
                ? { ...defaultTemplate, id: t.id, updatedAt: new Date().toISOString() }
                : t
            ),
          };
        }),
    }),
    {
      name: 'pixelmind-prompts',
      version: 5,
      migrate: () => ({ templates: DEFAULT_TEMPLATES }),
    }
  )
);

// ─── Prompt Builder Helpers ────────────────────────────────────────────────────

export function buildMetadataPrompt(
  template: PromptTemplate,
  opts: {
    marketplace: string;
    titleLength: number;
    descLength: number;
    keywordCount: number;
    keywordStyle: 'single' | 'double' | 'mixed';
    keywordPriority: boolean;
    pngBackground: boolean;
    whiteBackground: boolean;
  }
): string {
  const styleRules: Record<string, string> = {
    single: 'single-word ONLY — each keyword must be exactly ONE word with no spaces (e.g., business, meeting, office, teamwork, nature, forest). Split any phrase into individual words.',
    double: 'two-word phrases ONLY — each keyword must have exactly two words (e.g., business meeting, office environment, team collaboration).',
    mixed: 'mix of single words and two-word phrases naturally.',
  };

  return template.userPromptTemplate
    .replace(/\{\{marketplace\}\}/g, opts.marketplace)
    .replace(/\{\{TITLE_LENGTH\}\}/g, `${opts.titleLength} characters maximum`)
    .replace(/\{\{DESCRIPTION_LENGTH\}\}/g, `${opts.descLength} characters maximum`)
    .replace(/\{\{KEYWORD_COUNT\}\}/g, String(opts.keywordCount))
    .replace(/\{\{KEYWORD_STYLE\}\}/g, styleRules[opts.keywordStyle])
    .replace(/\{\{PNG_MODE\}\}/g, opts.pngBackground ? 'ON' : 'OFF')
    .replace(/\{\{WHITE_BACKGROUND_MODE\}\}/g, opts.whiteBackground ? 'ON' : 'OFF');
}

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  midjourney: `Format: /imagine prompt: [detailed description], [style modifiers], [technical specs] --ar {{aspectRatio}}
Start with "/imagine prompt:" and end with "--ar {{aspectRatio}}"
Include: artistic style, lighting, camera angle, quality descriptors`,
  flux: `Format: Natural language description optimized for Flux model
Include: subject, lighting, color palette, style, mood, technical quality
Be highly detailed and specific. Include "photorealistic" or style descriptors.`,
  ideogram: `Format: Clear descriptive text, good for images with text elements
Include: subject description, style, colors, composition
Ideogram excels at typography — mention any text elements if visible`,
  firefly: `Format: Adobe Firefly optimized — professional photography style
Include: subject, lighting setup, color grading, camera specs
Use terms like "studio lighting", "Adobe Stock style", "commercial photography"`,
  dalle: `Format: Clear, descriptive natural language for DALL-E 3
Include: detailed subject description, artistic style, mood, lighting
Be explicit and detailed. Mention aspect ratio preference.`,
  sd: `Format: Stable Diffusion tags — comma-separated keywords and descriptors
Include: quality tags (masterpiece, best quality, 8k), subject, style, artist references
Format: "masterpiece, best quality, [subject], [style], [technical], --ar {{aspectRatio}}"`,
};

export function buildImageToPromptPrompt(
  template: PromptTemplate,
  opts: { platform: string; aspectRatio: string }
): string {
  const instructions = (PLATFORM_INSTRUCTIONS[opts.platform] || PLATFORM_INSTRUCTIONS.dalle)
    .replace(/\{\{aspectRatio\}\}/g, opts.aspectRatio);

  return template.userPromptTemplate
    .replace(/\{\{platform\}\}/g, opts.platform.toUpperCase())
    .replace(/\{\{platformInstructions\}\}/g, instructions)
    .replace(/\{\{aspectRatio\}\}/g, opts.aspectRatio);
}

export function buildContentPrompt(
  template: PromptTemplate,
  opts: {
    contentType: string;
    topic: string;
    tone: string;
    language: string;
    charCount: number;
  }
): string {
  return template.userPromptTemplate
    .replace(/\{\{contentType\}\}/g, opts.contentType)
    .replace(/\{\{topic\}\}/g, opts.topic)
    .replace(/\{\{tone\}\}/g, opts.tone)
    .replace(/\{\{language\}\}/g, opts.language)
    .replace(/\{\{charCount\}\}/g, String(opts.charCount));
}
