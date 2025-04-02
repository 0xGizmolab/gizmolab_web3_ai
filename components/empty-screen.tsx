import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'What is a Smart Contract?',
    message: 'What is a Smart Contract and how does it work on Ethereum?'
  },
  {
    heading: 'Solidity vs Rust for Web3',
    message:
      'Compare Solidity and Rust for blockchain development. When should I use each?'
  },
  {
    heading: 'Ethereum vs Solana',
    message:
      'What are the key differences between Ethereum and Solana for dApp development?'
  },
  {
    heading: 'How to implement ERC-20 token?',
    message:
      'How do I create and deploy an ERC-20 token on Ethereum using Solidity?'
  }
]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
