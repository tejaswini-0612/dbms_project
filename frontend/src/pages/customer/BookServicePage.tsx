import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { vehiclesApi } from '@/api/vehicles'
import { mechanicsApi, serviceTypesApi } from '@/api/mechanics'
import { serviceRequestsApi } from '@/api/serviceRequests'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/utils/formatCurrency'
import { CheckCircle, Car, Wrench, User, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/utils/cn'

const STEPS = ['Vehicle', 'Service', 'Mechanic', 'Confirm'] as const
type Step = 0 | 1 | 2 | 3

export default function BookServicePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>(0)
  const [vehicleId, setVehicleId] = useState<number | null>(null)
  const [serviceTypeId, setServiceTypeId] = useState<number | null>(null)
  const [mechanicId, setMechanicId] = useState<number | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: vehicles, isLoading: vLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.list(1),
  })

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
      serviceRequestsApi.create({
        vehicle_id: vehicleId!,
        service_type_id: serviceTypeId!,
        mechanic_id: mechanicId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] })
      queryClient.invalidateQueries({ queryKey: ['my-requests'] })
      navigate('/customer/requests')
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Booking failed. Please try again.'
      setServerError(msg)
    },
  })

  const selectedVehicle = vehicles?.find((v) => v.vehicle_id === vehicleId)
  const selectedService = serviceTypes?.find((s) => s.service_type_id === serviceTypeId)
  const selectedMechanic = mechanics?.find((m) => m.mechanic_id === mechanicId)

  const canNext = () => {
    if (step === 0) return vehicleId !== null
    if (step === 1) return serviceTypeId !== null
    return true
  }

  const handleConfirm = () => {
    if (!vehicleId || !serviceTypeId) {
      setServerError('Please select a vehicle and service type.')
      return
    }
    setServerError(null)
    bookMutation.mutate()
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Book a Service</h1>
        <p className="text-white/50 text-sm mt-1">
          Schedule service for one of your vehicles in a few steps.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-300',
                i < step
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : i === step
                  ? 'bg-brand-gradient text-white shadow-md shadow-brand-600/30'
                  : 'bg-white/[0.06] text-white/30 border border-white/10',
              )}
            >
              {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                'text-xs font-medium transition-colors',
                i === step ? 'text-white' : i < step ? 'text-emerald-400' : 'text-white/30',
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px', i < step ? 'bg-emerald-500/30' : 'bg-white/[0.08]')} />
            )}
          </div>
        ))}
      </div>

      <Card>
        {/* Step 0 — Vehicle */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-brand-400" />
              <h2 className="font-semibold text-white">Select your vehicle</h2>
            </div>
            {vLoading ? (
              <Spinner fullPage />
            ) : !vehicles || vehicles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm">No vehicles found. Add one first.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/customer/vehicles')}
                >
                  Add Vehicle
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {vehicles.map((v) => (
                  <button
                    key={v.vehicle_id}
                    type="button"
                    onClick={() => setVehicleId(v.vehicle_id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left',
                      vehicleId === v.vehicle_id
                        ? 'border-brand-500/50 bg-brand-500/10'
                        : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20',
                    )}
                  >
                    <Car className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {v.make} {v.model} ({v.year})
                      </p>
                      <p className="text-xs text-white/40">{v.registration_number}</p>
                    </div>
                    {vehicleId === v.vehicle_id && (
                      <CheckCircle className="w-4 h-4 text-brand-400 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 1 — Service type */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-brand-400" />
              <h2 className="font-semibold text-white">Select service type</h2>
            </div>
            {stLoading ? (
              <Spinner fullPage />
            ) : (
              <div className="space-y-2">
                {(serviceTypes ?? []).map((st) => (
                  <button
                    key={st.service_type_id}
                    type="button"
                    onClick={() => setServiceTypeId(st.service_type_id)}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left',
                      serviceTypeId === st.service_type_id
                        ? 'border-brand-500/50 bg-brand-500/10'
                        : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20',
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{st.name}</p>
                      {st.description && (
                        <p className="text-xs text-white/40 mt-0.5">{st.description}</p>
                      )}
                      {st.estimated_minutes && (
                        <p className="text-xs text-white/30 mt-0.5">Est. {st.estimated_minutes} min</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-semibold text-brand-300">
                        {formatCurrency(st.base_price)}
                      </p>
                      {serviceTypeId === st.service_type_id && (
                        <CheckCircle className="w-4 h-4 text-brand-400 mt-1 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Mechanic */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-brand-400" />
              <h2 className="font-semibold text-white">Select mechanic (optional)</h2>
            </div>
            {mLoading ? (
              <Spinner fullPage />
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setMechanicId(null)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left',
                    mechanicId === null
                      ? 'border-brand-500/50 bg-brand-500/10'
                      : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20',
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white/40" />
                  </div>
                  <p className="text-sm font-medium text-white">No preference</p>
                  {mechanicId === null && (
                    <CheckCircle className="w-4 h-4 text-brand-400 ml-auto" />
                  )}
                </button>

                {(mechanics ?? []).map((m) => (
                  <button
                    key={m.mechanic_id}
                    type="button"
                    onClick={() => setMechanicId(m.mechanic_id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left',
                      mechanicId === m.mechanic_id
                        ? 'border-brand-500/50 bg-brand-500/10'
                        : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20',
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{m.name}</p>
                      {m.specialization && (
                        <p className="text-xs text-white/40">{m.specialization}</p>
                      )}
                    </div>
                    {mechanicId === m.mechanic_id && (
                      <CheckCircle className="w-4 h-4 text-brand-400 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="font-semibold text-white">Confirm booking</h2>
            </div>

            <div className="space-y-3">
              <SummaryRow label="Vehicle">
                {selectedVehicle
                  ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.registration_number})`
                  : '—'}
              </SummaryRow>
              <SummaryRow label="Service">{selectedService?.name ?? '—'}</SummaryRow>
              <SummaryRow label="Base Price">
                {selectedService ? formatCurrency(selectedService.base_price) : '—'}
              </SummaryRow>
              <SummaryRow label="Tax (18%)">
                {selectedService ? formatCurrency(Number(selectedService.base_price) * 0.18) : '—'}
              </SummaryRow>
              <div className="border-t border-white/[0.08] pt-3">
                <SummaryRow label="Total (incl. tax)" valueClass="text-brand-300 font-semibold">
                  {selectedService ? formatCurrency(Number(selectedService.base_price) * 1.18) : '—'}
                </SummaryRow>
              </div>
              <SummaryRow label="Mechanic">
                {selectedMechanic?.name ?? 'No preference (auto-assign)'}
              </SummaryRow>
            </div>

            {serverError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-sm text-red-400">{serverError}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep((s) => (s - 1) as Step)}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <Button
              type="button"
              disabled={!canNext()}
              onClick={() => setStep((s) => (s + 1) as Step)}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          ) : (
            <Button
              id="book-confirm-btn"
              type="button"
              loading={bookMutation.isPending}
              onClick={handleConfirm}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Confirm Booking
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

function SummaryRow({
  label,
  children,
  valueClass,
}: {
  label: string
  children: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/50">{label}</span>
      <span className={cn('text-white', valueClass)}>{children}</span>
    </div>
  )
}
