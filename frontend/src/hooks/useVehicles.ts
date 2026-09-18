import { useQuery } from '@tanstack/react-query'
import { vehiclesApi } from '@/api/vehicles'
import { useSession } from '@/store/authStore'

export function useVehicles() {
  const user = useSession()
  return useQuery({
    queryKey: ['vehicles', user?.id],
    queryFn: () => vehiclesApi.list(user!.id),
    enabled: !!user,
  })
}
