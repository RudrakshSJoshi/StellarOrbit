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
    use soroban_sdk::{contract, contractimpl, vec, Env, String, Vec};

    #[contract]
    pub struct Contract;

    #[contractimpl]
    impl Contract {
        pub fn hello(env: Env, to: String) -> Vec<String> {
            vec![&env, String::from_str(&env, "Hello"), to]
        }
    }
    """

    # Additional Rust data structures and functions
    rust_examples = """
    ### Key Rust Data Structures and Functions in Soroban SDK:

    1. **Storage Management**:
       - `env.storage().persistent()`: Access persistent storage.
       - `env.storage().temporary()`: Access temporary storage.
       - `set(key, value)`: Store a value in storage.
       - `get(key)`: Retrieve a value from storage.
       - `has(key)`: Check if a key exists in storage.
       - `remove(key)`: Delete a key from storage.

    2. **Data Types**:
       - `String`: A string type for smart contracts.
       - `BytesN`: A fixed-size byte array (e.g., for addresses).
       - `Vec`: A dynamic array.
       - `Map`: A key-value map.

    3. **Common Functions**:
       - `env.authenticated_address()`: Get the authenticated address of the caller.
       - `env.invoker()`: Get the address of the invoker.
       - `env.ledger().sequence()`: Get the current ledger sequence number.
       - `String::from_str(&env, "text")`: Create a `String` from a string literal.
       - `vec![&env, item1, item2]`: Create a vector with items.

    4. **Error Handling**:
       - Use `unwrap_or` for graceful error handling instead of `expect`.
       - Example: `env.storage().get(&key).unwrap_or(default_value)`.

    ### Example of Correct Storage Usage:
    ```rust
    #![no_std]
    use soroban_sdk::{contract, contractimpl, Env, BytesN, String};

    #[contract]
    pub struct GreetingContract;

    #[contractimpl]
    impl GreetingContract {
        pub fn store_greeting(env: Env, user: BytesN, greeting: String) {
            // Store the greeting in persistent storage
            env.storage().persistent().set(&user, &greeting);
        }

        pub fn get_greeting(env: Env, user: BytesN) -> String {
            // Retrieve the greeting from persistent storage
            env.storage().persistent().get(&user).unwrap_or(String::from_str(&env, "Greeting not found"))
        }
    }
    ```

    ### Example of Incorrect Storage Usage (Avoid This):
    ```rust
    #![no_std]
    use soroban_sdk::{contract, contractimpl, Env, BytesN, String};

    #[contract]
    pub struct GreetingContract;

    #[contractimpl]
    impl GreetingContract {
        pub fn store_greeting(env: Env, user: BytesN, greeting: String) {
            // Incorrect: Recreating the map in each function
            let map = env.storage().get_map::<BytesN, String>("greetings");
            map.insert(&env, user, greeting).expect("Failed to store greeting");
        }

        pub fn get_greeting(env: Env, user: BytesN) -> Vec<String> {
            // Incorrect: Using Vec<String> unnecessarily
            let map = env.storage().get_map::<BytesN, String>("greetings");
            match map.get(&env, user) {
                Some(greeting) => vec![&env, greeting.cloned().expect("Failed to clone greeting")],
                None => vec![&env, String::from_str(&env, "Greeting not found")]
            }
        }
    }
    ```
    """

    prompt = (
        "You are an expert in Rust and smart contract development using the Stellar blockchain and Soroban SDK. "
        "Your task is to assist the user in one of the following ways:\n"
        "1. If the user provides a code snippet, debug it and explain the issues.\n"
        "2. If the user requests a simple smart contract involving strings, generate the code and explain it.\n"
        "3. If the user asks about specific functions, macros, or code parts related to strings in smart contracts, provide detailed assistance.\n\n"
        "For reference, here is a sample smart contract code that stores and returns a greeting message:\n"
        f"```rust\n{sample_code}\n```\n\n"
        "Key points about the sample code:\n"
        "- `#![no_std]`: Indicates that the contract does not use the Rust standard library.\n"
        "- `use soroban_sdk::{...}`: Imports necessary components from the Soroban SDK.\n"
        "- `#[contract]`: Marks the `Contract` struct as a smart contract.\n"
        "- `#[contractimpl]`: Marks the implementation block as containing the contract's methods.\n"
        "- `pub fn hello(env: Env, to: String) -> Vec<String>`: Defines a public function `hello` that takes the environment and a user input string, and returns a vector of strings.\n"
        "- `vec![&env, String::from_str(&env, \"Hello\"), to]`: Creates a vector containing the greeting message and the user input.\n\n"
        "Additional Guidelines for Better Responses:\n"
        "1. **Debugging**:\n"
        "   - Always explain why the error occurs, including technical details (e.g., memory allocation issues in `no_std` environments).\n"
        "   - Provide a working solution and explain how it resolves the issue.\n"
        "2. **Code Generation**:\n"
        "   - Use `Env::storage()` for persistent state management instead of recreating data structures like `Map` in each function.\n"
        "   - Ensure the code is memory-efficient and follows best practices for smart contracts.\n"
        "   - Include clear explanations of the generated code, including how it meets the user's requirements.\n"
        "3. **Assistance**:\n"
        "   - Provide detailed explanations of functions, macros, or concepts, including their purpose, usage, and interaction with the Stellar blockchain.\n"
        "   - Include examples and best practices (e.g., cost of storage operations, scoping of data).\n\n"
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
    user_query = """Write me a code to enter user details
Use the Soroban SDK and ensure the contract is memory-efficient."""

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