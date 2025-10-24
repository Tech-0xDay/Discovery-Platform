import { z } from 'zod';

export const publishProjectSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z.string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  
  tagline: z.string()
    .max(200, 'Tagline must be less than 200 characters')
    .optional()
    .default(''),
  
  demoUrl: z.string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),
  
  githubUrl: z.string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),
  
  hackathonName: z.string()
    .max(200, 'Hackathon name must be less than 200 characters')
    .optional()
    .default(''),
  
  hackathonDate: z.string()
    .optional()
    .default(''),
  
  techStack: z.array(z.string()).optional().default([]),
});

export type PublishProjectInput = z.infer<typeof publishProjectSchema>;
