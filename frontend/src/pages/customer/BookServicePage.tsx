import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mechanicsApi, serviceTypesApi } from '@/api/mechanics'
import { serviceRequestsApi } from '@/api/serviceRequests'
import { useVehicles } from '@/hooks/useVehicles'
import { useSession } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const STEPS = ['Vehicle', 'Service', 'Mechanic', 'Review'] as const
type Step = 0 | 1 | 2 | 3

export default function BookServicePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useSession()

  const [step, setStep] = useState<Step>(0)
  const [vehicleId, setVehicleId] = useState<number | null>(null)
  const [serviceTypeId, setServiceTypeId] = useState<number | null>(null)
  const [mechanicId, setMechanicId] = useState<number | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: vehicles, isLoading: vLoading } = useVehicles()
  const { data: serviceTypes, isLoading: stLoading } = useQuery({
    queryKey: ['service-types'],
    queryFn: () => serviceTypesApi.list(),
  })
  const { data: mechanics, isLoading: mLoading } = useQuery({
    queryKey: ['mechanics'],
    queryFn: () => mechanicsApi.list(),
  })

  const bookMutation = useMutation({
    mutationFn: () =>
      serviceRequestsApi.create(
        { vehicle_id: vehicleId!, service_type_id: serviceTypeId!, mechanic_id: mechanicId },
        user!.id,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] })
      queryClient.invalidateQueries({ queryKey: ['pending-jobs'] })
      navigate('/customer/requests')
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setServerError(detail ?? 'Could not place the booking. Is the server running?')
    },
  })

  const selectedVehicle = vehicles?.find((v) => v.vehicle_id === vehicleId)
  const selectedService = serviceTypes?.find((s) => s.service_type_id === serviceTypeId)
  const selectedMechanic = mechanics?.find((m) => m.mechanic_id === mechanicId)

  const canAdvance = step === 0 ? vehicleId !== null : step === 1 ? serviceTypeId !== null : true

  const base = Number(selectedService?.base_price ?? 0)

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-8">
      <div>
        <p className="eyebrow">Book a service</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{STEPS[step]}</h1>
      </div>

      <ol className="flex items-center gap-px overflow-hidden rounded-md border border-line bg-line">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              'flex flex-1 items-center gap-2 px-4 py-2.5 text-xs',
              i === step ? 'bg-ink-700 text-white' : 'bg-ink-800 text-white/35',
            )}
          >
            <span className={cn('numeric', i < step ? 'text-accent-500' : '')}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="truncate">{label}</span>
          </li>
        ))}
      </ol>

      <Card padding="none">
        <div className="p-5">
          {step === 0 &&
            (vLoading ? (
              <Spinner fullPage />
            ) : !vehicles || vehicles.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-white/40">You have no vehicles registered.</p>
                <Button
                  className="mt-5"
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/customer/vehicles')}
                >
                  Add a vehicle
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {vehicles.map((v) => (
                  <OptionRow
                    key={v.vehicle_id}
                    selected={vehicleId === v.vehicle_id}
                    onClick={() => setVehicleId(v.vehicle_id)}
                    title={`${v.make} ${v.model}`}
                    subtitle={`${v.registration_number} · ${v.year}`}
                  />
                ))}
              </div>
            ))}

          {step === 1 &&
            (stLoading ? (
              <Spinner fullPage />
            ) : (
              <div className="space-y-2">
                {(serviceTypes ?? []).map((st) => (
                  <OptionRow
                    key={st.service_type_id}
                    selected={serviceTypeId === st.service_type_id}
                    onClick={() => setServiceTypeId(st.service_type_id)}
                    title={st.name}
                    subtitle={[st.description, st.estimated_minutes && `${st.estimated_minutes} min`]
                      .filter(Boolean)
                      .join(' · ')}
                    trailing={formatCurrency(st.base_price)}
                  />
                ))}
              </div>
            ))}

          {step === 2 &&
            (mLoading ? (
              <Spinner fullPage />
            ) : (
              <div className="space-y-2">
                <OptionRow
                  selected={mechanicId === null}
                  onClick={() => setMechanicId(null)}
                  title="No preference"
                  subtitle="Any available mechanic can pick up the job"
                />
                {(mechanics ?? []).map((m) => (
                  <OptionRow
                    key={m.mechanic_id}
                    selected={mechanicId === m.mechanic_id}
                    onClick={() => setMechanicId(m.mechanic_id)}
                    title={m.name}
                    subtitle={m.specialization ?? undefined}
                  />
                ))}
              </div>
            ))}

          {step === 3 && (
            <div className="space-y-4">
              <dl className="divide-rows overflow-hidden rounded-md border border-line">
                <ReviewRow label="Vehicle">
                  {selectedVehicle
                    ? `${selectedVehicle.make} ${selectedVehicle.model} · ${selectedVehicle.registration_number}`
                    : '—'}
                </ReviewRow>
                <ReviewRow label="Service">{selectedService?.name ?? '—'}</ReviewRow>
                <ReviewRow label="Mechanic">{selectedMechanic?.name ?? 'No preference'}</ReviewRow>
                <ReviewRow label="Base price">{formatCurrency(base)}</ReviewRow>
                <ReviewRow label="GST (18%)">{formatCurrency(base * 0.18)}</ReviewRow>
                <ReviewRow label="Estimated total" emphasis>
                  {formatCurrency(base * 1.18)}
                </ReviewRow>
              </dl>

              <p className="text-xs text-white/35">
                The invoice is raised automatically once the mechanic marks the job complete.
              </p>

              {serverError && (
                <div className="rounded-md border border-state-due/25 bg-state-due/10 px-3 py-2.5">
                  <p className="text-xs text-state-due">{serverError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => (s - 1) as Step)}
          >
            Back
          </Button>

          {step < 3 ? (
            <Button type="button" disabled={!canAdvance} onClick={() => setStep((s) => (s + 1) as Step)}>
              Continue
            </Button>
          ) : (
            <Button
              id="book-confirm-btn"
              type="button"
              loading={bookMutation.isPending}
              disabled={!vehicleId || !serviceTypeId}
              onClick={() => {
                setServerError(null)
                bookMutation.mutate()
              }}
            >
              Confirm booking
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

function OptionRow({
  selected,
  onClick,
  title,
  subtitle,
  trailing,
}: {
  selected: boolean
  onClick: () => void
  title: string
  subtitle?: string
  trailing?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-4 rounded-md border px-4 py-3 text-left transition-colors',
        selected
          ? 'border-accent-500/50 bg-accent-500/[0.07]'
          : 'border-line bg-ink-900 hover:border-line-strong',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 shrink-0 rounded-full',
          selected ? 'bg-accent-500' : 'bg-white/20',
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-white">{title}</span>
        {subtitle && <span className="numeric block truncate text-xs text-white/35">{subtitle}</span>}
      </span>
      {trailing && <span className="numeric shrink-0 text-sm text-white/70">{trailing}</span>}
    </button>
  )
}

function ReviewRow({
  label,
  children,
  emphasis,
}: {
  label: string
  children: React.ReactNode
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-ink-800 px-4 py-3">
      <dt className="text-xs text-white/45">{label}</dt>
      <dd
        className={cn(
          'numeric truncate text-sm',
          emphasis ? 'font-semibold text-accent-500' : 'text-white',
        )}
      >
        {children}
      </dd>
    </div>
  )
}
