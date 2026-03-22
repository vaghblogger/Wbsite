import { getAgents, getAgentBySlug } from "../services/supabase";

export async function handleGetAgents(): Promise<Response> {
  try {
    const agents = await getAgents();
    return Response.json(agents);
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return Response.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}

export async function handleGetAgent(slug: string): Promise<Response> {
  try {
    const agent = await getAgentBySlug(slug);
    if (!agent) {
      return Response.json({ error: "Agent not found" }, { status: 404 });
    }
    return Response.json(agent);
  } catch (error) {
    console.error("Failed to fetch agent:", error);
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }
}
