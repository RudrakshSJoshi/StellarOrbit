from typing import Literal
import json
from pydantic import BaseModel
from groq import Groq, AsyncGroq
import os

# Initialize Groq client
groq = AsyncGroq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

# Data model for LLM to generate
class Response(BaseModel):
    expected_field: Literal["general", "storage", "cross_contract", "atomic_swap"]
    reason: str

async def determine_agent(user_query: str) -> Response:
    """
    Determines which agent should handle the user's query based on detailed differentiation criteria.
    Returns a JSON response indicating the appropriate agent.
    """
    # Define the differentiation criteria in the user message
    user_message = (
        "Your task is to assign an agent based on the query provided by the user.\n"
        "Determine which agent should handle the following query based on these rules:\n"
        "1. **General Agent (general)**:\n"
        "   - Use this agent for queries related to strings, greetings, or general-purpose tasks.\n"
        "   - Examples:\n"
        "     - 'Write a smart contract that returns \"Hello, World!\"'\n"
        "     - 'Generate a simple greeting message'\n"
        "     - 'Explain how to use strings in Soroban'\n"
        "   - Keywords: 'hello', 'string', 'greeting', 'general', 'example'\n"
        "2. **Storage Agent (storage)**:\n"
        "   - Use this agent for queries related to storing or retrieving data.\n"
        "   - Examples:\n"
        "     - 'Write a smart contract that stores user details'\n"
        "     - 'How do I retrieve data from persistent storage?'\n"
        "     - 'Create a contract that saves and fetches data'\n"
        "   - Keywords: 'store', 'retrieve', 'storage', 'data', 'persist', 'save', 'fetch'\n"
        "3. **Cross-Contract Agent (cross_contract)**:\n"
        "   - Use this agent for queries related to cross-contract interactions.\n"
        "   - Examples:\n"
        "     - 'Write a contract that calls another contract'\n"
        "     - 'How do I interact with another contract in Soroban?'\n"
        "     - 'Create a contract that uses another contract's function'\n"
        "   - Keywords: 'cross contract', 'call contract', 'contract interaction', 'interact with contract'\n"
        "4. **Atomic Swap Agent (atomic_swap)**:\n"
        "   - Use this agent for queries related to atomic swaps between tokens.\n"
        "   - Examples:\n"
        "     - 'Write a contract for atomic swaps between two tokens'\n"
        "     - 'How do I implement an atomic swap in Soroban?'\n"
        "     - 'Create a contract that swaps tokens atomically'\n"
        "   - Keywords: 'atomic swap', 'token swap', 'swap tokens', 'atomic exchange'\n"
        "If the query does not match any of the above criteria, default to 'general'.\n\n"
        "The query provided by the user will be based off of these categories only:"
        "1. Debugging.\n"
        "2. Code Generation.\n"
        "3. Code or Function Explanation.\n"
        "4. Copilot assistance.\n"
        "These categories should not influence your decision for the agent, but to understand the variety of queries the user can ask.\n\n"
        "The response must be a JSON object with the following schema:\n"
        f"{json.dumps(Response.model_json_schema(), indent=2)}\n\n"
        "Expected_field determines the agent to route to, and reason provides context for choosing so.\n"
        "Reason should be justified and clearly explain why the agent was chosen.\n"
        f"Determine which agent should handle the following query: {user_query}"
    )

    # Call the Groq API with JSON response mode
    chat_completion = await groq.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": user_message,
            }
        ],
        model="deepseek-r1-distill-llama-70b",
        temperature=0.5,  # Set temperature to 0 for deterministic responses
        stream=False,  # Streaming is not supported in JSON mode
        response_format={"type": "json_object"},  # Enable JSON mode
        reasoning_format="hidden"
    )

    # Parse the JSON response into the Response model
    return Response.model_validate_json(chat_completion.choices[0].message.content)

# def main():
#     """
#     Main function to handle user input and interact with the Groq API.
#     """
#     # Ask for user input
#     # user_query = input("Enter your query: ")
#     user_query = """Write a smart contract that calls another contract to perform an addition operation.
# The contract should store the target contract ID in its storage and retrieve it when needed.
# """

#     # Determine which agent should handle the query
#     response = determine_agent(user_query)
#     print(response.expected_field)
#     print(response.reason)

# if __name__ == "__main__":
#     main()