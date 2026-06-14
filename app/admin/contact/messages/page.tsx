
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Mail, Eye, Trash2, CheckCircle, Search, Reply } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/axios'
import { useToast } from '@/hooks/use-toast'

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [page, search])

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/admin/contact/messages?page=${page}&search=${search}`)
      setMessages(response.data.data.data)
      setTotalPages(response.data.data.last_page || 1)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteMessage = async (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await api.delete(`/admin/contact/messages/${id}`)
        toast({ title: 'Success', description: 'Message deleted' })
        fetchMessages()
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Unread</Badge>
      case 'read':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Read</Badge>
      case 'replied':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Replied</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground">Manage customer inquiries and support tickets</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or subject..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No messages found</h3>
              <p className="text-muted-foreground">No contact messages available</p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{message.subject}</CardTitle>
                      {getStatusBadge(message.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{message.first_name} {message.last_name}</span>
                      <span>•</span>
                      <span>{message.email}</span>
                      {message.phone && (
                        <>
                          <span>•</span>
                          <span>{message.phone}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{new Date(message.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/contact/messages/${message.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => deleteMessage(message.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {truncateText(message.message, 120)}
                </p>
                {message.status === 'unread' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
                    <div className="h-2 w-2 rounded-full bg-red-600" />
                    New message awaiting response
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="py-2 px-4">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}