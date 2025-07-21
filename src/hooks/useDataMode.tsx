import React, { createContext, useContext, useState, ReactNode } from 'react'

type DataMode = 'mock' | 'pocketbase'

interface DataModeContextType {
  dataMode: DataMode
  setDataMode: (mode: DataMode) => void
  isUsingMockData: boolean
  isUsingPocketBase: boolean
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined)

export const DataModeProvider = ({ children }: { children: ReactNode }) => {
  const [dataMode, setDataMode] = useState<DataMode>('mock')

  const value = {
    dataMode,
    setDataMode,
    isUsingMockData: dataMode === 'mock',
    isUsingPocketBase: dataMode === 'pocketbase'
  }

  return (
    <DataModeContext.Provider value={value}>
      {children}
    </DataModeContext.Provider>
  )
}

export const useDataMode = () => {
  const context = useContext(DataModeContext)
  if (context === undefined) {
    throw new Error('useDataMode must be used within a DataModeProvider')
  }
  return context
}