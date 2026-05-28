import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

const getRequestUserId = (req: Request) => {
    const paramsId = req.params.id;
    return req.userId ?? (Array.isArray(paramsId) ? paramsId[0] : paramsId);
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
    try {
        const userId = getRequestUserId(req);
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

        if (user.credits < 5) {
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
                credits: { decrement: 5 }
            }
        });

        res.json({ projectId: project.id });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
};
