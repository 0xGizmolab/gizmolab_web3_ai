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
        //* Add the fixed string to the last message (user's input)
        lastMessage.content = `Make sure to answer these questions in the context of Web3 Development and Blockchain Technology. Prioritize Solidity for EVM and use Rust if Solana is mentioned. ${lastMessage.content}`
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
