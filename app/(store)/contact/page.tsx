
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/auth-store'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/lib/axios'

export default function ContactPage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post('/contact/send', formData)
      
      if (response.data.success) {
        setSubmitted(true)
        toast({
          title: 'Message Sent!',
          description: response.data.message,
        })
        // Reset form after 3 seconds
        setTimeout(() => {
          setSubmitted(false)
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
          })
        }, 3000)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-fill user data if logged in
  useState(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.name?.split(' ')[0] || '',
        last_name: user.name?.split(' ')[1] || '',
        email: user.email || '',
      }))
    }
  })

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'support@modernstore.com',
      description: 'We\'ll respond within 24 hours',
      action: 'mailto:support@modernstore.com',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      description: 'Mon-Fri, 9am-6pm EST',
      action: 'tel:+15551234567',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '123 Commerce Street',
      description: 'New York, NY 10001',
      action: 'https://maps.google.com',
    },
    {
      icon: Clock,
      title: 'Hours',
      details: '24/7 Online Support',
      description: 'Always here to help',
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container text-center">
          <h1 className="mb-4 text-4xl font-bold">Contact Us</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((info, index) => (
              <a key={index} href={info.action} target={info.title === 'Visit Us' ? '_blank' : undefined}>
                <Card className="cursor-pointer transition-all hover:shadow-lg">
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold">{info.title}</h3>
                    <p className="text-sm font-medium">{info.details}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{info.description}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you shortly
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Message Sent!</h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. We'll respond within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      <Send className="mr-2 h-4 w-4" />
                      {isLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Quick answers to common questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">What are your shipping times?</h4>
                    <p className="text-sm text-muted-foreground">
                      Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Do you offer returns?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes, we offer 30-day returns on all unused items in original packaging.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Is my payment secure?</h4>
                    <p className="text-sm text-muted-foreground">
                      Absolutely! We use Paystack for secure payment processing.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">How can I track my order?</h4>
                    <p className="text-sm text-muted-foreground">
                      Once your order ships, you'll receive a tracking number via email.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Office Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316bbafb0d%3A0xc89ff1dfa4a7a17e!2s123%20Commerce%20St%2C%20New%20York%2C%20NY%2010002%2C%20USA!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Store Location"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}