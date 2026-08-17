import { useQuery } from '@tanstack/react-query'
import { serviceRequestsApi } from '@/api/serviceRequests'

export function useServiceRequests() {
  return useQuery({
    queryKey: ['service-requests'],
    queryFn: () => serviceRequestsApi.listMine(1),
  })
}

export function useAssignedJobs() {
  return useQuery({
    queryKey: ['assigned-jobs'],
    queryFn: () => serviceRequestsApi.listAssigned(1),
    refetchInterval: 30_000, // mechanic gets fresh data every 30s
  })
}
