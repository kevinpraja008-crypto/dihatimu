import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as store from '../data/masterStore'
import { supabase } from '../lib/supabase'

const MasterDataContext = createContext(null)

export function MasterDataProvider({ children }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((n) => n + 1)
    })

    void store.refreshMasterGroups()

    return unsubscribe
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('dihatimu-master-data')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'master_groups' },
        () => store.refreshMasterGroups(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => store.refreshMasterGroups(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const masterGroups = store.getMasterGroups()

  const refreshMasterGroups = useCallback(() => store.refreshMasterGroups(), [])
  const addMasterGroup = useCallback((group) => store.addMasterGroup(group), [])
  const updateGroup = useCallback((id, updates) => store.updateGroup(id, updates), [])
  const archiveGroup = useCallback((id) => store.archiveGroup(id), [])
  const restoreGroup = useCallback((id) => store.restoreGroup(id), [])
  const deleteGroup = useCallback((id) => store.deleteGroup(id), [])

  const addParticipant = useCallback(
    (groupId, participant) => store.addParticipant(groupId, participant),
    [],
  )

  const updateParticipant = useCallback(
    (groupId, participantId, updates) =>
      store.updateParticipant(groupId, participantId, updates),
    [],
  )

  const deleteParticipant = useCallback(
    (groupId, participantId) => store.deleteParticipant(groupId, participantId),
    [],
  )


  const setMasterGroups = useCallback((groups) => store.setMasterGroups(groups), [])

  const value = useMemo(
    () => ({
      masterGroups,
      refreshMasterGroups,
      addMasterGroup,
      updateGroup,
      archiveGroup,
      restoreGroup,
      deleteGroup,
      addParticipant,
      updateParticipant,
      deleteParticipant,
      setMasterGroups,
    }),
    [
      masterGroups,
      refreshMasterGroups,
      addMasterGroup,
      updateGroup,
      archiveGroup,
      restoreGroup,
      deleteGroup,
      addParticipant,
      updateParticipant,
      deleteParticipant,
      setMasterGroups,
    ],
  )

  return (
    <MasterDataContext.Provider value={value}>
      {children}
    </MasterDataContext.Provider>
  )
}

export function useMasterData() {
  const ctx = useContext(MasterDataContext)
  if (!ctx) throw new Error('useMasterData must be used within MasterDataProvider')
  return ctx
}