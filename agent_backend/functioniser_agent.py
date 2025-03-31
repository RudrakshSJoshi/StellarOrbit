from groq import Groq, AsyncGroq
import os
import json
from dotenv import load_dotenv
import asyncio

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client
client = AsyncGroq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

async def generate_prompt(contract_code: str) -> str:
    """
    Generates a comprehensive prompt for the Groq model with:
    - Example contracts and expected outputs
    - Function metadata format specification
    - Detailed instructions
    """
    # Example 1: Atomic Swap Contract
    sample_contract_1 = """
    #![no_std]
    use soroban_sdk::{contract, contractimpl, Env, Address, token};

    #[contract]
    pub struct AtomicSwapContract;

    #[contractimpl]
    impl AtomicSwapContract {
        pub fn swap(
            env: Env,
            a: Address,
            b: Address,
            token_a: Address,
            token_b: Address,
            amount_a: i128,
            min_b_for_a: i128,
            amount_b: i128,
            min_a_for_b: i128,
        ) {
            // Verification and authorization logic...
            // Token transfer logic...
        }
    }
    """

    sample_output_1 = {
        "functions": [
            {
                "name": "swap",
                "parameters": [
                    {"name": "env", "type": "Env"},
                    {"name": "a", "type": "Address"},
                    {"name": "b", "type": "Address"},
                    {"name": "token_a", "type": "Address"},
                    {"name": "token_b", "type": "Address"},
                    {"name": "amount_a", "type": "i128"},
                    {"name": "min_b_for_a", "type": "i128"},
                    {"name": "amount_b", "type": "i128"},
                    {"name": "min_a_for_b", "type": "i128"}
                ],
                "returns": "void"
            }
        ]
    }

    # Example 2: Increment Contract
    sample_contract_2 = """
    #![no_std]
    use soroban_sdk::{contract, contractimpl, log, symbol_short, Env, Symbol};
    const COUNTER: Symbol = symbol_short!("COUNTER");
    #[contract]
    pub struct IncrementContract;
    #[contractimpl]
    impl IncrementContract {
        /// Increment increments an internal counter, and returns the value.
        pub fn increment(env: Env) -> u32 {
            let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
            log!(&env, "count: {}", count);
            count += 1;
            env.storage().instance().set(&COUNTER, &count);
            env.storage().instance().extend_ttl(50, 100);
            count
        }
    }
    mod test;
    """

    sample_output_2 = {
        "functions": [
            {
                "name": "increment",
                "parameters": [],
                "returns": "u32"
            }
        ]
    }

    prompt = f"""
    You are an expert Rust/Soroban smart contract developer. Your task is to:
    1. Analyze provided contract code
    2. Extract all public contract functions
    3. Return their metadata in the exact JSON format as shown below

    Rules:
    - Only include functions marked with `#[contractimpl]`
    - Only include public (pub) functions
    - Skip internal/private functions
    - For parameters, use their exact Rust types
    - For return types, use "void" if returning ()
    - Maintain the exact output structure
    - Always include the 'env' parameter if it exists

    Example 1:
    Contract:
    ```rust
    {sample_contract_1}
    ```

    Correct output:
    {json.dumps(sample_output_1, indent=2)}

    Example 2:
    Contract:
    ```rust
    {sample_contract_2}
    ```

    Correct output:
    {json.dumps(sample_output_2, indent=2)}

    Contract code to analyze:
    ```rust
    {contract_code}
    ```

    Provide your response in the specified JSON format, containing only the functions array.
    """

    return prompt

async def analyze_contract(contract_code: str) -> dict:
    """
    Main function to:
    1. Generate the analysis prompt
    2. Call Groq API
    3. Return structured function metadata
    """
    prompt = await generate_prompt(contract_code)
    
    # Debug: print the contract code being analyzed (first 200 chars)
    print(f"Analyzing contract (preview): {contract_code[:200]}...")

    try:
        response = await client.chat.completions.create(
            model="deepseek-r1-distill-llama-70b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.05,  # Lower temp for precise formatting
            response_format={"type": "json_object"},
            max_tokens=2048
        )

        # Parse and validate the response
        result = json.loads(response.choices[0].message.content)
        if not isinstance(result, dict) or "functions" not in result:
            raise ValueError("Invalid response format")

        for function in result["functions"]:
            function["parameters"] = [
                param for param in function["parameters"] 
                if param.get("name") != "env"
            ]
        return result

    except Exception as e:
        return {"error": str(e)}

async def functionizer_agent(contract_code):
    """
    Main agent function that analyzes a Rust/Soroban contract and 
    returns structured function metadata.
    
    Args:
        contract_code (str): The Rust contract code to analyze
        
    Returns:
        dict: Dictionary containing functions metadata
    """
    analysis = await analyze_contract(contract_code)
    print(json.dumps(analysis, indent=2))
    return analysis

# Sample contracts for testing
atomic_swap_contract = """
#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address, token};

#[contract]
pub struct AtomicSwapContract;

#[contractimpl]
impl AtomicSwapContract {
    pub fn swap(
        env: Env,
        a: Address,
        b: Address,
        token_a: Address,
        token_b: Address,
        amount_a: i128,
        min_b_for_a: i128,
        amount_b: i128,
        min_a_for_b: i128,
    ) {
        // Verification and authorization logic...
        // Token transfer logic...
    }
}
"""

increment_contract = """
#![no_std]
use soroban_sdk::{contract, contractimpl, log, symbol_short, Env, Symbol};
const COUNTER: Symbol = symbol_short!("COUNTER");
#[contract]
pub struct IncrementContract;
#[contractimpl]
impl IncrementContract {
    /// Increment increments an internal counter, and returns the value.
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        log!(&env, "count: {}", count);
        count += 1;
        env.storage().instance().set(&COUNTER, &count);
        env.storage().instance().extend_ttl(50, 100);
        count
    }
}
mod test;
"""

# For testing/debugging purposes
async def run_test():
    print("=== Testing with atomic swap contract ===")
    await functionizer_agent(atomic_swap_contract)
    
    print("\n=== Testing with increment contract ===")
    await functionizer_agent(increment_contract)
    
    # Add any other contract examples you want to test
    # print("\n=== Testing with custom contract ===")
    # await functionizer_agent(custom_contract)

async def functoniser_agent(contract_code):

    analysis = await analyze_contract(contract_code)
    print(json.dumps(analysis, indent=2))

    return analysis