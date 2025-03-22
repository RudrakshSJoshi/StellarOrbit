def multiline_to_single_line(multiline_str):
    # Replace actual newlines with the literal '\n'
    single_line_str = multiline_str.replace('\n', '\\n')
    return single_line_str

# Example usage
multiline_str = """
"
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
Copilot Assistance Called Here
######

        // Return the updated counter value
        count
    }
}
```
","""

single_line = multiline_to_single_line(multiline_str)
print(single_line)
