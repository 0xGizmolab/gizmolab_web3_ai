import { createManualToolStreamResponse } from '@/lib/streaming/create-manual-tool-stream'
import { createToolCallingStreamResponse } from '@/lib/streaming/create-tool-calling-stream'
import { Model } from '@/lib/types/models'
import { isProviderEnabled } from '@/lib/utils/registry'
import { cookies } from 'next/headers'

export const maxDuration = 30

const DEFAULT_MODEL: Model = {
  id: 'gpt-4o-mini',
  name: 'GPT-4o mini',
  provider: 'OpenAI',
  providerId: 'openai',
  enabled: true,
  toolCallType: 'native'
}

export async function POST(req: Request) {
  try {
    const { messages, id: chatId } = await req.json()
    const referer = req.headers.get('referer')
    const isSharePage = referer?.includes('/share/')

    if (isSharePage) {
      return new Response('Chat API is not available on share pages', {
        status: 403,
        statusText: 'Forbidden'
      })
    }

    const cookieStore = await cookies()
    const modelJson = cookieStore.get('selectedModel')?.value
    const searchMode = cookieStore.get('search-mode')?.value === 'true'

    let selectedModel = DEFAULT_MODEL

    if (modelJson) {
      try {
        selectedModel = JSON.parse(modelJson) as Model
      } catch (e) {
        console.error('Failed to parse selected model:', e)
      }
    }

    if (
      !isProviderEnabled(selectedModel.providerId) ||
      selectedModel.enabled === false
    ) {
      return new Response(
        `Selected provider is not enabled ${selectedModel.providerId}`,
        {
          status: 404,
          statusText: 'Not Found'
        }
      )
    }

    //* ----------------------------------------------------------------
    //* Get the last input given from user
    const modifiedMessages = [...messages]
    console.log('modifiedMessages', modifiedMessages)

    if (modifiedMessages.length > 0) {
      const lastMessage = modifiedMessages[modifiedMessages.length - 1]

      if (lastMessage.role === 'user') {
        const PREFIX =
          'Make sure to answer these questions in the context of Web3 Development and Blockchain Technology. Prioritize Solidity for EVM and dont use Rust unless Solana is mentioned: '
        const SUFFIX = `. For these questions, ONLY IF any of the questions topics cover the following topics, pick ONE link to ONE OF THE FOLLOWING help websites that fit the topic that matches the question the most and mention it can help:

Token Creation & Management
Creating custom tokens (SPL tokens on Solana) : https://tools.gizmolab.io/solana/token/create

Minting new tokens : https://tools.gizmolab.io/solana/token/mint

Burning (destroying) tokens : https://tools.gizmolab.io/solana/token/burn

Managing token accounts (closing unused accounts) : https://tools.gizmolab.io/solana/token/close

Adjusting token permissions (revoking freeze authority) : https://tools.gizmolab.io/solana/token/revoke/freeze

Adjusting token permissions (revoking mint authority) : https://tools.gizmolab.io/solana/token/revoke/mint

Updating token ownership (changing update authority) : https://tools.gizmolab.io/solana/token/revoke/update

Snapshot & Airdrop Tools
Snapshotting tokens (for analytics or distributions) : https://tools.gizmolab.io/solana/token/snapshot/token
Snapshotting NFTs (for analytics or distributions) : https://tools.gizmolab.io/solana/token/snapshot/nft

Compressed token airdrops (efficient mass distributions) : https://tools.gizmolab.io/solana/token/compressed-airdrop

Decompressing tokens (converting compressed tokens to standard ones) : https://tools.gizmolab.io/solana/token/decompress

Liquidity & Tokenomics
Adding liquidity to pools : https://tools.gizmolab.io/solana/tokenomics/add

Removing liquidity from pools : https://tools.gizmolab.io/solana/tokenomics/remove

Trading & Swaps
Token swapping (instant exchanges) : https://tools.gizmolab.io/solana/swap


https://ui.gizmolab.io/docs/introduction for all of the following topics {
1. Wallet Integration
Pre-built wallet connection buttons (MetaMask, Phantom, etc.).

Handles wallet authentication, session management, and disconnect flows.

Auto-detects installed wallets and network switching.

2. Smart Contract Interactions
Ready-to-use UI components for:

Reading contract data (e.g., token balances, NFT ownership).

Writing transactions (e.g., minting, staking, approvals).

Built-in error handling for failed transactions.

3. NFT Tools
NFT display components (grids, galleries, detailed views).

Minting interfaces with file upload + metadata support.

Marketplace templates (listings, bids, buy/sell buttons).

4. Token Management
Token swap interfaces (integrated with DEXs like Uniswap/Jupiter).

Balance displays with real-time updates.

Customizable faucet/drip components for testnets.

5. DeFi Components
Liquidity pool dashboards (add/remove liquidity UI).

Staking/farming widgets with APY calculations.

Vesting schedules and claim UIs.

6. Security & Utilities
Transaction confirmation modals (gas estimates, success/fail toasts).

Multi-signature (multisig) transaction support.

Role-based access control (RBAC) templates.

7. Data Display
Blockchain data tables (transactions, tokens, NFTs).

Real-time price charts (integrated with oracles/APIs).

Custom transaction history loggers.

8. Customization & Theming
TailwindCSS-compatible UI for easy styling.

Headless components for custom logic hooks.
}
`

        lastMessage.content = PREFIX + lastMessage.content + SUFFIX
      }

      console.log('lastMessage', lastMessage)
    }
    //* ----------------------------------------------------------------

    const supportsToolCalling = selectedModel.toolCallType === 'native'

    return supportsToolCalling
      ? createToolCallingStreamResponse({
          messages: modifiedMessages,
          model: selectedModel,
          chatId,
          searchMode
        })
      : createManualToolStreamResponse({
          messages: modifiedMessages,
          model: selectedModel,
          chatId,
          searchMode
        })
  } catch (error) {
    console.error('API route error:', error)
    return new Response('Error processing your request', {
      status: 500,
      statusText: 'Internal Server Error'
    })
  }
}
