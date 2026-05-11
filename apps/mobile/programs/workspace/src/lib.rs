use anchor_lang::prelude::*;
use anchor_spl::token_2022;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

declare_id!("fbbVdUW3wPHihqgUvyfEgcCqk78DEnyUqKq9s9iaNZK");

/// Staleness threshold for Pyth price feeds (30 seconds)
pub const PRICE_MAX_AGE_SECS: i64 = 30;

#[program]
pub mod workspace {
    use super::*;

    // owner_evm_address: [u8; 20], EVM address of vault owner (hex bytes), [0xAB, 0xCD, ...]
    // sentinel_ai_address: Pubkey, Sentinel AI authorized signer, 9PJ8I...3555
    // Token amounts: 1e9 format, Ex: 1000000000 = 1 SOL/TOKEN
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        owner_evm_address: [u8; 20],
        sentinel_ai_address: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.bump = ctx.bumps.config;
        config.authority = ctx.accounts.authority.key();
        config.is_active = true;
        config.is_paused = false;
        config.owner_evm_address = owner_evm_address;
        config.sentinel_ai_address = sentinel_ai_address;
        config.version = 1;
        Ok(())
    }

    /// Initializes a vault PDA seeded by the owner's EVM address.
    /// The payer (solver) is a third-party relayer — NOT the vault owner.
    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        owner_evm_address: [u8; 20],
        sentinel: Pubkey,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.bump = ctx.bumps.vault;
        vault.owner_evm_address = owner_evm_address;
        vault.sentinel = sentinel;
        vault.created_at = Clock::get()?.unix_timestamp;
        vault.is_active = true;
        vault.total_exits = 0;
        Ok(())
    }

    /// Emergency exit: transfers tokens from the vault token account to a
    /// destination, authorized ONLY by the sentinel AI address via has_one.
    /// Uses SPL Token-2022 transfer_checked for enhanced security.
    ///
    /// Includes a placeholder for Pyth SOL/USD price staleness verification.
    pub fn emergency_exit(
        ctx: Context<EmergencyExit>,
        amount: u64,
        _price_feed_data: Vec<u8>,
    ) -> Result<()> {
        let vault = &ctx.accounts.vault;
        require!(vault.is_active, ErrorCode::InactiveAccount);

        // ─── Pyth Price Oracle Placeholder ───────────────────────────
        // In production, integrate pyth-solana-receiver-sdk:
        //
        //   use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;
        //
        //   let price_update = &ctx.accounts.price_update;  // Account<'info, PriceUpdateV2>
        //   let sol_usd_feed_id: [u8; 32] = get_feed_id_from_hex(
        //       "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"
        //   )?;
        //   let price = price_update.get_price_no_older_than(
        //       &Clock::get()?,
        //       PRICE_MAX_AGE_SECS as u64,  // 30 seconds max staleness
        //       &sol_usd_feed_id,
        //   )?;
        //   // Use price.price (i64) and price.exponent (i32) for valuation
        //   // Revert automatically if price is stale (>30s)
        // ─────────────────────────────────────────────────────────────

        let evm_addr = vault.owner_evm_address;
        let vault_bump_arr = [vault.bump];
        let seeds = &[b"vault" as &[u8], evm_addr.as_ref(), &vault_bump_arr];
        let signer_seeds: &[&[&[u8]]] = &[seeds];

        let decimals = ctx.accounts.mint.decimals;

        token_2022::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token_2022::TransferChecked {
                    from: ctx.accounts.vault_token.to_account_info(),
                    to: ctx.accounts.destination_token.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
            decimals,
        )?;

        let vault = &mut ctx.accounts.vault;
        vault.total_exits = vault
            .total_exits
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;

        emit!(EmergencyExitEvent {
            owner_evm_address: evm_addr,
            sentinel: ctx.accounts.sentinel.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Deactivates a vault — sentinel-only authorization.
    pub fn deactivate_vault(ctx: Context<DeactivateVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.is_active, ErrorCode::InactiveAccount);
        vault.is_active = false;
        Ok(())
    }

    /// x402 Agentic Payment: Allows an agent to pay for data/infra fees autonomously.
    /// In a real x402 flow, this would be a specialized transfer to a service provider.
    pub fn pay_x402(ctx: Context<PayX402>, amount: u64) -> Result<()> {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.agent_vault.to_account_info(),
                to: ctx.accounts.service_provider.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;
        
        msg!("x402 Agentic Payment Executed: {} lamports", amount);
        Ok(())
    }
}

// ──────────────────────────────── Accounts ────────────────────────────────

#[derive(Accounts)]
pub struct PayX402<'info> {
    #[account(mut)]
    pub agent_vault: Signer<'info>,
    #[account(mut)]
    pub service_provider: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        seeds = [b"config", authority.key().as_ref()],
        bump,
        payer = authority,
        space = 8 + Config::LEN,
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(owner_evm_address: [u8; 20])]
pub struct InitializeVault<'info> {
    #[account(
        init,
        seeds = [b"vault", owner_evm_address.as_ref()],
        bump,
        payer = solver,
        space = 8 + VaultState::LEN,
    )]
    pub vault: Account<'info, VaultState>,
    /// The third-party solver/relayer that pays for account creation.
    #[account(mut)]
    pub solver: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// ACCOUNTS: 1. vault, 2. vault_token, 3. destination_token, 4. mint,
