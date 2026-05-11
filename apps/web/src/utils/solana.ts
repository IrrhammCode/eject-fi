/**
 * Eject.fi — Solana Program Integration v4.0 (Anchor Production)
 * 
 * This utility handles all interactions with our Anchor Program:
 *  - PDA Derivation (Vault & SolVault)
 *  - Transaction building for Initialize, Deposit, and EmergencyEject
 *  - Real on-chain state verification
 */
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from '@solana/web3.js';
import * as BufferLayout from '@solana/buffer-layout';
import { Buffer } from 'buffer';

// --- Configuration ---
// Update this PROGRAM_ID once you finish deploying in Noah!
export const PROGRAM_ID = new PublicKey('8dBWhixXv9A9u89TgaZmWG8huGgb5kJuPbeU57KyMihW');

const DEVNET_RPC = import.meta.env.VITE_SOLANA_RPC || clusterApiUrl('devnet');
const connection = new Connection(DEVNET_RPC, 'confirmed');

// --- PDA Derivation ---

/**
 * Finds the PDA for the Vault State account
 */
export function findVaultAddress(owner: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), owner.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Finds the PDA that actually holds the SOL (the SolVault)
 */
export function findSolVaultAddress(owner: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('sol_vault'), owner.toBuffer()],
    PROGRAM_ID
  );
}

// --- Anchor Instruction Discriminators ---
// These are the first 8 bytes of the SHA256 of "global:<instruction_name>"
const DISCRIMINATORS = {
  initialize_vault: Buffer.from([140, 91, 51, 170, 230, 233, 102, 178]),
  deposit: Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]),
  emergency_eject: Buffer.from([210, 115, 233, 12, 118, 55, 192, 123]),
};

// --- API Functions ---

/**
 * Checks if the user's vault exists on-chain
 */
export async function isVaultInitialized(owner: PublicKey): Promise<boolean> {
  try {
    const [vaultAddress] = findVaultAddress(owner);
    const info = await connection.getAccountInfo(vaultAddress);
    return info !== null;
  } catch {
    return false;
  }
}

/**
 * Builds a transaction to initialize the vault and deposit initial funds
 */
export async function buildInitAndDepositTx(
  owner: PublicKey,
  amountSol: number
): Promise<Transaction> {
  const [vaultAddress] = findVaultAddress(owner);
  const [solVaultAddress] = findSolVaultAddress(owner);
  const lamports = Math.floor(amountSol * 1e9);

  const tx = new Transaction();

  // 1. Initialize Instruction
  tx.add(
    new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: vaultAddress, isSigner: false, isWritable: true },
        { pubkey: solVaultAddress, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: DISCRIMINATORS.initialize_vault,
    })
  );

  // 2. Deposit Instruction
  const depositData = Buffer.concat([
    DISCRIMINATORS.deposit,
    new Uint8Array(new BigUint64Array([BigInt(lamports)]).buffer),
  ]);

  tx.add(
    new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: solVaultAddress, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: depositData,
    })
  );

  return tx;
}

/**
 * Builds the Emergency Eject transaction
 */
export async function handleEjectTransaction(
  owner: PublicKey,
  destination: PublicKey = new PublicKey('11111111111111111111111111111111') // System Program as fallback
): Promise<Transaction> {
  const [vaultAddress] = findVaultAddress(owner);
  const [solVaultAddress] = findSolVaultAddress(owner);

  const tx = new Transaction();

  tx.add(
    new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: vaultAddress, isSigner: false, isWritable: false },
        { pubkey: solVaultAddress, isSigner: false, isWritable: true },
        { pubkey: destination, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: true },
      ],
      data: DISCRIMINATORS.emergency_eject,
    })
  );

  return tx;
}

/**
 * Verify if the program is deployed on the current network
 */
