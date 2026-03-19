'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react'

// Mock API keys
const mockApiKeys = [
  { id: '1', name: 'Production', prefix: 'sk_live_...3x7k', created: '2024-02-15', lastUsed: '2024-03-18' },
  { id: '2', name: 'Development', prefix: 'sk_test_...9a2m', created: '2024-03-01', lastUsed: '2024-03-17' },
]

export default function ApiKeysPage() {
  const [showNewKey, setShowNewKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl">API Keys</h2>
        <p className="text-cream/60 mt-1">Manage API keys for programmatic access to PathAI Studio</p>
      </div>

      {/* Warning */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-500">Security Notice</p>
            <p className="text-cream/60 mt-1">
              API keys provide full access to your account. Never share keys or commit them to version control.
              Keys are only shown once when created.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create new key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create New API Key</CardTitle>
          <CardDescription>
            Generate a new API key for accessing the PathAI Studio REST API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Key name (e.g., Production, Development)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1"
            />
            <Button className="bg-teal text-charcoal hover:bg-teal-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your API Keys</CardTitle>
          <CardDescription>
            {mockApiKeys.length} active keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockApiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 rounded-lg bg-charcoal-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
                    <Key className="w-5 h-5 text-teal" />
                  </div>
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-sm text-cream/40 font-mono">{key.prefix}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-cream/60">Created {key.created}</p>
                    <p className="text-cream/40">Last used {key.lastUsed}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(key.prefix)}>
                      {copied === key.prefix ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation link */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-medium">API Documentation</h3>
            <p className="text-sm text-cream/60 mt-1">
              Learn how to integrate PathAI Studio into your workflows
            </p>
          </div>
          <Button variant="outline">
            View Docs
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}