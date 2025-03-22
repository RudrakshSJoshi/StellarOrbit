from groq import Groq
import os

# Initialize Groq client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def generate_prompt(user_query):
    """
    Generates a prompt for the Groq model based on the user's query.
    Includes sample code for atomic swaps, Rust data structures, functions, and examples.
    """
    sample_code_atomic_swap = """
    #![no_std]
    use soroban_sdk::{contract, contractimpl, Env, Address, token};

    #[contract]
    pub struct AtomicSwapContract;

    #[contractimpl]
    impl AtomicSwapContract {
        // Swap token A for token B atomically. Settle for the minimum requested price
        // for each party (this is an arbitrary choice to demonstrate the usage of
        // allowance; full amounts could be swapped as well).
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
            // Verify preconditions on the minimum price for both parties.
            if amount_b < min_b_for_a {
                panic!("not enough token B for token A");
            }
            if amount_a < min_a_for_b {
                panic!("not enough token A for token B");
            }

            // Require authorization for a subset of arguments specific to a party.
            a.require_auth_for_args(
                (token_a.clone(), token_b.clone(), amount_a, min_b_for_a).into_val(&env),
            );
            b.require_auth_for_args(
                (token_b.clone(), token_a.clone(), amount_b, min_a_for_b).into_val(&env),
            );

            // Perform the swap by moving tokens from a to b and from b to a.
            move_token(&env, &token_a, &a, &b, amount_a, min_a_for_b);
            move_token(&env, &token_b, &b, &a, amount_b, min_b_for_a);
        }
    }

    fn move_token(
        env: &Env,
        token: &Address,
        from: &Address,
        to: &Address,
        max_spend_amount: i128,
        transfer_amount: i128,
    ) {
        let token = token::Client::new(env, token);
        let contract_address = env.current_contract_address();

        // Transfer the maximum spend amount to the swap contract's address.
        token.transfer(from, &contract_address, &max_spend_amount);

        // Transfer the necessary amount to `to`.
        token.transfer(&contract_address, to, &transfer_amount);

        // Refund the remaining balance to `from`.
        token.transfer(
            &contract_address,
            from,
            &(&max_spend_amount - &transfer_amount),
        );
    }
    """

    # Additional Rust data structures and functions for atomic swaps
    rust_examples = """
    ### Key Rust Data Structures and Functions for Atomic Swaps:

    1. **Authorization**:
       - `require_auth_for_args`: Ensures that the specified arguments are authorized by the given address.
       - Example:
         ```rust
         a.require_auth_for_args(
             (token_a.clone(), token_b.clone(), amount_a, min_b_for_a).into_val(&env),
         );
         ```

    2. **Token Transfers**:
       - `token::Client::new(&env, token)`: Creates a client to interact with a token contract.
       - `token.transfer(from, to, amount)`: Transfers tokens from one address to another.
       - Example:
         ```rust
         let token = token::Client::new(&env, &token_a);
         token.transfer(&from, &to, &amount);
         ```

    3. **Error Handling**:
       - Use `panic!` for critical errors that should halt execution.
       - Example:
         ```rust
         if amount_b < min_b_for_a {
             panic!("not enough token B for token A");
         }
         ```

    4. **Atomic Swap Logic**:
       - Verify preconditions (e.g., minimum price) before performing the swap.
       - Use `move_token` to handle token transfers and refunds.

    ### Example of Correct Atomic Swap Usage:
    ```rust
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
            // Verify preconditions on the minimum price for both parties.
            if amount_b < min_b_for_a {
                panic!("not enough token B for token A");
            }
            if amount_a < min_a_for_b {
                panic!("not enough token A for token B");
            }

            // Require authorization for a subset of arguments specific to a party.
            a.require_auth_for_args(
                (token_a.clone(), token_b.clone(), amount_a, min_b_for_a).into_val(&env),
            );
            b.require_auth_for_args(
                (token_b.clone(), token_a.clone(), amount_b, min_a_for_b).into_val(&env),
            );

            // Perform the swap by moving tokens from a to b and from b to a.
            move_token(&env, &token_a, &a, &b, amount_a, min_a_for_b);
            move_token(&env, &token_b, &b, &a, amount_b, min_b_for_a);
        }
    }

    fn move_token(
        env: &Env,
        token: &Address,
        from: &Address,
        to: &Address,
        max_spend_amount: i128,
        transfer_amount: i128,
    ) {
        let token = token::Client::new(env, token);
        let contract_address = env.current_contract_address();

        // Transfer the maximum spend amount to the swap contract's address.
        token.transfer(from, &contract_address, &max_spend_amount);

        // Transfer the necessary amount to `to`.
        token.transfer(&contract_address, to, &transfer_amount);

        // Refund the remaining balance to `from`.
        token.transfer(
            &contract_address,
            from,
            &(&max_spend_amount - &transfer_amount),
        );
    }
    ```

    ### Example of Incorrect Atomic Swap Usage (Avoid This):
    ```rust
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
            // Incorrect: No authorization or precondition checks
            move_token(&env, &token_a, &a, &b, amount_a, min_a_for_b);
            move_token(&env, &token_b, &b, &a, amount_b, min_b_for_a);
        }
    }
    ```
    """

    prompt = (
        "You are an expert in Rust and smart contract development using the Stellar blockchain and Soroban SDK. "
        "Your task is to assist the user in one of the following ways:\n"
        "1. If the user provides a code snippet, debug it and explain the issues.\n"
        "2. If the user requests a simple smart contract involving atomic swaps, generate the code and explain it.\n"
        "3. If the user asks about specific functions, macros, or code parts related to atomic swaps, provide detailed assistance.\n\n"
        "4. If the user provides a code snippet, and requests a copilot assistance through a prompt with debugging and explaining the issues.\n"
        "For reference, here is a sample smart contract code for atomic swaps:\n"
        f"```rust\n{sample_code_atomic_swap}\n```\n\n"
        "Key points about the sample code:\n"
        "- `#![no_std]`: Indicates that the contract does not use the Rust standard library.\n"
        "- `use soroban_sdk::{...}`: Imports necessary components from the Soroban SDK.\n"
        "- `#[contract]`: Marks the `AtomicSwapContract` struct as a smart contract.\n"
        "- `#[contractimpl]`: Marks the implementation block as containing the contract's methods.\n"
        "- `require_auth_for_args`: Ensures that the specified arguments are authorized by the given address.\n"
        "- `token::Client::new(&env, token)`: Creates a client to interact with a token contract.\n"
        "- `token.transfer(from, to, amount)`: Transfers tokens from one address to another.\n\n"
        "Additional Guidelines for Better Responses:\n"
        "1. **Debugging**:\n"
        "   - Always explain why the error occurs, including technical details (e.g., missing authorization).\n"
        "   - Provide a working solution and explain how it resolves the issue.\n"
        "2. **Code Generation**:\n"
        "   - Use `require_auth_for_args` for authorization.\n"
        "   - Use `token::Client` for token transfers.\n"
        "   - Include clear explanations of the generated code, including how it meets the user's requirements.\n"
        "3. **Assistance**:\n"
        "   - Provide detailed explanations of functions, macros, or concepts, including their purpose, usage, and interaction with the Stellar blockchain.\n"
        "   - Include examples and best practices (e.g., authorization, token transfers).\n\n"
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
    user_query = """Write a smart contract for atomic swaps between two tokens.
The contract should ensure that both parties authorize the swap and that the minimum price is respected. Write the code with minimal storage."""

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
        content = chunk.choices[0].delta.content
        if content:
            print(content, end="")

if __name__ == "__main__":
    main()