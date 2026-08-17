import { useQuery } from '@tanstack/react-query'
import { vehiclesApi } from '@/api/vehicles'

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.list(1),
  })
}
