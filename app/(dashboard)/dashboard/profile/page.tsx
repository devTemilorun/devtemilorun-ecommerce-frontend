
'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit2, 
  Save, 
  X,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Loader2
} from 'lucide-react'
import Image from 'next/image'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  // Fetch user activity
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['user-activity'],
    queryFn: async () => {
      const response = await api.get('/user/activity')
      return response.data.data
    },
  })

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/user', data)
      return response.data
    },
    onSuccess: (data) => {
      updateUser(data.user)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['user-activity'] })
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
      setIsEditing(false)
      setFormData(prev => ({ ...prev, current_password: '', new_password: '', confirm_password: '' }))
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      })
    },
  })

  // Avatar upload mutation
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: (data) => {
      updateUser({ ...user, avatar: data.avatar_url })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast({
        title: 'Success',
        description: 'Avatar updated successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload avatar',
        variant: 'destructive',
      })
    },
    onSettled: () => {
      setIsUploading(false)
    },
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      })
      return
    }
    
    const submitData: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    }
    
    if (formData.new_password) {
      submitData.current_password = formData.current_password
      submitData.new_password = formData.new_password
      submitData.new_password_confirmation = formData.confirm_password
    }
    
    updateMutation.mutate(submitData)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      avatarMutation.mutate(file)
    }
  }

  const activities = activitiesData || []

  const getActivityIcon = (type: string, status?: string) => {
    if (type === 'order') {
      if (status === 'delivered') return <CheckCircle className="h-4 w-4 text-green-500" />
      if (status === 'cancelled') return <AlertCircle className="h-4 w-4 text-red-500" />
      return <Package className="h-4 w-4 text-blue-500" />
    }
    if (type === 'login') return <Clock className="h-4 w-4 text-green-500" />
    return <User className="h-4 w-4 text-purple-500" />
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending_payment: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      shipped: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  if (activitiesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar - Avatar & Stats */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative mx-auto h-24 w-24 cursor-pointer group" onClick={handleAvatarClick}>
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 overflow-hidden">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  className="hidden"
                />
                <h2 className="mt-4 text-xl font-semibold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                  <Shield className="h-3 w-3" />
                  Verified Account
                </p>
              </div>

              <div className="mt-6 space-y-3 border-t pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Form - Edit Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="mb-4 font-semibold">Change Password</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_password">Current Password</Label>
                        <Input
                          id="current_password"
                          name="current_password"
                          type="password"
                          value={formData.current_password}
                          onChange={handleInputChange}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new_password">New Password</Label>
                        <Input
                          id="new_password"
                          name="new_password"
                          type="password"
                          value={formData.new_password}
                          onChange={handleInputChange}
                          placeholder="Enter new password (min 8 characters)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <Input
                          id="confirm_password"
                          name="confirm_password"
                          type="password"
                          value={formData.confirm_password}
                          onChange={handleInputChange}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          current_password: '',
                          new_password: '',
                          confirm_password: '',
                        })
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="mt-1 font-medium">{user?.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email Address</Label>
                      <p className="mt-1 font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone Number</Label>
                      <p className="mt-1 font-medium">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Account Type</Label>
                      <p className="mt-1 font-medium capitalize">{user?.role || 'Customer'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest account activities</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                      <div className="mt-1 rounded-full bg-muted p-2">
                        {getActivityIcon(activity.type, activity.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">
                            {activity.action}
                            {activity.order_number && (
                              <span className="ml-1 font-mono text-xs text-muted-foreground">
                                #{activity.order_number}
                              </span>
                            )}
                          </p>
                          <span className="text-xs text-muted-foreground">{activity.time_ago}</span>
                        </div>
                        {activity.total && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Amount: ₦{activity.total.toLocaleString()}
                          </p>
                        )}
                        {activity.status && (
                          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(activity.status)}`}>
                            {activity.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <Clock className="mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}