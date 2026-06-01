import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface GenericCrudProps {
  entityName: string
  endpoint: string
  columns: { key: string; label: string }[]
}

export function GenericCrud({ entityName, endpoint, columns }: GenericCrudProps) {
  const queryClient = useQueryClient()
  
  const { data, isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: () => apiClient.get(`/admin${endpoint}`)
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin${endpoint}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] })
    }
  })

  const items = data?.data?.content || []

  if (isLoading) return <div className="p-8">Loading {entityName}...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{entityName} Management</h1>
        <Button>Add New {entityName}</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All {entityName}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any) => (
                <TableRow key={item.id}>
                  {columns.map(col => (
                    <TableCell key={col.key} className="truncate max-w-[200px]">{item[col.key]}</TableCell>
                  ))}
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
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
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-4 text-muted-foreground">
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
