import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'date'
}

interface GenericCrudProps {
  entityName: string
  endpoint: string
  columns: { key: string; label: string }[]
  fields?: FieldDef[]
  readOnly?: boolean
}

export function GenericCrud({ entityName, endpoint, columns, fields = [], readOnly = false }: GenericCrudProps) {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { register, handleSubmit, reset, setValue } = useForm()
  
  const { data, isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: () => apiClient.get(`/admin${endpoint}`)
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/admin${endpoint}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] })
      toast.success(`${entityName} created successfully`)
      setIsModalOpen(false)
    },
    onError: () => toast.error(`Failed to create ${entityName}`)
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => apiClient.put(`/admin${endpoint}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] })
      toast.success(`${entityName} updated successfully`)
      setIsModalOpen(false)
    },
    onError: () => toast.error(`Failed to update ${entityName}`)
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin${endpoint}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] })
      toast.success(`${entityName} deleted successfully`)
    },
    onError: () => toast.error(`Failed to delete ${entityName}`)
  })

  const items = data?.data?.content || []

  const openAddModal = () => {
    setEditingId(null)
    reset()
    setIsModalOpen(true)
  }

  const openEditModal = (item: any) => {
    setEditingId(item.id)
    fields.forEach(f => {
      let val = item[f.key]
      if (f.type === 'date' && val) {
        val = val.split('T')[0]
      }
      setValue(f.key, val)
    })
    setIsModalOpen(true)
  }

  const onSubmit = (formData: any) => {
    // Process types
    fields.forEach(f => {
      if (f.type === 'number' && formData[f.key]) formData[f.key] = Number(formData[f.key])
      if (f.type === 'boolean') formData[f.key] = formData[f.key] === 'true' || formData[f.key] === true
    })

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  if (isLoading) return <div className="p-8">Loading {entityName}...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{entityName} Management</h1>
        {!readOnly && (
          <Button onClick={openAddModal}>Add New {entityName}</Button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Add'} {entityName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map(field => (
              <div key={field.key} className="grid gap-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === 'textarea' ? (
                  <Textarea id={field.key} {...register(field.key)} />
                ) : (
                  <Input 
                    id={field.key} 
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} 
                    {...register(field.key)} 
                  />
                )}
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All {entityName}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
                {!readOnly && <TableHead className="w-[150px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any) => (
                <TableRow key={item.id}>
                  {columns.map(col => (
                    <TableCell key={col.key} className="truncate max-w-[200px]">{item[col.key]}</TableCell>
                  ))}
                  {!readOnly && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(item)}>Edit</Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete this ${entityName}?`)) {
                              deleteMutation.mutate(item.id)
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + (readOnly ? 0 : 1)} className="text-center py-4 text-muted-foreground">
                    No {entityName.toLowerCase()} found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
