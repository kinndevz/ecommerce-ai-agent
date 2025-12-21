from typing import Literal
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from app.agents.interceptors import UserContext
from app.agents.state import AgentState
from app.agents.nodes.supervisor_node import SupervisorNode
from app.agents.nodes.product_agent_node import ProductAgentNode
from app.agents.nodes.quality_check_node import QualityCheckNode
from app.agents.nodes.general_agent_node import GeneralAgentNode
from app.agents.nodes.order_agent_node import OrderAgentNode


def route_after_supervisor(state: AgentState) -> Literal["product_agent", "order_agent", "general_agent", "quality_check", "END"]:
    """
    Route based on supervisor's decision

    Args:
        state: Current state

    Returns:
        Next node name
    """
    next_node = state.get("next_node", "END")

    print(f"🔀 Routing after supervisor → {next_node}")

    return next_node


def route_after_agent(state: AgentState) -> Literal["quality_check", "END"]:
    """
    Route after agent execution - always go to quality_check

    Args:
        state: Current state

    Returns:
        Next node name
    """
    next_node = state.get("next_node", "quality_check")

    print(f"🔀 Routing after agent → {next_node}")

    return next_node


def route_after_quality_check(state: AgentState) -> Literal["END"]:
    """
    Route after quality check - always END

    Args:
        state: Current state

    Returns:
        Always END
    """
    print(f"🔀 Routing after quality_check → END")

    return "END"


def create_agent_graph():
    """
    Create agent graph with supervisor routing

    Flow:
        START → supervisor → product_agent → quality_check → END
                           ↘ END (for greetings)
    """

    print("\n" + "="*80)
    print("🏗️  BUILDING AGENT GRAPH")
    print("="*80)

    # INITIALIZE NODES
    supervisor = SupervisorNode()
    product_agent = ProductAgentNode()
    order_agent = OrderAgentNode()
    general_agent = GeneralAgentNode()
    quality_check = QualityCheckNode()

    # CREATE GRAPH
    workflow = StateGraph(
        state_schema=AgentState,
        context_schema=UserContext)

    # Add nodes
    print("\n📍 Adding nodes...")
    workflow.add_node("supervisor", supervisor)
    workflow.add_node("product_agent", product_agent)
    workflow.add_node("order_agent", order_agent)
    workflow.add_node("general_agent", general_agent)
    workflow.add_node("quality_check", quality_check)
    print("   ✅ All nodes added")

    # CONFIGURE EDGES
    print("\n🔀 Configuring edges...")

    # Entry point
    workflow.set_entry_point("supervisor")

    # Supervisor → product_agent OR END
    workflow.add_conditional_edges(
        "supervisor",
        route_after_supervisor,
        {
            "product_agent": "product_agent",
            "order_agent": "order_agent",
            "general_agent": "general_agent",
            "quality_check": "quality_check",
            "END": END
        }
    )

    # Product Agent → quality_check
    workflow.add_conditional_edges(
        "product_agent",
        route_after_agent,
        {
            "quality_check": "quality_check",
            "END": END
        }
    )

    # Order Agent -> quality_check
    workflow.add_conditional_edges(
        "order_agent",
        route_after_agent,
        {
            "quality_check": "quality_check",
            "END": END
        }
    )

    workflow.add_edge("general_agent", END)

    # Quality Check → END
    workflow.add_conditional_edges(
        "quality_check",
        route_after_quality_check,
        {
            "END": END
        }
    )

    print("   ✅ Edges configured")

    # COMPILE
    print("\n💾 Compiling graph with memory...")
    checkpointer = InMemorySaver()
    app = workflow.compile(checkpointer=checkpointer)

    print("\n" + "="*80)
    print("✅ AGENT GRAPH READY")
    print("="*80)
    print("\nFlow:")
    print("  START → supervisor → product_agent → quality_check → END")
    print("                     ↘ END (greetings)")
    print("\nNodes:")
    print("  • Supervisor: Routes queries")
    print("  • Product Agent: Searches products")
    print("  • Quality Check: Formats responses")
    print("\nFeatures:")
    print("  ✅ Intelligent routing")
    print("  ✅ Dynamic tool discovery")
    print("  ✅ Secure auth token passing")
    print("  ✅ Natural response formatting")
    print("  ✅ Conversation memory")
    print("="*80 + "\n")

    return app


# Global graph instance
agent_graph = None


async def get_agent_graph():
    """Get or create agent graph"""
    global agent_graph

    if agent_graph is None:
        agent_graph = create_agent_graph()

    return agent_graph
