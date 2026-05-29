import {z} from 'zod';

const EnvSchema = z.object({
    PORT : z.string().default('5000'),
    ALLOWED_ORIGIN: z.string().default('http://localhost:5173'),

    OPENAI_API_KEY: z.string().optional(),
    GOOGLE_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),

    SEARCH_PROVIDER: z.string().default('tavily'),
    SEARCH_API_KEY: z.string(), 

    MODEL_PROVIDER: z.enum(['openai', 'gemini', 'groq']).default('openai'),
    OPENAI_MODEL: z.string().default('gpt-4o-mini'),
    GOOGLE_MODEL: z.string().default('gemini-2.0-flash-lite'),
    GROQ_MODEL: z.string().default('llama-3.1-8b-instant'),
    JWT_SECRET:z.string(),

    DATABASE:z.string(),
    PASSWORD:z.string(),
    CLIENT_ID :z.string(),
    CLIENT_SECRET :z.string(),
    FRONTEND_URL : z.string(),
    BACKEND_URL : z.string(),
    SESSION_SECRET:z.string(),
    NODE_ENV:z.string(),
});

export const env = EnvSchema.parse(process.env);
