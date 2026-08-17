import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useVehicles } from '@/hooks/useVehicles'
import { vehiclesApi } from '@/api/vehicles'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { Car, Plus, Calendar, Hash } from 'lucide-react'
import { formatDate } from '@/utils/formatDate'

const schema = z.object({
  registration_number: z.string().min(1, 'Registration number is required').max(20),
  make: z.string().min(1, 'Make is required').max(50),
  model: z.string().min(1, 'Model is required').max(50),
  year: z
    .number({ invalid_type_error: 'Year must be a number' })
    .min(1980, 'Year must be 1980 or later')
    .max(new Date().getFullYear() + 1, 'Invalid year'),
})

type FormData = z.infer<typeof schema>

export default function VehiclesPage() {
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { data: vehicles, isLoading } = useVehicles()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const addMutation = useMutation({
    mutationFn: (data: FormData) => vehiclesApi.create(data, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setOpen(false)
      reset()
      setServerError(null)
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      let msg = 'Failed to add vehicle. Check your connection.'
      if (typeof detail === 'string') {
        if (detail.includes('already exists') || detail.includes('duplicate') || detail.includes('unique')) {
          msg = '⚠️ A vehicle with this registration number already exists.'
        } else {
          msg = detail
        }
      } else if (Array.isArray(detail)) {
        msg = detail.map((e: { msg?: string; loc?: string[] }) =>
          `${e.loc?.slice(-1)[0] ?? 'Field'}: ${e.msg}`
        ).join(' | ')
      }
      setServerError(msg)
    },
  })

  const onSubmit = (data: FormData) => {
    setServerError(null)
    addMutation.mutate(data)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Vehicles</h1>
          <p className="text-white/50 text-sm mt-1">
            {vehicles?.length ?? 0} vehicle{vehicles?.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Button id="add-vehicle-btn" onClick={() => setOpen(true)} icon={<Plus />}>
          Add Vehicle
        </Button>
      </div>

      {isLoading ? (
        <Spinner fullPage />
      ) : !vehicles || vehicles.length === 0 ? (
        <Card className="text-center py-16">
          <Car className="w-14 h-14 text-white/15 mx-auto mb-4" />
          <p className="text-white/40 mb-6">No vehicles registered yet</p>
          <Button onClick={() => setOpen(true)} icon={<Plus />}>
            Add your first vehicle
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <Card key={v.vehicle_id} hover className="flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">
                    {v.make} {v.model}
                  </p>
                  <p className="text-xs text-white/40">{v.year}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                  <span className="font-mono text-white/80 tracking-wide">
                    {v.registration_number}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  Added {formatDate(v.created_at)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add vehicle modal */}
      <Modal
        isOpen={open}
        onClose={() => {
          setOpen(false)
          reset()
          setServerError(null)
        }}
        title="Add New Vehicle"
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            id="reg-number"
            label="Registration Number"
            placeholder="TN01AB1234"
            error={errors.registration_number?.message}
            {...register('registration_number')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="make"
              label="Make"
              placeholder="Honda"
              error={errors.make?.message}
              {...register('make')}
            />
            <Input
              id="model"
              label="Model"
              placeholder="City"
              error={errors.model?.message}
              {...register('model')}
            />
          </div>

          <Input
            id="year"
            label="Year"
            type="number"
            placeholder="2022"
            error={errors.year?.message}
            {...register('year', { valueAsNumber: true })}
          />

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{serverError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setOpen(false)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button
              id="add-vehicle-submit"
              type="submit"
              className="flex-1"
              loading={isSubmitting || addMutation.isPending}
            >
              Add Vehicle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