///           5. sentinel, 6. token_program
/// TOTAL: 6 (✅ ≤8)
/// CPI: 1. transfer_checked (✅ ≤3)
#[derive(Accounts)]
pub struct EmergencyExit<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.owner_evm_address.as_ref()],
        bump = vault.bump,
        has_one = sentinel @ ErrorCode::Unauthorized,
    )]
    pub vault: Account<'info, VaultState>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = vault,
        token::token_program = token_program,
    )]
    pub vault_token: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = mint,
        token::token_program = token_program,
    )]
    pub destination_token: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mint::token_program = token_program,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    /// Sentinel AI address — the ONLY key authorized to trigger emergency exit.
    pub sentinel: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,

    // ── Pyth Oracle Placeholder ──
    // In production, add:
    //   pub price_update: Account<'info, PriceUpdateV2>,
}

#[derive(Accounts)]
pub struct DeactivateVault<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.owner_evm_address.as_ref()],
        bump = vault.bump,
        has_one = sentinel @ ErrorCode::Unauthorized,
    )]
    pub vault: Account<'info, VaultState>,
    pub sentinel: Signer<'info>,
}

// ──────────────────────────────── State ───────────────────────────────────

#[account]
pub struct Config {
    pub bump: u8,
    pub authority: Pubkey,
    pub is_active: bool,
    pub is_paused: bool,
    pub owner_evm_address: [u8; 20],
    pub sentinel_ai_address: Pubkey,
    pub version: u8,
}

impl Config {
    pub const LEN: usize = 1 + 32 + 1 + 1 + 20 + 32 + 1;
}

#[account]
pub struct VaultState {
    pub bump: u8,
    pub owner_evm_address: [u8; 20],
    pub sentinel: Pubkey,
    pub created_at: i64,
    pub is_active: bool,
    pub total_exits: u64,
}

impl VaultState {
    pub const LEN: usize = 1 + 20 + 32 + 8 + 1 + 8;
}

// ──────────────────────────────── Events ──────────────────────────────────

#[event]
pub struct EmergencyExitEvent {
    pub owner_evm_address: [u8; 20],
    pub sentinel: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

// ──���──────────────────────────── Errors ──────────────────────────────────

#[error_code]
pub enum ErrorCode {
    #[msg("Math overflow occurred")]
    MathOverflow,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Account is inactive")]
    InactiveAccount,
    #[msg("Price feed is stale (>30s)")]
    StalePriceFeed,
    #[msg("Invalid amount")]
    InvalidAmount,
}
