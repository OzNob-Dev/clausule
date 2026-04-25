// @ts-check
import { useQuery } from '@tanstack/react-query'
import { apiFetch, readJson } from '@shared/utils/api'

export function useFeedbackThreadsQuery(options = {}) {
  return useQuery({
    queryKey: ['feedback', 'threads'],
    retry: false,
    queryFn: async () => {
      const response = await apiFetch('/api/feedback')
      const data = await readJson(response, { feedback: [] })

      if (!response.ok) {
        throw new Error(data.error ?? 'Could not load feedback threads. Please try again.')
      }

      return data.feedback ?? []
    },
    ...options,
  })
}
