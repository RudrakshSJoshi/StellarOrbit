from typing import List, Literal
import json
from pydantic import BaseModel
from groq import Groq, AsyncGroq

# Initialize Groq client
groq = AsyncGroq()

# Data model for the agent's response
class Response(BaseModel):
    code_updation_required: bool
    code_requested: List[str]

example_queries = """
### Example Queries for understanding
### Example Query 1:
#### user_query:
Copilot Code Requested
```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, log};

const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct IncrementContract;

#[contractimpl]
impl IncrementContract {
    pub fn increment(env: Env) -> u32 {
        // Retrieve the current counter value from instance storage
        let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        log!(&env, "count: {}", count);

######
Copilot Code Requested
User Request: Increment the counter, update the storage, and extend the TTL.
######

        // Return the updated counter value
        count
    }
}
```
#### agent_response:
```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, log};

const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct IncrementContract;

#[contractimpl]
impl IncrementContract {
    pub fn increment(env: Env) -> u32 {
        // Retrieve the current counter value from instance storage
        let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        log!(&env, "count: {}", count);

        // Increment the counter
        count += 1;

        // Store the updated counter value in instance storage
        env.storage().instance().set(&COUNTER, &count);

        // Extend the TTL of the instance storage
        env.storage().instance().extend_ttl(50, 100);

        // Return the updated counter value
        count
    }
}
```

### your response:
code_updation_required: True
code_requested: ["

        // Increment the counter
        count += 1;

        // Store the updated counter value in instance storage
        env.storage().instance().set(&COUNTER, &count);

        // Extend the TTL of the instance storage
        env.storage().instance().extend_ttl(50, 100);

"]
"""
async def extract_code_from_response(user_query: str, agent_response: str) -> Response:
    """
    Uses the LLM to determine if code is required and extracts the relevant code snippets.
    Returns a JSON response with the required fields.
    """
    # Define the prompt for the LLM
    prompt = (
        "You are a code extraction assistant. Your task is to analyze the user query and agent response to determine if code is required and extract the relevant code snippets.\n\n"
        "Here are the rules:\n"
        "1. If the user query involves debugging or copilot assistance, extract the code snippet that should be used to fix or complete the code. Make sure to maintain the formatting style of the original code, assume that the code snippet will be written from the leftmost position.\n"
        "2. If the user query involves code generation, extract the generated code snippet.\n"
        "3. If the user query involves explaining functions or concepts, no code is required.\n"
        "4. If the user query involves cross-contract calls, extract both Contract A and Contract B code snippets, with code of contract A first and then contract B.\n\n"
        "In case of debugging, copilot task, code generation and cross contracts, code generation is True.\n\n"
        "The response must be a JSON object with the following schema:\n"
        f"{json.dumps(Response.model_json_schema(), indent=2)}\n\n"
        "Refer to the below examples for clarity:\n"
        f"{example_queries}\n\n"
        "Now generate the response for the below query and response:\n"
        "Incorrect responses will lead to severe penalties.\n\n"
        "Here is the user query:\n"
        f"{user_query}\n\n"
        "Here is the agent response:\n"
        f"{agent_response}\n\n"
        "Provide your response below:"
    )

    # Call the Groq API with JSON response mode
    chat_completion = await groq.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="deepseek-r1-distill-llama-70b",
        temperature=0.5,  # Set temperature to 0.5 for balanced creativity and accuracy
        stream=False,  # Streaming is not supported in JSON mode
        response_format={"type": "json_object"},  # Enable JSON mode
        max_completion_tokens=8192,
    )

    # Parse the JSON response into the Response model
    return Response.model_validate_json(chat_completion.choices[0].message.content)

async def query_response_agent(user_query, agent_response):
    """
    Main function to test the agent.
    """
    # Extract the relevant code from the agent's response
    response = await extract_code_from_response(user_query, agent_response)
    return response
    # # Print the response
    # print(f"Code Updation Required: {response.code_updation_required}")
    # print(f"Code Requested: {response.code_requested}")




### Example Query 2:
#### user_query:
# Write a smart contract that calls another contract to perform an addition operation.
# The contract should store the target contract ID in its storage and retrieve it when needed.

# #### agent_response:
# I'll help you generate two smart contracts - one for the target contract that performs the addition (Contract A) and another for the caller contract that stores and retrieves the contract ID (Contract B).

# **Contract A (Target Contract)**:
# ```rust
# #![no_std]
# use soroban_sdk::{contract, contractimpl, Env};

# #[contract]
# pub struct ContractA;

# #[contractimpl]
# impl ContractA {
#     pub fn add(env: Env, x: u32, y: u32) -> u32 {
#         x.checked_add(y).expect("Addition overflow")
#     }
# }
# ```

# **Contract B (Caller Contract)**:
# ```rust
# #![no_std]
# use soroban_sdk::{contract, contractimpl, Env, Address, symbol_short};

# mod contract_a {
#     soroban_sdk::contractimport!(
#         file = "../contract_a/target/wasm32-unknown-unknown/release/soroban_cross_contract_a_contract.wasm"
#     );
# }

# #[contract]
# pub struct ContractB;

# #[contractimpl]
# impl ContractB {
#     pub fn store_contract_id(env: Env, contract: Address) {
#         env.storage().instance().set(&symbol_short!("CONTRACT_ID"), &contract);
#     }

#     pub fn add_with(env: Env, x: u32, y: u32) -> u32 {
#         let contract: Address = env.storage().instance().get(&symbol_short!("CONTRACT_ID")).unwrap();
#         let client = contract_a::Client::new(&env, &contract);
#         client.add(&x, &y)
#     }
# }
# ```

# #### your response:
# code_updation_required: True
# code_requested: ["

# #![no_std]
# use soroban_sdk::{contract, contractimpl, Env};

# #[contract]
# pub struct ContractA;

# #[contractimpl]
# impl ContractA {
#     pub fn add(env: Env, x: u32, y: u32) -> u32 {
#         x.checked_add(y).expect("Addition overflow")
#     }
# }

# ","

# #![no_std]
# use soroban_sdk::{contract, contractimpl, Env, Address, symbol_short};

# mod contract_a {
#     soroban_sdk::contractimport!(
#         file = "../contract_a/target/wasm32-unknown-unknown/release/soroban_cross_contract_a_contract.wasm"
#     );
# }

# #[contract]
# pub struct ContractB;

# #[contractimpl]
# impl ContractB {
#     pub fn store_contract_id(env: Env, contract: Address) {
#         env.storage().instance().set(&symbol_short!("CONTRACT_ID"), &contract);
#     }

#     pub fn add_with(env: Env, x: u32, y: u32) -> u32 {
#         let contract: Address = env.storage().instance().get(&symbol_short!("CONTRACT_ID")).unwrap();
#         let client = contract_a::Client::new(&env, &contract);
#         client.add(&x, &y)
#     }
# }

# "]
