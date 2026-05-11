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

const DEVNET_RPC = process.env.EXPO_PUBLIC_SOLANA_RPC || clusterApiUrl('devnet');
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
