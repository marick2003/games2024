import { useFetchApi } from '@/utils/useFetchApi'
import { type DoBet, } from '../types'
interface ApiOptions {
  PageIndex?: number
  PageSize?: number
}


export const serviceInit = (body: any) => {
  const url = `/Plinko/GetInitialization`
  const httpMethod = 'post'

  return useFetchApi({ url, httpMethod, body })
}



export const serviceBetHistory = (body: ApiOptions) => {
  const url = `/Plinko/GetBetRecord`
  const httpMethod = 'post'

  return useFetchApi({ url, httpMethod, body })
}


export const serviceDoBet = (body: DoBet) => {
  const url = `/Plinko/DoBet`
  const httpMethod = 'post'

  return useFetchApi({ url, httpMethod, body })
}
