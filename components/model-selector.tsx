'use client'

import { Model } from '@/lib/types/models'
import { setCookie } from '@/lib/utils/cookies'
import { useEffect } from 'react'
import { createModelId } from '../lib/utils'

//! HARDCODED MODEL - Change the model configuration here if needed
const FIXED_MODEL: Model = {
  id: 'claude-3-sonnet-20240229',
  name: 'Claude 3.7 Sonnet',
  provider: 'Anthropic',
  providerId: 'anthropic',
  enabled: true,
  toolCallType: 'manual'
}

interface ModelSelectorProps {
  models: Model[]
}

export function ModelSelector({ models }: ModelSelectorProps) {
  useEffect(() => {
    // Always set the fixed model on component mount
    const modelId = createModelId(FIXED_MODEL)
    setCookie('selectedModel', JSON.stringify(FIXED_MODEL))
  }, [])

  // Return null to make the component invisible but still functional
  return null
}
