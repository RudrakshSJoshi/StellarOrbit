import asyncio
import re
from functioniser_agent import functoniser_agent
from validate_request import determine_agent
from hello_world_agent import hello_world_agent
from storage_agent import storage_agent
from cross_contract_agent import cross_contract_agent
from atomic_swap_agent import atomic_swap_agent
import json

async def query_handler(request_type: str, user_code: str, context: str):
    context = context + "\n\n The output should be compatible with Soroban SDK and Rust.\n If required, use only the Soroban SDK and ensure the contract is memory-efficient.\n"
    final_query = ""

    if request_type == "copilot":
        matches = list(re.finditer(r"######", user_code))
        
        if len(matches) < 2:
            print("Error: Less than two sets of ###### found in user_code.")
            return None
        elif len(matches) > 2:
            print("Error: More than two sets of ###### found in user_code.")
            return None
        else:
            start = matches[0].end()
            end = matches[1].start()
            
            copilot_message = f"\nCopilot Code Requested\nUser Request: {context}\n"
            processed_code = (
                "Copilot Code Requested \n" + 
                user_code[:start] + 
                copilot_message + 
                user_code[end:]
            )
            final_query = processed_code
    elif request_type in ["generation", "assistance"]:
        final_query = context + "\nThe following code is provided for context and may include relevant functions or data structures from the Soroban SDK. While it shouldn't directly influence your output, feel free to reference it if it helps explain or enhance the response.\n\n" + user_code
    elif request_type == "debugging":
        final_query = "Received Compilation or Runtime Error as follows, please fix the code:\n" + context + "\n\nHere's my code with the error:\n" + user_code
    
    determined_data = await determine_agent(final_query)
    determined_agent = determined_data.expected_field
    response = ""
    
    if determined_agent == "general":
        response = await hello_world_agent(final_query)
    elif determined_agent == "storage":
        response = await storage_agent(final_query)
    elif determined_agent == "cross_contract":
        response = await cross_contract_agent(final_query)
    elif determined_agent == "atomic_swap":
        response = await atomic_swap_agent(final_query)
    
    return {
        "agent_response": response
    }

async def functioniser(contract_code):
    return await functoniser_agent(contract_code)
