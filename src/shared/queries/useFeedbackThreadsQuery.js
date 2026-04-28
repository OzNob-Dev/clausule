// @ts-check
import { useQuery } from '@tanstack/react-query'
import { listFeedbackThreadsAction } from '@actions/brag-actions'

export function useFeedbackThreadsQuery(options = {}) {
  return useQuery({
    queryKey: ['feedback', 'threads'],
    retry: false,
    queryFn: () => listFeedbackThreadsAction(),
    ...options,
  })
}
