import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Workspace } from "../target/types/workspace";
import { expect } from "chai";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

// Token-2022 program ID
const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

describe("Eject.fi - Cross-Chain DeFi Protocol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.workspace as Program<Workspace>;

  // Keys
  const authority = Keypair.generate();
  const solver = Keypair.generate();
  const sentinel = Keypair.generate();
  const unauthorizedUser = Keypair.generate();
  const mint = Keypair.generate();
  const destinationOwner = Keypair.generate();

  // EVM address (20 bytes)
  const ownerEvmAddress = Array.from(Buffer.alloc(20).fill(0xab));

  // PDAs
  let configPDA: PublicKey;
  let vaultPDA: PublicKey;
  let vaultTokenATA: PublicKey;
  let destinationTokenATA: PublicKey;

  before(async () => {
    // Fund all accounts with 100 SOL
    const accounts = [authority, solver, sentinel, unauthorizedUser, destinationOwner];
    for (const kp of accounts) {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        100 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);
    }

    // Derive config PDA
    [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("config"), authority.publicKey.toBuffer()],
      program.programId
    );

    // Derive vault PDA
    [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), Buffer.from(ownerEvmAddress)],
      program.programId
    );

    // Create Token-2022 mint
    const lamports = await getMinimumBalanceForRentExemptMint(
      provider.connection
    );

    const createMintTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: solver.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports,
        space: MINT_SIZE,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint.publicKey,
        6,
        solver.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(createMintTx, [solver, mint]);

    // Derive ATAs for Token-2022
    vaultTokenATA = await getAssociatedTokenAddress(
      mint.publicKey,
      vaultPDA,
      true, // allowOwnerOffCurve for PDA
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    destinationTokenATA = await getAssociatedTokenAddress(
      mint.publicKey,
      destinationOwner.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create vault token ATA
    const createVaultAtaTx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        solver.publicKey,
        vaultTokenATA,
        vaultPDA,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(createVaultAtaTx, [solver]);

    // Create destination token ATA
    const createDestAtaTx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        solver.publicKey,
        destinationTokenATA,
        destinationOwner.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(createDestAtaTx, [solver]);

    // Mint tokens to vault token account
    const mintToTx = new Transaction().add(
      createMintToInstruction(
        mint.publicKey,
        vaultTokenATA,
        solver.publicKey,
        1_000_000_000, // 1000 tokens (6 decimals)
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(mintToTx, [solver]);
  });

  // ─── INITIAL TESTS (MUST ALL PASS) ───

  it("Initialize Config", async () => {
    await program.methods
      .initializeConfig(ownerEvmAddress, sentinel.publicKey)
      .accounts({
        config: configPDA,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const config = await program.account.config.fetch(configPDA);
    expect(config.isActive).to.be.true;
    expect(config.isPaused).to.be.false;
    expect(Number(config.version)).to.equal(1);
    expect(config.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    expect(config.sentinelAiAddress.toBase58()).to.equal(
      sentinel.publicKey.toBase58()
    );
    expect(Buffer.from(config.ownerEvmAddress)).to.deep.equal(
      Buffer.from(ownerEvmAddress)
    );
  });

  it("Initialize Vault - solver pays, PDA seeded by EVM address", async () => {
    await program.methods
      .initializeVault(ownerEvmAddress, sentinel.publicKey)
      .accounts({
        vault: vaultPDA,
        solver: solver.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([solver])
      .rpc();

    const vault = await program.account.vaultState.fetch(vaultPDA);
    expect(vault.isActive).to.be.true;
    expect(vault.sentinel.toBase58()).to.equal(sentinel.publicKey.toBase58());
    expect(Buffer.from(vault.ownerEvmAddress)).to.deep.equal(
      Buffer.from(ownerEvmAddress)
    );
    expect(Number(vault.totalExits)).to.equal(0);
    expect(Number(vault.createdAt)).to.be.greaterThan(0);
  });

  it("Emergency Exit - sentinel transfers tokens via Token-2022", async () => {
    const amount = new BN(500_000_000); // 500 tokens

    await program.methods
      .emergencyExit(amount, Buffer.from([]))
      .accounts({
        vault: vaultPDA,
        vaultToken: vaultTokenATA,
        destinationToken: destinationTokenATA,
        mint: mint.publicKey,
        sentinel: sentinel.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([sentinel])
      .rpc();

    // Verify destination received tokens
    const destAcct = await getAccount(
      provider.connection,
      destinationTokenATA,
      "processed",
      TOKEN_2022_PROGRAM_ID
    );
    expect(Number(destAcct.amount)).to.equal(500_000_000);

    // Verify vault token balance decreased
    const vaultAcct = await getAccount(
      provider.connection,
      vaultTokenATA,
      "processed",
      TOKEN_2022_PROGRAM_ID
    );
    expect(Number(vaultAcct.amount)).to.equal(500_000_000);

    // Verify exit counter incremented
    const vault = await program.account.vaultState.fetch(vaultPDA);
    expect(Number(vault.totalExits)).to.equal(1);
  });

  // ─── SECURITY TESTS ───

  it("Emergency Exit - FAILS for unauthorized signer (not sentinel)", async () => {
    try {
      await program.methods
        .emergencyExit(new BN(100_000_000), Buffer.from([]))
        .accounts({
          vault: vaultPDA,
          vaultToken: vaultTokenATA,
          destinationToken: destinationTokenATA,
          mint: mint.publicKey,
          sentinel: unauthorizedUser.publicKey,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .signers([unauthorizedUser])
        .rpc();
      expect.fail("Should have thrown unauthorized error");
    } catch (error: any) {
      expect(error.message).to.include("Unauthorized");
    }
  });

  it("Deactivate Vault - sentinel only", async () => {
    await program.methods
      .deactivateVault()
      .accounts({
        vault: vaultPDA,
        sentinel: sentinel.publicKey,
      })
      .signers([sentinel])
      .rpc();

    const vault = await program.account.vaultState.fetch(vaultPDA);
    expect(vault.isActive).to.be.false;
  });

  it("Emergency Exit - FAILS on deactivated vault", async () => {
    try {
      await program.methods
        .emergencyExit(new BN(100_000_000), Buffer.from([]))
        .accounts({
          vault: vaultPDA,
          vaultToken: vaultTokenATA,
          destinationToken: destinationTokenATA,
          mint: mint.publicKey,
          sentinel: sentinel.publicKey,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .signers([sentinel])
        .rpc();
      expect.fail("Should have thrown inactive error");
    } catch (error: any) {
      expect(error.message).to.include("inactive");
    }
  });

  it("Deactivate Vault - FAILS for unauthorized user", async () => {
    // Create a fresh vault for this test
    const evmAddr2 = Array.from(Buffer.alloc(20).fill(0xcd));
    const [vault2PDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), Buffer.from(evmAddr2)],
      program.programId
    );

    await program.methods
      .initializeVault(evmAddr2, sentinel.publicKey)
      .accounts({
        vault: vault2PDA,
        solver: solver.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([solver])
      .rpc();

    try {
      await program.methods
        .deactivateVault()
        .accounts({
          vault: vault2PDA,
          sentinel: unauthorizedUser.publicKey,
        })
        .signers([unauthorizedUser])
        .rpc();
      expect.fail("Should have thrown unauthorized error");
    } catch (error: any) {
      expect(error.message).to.include("Unauthorized");
    }
  });
});