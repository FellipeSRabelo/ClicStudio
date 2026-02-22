import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSupabaseQuery(table, options = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { select = '*', orderBy = 'created_at', ascending = false, filters = [] } = options

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from(table).select(select).order(orderBy, { ascending })

      filters.forEach(({ column, operator, value }) => {
        if (operator === 'eq') query = query.eq(column, value)
        else if (operator === 'gte') query = query.gte(column, value)
        else if (operator === 'lte') query = query.lte(column, value)
        else if (operator === 'in') query = query.in(column, value)
      })

      const { data: result, error: err } = await query
      if (err) throw err
      setData(result || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [table, select, orderBy, ascending, JSON.stringify(filters)])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData, setData }
}

export function useSupabaseMutation(table) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const insert = async (record) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from(table).insert(record).select()
      if (err) throw err
      return data[0]
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const update = async (id, record) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from(table).update(record).eq('id', id).select()
      if (err) throw err
      return data[0]
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase.from(table).delete().eq('id', id)
      if (err) throw err
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { insert, update, remove, loading, error }
}

export function useRealtimeSubscription(table, callback) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        callback(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, callback])
}
