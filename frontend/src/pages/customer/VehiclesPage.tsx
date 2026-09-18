import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useVehicles } from '@/hooks/useVehicles'
import { vehiclesApi } from '@/api/vehicles'
import { useSession } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/formatDate'

const schema = z.object({
  registration_number: z.string().min(1, 'Registration number is required').max(20),
  make: z.string().min(1, 'Make is required').max(50),
  model: z.string().min(1, 'Model is required').max(50),
  year: z
    .number({ invalid_type_error: 'Year must be a number' })
    .min(1980, 'Year must be 1980 or later')
    .max(new Date().getFullYear() + 1, 'Year is not valid'),
})

type FormData = z.infer<typeof schema>

export default function VehiclesPage() {
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const user = useSession()
  const { data: vehicles, isLoading } = useVehicles()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const close = () => {
    setOpen(false)
    reset()
    setServerError(null)
  }

  const addMutation = useMutation({
    mutationFn: (data: FormData) => vehiclesApi.create(data, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      close()
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      if (typeof detail === 'string') {
        setServerError(detail)
      } else if (Array.isArray(detail)) {
        setServerError(
          detail
            .map((e: { msg?: string; loc?: string[] }) => `${e.loc?.slice(-1)[0] ?? 'Field'}: ${e.msg}`)
            .join(' · '),
        )
      } else {
        setServerError('Could not add the vehicle. Is the server running?')
      }
    },
  })

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Vehicles</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {vehicles?.length ?? 0} registered
          </h1>
        </div>
        <Button id="add-vehicle-btn" onClick={() => setOpen(true)}>
          Add vehicle
        </Button>
      </div>

      {isLoading ? (
        <Spinner fullPage />
      ) : !vehicles || vehicles.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-sm text-white/40">No vehicles registered yet.</p>
          <Button className="mt-5" size="sm" variant="outline" onClick={() => setOpen(true)}>
            Add your first vehicle
          </Button>
        </Card>
      ) : (
        <div className="divide-rows overflow-hidden rounded-lg border border-line">
          <div className="hidden bg-ink-700 px-5 py-3 sm:grid sm:grid-cols-[1fr_1fr_auto] sm:gap-4">
            <span className="eyebrow">Vehicle</span>
            <span className="eyebrow">Registration</span>
            <span className="eyebrow">Added</span>
          </div>
          {vehicles.map((v) => (
            <div
              key={v.vehicle_id}
              className="grid gap-1 bg-ink-800 px-5 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-4"
            >
              <div>
                <p className="text-sm text-white">
                  {v.make} {v.model}
                </p>
                <p className="numeric text-xs text-white/35">{v.year}</p>
              </div>
              <p className="numeric text-sm tracking-wide text-white/70">{v.registration_number}</p>
              <p className="text-xs text-white/35">{formatDate(v.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={close} title="Add a vehicle" size="sm">
        <form onSubmit={handleSubmit((d) => addMutation.mutate(d))} noValidate className="space-y-4">
          <Input
            id="reg-number"
            label="Registration number"
            placeholder="MH-12-AB-1234"
            error={errors.registration_number?.message}
            {...register('registration_number')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input id="make" label="Make" placeholder="Honda" error={errors.make?.message} {...register('make')} />
            <Input id="model" label="Model" placeholder="City" error={errors.model?.message} {...register('model')} />
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
            <div className="rounded-md border border-state-due/25 bg-state-due/10 px-3 py-2.5">
              <p className="text-xs text-state-due">{serverError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={close}>
              Cancel
            </Button>
            <Button id="add-vehicle-submit" type="submit" className="flex-1" loading={addMutation.isPending}>
              Add vehicle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
