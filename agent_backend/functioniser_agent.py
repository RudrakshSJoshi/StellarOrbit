from groq import Groq, AsyncGroq
import os
import json

# Initialize Groq client
client = AsyncGroq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

class FunctionMetadata:
    def __init__(self, name: str, parameters: list, returns: str):
        self.name = name
        self.parameters = parameters
        self.returns = returns

    def to_dict(self):
        return {
            "name": self.name,
            "parameters": [param.__dict__ for param in self.parameters],
            "returns": self.returns
        }

class Parameter:
    def __init__(self, name: str, type: str):
        self.name = name
        self.type = type

async def generate_prompt(user_query: str) -> str:
    """
    Generates a comprehensive prompt for the Groq model with:
    - Sample contract code
    - Function metadata format specification
    - Detailed instructions
    """
    sample_contract = """
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

    function_format_example = {
        "functions": [
            {
                "name": "swap",
                "parameters": [
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

    prompt = f"""
    You are an expert Rust/Soroban smart contract developer. Your task is to:
    1. Analyze provided contract code
    2. Extract all public contract functions
    3. Return their metadata in this exact JSON format:
    {json.dumps(function_format_example, indent=4)}

    Rules:
    - Only include functions marked with `#[contractimpl]`
    - Only include public (pub) functions
    - Skip internal/private functions
    - For parameters, use their exact Rust types
    - For return types, use "void" if returning ()
    - Maintain the exact output structure

    Sample Contract for Reference:
    ```rust
    {sample_contract}
    ```

    Current Analysis Task:
    {user_query}

    Provide your response in the specified JSON format, containing only the functions array.
    """

    return prompt

async def analyze_contract(user_query: str) -> dict:
    """
    Main function to:
    1. Generate the analysis prompt
    2. Call Groq API
    3. Return structured function metadata
    """
    prompt = await generate_prompt(user_query)

    try:
        response = await client.chat.completions.create(
            model="deepseek-r1-distill-llama-70b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,  # Lower temp for precise formatting
            response_format={"type": "json_object"},
            max_tokens=2048
        )

        # Parse and validate the response
        result = json.loads(response.choices[0].message.content)
        if not isinstance(result, dict) or "functions" not in result:
            raise ValueError("Invalid response format")

        return result

    except Exception as e:
        return {"error": str(e)}

# Example usage:
async def functoniser_agent(contract_code):

    analysis = await analyze_contract(contract_code)
    print(json.dumps(analysis, indent=2))

    return analysis