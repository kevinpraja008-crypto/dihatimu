import {
    createContext,
    useContext,
    useEffect,
    useState,
  } from 'react'
  import { supabase } from '../lib/supabase'

  const AuthContext = createContext(null)

  function createAccessDeniedError() {
    const error = new Error('Akun tidak memiliki akses administrator.')
    error.code = 'ADMIN_ACCESS_DENIED'
    return error
  }

  export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [sessionLoading, setSessionLoading] = useState(true)
    const [adminLoading, setAdminLoading] = useState(true)

    useEffect(() => {
      let active = true

      if (!supabase) {
        setSessionLoading(false)
        setAdminLoading(false)

        return () => {
          active = false
        }
      }

      supabase.auth
        .getSession()
        .then(({ data, error }) => {
          if (!active) return

          if (error) {
            console.error(
              '[DIHATIMU] Gagal membaca sesi admin:',
              error,
            )
          }

          setSession(data?.session ?? null)
          setSessionLoading(false)
        })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!active) return

          setSession(nextSession)
          setSessionLoading(false)
        },
      )

      return () => {
        active = false
        subscription.unsubscribe()
      }
    }, [])

    useEffect(() => {
      let active = true

      if (!supabase || !session?.user) {
        setIsAdmin(false)
        setAdminLoading(false)

        return () => {
          active = false
        }
      }

      setAdminLoading(true)

      supabase
        .rpc('is_admin')
        .then(({ data, error }) => {
          if (!active) return

          if (error) {
            console.error(
              '[DIHATIMU] Gagal memeriksa akses administrator:',
              error,
            )
          }

          setIsAdmin(!error && data === true)
          setAdminLoading(false)
        })

      return () => {
        active = false
      }
    }, [session?.user?.id])

    async function signIn(email, password) {
      if (!supabase) {
        return {
          data: null,
          error: new Error('Supabase belum dikonfigurasi.'),
        }
      }

      setAdminLoading(true)

      const signInResult = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (signInResult.error) {
        setIsAdmin(false)
        setAdminLoading(false)
        return signInResult
      }

      const {
        data: adminAllowed,
        error: adminError,
      } = await supabase.rpc('is_admin')

      if (adminError || adminAllowed !== true) {
        if (adminError) {
          console.error(
            '[DIHATIMU] Pemeriksaan administrator gagal:',
            adminError,
          )
        }

        await supabase.auth.signOut()

        setSession(null)
        setIsAdmin(false)
        setSessionLoading(false)
        setAdminLoading(false)

        return {
          data: null,
          error: createAccessDeniedError(),
        }
      }

      setSession(signInResult.data.session)
      setIsAdmin(true)
      setSessionLoading(false)
      setAdminLoading(false)

      return signInResult
    }

    async function signOut() {
      if (!supabase) {
        return {
          error: new Error('Supabase belum dikonfigurasi.'),
        }
      }

      const result = await supabase.auth.signOut()

      if (!result.error) {
        setSession(null)
        setIsAdmin(false)
        setSessionLoading(false)
        setAdminLoading(false)
      }

      return result
    }

    const loading = sessionLoading || adminLoading
    const isAuthenticated = Boolean(session?.user) && isAdmin

    return (
      <AuthContext.Provider
        value={{
          session,
          user: session?.user ?? null,
          loading,
          isAdmin,
          isAuthenticated,
          signIn,
          signOut,
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }

  export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
      throw new Error(
        'useAuth harus digunakan di dalam AuthProvider.',
      )
    }

    return context
  }