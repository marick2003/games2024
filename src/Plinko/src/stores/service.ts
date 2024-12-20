import { useFetchApi } from '@/utils/useFetchApi'
import type {DoBet, BetRecordSeedRequest, RefreshSeedRequest, UpdateSeedRequest} from '../types'
interface ApiOptions {
  PageIndex?: number
  PageSize?: number
}

export const serviceInit = (body: any) => {
  const url = `/Plinko/GetInitialization`
  const httpMethod = 'post'

  return useFetchApi({ url, httpMethod, body })
}

export const serviceGetBalance = (body: any) => {
  const url = `/Client/GetBalance`
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

export const serviceGetBetRecordSeed = (body: BetRecordSeedRequest) => {
  const url = `/Plinko/GetBetRecordSeed`
  const httpMethod = 'post'

  return useFetchApi({ url, httpMethod, body })
}

export const serviceGetRefreshSeed = (body: RefreshSeedRequest) => {
  const url = `/Plinko/RefreshSeed`
  const httpMethod = 'post'

  return useFetchApi({ url, httpMethod, body })
}

export const serviceUpdateSeed = (body: UpdateSeedRequest) => {
  const url = `/Plinko/UpdateSeed`
  const httpMethod = 'post'

  return useFetchApi({ url, httpMethod, body })
}

export const serviceGetSeedInfo = (body: any) => {
  const url = `/Plinko/GetSeedInfo`
  const httpMethod = 'post'

  return useFetchApi({ url, httpMethod, body })
}