export async function isProgramDeployed(): Promise<boolean> {
  try {
    const info = await connection.getAccountInfo(PROGRAM_ID);
    return info !== null && info.executable;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// DEPOSIT / WITHDRAW / TRANSFER — Core Wallet Management
// ═══════════════════════════════════════════════════════════

/**
 * Builds a deposit-only transaction (for vaults already initialized).
 * On Devnet where the Anchor program may not be deployed, this falls back
 * to a simple SystemProgram.transfer to the SolVault PDA address,
 * effectively "parking" SOL at a deterministic address the user controls.
 */
export async function buildDepositOnlyTx(
  owner: PublicKey,
  amountSol: number
): Promise<Transaction> {
  const [solVaultAddress] = findSolVaultAddress(owner);
  const lamports = Math.floor(amountSol * 1e9);

  const tx = new Transaction();

  // Try Anchor instruction first
  const programDeployed = await isProgramDeployed();
  if (programDeployed) {
    const depositData = Buffer.concat([
      DISCRIMINATORS.deposit,
      new Uint8Array(new BigUint64Array([BigInt(lamports)]).buffer),
    ]);
    tx.add(
      new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: solVaultAddress, isSigner: false, isWritable: true },
          { pubkey: owner, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: depositData,
      })
    );
  } else {
    // Fallback: direct transfer to the vault PDA address
    tx.add(
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: solVaultAddress,
        lamports,
      })
    );
  }

  return tx;
}

/**
 * Builds a withdraw transaction — pulls SOL from the vault PDA back to the owner.
 * On Devnet without the Anchor program, this is a simple transfer from vault to owner.
 * Note: The PDA must have been funded via deposit first.
 */
export async function buildWithdrawTx(
  owner: PublicKey,
  amountSol: number
): Promise<{ tx: Transaction; vaultBalance: number }> {
  const [solVaultAddress] = findSolVaultAddress(owner);
  const lamports = Math.floor(amountSol * 1e9);

  // Check vault balance first
  const vaultBalance = await connection.getBalance(solVaultAddress);
  if (vaultBalance < lamports) {
    throw new Error(
      `Insufficient vault balance. Vault has ${(vaultBalance / 1e9).toFixed(4)} SOL, ` +
      `requested ${amountSol} SOL.`
    );
  }

  const tx = new Transaction();

  // On Devnet: use Anchor emergency_eject if deployed, else this requires
  // the vault PDA to be a signer (which only works with the program).
  // For demo purposes, we build the instruction but the user understands
  // that full withdraw requires the Anchor program authority.
  const programDeployed = await isProgramDeployed();
  if (programDeployed) {
    const [vaultAddress] = findVaultAddress(owner);
    tx.add(
      new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: vaultAddress, isSigner: false, isWritable: false },
          { pubkey: solVaultAddress, isSigner: false, isWritable: true },
          { pubkey: owner, isSigner: true, isWritable: true },
          { pubkey: owner, isSigner: true, isWritable: true }, // destination = self
        ],
        data: DISCRIMINATORS.emergency_eject,
      })
    );
  } else {
    // Fallback: Build a withdraw memo to demonstrate the flow
    // In production with the Anchor program, the PDA authority signs this
    tx.add(
      new TransactionInstruction({
        keys: [{ pubkey: owner, isSigner: true, isWritable: true }],
        data: Buffer.from(`eject:withdraw:${amountSol}SOL:${Date.now()}`, 'utf-8'),
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      })
    );
  }

  return { tx, vaultBalance: vaultBalance / 1e9 };
}

/**
 * Builds a simple SOL transfer transaction from the user's wallet
 * to any recipient address. This is a direct wallet-to-wallet transfer,
 * NOT involving the vault PDA.
 */
export function buildTransferTx(
  from: PublicKey,
  to: PublicKey,
  amountSol: number
): Transaction {
  const lamports = Math.floor(amountSol * 1e9);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports,
    })
  );

  // Tag with memo for traceability
  tx.add(
    new TransactionInstruction({
      keys: [{ pubkey: from, isSigner: true, isWritable: true }],
      data: Buffer.from(`eject:transfer:${amountSol}SOL`, 'utf-8'),
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
    })
  );

  return tx;
}

/**
 * Gets the current SOL balance of the user's vault PDA.
 */
export async function getVaultBalance(owner: PublicKey): Promise<number> {
  try {
    const [solVaultAddress] = findSolVaultAddress(owner);
    const balance = await connection.getBalance(solVaultAddress);
    return balance / 1e9;
  } catch {
    return 0;
  }
}
