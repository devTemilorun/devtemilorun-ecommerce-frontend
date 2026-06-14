
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Mail, Phone, Calendar, Reply, Send, CheckCircle, User, Clock, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/axios'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/auth-store'

export default function MessageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [message, setMessage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [replyMessage, setReplyMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchMessage()
  }, [params.id])

  const fetchMessage = async () => {
    try {
      const response = await api.get(`/admin/contact/messages/${params.id}`)
      setMessage(response.data.data)
    } catch (error) {
      console.error('Failed to fetch message:', error)
      toast({
        title: 'Error',
        description: 'Failed to load message',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async () => {
    try {
      await api.post(`/admin/contact/messages/${params.id}/read`)
      toast({ title: 'Success', description: 'Message marked as read' })
      fetchMessage()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark as read', variant: 'destructive' })
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a reply message',
        variant: 'destructive',
      })
      return
    }

    setIsSending(true)
    try {
      await api.post(`/admin/contact/messages/${params.id}/reply`, {
        reply_message: replyMessage
      })
      toast({
        title: 'Success',
        description: 'Reply sent successfully! The customer will receive an email notification.',
      })
      setReplyMessage('')
      fetchMessage()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!message) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Message not found</p>
        <Button className="mt-4" asChild>
          <Link href="/admin/contact/messages">Back to Messages</Link>
        </Button>
      </div>
    )
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/contact/messages">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Messages
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Message Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-2xl">{message.subject}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {getStatusBadge(message.status)}
                    {message.status === 'unread' && (
                      <Button size="sm" variant="outline" onClick={handleMarkAsRead}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Message</p>
                    <p className="whitespace-pre-wrap mt-2">{message.message}</p>
                  </div>
                </div>
              </div>

              {/* Show Admin Reply if exists */}
              {message.admin_reply && (
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Reply className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Your Reply</p>
                      <p className="whitespace-pre-wrap mt-2 text-green-800 dark:text-green-200">
                        {message.admin_reply}
                      </p>
                      {message.replied_at && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Sent on {new Date(message.replied_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reply Section - Only show if not already replied */}
          {message.status !== 'replied' ? (
            <Card>
              <CardHeader>
                <CardTitle>Reply to Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reply">Your Reply</Label>
                    <Textarea
                      id="reply"
                      placeholder="Type your reply here... The customer will receive this via email."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <Button 
                    onClick={handleSendReply} 
                    disabled={isSending || !replyMessage.trim()}
                    className="w-full"
                  >
                    {isSending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Reply Already Sent</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  You have already replied to this message. The customer has been notified.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{message.first_name} {message.last_name}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${message.email}`} className="text-primary hover:underline">
                    {message.email}
                  </a>
                </div>
              </div>
              {message.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${message.phone}`} className="text-primary hover:underline">
                      {message.phone}
                    </a>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Message ID</p>
                <p className="font-mono text-sm">#{message.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Received</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(message.created_at).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`mailto:${message.email}?subject=Re: ${message.subject}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Open in Email Client
                </a>
              </Button>
              {message.phone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${message.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Customer
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">Message received</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(message.created_at).toLocaleDateString()}
                </span>
              </div>
              {message.read_at && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm">Marked as read</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(message.read_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {message.replied_at && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm">Reply sent</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(message.replied_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}