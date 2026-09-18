import { useQuery } from '@tanstack/react-query'
import { serviceRequestsApi } from '@/api/serviceRequests'
import { useSession } from '@/store/authStore'

export function useServiceRequests() {
  const user = useSession()
  return useQuery({
    queryKey: ['service-requests', user?.id],
    queryFn: () => serviceRequestsApi.listMine(user!.id),
    enabled: !!user,
  })
}

export function useAssignedJobs() {
  const user = useSession()
  return useQuery({
    queryKey: ['assigned-jobs', user?.id],
    queryFn: () => serviceRequestsApi.listAssigned(user!.id),
    enabled: !!user,
    refetchInterval: 20_000,
  })
}

export function usePendingJobs() {
  return useQuery({
    queryKey: ['pending-jobs'],
    queryFn: () => serviceRequestsApi.listPending(),
    refetchInterval: 20_000,
  })
}
