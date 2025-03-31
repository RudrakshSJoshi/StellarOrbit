#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol, String};

#[contract]
pub struct UserContract;

const NAME: Symbol = Symbol::short("name");
const AGE: Symbol = Symbol::short("age");

#[contractimpl]
impl UserContract {
    /// Stores the user's name and age
    pub fn store_user(env: Env, name: String, age: u32) {
        env.storage().instance().set(&NAME, &name);
        env.storage().instance().set(&AGE, &age);
    }

    /// Fetches the stored user's name and age
    pub fn fetch_user(env: Env) -> (String, u32) {
        let name: String = env.storage().instance().get(&NAME).unwrap_or(String::from_str(&env, "Unknown"));
        let age: u32 = env.storage().instance().get(&AGE).unwrap_or(0);
        (name, age)
    }
}
