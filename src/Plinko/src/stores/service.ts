import { useFetchApi } from '@/utils/useFetchApi'

interface ApiOptions {
  PageIndex?: number
  PageSize?: number
}

export const serviceBetHistory = (body: ApiOptions) => {
  const url = `/Plinko/GetBetRecord`
  const httpMethod = 'post'

  return useFetchApi({ url, httpMethod, body })
}
