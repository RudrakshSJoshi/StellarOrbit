import asyncio
import re
from validate_request import determine_agent
from hello_world_agent import hello_world_agent
from storage_agent import storage_agent
from cross_contract_agent import cross_contract_agent
from atomic_swap_agent import atomic_swap_agent
from query_response_agent import query_response_agent
import json

async def query_handler(request_type: str, user_code: str, context: str):
    # print("Request Type:", request_type)
    # print("User Code:", user_code)
    # print("Context:", context)
    context = context + "\n\n The output should be compatible with Soroban SDK and Rust.\n If required, use only the Soroban SDK and ensure the contract is memory-efficient.\n"
    final_query = ""

    if request_type == "copilot":
        # Find all occurrences of the ###### markers
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
            
            # Construct the new code with copilot request formatting
            copilot_message = f"\nCopilot Code Requested\nUser Request: {context}\n"
            processed_code = (
                "Copilot Code Requested \n" + 
                user_code[:start] + 
                copilot_message + 
                user_code[end:]
            )
            final_query = processed_code
    elif request_type == "generation" or request_type == "assistance":
        final_query = context + "\nThe following code is provided for context and may include relevant functions or data structures from the Soroban SDK. While it shouldn't directly influence your output, feel free to reference it if it helps explain or enhance the response.\n\n" + user_code
    elif request_type == "debugging":
        final_query = "Received Compilation or Runtime Error as follows, please fix the code:\n" + context + "\n\nHere's my code with the error:\n" + user_code
    
    determined_data = await determine_agent(final_query)
    determined_agent = determined_data.expected_field
    determined_response = determined_data.reason

    # print(f"{determined_agent}\n\n{determined_response}")
    # expected_field: Literal["general", "storage", "cross_contract", "atomic_swap"]
    response = ""
    if determined_agent == "general":
        response = await hello_world_agent(final_query)
    elif determined_agent == "storage":
        response = await storage_agent(final_query)
    elif determined_agent == "cross_contract":
        response = await cross_contract_agent(final_query)
    elif determined_agent == "atomic_swap":
        response = await atomic_swap_agent(final_query)

    final_response = await query_response_agent(final_query, response)
    updation_required = final_response.code_updation_required

    updated_code = ""
    extra_code = ""

    if updation_required:
        if len(final_response.code_requested) == 0 or len(final_response.code_requested) > 2:
            return "Error: The number of code requests is either zero or exceeds the allowed limit of two."
        elif len(final_response.code_requested) == 1:
            updated_code = final_response.code_requested[0]
        else:
            # If there are exactly two items in the array
            updated_code = final_response.code_requested[0]
            extra_code = final_response.code_requested[1]

    if updated_code != "":
        print(updated_code)
    if extra_code != "":
        print(extra_code)

    return {
        "ide_update": updation_required,
        "agent_response": response,
        "code1": updated_code,
        "code2": extra_code
    }