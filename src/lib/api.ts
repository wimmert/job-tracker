// API configuration - using dual-mode API for gradual migration
import { dualModeAPI } from './dualModeApi'

// Use dual-mode API that can switch between mock and PocketBase
export const api = dualModeAPI