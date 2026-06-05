import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { QUERY_KEYS } from '@/constants'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'array' | 'select'
  options?: string[]
  required?: boolean
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
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  // Dynamically build Zod schema
  const schemaMap: any = {}
  fields.forEach(f => {
    let fieldSchema: any
    if (f.type === 'number') {
      fieldSchema = z.coerce.number()
    } else if (f.type === 'boolean') {
      fieldSchema = z.coerce.boolean()
    } else {
      fieldSchema = z.string()
    }
    if (!f.required) {
      fieldSchema = fieldSchema.optional().or(z.literal(''))
    } else if (f.type !== 'number' && f.type !== 'boolean') {
      fieldSchema = fieldSchema.min(1, `${f.label} is required`)
    }
    schemaMap[f.key] = fieldSchema
  })
  const schema = z.object(schemaMap)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })
  
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.GENERIC_CRUD_LIST(endpoint, page, size),
    queryFn: () => apiClient.get(`${endpoint}?page=${page}&size=${size}`)
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`${endpoint}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GENERIC_CRUD(endpoint) })
      toast.success(`${entityName} created successfully`)
      setIsModalOpen(false)
    },
    onError: () => toast.error(`Failed to create ${entityName}`)
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => apiClient.put(`${endpoint}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GENERIC_CRUD(endpoint) })
      toast.success(`${entityName} updated successfully`)
      setIsModalOpen(false)
    },
    onError: () => toast.error(`Failed to update ${entityName}`)
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`${endpoint}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GENERIC_CRUD(endpoint) })
      toast.success(`${entityName} deleted successfully`)
      setDeleteId(null)
    },
    onError: () => {
      toast.error(`Failed to delete ${entityName}`)
      setDeleteId(null)
    }
  })

  const paginationData = data?.data || {}
  const items = paginationData.content || []
  const totalPages = paginationData.totalPages || 0
  const isFirst = paginationData.first ?? true
  const isLast = paginationData.last ?? true

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
      } else if (f.type === 'array' && val) {
        val = Array.isArray(val) ? val.join(', ') : val
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
      if (f.type === 'array' && formData[f.key]) {
        formData[f.key] = formData[f.key].split(',').map((s: string) => s.trim()).filter(Boolean)
      }
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
                ) : field.type === 'select' ? (
                  <select
                    id={field.key}
                    {...register(field.key)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <Input 
                    id={field.key} 
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} 
                    {...register(field.key)} 
                  />
                )}
                {errors[field.key] && (
                  <span className="text-red-500 text-sm">
                    {errors[field.key]?.message as string}
                  </span>
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
                          onClick={() => setDeleteId(item.id)}
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
          
          <div className="flex items-center justify-between px-2 mt-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Rows per page</span>
              <select 
                className="border rounded p-1"
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value))
                  setPage(0)
                }}
              >
                {[5, 10, 20, 50].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isFirst} 
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isLast} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the {entityName.toLowerCase()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
