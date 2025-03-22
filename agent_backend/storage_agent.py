from groq import Groq
import os

# Initialize Groq client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def generate_prompt(user_query):
    """
    Generates a prompt for the Groq model based on the user's query.
    Includes a sample code reference, Rust data structures, functions, and examples.
    """
    sample_code = """
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
    """

    # Additional Rust data structures and functions
    rust_examples = """
    ### Key Rust Data Structures and Functions in Soroban SDK:

    1. **Storage Management**:
       - `env.storage().persistent()`: Access persistent storage.
       - `env.storage().temporary()`: Access temporary storage.
       - `env.storage().instance()`: Access instance storage, which is specific to the contract instance.
       - `set(key, value)`: Store a value in storage.
       - `get(key)`: Retrieve a value from storage.
       - `has(key)`: Check if a key exists in storage.
       - `remove(key)`: Delete a key from storage.
       - `extend_ttl(min_ledgers_to_live, max_ledgers_to_live)`: Extend the time-to-live (TTL) of instance storage.

    2. **Data Types**:
       - `String`: A string type for smart contracts.
       - `BytesN`: A fixed-size byte array (e.g., for addresses).
       - `Vec`: A dynamic array.
       - `Map`: A key-value map.
       - `Symbol`: A type representing a symbol, used for keys in storage.
       - `symbol_short!("name")`: Create a short symbol for use as a key in storage.

    3. **Common Functions**:
       - `env.authenticated_address()`: Get the authenticated address of the caller.
       - `env.invoker()`: Get the address of the invoker.
       - `env.ledger().sequence()`: Get the current ledger sequence number.
       - `String::from_str(&env, "text")`: Create a `String` from a string literal.
       - `vec![&env, item1, item2]`: Create a vector with items.
       - `log!(&env, "message")`: Log a message to the contract's log output.

    4. **Error Handling**:
       - Use `unwrap_or` for graceful error handling instead of `expect`.
       - Example: `env.storage().get(&key).unwrap_or(default_value)`.
       - Example: `env.storage().instance().get(&key).unwrap_or(default_value)`.

    ### Example of Correct Instance Storage Usage:
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

    ### Example of Incorrect Instance Storage Usage (Avoid This):
    ```rust
    #![no_std]
    use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, log};

    const COUNTER: Symbol = symbol_short!("COUNTER");

    #[contract]
    pub struct IncrementContract;

    #[contractimpl]
    impl IncrementContract {
        pub fn increment(env: Env) -> u32 {
            // Incorrect: Recreating the counter in each function
            let mut count: u32 = 0;
            if let Some(value) = env.storage().instance().get(&COUNTER) {
                count = value;
            }

            // Increment the counter
            count += 1;

            // Store the updated counter value in instance storage
            env.storage().instance().set(&COUNTER, &count);

            // Return the updated counter value
            count
        }
    }
    ```
    """

    prompt = (
        "You are an expert in Rust and smart contract development using the Stellar blockchain and Soroban SDK. "
        "Your task is to assist the user in one of the following ways:\n"
        "1. If the user provides a code snippet, debug it and explain the issues.\n"
        "2. If the user requests a simple smart contract involving storage, generate the code and explain it.\n"
        "3. If the user asks about specific functions, macros, or code parts related to storage in smart contracts, provide detailed assistance.\n\n"
        "4. If the user provides a code snippet, and requests a copilot assistance through a prompt with debugging and explaining the issues.\n"
        "For reference, here is a sample smart contract code that uses instance storage to manage a counter:\n"
        f"```rust\n{sample_code}\n```\n\n"
        "Key points about the sample code:\n"
        "- `#![no_std]`: Indicates that the contract does not use the Rust standard library.\n"
        "- `use soroban_sdk::{...}`: Imports necessary components from the Soroban SDK.\n"
        "- `#[contract]`: Marks the `IncrementContract` struct as a smart contract.\n"
        "- `#[contractimpl]`: Marks the implementation block as containing the contract's methods.\n"
        "- `pub fn increment(env: Env) -> u32`: Defines a public function `increment` that increments a counter stored in instance storage.\n"
        "- `env.storage().instance()`: Accesses instance storage, which is specific to the contract instance.\n"
        "- `extend_ttl(50, 100)`: Extends the time-to-live (TTL) of the instance storage.\n\n"
        "Additional Guidelines for Better Responses:\n"
        "1. **Debugging**:\n"
        "   - Always explain why the error occurs, including technical details (e.g., incorrect storage usage).\n"
        "   - Provide a working solution and explain how it resolves the issue.\n"
        "2. **Code Generation**:\n"
        "   - Use `env.storage().instance()` for instance-specific storage.\n"
        "   - Ensure the code is memory-efficient and follows best practices for smart contracts.\n"
        "   - Include clear explanations of the generated code, including how it meets the user's requirements.\n"
        "3. **Assistance**:\n"
        "   - Provide detailed explanations of functions, macros, or concepts, including their purpose, usage, and interaction with the Stellar blockchain.\n"
        "   - Include examples and best practices (e.g., TTL management, logging).\n\n"
        "Here are some key Rust data structures, functions, and examples to guide your responses:\n"
        f"{rust_examples}\n\n"
        "For each case, follow this output format:\n"
        "- First, explain what the user is asking for (debugging, generating code, or assistance).\n"
        "- Then, cite the important points (e.g., what is wrong in debugging, what the generated code does, or what the property/function does).\n"
        "- Follow this with a Rust code block (if applicable) and close it.\n"
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
    user_query = """Copilot Code Requested

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
}"""

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