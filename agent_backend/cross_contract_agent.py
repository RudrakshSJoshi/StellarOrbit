from groq import Groq
import os

# Initialize Groq client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def generate_prompt(user_query):
    """
    Generates a prompt for the Groq model based on the user's query.
    Includes sample code for cross-contract calls, Rust data structures, functions, and examples.
    """
    sample_code_contract_a = """
    #![no_std]
    use soroban_sdk::{contract, contractimpl, Env};

    #[contract]
    pub struct ContractA;

    #[contractimpl]
    impl ContractA {
        pub fn add(env: Env, x: u32, y: u32) -> u32 {
            x.checked_add(y).expect("no overflow")
        }
    }
    """

    sample_code_contract_b = """
    #![no_std]
    use soroban_sdk::{contract, contractimpl, Env, Address, symbol_short};

    mod contract_a {
        soroban_sdk::contractimport!(
            file = "../contract_a/target/wasm32-unknown-unknown/release/soroban_cross_contract_a_contract.wasm"
        );
    }

    #[contract]
    pub struct ContractB;

    #[contractimpl]
    impl ContractB {
        pub fn store_contract_id(env: Env, contract: Address) {
            // Store the target contract ID in instance storage
            env.storage().instance().set(&symbol_short!("CONTRACT_ID"), &contract);
        }

        pub fn add_with(env: Env, x: u32, y: u32) -> u32 {
            // Retrieve the target contract ID from instance storage
            let contract: Address = env.storage().instance().get(&symbol_short!("CONTRACT_ID")).unwrap();

            // Create a client to interact with Contract A
            let client = contract_a::Client::new(&env, &contract);

            // Call the add function on Contract A
            client.add(&x, &y)
        }
    }
    """

    # Additional Rust data structures and functions for cross-contract calls
    rust_examples = """
    ### Key Rust Data Structures and Functions for Cross-Contract Calls:

    1. **Contract Import**:
       - `contractimport!`: Imports the compiled WASM of another contract to enable cross-contract calls.
       - Example:
         ```rust
         mod contract_a {
             soroban_sdk::contractimport!(
                 file = "../contract_a/target/wasm32-unknown-unknown/release/soroban_cross_contract_a_contract.wasm"
             );
         }
         ```

    2. **Cross-Contract Client**:
       - `contract_a::Client::new(&env, &contract)`: Creates a client to interact with Contract A.
       - Example:
         ```rust
         let client = contract_a::Client::new(&env, &contract);
         client.add(&x, &y);
         ```

    3. **Address Type**:
       - `Address`: Represents the address of a contract or account.
       - Example:
         ```rust
         let contract: Address = env.storage().instance().get(&symbol_short!("CONTRACT_ID")).unwrap();
         ```

    4. **Storage of Contract IDs**:
       - Store contract IDs in instance or persistent storage for later retrieval.
       - Example:
         ```rust
         env.storage().instance().set(&symbol_short!("CONTRACT_ID"), &contract);
         let contract: Address = env.storage().instance().get(&symbol_short!("CONTRACT_ID")).unwrap();
         ```

    5. **Error Handling**:
       - Use `unwrap_or` for graceful error handling.
       - Example:
         ```rust
         let contract: Address = env.storage().instance().get(&symbol_short!("CONTRACT_ID")).unwrap_or(default_address);
         ```

    ### Example of Correct Cross-Contract Call Usage:
    ```rust
    #![no_std]
    use soroban_sdk::{contract, contractimpl, Env, Address};

    mod contract_a {
        soroban_sdk::contractimport!(
            file = "../contract_a/target/wasm32-unknown-unknown/release/soroban_cross_contract_a_contract.wasm"
        );
    }

    #[contract]
    pub struct ContractB;

    #[contractimpl]
    impl ContractB {
        pub fn add_with(env: Env, contract: Address, x: u32, y: u32) -> u32 {
            let client = contract_a::Client::new(&env, &contract);
            client.add(&x, &y)
        }
    }
    ```

    ### Example of Incorrect Cross-Contract Call Usage (Avoid This):
    ```rust
    #![no_std]
    use soroban_sdk::{contract, contractimpl, Env, Address};

    #[contract]
    pub struct ContractB;

    #[contractimpl]
    impl ContractB {
        pub fn add_with(env: Env, contract: Address, x: u32, y: u32) -> u32 {
            // Incorrect: No contract import or client creation
            x + y
        }
    }
    ```
    """

    prompt = (
        "You are an expert in Rust and smart contract development using the Stellar blockchain and Soroban SDK. "
        "Your task is to assist the user in one of the following ways:\n"
        "1. If the user provides a code snippet, debug it and explain the issues.\n"
        "2. If the user requests a simple smart contract involving cross-contract calls, generate the code and explain it.\n"
        "3. If the user asks about specific functions, macros, or code parts related to cross-contract calls, provide detailed assistance.\n\n"
        "4. If the user provides a code snippet, and requests a copilot assistance through a prompt with debugging and explaining the issues.\n"
        "For reference, here are sample smart contract codes for cross-contract calls:\n"
        "**Contract A (Target Contract)**:\n"
        f"```rust\n{sample_code_contract_a}\n```\n\n"
        "**Contract B (Caller Contract)**:\n"
        f"```rust\n{sample_code_contract_b}\n```\n\n"
        "Key points about the sample codes:\n"
        "- `#![no_std]`: Indicates that the contract does not use the Rust standard library.\n"
        "- `use soroban_sdk::{...}`: Imports necessary components from the Soroban SDK.\n"
        "- `#[contract]`: Marks the struct as a smart contract.\n"
        "- `#[contractimpl]`: Marks the implementation block as containing the contract's methods.\n"
        "- `contractimport!`: Imports the compiled WASM of another contract to enable cross-contract calls.\n"
        "- `contract_a::Client::new(&env, &contract)`: Creates a client to interact with Contract A.\n\n"
        "Additional Guidelines for Better Responses:\n"
        "1. **Debugging**:\n"
        "   - Always explain why the error occurs, including technical details (e.g., missing contract import).\n"
        "   - Provide a working solution and explain how it resolves the issue.\n"
        "2. **Code Generation**:\n"
        "   - Use `contractimport!` to import the target contract.\n"
        "   - Use `contract_a::Client::new(&env, &contract)` to create a client for cross-contract calls.\n"
        "   - Include clear explanations of the generated code, including how it meets the user's requirements.\n"
        "3. **Assistance**:\n"
        "   - Provide detailed explanations of functions, macros, or concepts, including their purpose, usage, and interaction with the Stellar blockchain.\n"
        "   - Include examples and best practices (e.g., storing contract IDs, error handling).\n\n"
        "Here are some key Rust data structures, functions, and examples to guide your responses:\n"
        f"{rust_examples}\n\n"
        "For each case, follow this output format:\n"
        "- First, explain what the user is asking for (debugging, generating code, or assistance).\n"
        "- Then, cite the important points (e.g., what is wrong in debugging, what the generated code does, or what the property/function does).\n"
        "- Follow this with Rust code blocks (if applicable) and close them.\n"
        "   - Use **Contract A** and **Contract B** tags to separate the codes if both are required.\n"
        "- Acknowledge and end the response.\n\n"
        f"User Query: {user_query}\n\n"
        "Provide your response below:"
    )
    return prompt

def main():
    """
    Main function to handle user input and interact with the Groq API.
    """
    # Ask for user input
    user_query = """Write a smart contract that calls another contract to perform an addition operation.
The contract should store the target contract ID in its storage and retrieve it when needed."""

    # Generate the prompt
    prompt = generate_prompt(user_query)

    # Call the Groq API
    stream = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.6,  # Optimal temperature for reasoning tasks
        max_completion_tokens=2048,  # Adjust based on complexity
        top_p=0.95,
        stream=True,  # Enable streaming for incremental output
        reasoning_format="hidden"
    )

    # Print the incremental deltas returned by the LLM.
    for chunk in stream:
        print(chunk.choices[0].delta.content, end="")

if __name__ == "__main__":
    main()