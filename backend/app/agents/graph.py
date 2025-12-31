from typing import Literal
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from app.agents.interceptors import UserContext
from app.agents.state import AgentState
from app.agents.nodes.supervisor_node import SupervisorNode
from app.agents.nodes.product_agent_node import ProductAgentNode
from app.agents.nodes.general_agent_node import GeneralAgentNode
from app.agents.nodes.order_agent_node import OrderAgentNode
from app.core.config import get_checkpointer


def route_after_supervisor(state: AgentState) -> Literal["product_agent", "order_agent", "general_agent", "END"]:
    """
    Route based on supervisor's decision

    Args:
        state: Current state

    Returns:
        Next node name
    """
    next_node = state.get("next_node", "general_agent")

    print(f"🔀 Routing after supervisor → {next_node}")

    return next_node


async def create_agent_graph():
    """
    Create agent graph with supervisor routing

    Flow:
        START → supervisor → product_agent → END
                          ↘ order_agent → END
                          ↘ general_agent → END
    """

    print("\n" + "="*80)
    print("🏗️  BUILDING AGENT GRAPH")
    print("="*80)

    # INITIALIZE NODES
    supervisor = SupervisorNode()
    product_agent = ProductAgentNode()
    order_agent = OrderAgentNode()
    general_agent = GeneralAgentNode()

    # CREATE GRAPH
    workflow = StateGraph(
        state_schema=AgentState,
        context_schema=UserContext
    )

    # Add nodes
    print("\n📍 Adding nodes...")
    workflow.add_node("supervisor", supervisor)
    workflow.add_node("product_agent", product_agent)
    workflow.add_node("order_agent", order_agent)
    workflow.add_node("general_agent", general_agent)
    print("   ✅ All nodes added")

    # CONFIGURE EDGES
    print("\n🔀 Configuring edges...")

    # Entry point
    workflow.set_entry_point("supervisor")

    # Supervisor → agents
    workflow.add_conditional_edges(
        "supervisor",
        route_after_supervisor,
        {
            "product_agent": "product_agent",
            "order_agent": "order_agent",
            "general_agent": "general_agent",
            "END": END
        }
    )

    workflow.add_edge("product_agent", END)
    workflow.add_edge("order_agent", END)
    workflow.add_edge("general_agent", END)

    print("   ✅ Edges configured")

    # COMPILE
    print("\n💾 Compiling graph with PostgreSQL checkpointer...")
    checkpointer = await get_checkpointer()
    app = workflow.compile(checkpointer=checkpointer)

    print("\n" + "="*80)
    print("✅ AGENT GRAPH READY")
    print("="*80)
    print("\nFlow:")
    print("  START → supervisor → product_agent → END")
    print("                     ↘ order_agent → END")
    print("                     ↘ general_agent → END")
    print("\nNodes:")
    print("  • Supervisor: Routes queries")
    print("  • Product Agent: Searches products (HTML cards)")
    print("  • Order Agent: Manages cart (natural text)")
    print("  • General Agent: Handles greetings")
    print("\nFeatures:")
    print("  ✅ Intelligent routing")
    print("  ✅ Dynamic tool discovery")
    print("  ✅ Secure auth token passing")
    print("  ✅ Conversation memory")
    print("  ⚡ Faster response (-5s)")
    print("="*80 + "\n")

    return app


# Global graph instance
agent_graph = None


async def get_agent_graph():
    """Get or create agent graph"""
    global agent_graph

    if agent_graph is None:
        agent_graph = await create_agent_graph()

    return agent_graph
