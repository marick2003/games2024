import { createFetch } from '@vueuse/core'
import CustomError from '@/utils/CustomError'
import queryString from 'query-string';
const apiUrl = import.meta.env.VITE_API_URL;

const useFetch = createFetch({
  baseUrl: `${import.meta.env.DEV ? '' : apiUrl}/api`
})
export const useFetchApi = ({ url, httpMethod, body }) => {
  const parsed = queryString.parse(location.search) ;
  const fetchResult = useFetch(url, {
    immediate: false,
    beforeFetch({ options }) {
      options.headers = {
        'Content-Type': 'application/json',
        'token': parsed.token || 'G4JaSpQhBXLOiDn6t5P1MfijJfARQhCZXYdY1jbJ7pV/cAqQn21sy+KGrhokuZeX'
      }
      return {
        options
      }
    }
  })

  const executeApi = async ():Promise<void> => {
    const timeoutId = setTimeout(() => {
      if (fetchResult.canAbort.value) {
        fetchResult.abort()
      }
    }, 30000)

    try {

      await fetchResult[httpMethod](body).execute(true)
      fetchResult.data.value = JSON.parse(fetchResult.data.value)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new CustomError(504, 'Abort')
      }

      throw new CustomError(fetchResult.statusCode.value, 'api failed')

    }

    clearTimeout(timeoutId)
  }


  return {
    ...fetchResult, // isFetching, error, data
    execute: executeApi
  }
}
