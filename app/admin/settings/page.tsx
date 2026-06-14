
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { adminService } from '@/services/api/admin.service'
import { Save, Globe, CreditCard, Mail, Truck, DollarSign, Shield } from 'lucide-react'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    store: {
      name: 'ModernStore',
      email: 'contact@modernstore.com',
      phone: '+1 (555) 123-4567',
      address: '123 Commerce Street, New York, NY 10001',
      currency: 'USD',
      timezone: 'America/New_York',
    },
    payment: {
      paystack_enabled: true,
      stripe_enabled: false,
      currency: 'NGN',
      test_mode: true,
    },
    shipping: {
      free_shipping_threshold: 100,
      domestic_rate: 10,
      international_rate: 25,
    },
    email: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_encryption: 'tls',
    },
    tax: {
      rate: 10,
      apply_tax: true,
      tax_inclusive: false,
    },
  })

  const { toast } = useToast()

  const handleStoreChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      store: { ...prev.store, [field]: value }
    }))
  }

  const handlePaymentChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      payment: { ...prev.payment, [field]: value }
    }))
  }

  const handleShippingChange = (field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: value }
    }))
  }

  const handleEmailChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [field]: value }
    }))
  }

  const handleTaxChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      tax: { ...prev.tax, [field]: value }
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await adminService.updateSettings(settings)
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your store configuration and preferences</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Store Settings
              </CardTitle>
              <CardDescription>
                Configure your store information and basic settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="store_name">Store Name</Label>
                  <Input
                    id="store_name"
                    value={settings.store.name}
                    onChange={(e) => handleStoreChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="store_email">Store Email</Label>
                  <Input
                    id="store_email"
                    type="email"
                    value={settings.store.email}
                    onChange={(e) => handleStoreChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="store_phone">Phone Number</Label>
                  <Input
                    id="store_phone"
                    value={settings.store.phone}
                    onChange={(e) => handleStoreChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={settings.store.currency}
                    onChange={(e) => handleStoreChange('currency', e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={settings.store.timezone}
                    onChange={(e) => handleStoreChange('timezone', e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Africa/Lagos">West Africa Time (WAT)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Store Address</Label>
                  <textarea
                    id="address"
                    value={settings.store.address}
                    onChange={(e) => handleStoreChange('address', e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>
                Configure payment gateways and processing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Paystack</p>
                    <p className="text-sm text-muted-foreground">
                      Accept payments via Paystack (cards, bank transfers, USSD)
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment.paystack_enabled}
                    onCheckedChange={(checked) => handlePaymentChange('paystack_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Test Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Enable test mode for development and testing
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment.test_mode}
                    onCheckedChange={(checked) => handlePaymentChange('test_mode', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="payment_currency">Payment Currency</Label>
                  <select
                    id="payment_currency"
                    value={settings.payment.currency}
                    onChange={(e) => handlePaymentChange('currency', e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Settings
              </CardTitle>
              <CardDescription>
                Configure shipping rates and delivery options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="free_shipping">Free Shipping Threshold ($)</Label>
                  <Input
                    id="free_shipping"
                    type="number"
                    value={settings.shipping.free_shipping_threshold}
                    onChange={(e) => handleShippingChange('free_shipping_threshold', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Orders above this amount get free shipping
                  </p>
                </div>
                <div>
                  <Label htmlFor="domestic_rate">Domestic Shipping Rate ($)</Label>
                  <Input
                    id="domestic_rate"
                    type="number"
                    value={settings.shipping.domestic_rate}
                    onChange={(e) => handleShippingChange('domestic_rate', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="international_rate">International Shipping Rate ($)</Label>
                  <Input
                    id="international_rate"
                    type="number"
                    value={settings.shipping.international_rate}
                    onChange={(e) => handleShippingChange('international_rate', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for sending emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={settings.email.smtp_host}
                    onChange={(e) => handleEmailChange('smtp_host', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={settings.email.smtp_port}
                    onChange={(e) => handleEmailChange('smtp_port', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_encryption">Encryption</Label>
                  <select
                    id="smtp_encryption"
                    value={settings.email.smtp_encryption}
                    onChange={(e) => handleEmailChange('smtp_encryption', e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tax Settings
              </CardTitle>
              <CardDescription>
                Configure tax rates and calculation rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Apply Tax</p>
                    <p className="text-sm text-muted-foreground">
                      Enable tax calculation on orders
                    </p>
                  </div>
                  <Switch
                    checked={settings.tax.apply_tax}
                    onCheckedChange={(checked) => handleTaxChange('apply_tax', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    value={settings.tax.rate}
                    onChange={(e) => handleTaxChange('rate', parseFloat(e.target.value))}
                    disabled={!settings.tax.apply_tax}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Tax Inclusive Pricing</p>
                    <p className="text-sm text-muted-foreground">
                      Include tax in product prices
                    </p>
                  </div>
                  <Switch
                    checked={settings.tax.tax_inclusive}
                    onCheckedChange={(checked) => handleTaxChange('tax_inclusive', checked)}
                    disabled={!settings.tax.apply_tax}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  )
}