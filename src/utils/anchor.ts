import { PublicKey, Transaction, TransactionInstruction, Connection, clusterApiUrl } from '@solana/web3.js'
import { MEMO_PROGRAM_ID } from './memo'

export async function buildMemoTransaction(hash: string, payer: string) {
  const connection = new Connection(clusterApiUrl('devnet'))
  const tx = new Transaction()
  const instr = new TransactionInstruction({
    keys: [],
    programId: new PublicKey(MEMO_PROGRAM_ID),
    data: Buffer.from(hash),
  })
  tx.add(instr)

  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = new PublicKey(payer)
  return { tx, connection }
}
