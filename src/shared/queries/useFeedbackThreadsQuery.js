// @ts-check
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@shared/utils/api'

export function useFeedbackThreadsQuery(options = {}) {
  return useQuery({
    queryKey: ['feedback', 'threads'],
    retry: false,
    queryFn: async () => {
      const res = await apiFetch('/api/feedback')
      if (!res.ok) throw new Error('Failed to fetch feedback')
      const data = await res.json()
      return data.feedback ?? []
    },
    ...options,
  })
}
