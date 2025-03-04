import { QueryClient } from '@tanstack/react-query'

export const client = new QueryClient({
<<<<<<< HEAD
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            retry: 0,
        },
    },
=======
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 0,
    },
  },
>>>>>>> c4c8c08bc6f3db4703b87121dd917cd07f772ba1
})
