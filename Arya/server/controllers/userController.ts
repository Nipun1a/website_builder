import type { Request, Response } from "express";
import openai from "../configs/openai.js";
import prisma from "../lib/prisma.js";

const PROJECT_CREATION_COST = 5;

const getRequestUserId = (req: Request) => {
    const paramsId = req.params.id;
    return req.userId ?? (Array.isArray(paramsId) ? paramsId[0] : paramsId);
};

const getParam = (req: Request, key: string) => {
    const value = req.params[key];
    return Array.isArray(value) ? value[0] : value;
};

const cleanGeneratedCode = (code: string) => {
    return code.replace(/```[a-z]*\n?/gi, "").replace(/```$/g, "").trim();
};

export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = getRequestUserId(req);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ credits: user.credits });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};

export const createUserProject = async (req: Request, res: Response) => {
    const userId = getRequestUserId(req);

    try {
        const { initial_prompt } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        if (!initial_prompt || typeof initial_prompt !== "string") {
            return res.status(400).json({ message: "Initial prompt is required" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.credits < PROJECT_CREATION_COST) {
            return res.status(403).json({ message: "Insufficient credits" });
        }

        const projectName = initial_prompt.length > 50
            ? `${initial_prompt.substring(0, 47)}...`
            : initial_prompt;

        const project = await prisma.websiteProject.create({
            data: {
                name: projectName,
                initial_prompt,
                userId,
                conversation: {
                    create: {
                        role: "user",
                        content: initial_prompt
                    }
                }
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: {
                totalCreation: { increment: 1 },
                credits: { decrement: PROJECT_CREATION_COST }
            }
        });

        const promptEnhanceResponse = await openai.chat.completions.create({
            model: "z-ai/glm-4.5-air",
            messages: [
                {
                    role: "system",
                    content: `You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.
Enhance this prompt by:
1. Adding specific design details (layout, color scheme, typography)
2. Specifying key sections and features
3. Describing the user experience and interactions
4. Including modern web design best practices
5. Mentioning responsive design requirements
6. Adding any missing but important elements
Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).`
                },
                {
                    role: "user",
                    content: initial_prompt
                }
            ]
        });

        const enhancedPrompt = promptEnhanceResponse.choices[0]?.message.content ?? initial_prompt;

        await prisma.conversation.createMany({
            data: [
                {
                    role: "assistant",
                    content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
                    projectId: project.id
                },
                {
                    role: "assistant",
                    content: "Now generating your website...",
                    projectId: project.id
                }
            ]
        });

        const codeGenerationResponse = await openai.chat.completions.create({
            model: "z-ai/glm-4.5-air",
            messages: [
                {
                    role: "system",
                    content: `You are an expert web developer. Create a complete, production-ready, single-page website based on this request: "${enhancedPrompt}"

CRITICAL REQUIREMENTS:
- You MUST output valid HTML ONLY.
- Use Tailwind CSS for ALL styling.
- Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
- Use Tailwind utility classes extensively for styling, animations, and responsiveness.
- Make it fully functional and interactive with JavaScript in a <script> tag before closing </body>.
- Use modern, beautiful design with great UX using Tailwind classes.
- Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:).
- Use placeholder images from https://placehold.co/600x400.
- Do NOT include markdown, explanations, notes, or code fences.

The HTML should be complete and ready to render as-is with Tailwind CSS.`
                },
                {
                    role: "user",
                    content: enhancedPrompt
                }
            ]
        });

        const generatedCode = cleanGeneratedCode(codeGenerationResponse.choices[0]?.message.content ?? "");

        const version = await prisma.version.create({
            data: {
                code: generatedCode,
                description: "Initial version",
                projectId: project.id
            }
        });

        await prisma.websiteProject.update({
            where: { id: project.id },
            data: {
                current_code: generatedCode,
                current_version_index: version.id
            }
        });

        await prisma.conversation.create({
            data: {
                role: "assistant",
                content: "I've created your website! You can now preview it and request changes.",
                projectId: project.id
            }
        });

        res.json({ projectId: project.id });
    } catch (error: any) {
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: PROJECT_CREATION_COST } }
            }).catch(() => undefined);
        }

        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};

export const getUserProject = async (req: Request, res: Response) => {
    try {
        const userId = getRequestUserId(req);
        const projectId = getParam(req, "projectId");

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        if (!projectId) {
            return res.status(400).json({ message: "Project id is required" });
        }

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
            include: {
                conversation: {
                    orderBy: { timestamp: "asc" }
                },
                versions: {
                    orderBy: { timestamp: "asc" }
                }
            }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json({ project });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};

export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = getRequestUserId(req);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const projects = await prisma.websiteProject.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" }
        });

        res.json({ projects });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};

export const toggleProjectPublish = async (req: Request, res: Response) => {
    try {
        const userId = getRequestUserId(req);
        const projectId = getParam(req, "projectId");

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        if (!projectId) {
            return res.status(400).json({ message: "Project id is required" });
        }

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const updatedProject = await prisma.websiteProject.update({
            where: { id: project.id },
            data: { isPublished: !project.isPublished }
        });

        res.json({
            isPublished: updatedProject.isPublished,
            message: updatedProject.isPublished
                ? "Project published successfully"
                : "Project unpublished successfully"
        });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};

export const purchaseCredits = async (_req: Request, res: Response) => {
    res.status(501).json({ message: "Purchase credits is not implemented yet" });
};
