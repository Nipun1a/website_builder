import type { Request, Response } from "express";
import { generateGeminiContent } from "../configs/gemini.js";
import prisma from "../lib/prisma.js";

const REVISION_COST = 5;

const getParam = (req: Request, key: string) => {
    const value = req.params[key];
    return Array.isArray(value) ? value[0] : value;
};

const cleanGeneratedCode = (code: string) => {
    return code.replace(/```[a-z]*\n?/gi, "").replace(/```$/g, "").trim();
};

export const makeRevision = async (req: Request, res: Response) => {
    const userId = req.userId;
    let creditsDeducted = false;

    try {
        const projectId = getParam(req, "projectId");
        const { message } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        if (!projectId) {
            return res.status(400).json({ message: "Project id is required" });
        }

        if (!message || typeof message !== "string" || message.trim() === "") {
            return res.status(400).json({ message: "Please enter a valid prompt" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.credits < REVISION_COST) {
            return res.status(403).json({ message: "Add more credits to make changes" });
        }

        const currentProject = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
            include: { versions: true }
        });

        if (!currentProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        await prisma.conversation.create({
            data: {
                role: "user",
                content: message,
                projectId
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: REVISION_COST } }
        });
        creditsDeducted = true;

        const enhancedPrompt = await generateGeminiContent(
            `You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

Enhance this by:
1. Being specific about what elements to change
2. Mentioning design details (colors, spacing, sizes)
3. Clarifying the desired outcome
4. Using clear technical terms

Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).`,
            `User request: "${message}"`
        ).catch(() => message);

        await prisma.conversation.create({
            data: {
                role: "assistant",
                content: `I've enhanced your prompt to: ${enhancedPrompt}`,
                projectId
            }
        });

        const generatedCode = await generateGeminiContent(
            `You are an expert web developer.

CRITICAL REQUIREMENTS:
- Return ONLY the complete updated HTML code with the requested changes.
- Use Tailwind CSS for ALL styling (NO custom CSS).
- Use Tailwind utility classes for all styling changes.
- Include all JavaScript in <script> tags before closing </body>.
- Make sure it's a complete, standalone HTML document with Tailwind CSS.
- Return the HTML code only, nothing else.

Apply the requested changes while maintaining the Tailwind CSS styling approach.`,
            `Here is the current website code: "${currentProject.current_code ?? ""}". The user wants this change: "${enhancedPrompt}"`
        );

        const version = await prisma.version.create({
            data: {
                code: generatedCode,
                description: "Revision",
                projectId: currentProject.id
            }
        });

        await prisma.websiteProject.update({
            where: { id: currentProject.id },
            data: {
                current_code: generatedCode,
                current_version_index: version.id
            }
        });

        await prisma.conversation.create({
            data: {
                role: "assistant",
                content: "I've made the changes to your website! You can now preview it.",
                projectId
            }
        });

        res.json({ message: "Revision created successfully", versionId: version.id });
    } catch (error: any) {
        if (userId && creditsDeducted) {
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: REVISION_COST } }
            }).catch(() => undefined);
        }

        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};

export const rollbackToVersion = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const projectId = getParam(req, "projectId");
        const versionId = getParam(req, "versionId");

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!projectId || !versionId) {
            return res.status(400).json({ message: "Project id and version id are required" });
        }

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
            include: { versions: true }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const version = project.versions.find((projectVersion) => projectVersion.id === versionId);

        if (!version) {
            return res.status(404).json({ message: "Version not found" });
        }

        await prisma.websiteProject.update({
            where: { id: project.id },
            data: {
                current_code: version.code,
                current_version_index: version.id
            }
        });

        await prisma.conversation.create({
            data: {
                role: "assistant",
                content: "I've rolled back your website to the selected version. You can now preview it.",
                projectId
            }
        });

        res.json({ message: "Version rolled back successfully" });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const projectId = getParam(req, "projectId");

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
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

        await prisma.websiteProject.delete({
            where: { id: project.id }
        });

        res.json({ message: "Project deleted successfully" });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};

export const getProjectPreview = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const projectId = getParam(req, "projectId");

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!projectId) {
            return res.status(400).json({ message: "Project id is required" });
        }

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
            include: { versions: true }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json({ code: project.current_code, project });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};

export const getPublishedProjects = async (_req: Request, res: Response) => {
    try {
        const projects = await prisma.websiteProject.findMany({
            where: { isPublished: true },
            include: { user: true }
        });

        res.json({ projects });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const projectId = getParam(req, "projectId");

        if (!projectId) {
            return res.status(400).json({ message: "Project id is required" });
        }

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, isPublished: true }
        });

        if (!project?.current_code) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json({ code: project.current_code });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};

export const savedProjectCode = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const projectId = getParam(req, "projectId");
        const { code } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!projectId) {
            return res.status(400).json({ message: "Project id is required" });
        }

        if (!code || typeof code !== "string") {
            return res.status(400).json({ message: "Code is required" });
        }

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        await prisma.websiteProject.update({
            where: { id: project.id },
            data: {
                current_code: code,
                current_version_index: ""
            }
        });

        res.json({ message: "Project saved successfully" });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};
